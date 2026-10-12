package app.forge.workout;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.media.AudioAttributes;
import android.media.MediaPlayer;
import android.content.res.AssetFileDescriptor;
import android.os.Build;
import android.os.PowerManager;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.os.VibratorManager;
import android.util.Log;

final class TimerSignals {
    static final String TIMER_CHANNEL="forge-rest-status",COMPLETE_CHANNEL="forge-rest-complete",REMINDER_CHANNEL="forge-training";
    static void channels(Context c){
        NotificationManager n=(NotificationManager)c.getSystemService(Context.NOTIFICATION_SERVICE);
        NotificationChannel status=new NotificationChannel(TIMER_CHANNEL,"Active rest timer",NotificationManager.IMPORTANCE_LOW);
        status.setDescription("Live countdown while you rest");status.setSound(null,null);status.enableVibration(false);
        NotificationChannel complete=new NotificationChannel(COMPLETE_CHANNEL,"Rest complete",NotificationManager.IMPORTANCE_DEFAULT);
        complete.setDescription("Timer-finished message; the app separately controls sound and vibration");complete.setSound(null,null);complete.enableVibration(false);
        NotificationChannel reminder=new NotificationChannel(REMINDER_CHANNEL,"Training reminders",NotificationManager.IMPORTANCE_DEFAULT);
        reminder.setDescription("Only the training days you choose");
        n.createNotificationChannel(status);n.createNotificationChannel(complete);n.createNotificationChannel(reminder);
    }
    static boolean canNotify(Context c){return Build.VERSION.SDK_INT<33||c.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)==PackageManager.PERMISSION_GRANTED;}
    static synchronized void finish(Context c,long deadline){
        SharedPreferences p=RestTimerService.prefs(c);
        if(deadline<=0||p.getLong("timer_deadline",0)!=deadline||p.getLong("timer_delivered",0)==deadline)return;
        String next=p.getString("timer_next","Your next set is ready");boolean sound=p.getBoolean("timer_sound",true),vibrate=p.getBoolean("timer_vibrate",true);
        p.edit().putLong("timer_delivered",deadline).commit();
        RestTimerService.cancel(c,false);channels(c);cue(c,sound,vibrate);
        if(canNotify(c)){
            PendingIntent tap=PendingIntent.getActivity(c,0,new Intent(c,MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP),PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
            Notification done=new Notification.Builder(c,COMPLETE_CHANNEL).setSmallIcon(R.drawable.ic_notification).setContentTitle("Rest complete. Next set ready.").setContentText(next).setContentIntent(tap).setAutoCancel(true).setCategory(Notification.CATEGORY_ALARM).build();
            ((NotificationManager)c.getSystemService(Context.NOTIFICATION_SERVICE)).notify(201,done);
        }
        MainActivity.callback("onNativeTimerFinished",Long.toString(deadline));
    }
    static void cue(Context c,boolean sound,boolean vibrate){
        if(vibrate){
            try{Vibrator v=Build.VERSION.SDK_INT>=31?((VibratorManager)c.getSystemService(Context.VIBRATOR_MANAGER_SERVICE)).getDefaultVibrator():(Vibrator)c.getSystemService(Context.VIBRATOR_SERVICE);
                if(v!=null&&v.hasVibrator())v.vibrate(VibrationEffect.createWaveform(new long[]{0,180,80,180},-1),new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).build());
            }catch(Exception e){Log.w("Forge","Vibration",e);}
        }
        if(sound){
            try{
                PowerManager.WakeLock wake=((PowerManager)c.getSystemService(Context.POWER_SERVICE)).newWakeLock(PowerManager.PARTIAL_WAKE_LOCK,"Forge:completionCue");wake.acquire(4000);
                MediaPlayer player=new MediaPlayer();player.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build());
                try(AssetFileDescriptor fd=c.getResources().openRawResourceFd(R.raw.complete)){player.setDataSource(fd.getFileDescriptor(),fd.getStartOffset(),fd.getLength());}
                player.setOnCompletionListener(mp->{mp.release();if(wake.isHeld())wake.release();});
                player.setOnErrorListener((mp,what,extra)->{mp.release();if(wake.isHeld())wake.release();return true;});
                player.prepare();player.start();
            }catch(Exception e){Log.w("Forge","Completion sound",e);}
        }
    }
}
