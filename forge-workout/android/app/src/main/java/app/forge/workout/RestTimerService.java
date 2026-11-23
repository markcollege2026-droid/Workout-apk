package app.forge.workout;

import android.app.Service;
import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.PowerManager;
import android.os.SystemClock;
import android.util.Log;

/**
 * User-started foreground countdown; a partial wake lock keeps it precise while the screen
 * is off. One service instance handles both countdown kinds, but they keep completely
 * separate persisted state: "rest" (recovery between sets) and "work" (a timed exercise).
 */
public class RestTimerService extends Service {
    public static final String START="app.forge.workout.START_REST";
    public static final String TYPE_REST="rest",TYPE_WORK="work";
    static final int ONGOING=100,ALARM_REST=101,ALARM_WORK=103;
    private final Handler handler=new Handler();
    private PowerManager.WakeLock wake;
    private long deadline,elapsedDeadline;
    private String next,kind,type=TYPE_REST;
    private boolean sound,vibrate;
    private final Runnable tick=new Runnable(){@Override public void run(){
        long remaining=elapsedDeadline-SystemClock.elapsedRealtime();
        if(remaining<=0){TimerSignals.finish(RestTimerService.this,deadline,type);return;}
        ((NotificationManager)getSystemService(NOTIFICATION_SERVICE)).notify(ONGOING,notification(remaining));
        handler.postDelayed(this,Math.min(1000,remaining));
    }};
    static SharedPreferences prefs(Context c){return c.getSharedPreferences("forge_native",Context.MODE_PRIVATE);}
    /** The two countdown kinds persist under different key prefixes. */
    static String prefix(String type){return TYPE_WORK.equals(type)?"work_":"timer_";}
    static String normalise(String type){return TYPE_WORK.equals(type)?TYPE_WORK:TYPE_REST;}
    @Override public void onCreate(){super.onCreate();TimerSignals.channels(this);}
    @Override public int onStartCommand(Intent intent,int flags,int startId){
        SharedPreferences p=prefs(this);
        if(intent!=null&&START.equals(intent.getAction())){
            type=normalise(intent.getStringExtra("type"));
            String key=prefix(type);
            deadline=intent.getLongExtra("deadline",0);kind=intent.getStringExtra("kind");next=intent.getStringExtra("next");
            sound=intent.getBooleanExtra("sound",true);vibrate=intent.getBooleanExtra("vibrate",true);
            p.edit().putString("timer_type",type)
                .putLong(key+"deadline",deadline).putLong(key+"cancelled",0)
                .putString(key+"kind",kind).putString(key+"next",next)
                .putBoolean(key+"sound",sound).putBoolean(key+"vibrate",vibrate).commit();
        }else{
            type=normalise(p.getString("timer_type",TYPE_REST));
            String key=prefix(type);
            deadline=p.getLong(key+"deadline",0);kind=p.getString(key+"kind",TYPE_WORK.equals(type)?"work":"rest");
            next=p.getString(key+"next",TYPE_WORK.equals(type)?"Your timed set":"Your next set");
            sound=p.getBoolean(key+"sound",true);vibrate=p.getBoolean(key+"vibrate",true);
        }
        if(deadline==0){stopSelf();return START_NOT_STICKY;}
        long remaining=Math.max(1,deadline-System.currentTimeMillis());elapsedDeadline=SystemClock.elapsedRealtime()+remaining;
        if(Build.VERSION.SDK_INT>=34)startForeground(ONGOING,notification(remaining),ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
        else startForeground(ONGOING,notification(remaining));
        handler.removeCallbacks(tick);
        if(wake!=null&&wake.isHeld())wake.release();
        wake=((PowerManager)getSystemService(POWER_SERVICE)).newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,"Forge:"+type+"Countdown");
        wake.setReferenceCounted(false);wake.acquire(remaining+30000);
        scheduleAlarm(this,deadline,type);handler.postDelayed(tick,Math.min(1000,remaining));
        return START_STICKY;
    }
    private Notification notification(long remaining){
        Intent open=new Intent(this,MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent show=PendingIntent.getActivity(this,0,open,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
        boolean work=TYPE_WORK.equals(type);
        Intent stop=new Intent(this,TimerReceiver.class).setAction(TimerReceiver.CANCEL).putExtra("deadline",deadline).putExtra("type",type);
        PendingIntent stopPI=PendingIntent.getBroadcast(this,work?104:102,stop,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
        int sec=(int)Math.ceil(remaining/1000d);
        String title=(work?"Hold timer":("transition".equals(kind)?"Switch stations":"Rest timer"))+" · "+sec/60+":"+String.format(java.util.Locale.US,"%02d",sec%60);
        return new Notification.Builder(this,TimerSignals.TIMER_CHANNEL)
            .setSmallIcon(R.drawable.ic_notification).setContentTitle(title)
            .setContentText(next==null?(work?"Hold the position":"Your next set is ready soon"):next).setContentIntent(show)
            .setOngoing(true).setOnlyAlertOnce(true).setShowWhen(false).setCategory(Notification.CATEGORY_STOPWATCH)
            .setVisibility(Notification.VISIBILITY_PUBLIC)
            .addAction(new Notification.Action.Builder(null,work?"Cancel hold":"Skip rest",stopPI).build()).build();
    }
    static PendingIntent alarmIntent(Context c,long deadline,String type){
        String t=normalise(type);
        return PendingIntent.getBroadcast(c,TYPE_WORK.equals(t)?ALARM_WORK:ALARM_REST,
            new Intent(c,TimerReceiver.class).setAction(TimerReceiver.END).putExtra("deadline",deadline).putExtra("type",t),
            PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
    }
    static void scheduleAlarm(Context c,long deadline,String type){
        AlarmManager a=(AlarmManager)c.getSystemService(Context.ALARM_SERVICE);PendingIntent pi=alarmIntent(c,deadline,type);
        try{
            if(Build.VERSION.SDK_INT<31||a.canScheduleExactAlarms())a.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,deadline,pi);
            else a.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,deadline,pi);
        }catch(Exception e){Log.w("Forge","Exact-alarm fallback unavailable",e);}
    }
    /**
     * Cancels one countdown channel. Only the channel that is actually running may stop the
     * service, so cancelling a hold can never kill an unrelated rest countdown (or vice versa).
     */
    static void cancel(Context c,boolean fromNotification,String type){
        String t=normalise(type),key=prefix(t);
        SharedPreferences p=prefs(c);
        long deadline=p.getLong(key+"deadline",0);
        String active=normalise(p.getString("timer_type",TYPE_REST));
        p.edit().putLong(key+"deadline",0).putLong(key+"cancelled",deadline).commit();
        ((AlarmManager)c.getSystemService(Context.ALARM_SERVICE)).cancel(alarmIntent(c,deadline,t));
        if(active.equals(t)){
            c.stopService(new Intent(c,RestTimerService.class));
            ((NotificationManager)c.getSystemService(Context.NOTIFICATION_SERVICE)).cancel(ONGOING);
        }
        if(fromNotification)MainActivity.callback(TYPE_WORK.equals(t)?"onNativeWorkCancelled":"onNativeTimerCancelled",Long.toString(deadline));
    }
    @Override public void onDestroy(){handler.removeCallbacks(tick);if(wake!=null&&wake.isHeld())wake.release();stopForeground(STOP_FOREGROUND_REMOVE);super.onDestroy();}
    @Override public IBinder onBind(Intent intent){return null;}
}
