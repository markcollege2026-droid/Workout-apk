package app.forge.workout;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import org.json.JSONObject;
import org.json.JSONArray;
import java.util.Calendar;

public class ReminderReceiver extends BroadcastReceiver {
    static final String REMIND="app.forge.workout.TRAINING_DAY";
    static void schedule(Context c){
        AlarmManager alarms=(AlarmManager)c.getSystemService(Context.ALARM_SERVICE);
        for(int day=0;day<7;day++)alarms.cancel(pending(c,day));
        try{
            JSONObject config=new JSONObject(RestTimerService.prefs(c).getString("reminders","{\"days\":[],\"time\":\"18:00\"}"));
            JSONArray days=config.getJSONArray("days");String[] time=config.getString("time").split(":");
            for(int i=0;i<days.length();i++){
                int day=days.getInt(i);Calendar now=Calendar.getInstance(),next=Calendar.getInstance();
                next.set(Calendar.HOUR_OF_DAY,Integer.parseInt(time[0]));next.set(Calendar.MINUTE,Integer.parseInt(time[1]));next.set(Calendar.SECOND,0);next.set(Calendar.MILLISECOND,0);
                int delta=(day+1-now.get(Calendar.DAY_OF_WEEK)+7)%7;next.add(Calendar.DAY_OF_YEAR,delta);
                if(next.getTimeInMillis()<=System.currentTimeMillis())next.add(Calendar.DAY_OF_YEAR,7);
                alarms.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,next.getTimeInMillis(),pending(c,day));
            }
        }catch(Exception e){android.util.Log.w("Forge","Reminder settings",e);}
    }
    private static PendingIntent pending(Context c,int day){return PendingIntent.getBroadcast(c,300+day,new Intent(c,ReminderReceiver.class).setAction(REMIND).putExtra("day",day),PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);}
    @Override public void onReceive(Context c,Intent intent){
        if(REMIND.equals(intent.getAction())&&TimerSignals.canNotify(c)){
            TimerSignals.channels(c);
            PendingIntent tap=PendingIntent.getActivity(c,0,new Intent(c,MainActivity.class),PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
            Notification reminder=new Notification.Builder(c,TimerSignals.REMINDER_CHANNEL).setSmallIcon(R.drawable.ic_notification).setContentTitle("A little better. One session at a time.").setContentText("Your training day is here. Plan your next rep in Forge.").setContentIntent(tap).setAutoCancel(true).build();
            ((NotificationManager)c.getSystemService(Context.NOTIFICATION_SERVICE)).notify(301,reminder);
        }
        schedule(c);
        if(!REMIND.equals(intent.getAction())){
            long deadline=RestTimerService.prefs(c).getLong("timer_deadline",0);
            if(deadline>System.currentTimeMillis())RestTimerService.scheduleAlarm(c,deadline);
            else if(deadline>0)RestTimerService.prefs(c).edit().putLong("timer_deadline",0).apply();
        }
    }
}
