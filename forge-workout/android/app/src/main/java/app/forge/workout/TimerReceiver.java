package app.forge.workout;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.os.Looper;

public class TimerReceiver extends BroadcastReceiver {
    static final String END="app.forge.workout.END_REST",CANCEL="app.forge.workout.CANCEL_REST";
    @Override public void onReceive(Context context,Intent intent){
        long deadline=intent.getLongExtra("deadline",0);
        if(CANCEL.equals(intent.getAction())){
            if(RestTimerService.prefs(context).getLong("timer_deadline",0)==deadline)RestTimerService.cancel(context,true);
        }else if(END.equals(intent.getAction())){
            PendingResult result=goAsync();
            TimerSignals.finish(context,deadline);
            // Keep the receiver process alive until the short cue has completed.
            new Handler(Looper.getMainLooper()).postDelayed(result::finish,1800);
        }
    }
}
