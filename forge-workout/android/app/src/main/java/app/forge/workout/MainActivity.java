package app.forge.workout;

import android.Manifest;
import android.app.Activity;
import android.app.AlarmManager;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.content.ContentValues;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.ConsoleMessage;
import android.util.Log;
import android.widget.LinearLayout;
import org.json.JSONObject;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.lang.ref.WeakReference;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/** Offline assets + narrowly scoped native bridges. No remote page can be loaded. */
public class MainActivity extends Activity {
    private static WeakReference<MainActivity> current = new WeakReference<>(null);
    private WebView web;
    private WorkspaceDatabase db;
    private String pendingExport;
    private final ExecutorService files = Executors.newSingleThreadExecutor();
    private static final int EXPORT=40, IMPORT=41, NOTIFICATIONS=42;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        current = new WeakReference<>(this);
        db = new WorkspaceDatabase();
        TimerSignals.channels(this);
        getWindow().setStatusBarColor(0xff101114);
        getWindow().setNavigationBarColor(0xff15161b);
        getWindow().setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE);
        LinearLayout container = new LinearLayout(this);
        container.setOrientation(LinearLayout.VERTICAL);
        container.setBackgroundColor(0xff101114);
        container.setFitsSystemWindows(true);
        web = new WebView(this);
        web.setBackgroundColor(0xff101114);
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(false);
        web.getSettings().setBlockNetworkLoads(true);
        web.getSettings().setSafeBrowsingEnabled(false);
        web.getSettings().setAllowFileAccess(true);
        web.getSettings().setAllowContentAccess(false);
        web.getSettings().setAllowFileAccessFromFileURLs(false);
        web.getSettings().setAllowUniversalAccessFromFileURLs(false);
        web.getSettings().setCacheMode(android.webkit.WebSettings.LOAD_NO_CACHE);
        web.getSettings().setMediaPlaybackRequiresUserGesture(true);
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !request.getUrl().toString().equals("file:///android_asset/www/index.html");
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return !url.equals("file:///android_asset/www/index.html");
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onConsoleMessage(ConsoleMessage message) {
                Log.d("ForgeUI", message.message()+" @"+message.lineNumber()); return true;
            }
        });
        web.addJavascriptInterface(new Bridge(), "Native");
        WebView.setWebContentsDebuggingEnabled((getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE)!=0);
        container.addView(web,new LinearLayout.LayoutParams(-1,-1));
        setContentView(container);
        web.loadUrl("file:///android_asset/www/index.html");
    }
    static void callback(String name, String argument) {
        MainActivity a = current.get();
        if(a!=null && a.web!=null) a.runOnUiThread(()->a.web.evaluateJavascript("window."+name+"&&window."+name+"("+JSONObject.quote(argument)+");",null));
    }
    @Override protected void onResume() {
        super.onResume();
        if(web!=null) {web.onResume();web.post(()->{web.evaluateJavascript("window.onNativePermissions&&window.onNativePermissions();",null);callback("onNativeTimerState",new Bridge().timerState());});}
    }
    @Override protected void onPause() {super.onPause();if(web!=null)web.onPause();}
    @Override protected void onDestroy() {
        if(current.get()==this)current.clear();
        if(web!=null){web.removeJavascriptInterface("Native");web.destroy();web=null;}
        files.shutdown();if(db!=null)db.close();super.onDestroy();
    }
    @Override public void onBackPressed() {
        if(web==null){moveTaskToBack(true);return;}
        web.evaluateJavascript("window.onNativeBack?window.onNativeBack():false",value->{if(!"true".equals(value))moveTaskToBack(true);});
    }
    private void message(String text) {callback("onNativeMessage",text);}

    final class WorkspaceDatabase extends SQLiteOpenHelper {
        WorkspaceDatabase(){super(MainActivity.this,"forge.sqlite",null,1);setWriteAheadLoggingEnabled(true);}
        @Override public void onCreate(SQLiteDatabase db){
            db.execSQL("CREATE TABLE workspace (id INTEGER PRIMARY KEY, state TEXT NOT NULL, modified INTEGER NOT NULL)");
        }
        @Override public void onUpgrade(SQLiteDatabase db,int oldV,int newV){
            // Schema v1 is the only version so far. Keep the stored workspace on upgrade
            // instead of failing; add explicit per-version migrations here when the schema changes.
            if(oldV<1)onCreate(db);
        }
        synchronized String load(){
            try(Cursor c=getReadableDatabase().rawQuery("SELECT state FROM workspace WHERE id=1",null)){return c.moveToFirst()?c.getString(0):"";}
        }
        synchronized void save(String json){
            SQLiteDatabase sql=getWritableDatabase();sql.beginTransaction();
            try{
                // One last known state stays available to an advanced local recovery, never uploaded.
                sql.execSQL("INSERT OR REPLACE INTO workspace(id,state,modified) SELECT 2,state,modified FROM workspace WHERE id=1");
                ContentValues v=new ContentValues();v.put("id",1);v.put("state",json);v.put("modified",System.currentTimeMillis());
                sql.insertWithOnConflict("workspace",null,v,SQLiteDatabase.CONFLICT_REPLACE);sql.setTransactionSuccessful();
            }finally{sql.endTransaction();}
        }
    }
    public final class Bridge {
        @JavascriptInterface public String loadState(){try{return db.load();}catch(Exception e){return "{\"storageError\":true}";}}
        @JavascriptInterface public String saveState(String json){
            try {JSONObject check=new JSONObject(json);if(check.optInt("version")!=1)return "Unsupported state";db.save(json);return "ok";}
            catch(Exception e){Log.e("Forge","SQLite save",e);return "SQLite error: "+e.getMessage();}
        }
        @JavascriptInterface public void keepScreenAwake(boolean awake){runOnUiThread(()->{
            if(awake)getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
            else getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        });}
        @JavascriptInterface public void startTimer(long deadline,String kind,String next,boolean sound,boolean vibrate){
            runOnUiThread(()->{
                Intent i=new Intent(MainActivity.this,RestTimerService.class).setAction(RestTimerService.START);
                i.putExtra("deadline",deadline).putExtra("kind",kind).putExtra("next",next).putExtra("sound",sound).putExtra("vibrate",vibrate);
                try {startForegroundService(i);}catch(Exception e){Log.e("Forge","Timer service",e);message("Could not start the background timer: "+e.getMessage());}
            });
        }
        @JavascriptInterface public String timerState(){
            try {android.content.SharedPreferences p=RestTimerService.prefs(MainActivity.this);JSONObject j=new JSONObject();j.put("deadline",p.getLong("timer_deadline",0));j.put("delivered",p.getLong("timer_delivered",0));j.put("cancelled",p.getLong("timer_cancelled",0));return j.toString();}catch(Exception e){return "{}";}
        }
        @JavascriptInterface public void cancelTimer(){runOnUiThread(()->RestTimerService.cancel(MainActivity.this,false));}
        @JavascriptInterface public void testAlert(boolean sound,boolean vibrate){runOnUiThread(()->TimerSignals.cue(MainActivity.this,sound,vibrate));}
        @JavascriptInterface public String permissions(){
            try {
                JSONObject j=new JSONObject();j.put("native",true);
                j.put("notifications",Build.VERSION.SDK_INT<33||checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)==PackageManager.PERMISSION_GRANTED);
                AlarmManager alarms=(AlarmManager)getSystemService(ALARM_SERVICE);
                j.put("exact",Build.VERSION.SDK_INT<31||alarms.canScheduleExactAlarms());return j.toString();
            }catch(Exception e){return "{}";}
        }
        @JavascriptInterface public void requestNotifications(){runOnUiThread(()->{
            if(Build.VERSION.SDK_INT>=33&&checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED){
                if(getPreferences(MODE_PRIVATE).getBoolean("notificationAsked",false)&&!shouldShowRequestPermissionRationale(Manifest.permission.POST_NOTIFICATIONS)){
                    Intent i=new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE,getPackageName());startActivity(i);
                }else{getPreferences(MODE_PRIVATE).edit().putBoolean("notificationAsked",true).apply();requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS},NOTIFICATIONS);}
            }else startActivity(new Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE,getPackageName()));
        });}
        @JavascriptInterface public void requestExactAlarms(){runOnUiThread(()->{
            if(Build.VERSION.SDK_INT>=31){try{startActivity(new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).setData(Uri.parse("package:"+getPackageName())));}catch(Exception e){message("Open Android Settings → Apps → Forge → Alarms & reminders.");}}
            else message("Exact alarms are already available on this Android version.");
        });}
        @JavascriptInterface public void setReminders(String json){
            getSharedPreferences("forge_native",MODE_PRIVATE).edit().putString("reminders",json).apply();ReminderReceiver.schedule(MainActivity.this);
        }
        @JavascriptInterface public void exportBackup(String json,String filename){runOnUiThread(()->{
            pendingExport=json;Intent i=new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("application/json").putExtra(Intent.EXTRA_TITLE,filename);
            try{startActivityForResult(i,EXPORT);}catch(Exception e){message("No Android document picker available.");}
        });}
        @JavascriptInterface public void importBackup(){runOnUiThread(()->{
            Intent i=new Intent(Intent.ACTION_OPEN_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("*/*").putExtra(Intent.EXTRA_MIME_TYPES,new String[]{"application/json","text/plain","application/octet-stream"});
            try{startActivityForResult(i,IMPORT);}catch(Exception e){message("No Android document picker available.");}
        });}
    }
    @Override public void onRequestPermissionsResult(int request,String[] permissions,int[] grantResults){
        super.onRequestPermissionsResult(request,permissions,grantResults);
        if(request==NOTIFICATIONS){if(grantResults.length==0||grantResults[0]!=PackageManager.PERMISSION_GRANTED)message("Notifications are off. Countdown sound and vibration still work; reminders need notification permission.");callback("onNativePermissions","");}
    }
    @Override protected void onActivityResult(int request,int result,Intent data){
        super.onActivityResult(request,result,data);
        if(result!=RESULT_OK||data==null||data.getData()==null){if(request==EXPORT)pendingExport=null;return;}
        final Uri uri=data.getData();
        if(request==EXPORT){
            final String json=pendingExport;pendingExport=null;if(json==null){message("Please export again; the pending file was cleared.");return;}
            files.execute(()->{try(OutputStream out=getContentResolver().openOutputStream(uri,"wt")){if(out==null)throw new Exception("Cannot open file");out.write(json.getBytes(StandardCharsets.UTF_8));out.flush();message("JSON backup saved.");}catch(Exception e){message("Backup failed: "+e.getMessage());}});
        }else if(request==IMPORT){
            files.execute(()->{try(InputStream in=getContentResolver().openInputStream(uri);ByteArrayOutputStream out=new ByteArrayOutputStream()){
                if(in==null)throw new Exception("Cannot open file");byte[] buffer=new byte[8192];int read,total=0;
                while((read=in.read(buffer))!=-1){total+=read;if(total>64*1024*1024)throw new Exception("Backup exceeds the 64 MB safety limit");out.write(buffer,0,read);}
                callback("onNativeImport",new String(out.toByteArray(),StandardCharsets.UTF_8));
            }catch(Exception e){message("Restore failed: "+e.getMessage());}});
        }
    }
}
