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

/** User-started foreground countdown; partial wake lock keeps it precise while screen is off. */
public class RestTimerService extends Service {
    public static final String START="app.forge.workout.START_REST";
    static final int ONGOING=100,ALARM_REQUEST=101;
    private final Handler handler=new Handler();
    private PowerManager.WakeLock wake;
    private long deadline,elapsedDeadline;
    private String next,kind;
    private boolean sound,vibrate;
    private final Runnable tick=new Runnable(){@Override public void run(){
        long remaining=elapsedDeadline-SystemClock.elapsedRealtime();
        if(remaining<=0){TimerSignals.finish(RestTimerService.this,deadline);return;}
        ((NotificationManager)getSystemService(NOTIFICATION_SERVICE)).notify(ONGOING,notification(remaining));
        handler.postDelayed(this,Math.min(1000,remaining));
    }};
    static SharedPreferences prefs(Context c){return c.getSharedPreferences("forge_native",Context.MODE_PRIVATE);}
    @Override public void onCreate(){super.onCreate();TimerSignals.channels(this);}
    @Override public int onStartCommand(Intent intent,int flags,int startId){
        SharedPreferences p=prefs(this);
        if(intent!=null&&START.equals(intent.getAction())){
            deadline=intent.getLongExtra("deadline",0);kind=intent.getStringExtra("kind");next=intent.getStringExtra("next");
            sound=intent.getBooleanExtra("sound",true);vibrate=intent.getBooleanExtra("vibrate",true);
            p.edit().putLong("timer_deadline",deadline).putLong("timer_cancelled",0).putString("timer_kind",kind).putString("timer_next",next).putBoolean("timer_sound",sound).putBoolean("timer_vibrate",vibrate).commit();
        }else{
            deadline=p.getLong("timer_deadline",0);kind=p.getString("timer_kind","rest");next=p.getString("timer_next","Your next set");sound=p.getBoolean("timer_sound",true);vibrate=p.getBoolean("timer_vibrate",true);
        }
        if(deadline==0){stopSelf();return START_NOT_STICKY;}
        long remaining=Math.max(1,deadline-System.currentTimeMillis());elapsedDeadline=SystemClock.elapsedRealtime()+remaining;
        if(Build.VERSION.SDK_INT>=34)startForeground(ONGOING,notification(remaining),ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
        else startForeground(ONGOING,notification(remaining));
        handler.removeCallbacks(tick);
        if(wake!=null&&wake.isHeld())wake.release();
        wake=((PowerManager)getSystemService(POWER_SERVICE)).newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,"Forge:restCountdown");
        wake.setReferenceCounted(false);wake.acquire(remaining+30000);
        scheduleAlarm(this,deadline);handler.postDelayed(tick,Math.min(1000,remaining));
        return START_STICKY;
    }
    private Notification notification(long remaining){
        Intent open=new Intent(this,MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent show=PendingIntent.getActivity(this,0,open,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
        Intent skip=new Intent(this,TimerReceiver.class).setAction(TimerReceiver.CANCEL).putExtra("deadline",deadline);
        PendingIntent skipPI=PendingIntent.getBroadcast(this,102,skip,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
        int sec=(int)Math.ceil(remaining/1000d);
        return new Notification.Builder(this,TimerSignals.TIMER_CHANNEL)
            .setSmallIcon(R.drawable.ic_notification).setContentTitle(("transition".equals(kind)?"Switch stations":"Rest timer")+" · "+sec/60+":"+String.format(java.util.Locale.US,"%02d",sec%60))
            .setContentText(next==null?"Your next set is ready soon":next).setContentIntent(show)
            .setOngoing(true).setOnlyAlertOnce(true).setShowWhen(false).setCategory(Notification.CATEGORY_STOPWATCH)
            .setVisibility(Notification.VISIBILITY_PUBLIC)
            .addAction(new Notification.Action.Builder(null,"Skip rest",skipPI).build()).build();
    }
    static PendingIntent alarmIntent(Context c,long deadline){
        return PendingIntent.getBroadcast(c,ALARM_REQUEST,new Intent(c,TimerReceiver.class).setAction(TimerReceiver.END).putExtra("deadline",deadline),PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
    }
    static void scheduleAlarm(Context c,long deadline){
        AlarmManager a=(AlarmManager)c.getSystemService(Context.ALARM_SERVICE);PendingIntent pi=alarmIntent(c,deadline);
        try{
            if(Build.VERSION.SDK_INT<31||a.canScheduleExactAlarms())a.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,deadline,pi);
            else a.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,deadline,pi);
        }catch(Exception e){Log.w("Forge","Exact-alarm fallback unavailable",e);}
    }
    static void cancel(Context c,boolean fromNotification){
        long deadline=prefs(c).getLong("timer_deadline",0);
        prefs(c).edit().putLong("timer_deadline",0).putLong("timer_cancelled",deadline).commit();
        ((AlarmManager)c.getSystemService(Context.ALARM_SERVICE)).cancel(alarmIntent(c,deadline));
        c.stopService(new Intent(c,RestTimerService.class));
        ((NotificationManager)c.getSystemService(Context.NOTIFICATION_SERVICE)).cancel(ONGOING);
        if(fromNotification)MainActivity.callback("onNativeTimerCancelled",Long.toString(deadline));
    }
    @Override public void onDestroy(){handler.removeCallbacks(tick);if(wake!=null&&wake.isHeld())wake.release();stopForeground(STOP_FOREGROUND_REMOVE);super.onDestroy();}
    @Override public IBinder onBind(Intent intent){return null;}
}
