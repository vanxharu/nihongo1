package app.nihongo.study;

import android.Manifest;
import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.text.TextUtils;

import java.util.Calendar;

/**
 * Daily vocabulary notification at 20:00 (inexact, battery friendly), plus the daily widget refresh.
 * Scheduled at app start (DailyWordInit), when the widget is added and after reboot.
 */
public class DailyWord extends BroadcastReceiver {
    static final String CHANNEL_ID = "daily_word";
    static final String ACTION_FIRE = "app.nihongo.study.DAILY_WORD";
    private static final int NOTIFY_HOUR = 20;
    private static final int NOTIFICATION_ID = 2001;

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        if (ACTION_FIRE.equals(action)) {
            VocabWidgetProvider.refreshAll(context);
            notifyWord(context);
        } else {
            // BOOT_COMPLETED, MY_PACKAGE_REPLACED, TIMEZONE_CHANGED
            ensureScheduled(context);
            VocabWidgetProvider.ensureRotation(context);
            VocabWidgetProvider.refreshAll(context);
        }
    }

    static void ensureChannel(Context context) {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationManager nm = context.getSystemService(NotificationManager.class);
        if (nm == null || nm.getNotificationChannel(CHANNEL_ID) != null) return;
        NotificationChannel ch = new NotificationChannel(CHANNEL_ID, "Từ vựng mỗi ngày", NotificationManager.IMPORTANCE_DEFAULT);
        ch.setDescription("Một từ vựng JLPT mỗi tối lúc 20:00");
        nm.createNotificationChannel(ch);
    }

    static void ensureScheduled(Context context) {
        ensureChannel(context);
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        Calendar next = Calendar.getInstance();
        next.set(Calendar.HOUR_OF_DAY, NOTIFY_HOUR);
        next.set(Calendar.MINUTE, 0);
        next.set(Calendar.SECOND, 0);
        if (next.getTimeInMillis() <= System.currentTimeMillis()) next.add(Calendar.DAY_OF_YEAR, 1);
        Intent i = new Intent(context, DailyWord.class).setAction(ACTION_FIRE);
        PendingIntent pi = PendingIntent.getBroadcast(context, 1, i,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        // Re-registering replaces the previous alarm (same PendingIntent), so this is safe to call often.
        am.setInexactRepeating(AlarmManager.RTC_WAKEUP, next.getTimeInMillis(), AlarmManager.INTERVAL_DAY, pi);
    }

    private static void notifyWord(Context context) {
        if (Build.VERSION.SDK_INT >= 33 && context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) return;
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        WordRepository.Word w = WordRepository.ofTheDay(context);
        if (nm == null || w == null) return;
        ensureChannel(context);

        String title = TextUtils.isEmpty(w.reading) ? w.word : w.word + "（" + w.reading + "）";
        StringBuilder body = new StringBuilder(w.meaning);
        if (!TextUtils.isEmpty(w.example)) {
            body.append("\n\n").append(w.example);
            if (!TextUtils.isEmpty(w.exampleVi)) body.append("\n").append(w.exampleVi);
        }
        Notification.Builder b = Build.VERSION.SDK_INT >= 26
                ? new Notification.Builder(context, CHANNEL_ID)
                : new Notification.Builder(context);
        b.setSmallIcon(R.drawable.ic_notification_word)
                .setContentTitle(title)
                .setContentText(w.meaning)
                .setSubText(w.level + " · Từ vựng mỗi ngày")
                .setStyle(new Notification.BigTextStyle().bigText(body.toString()))
                .setColor(0xFFF36A78)
                .setAutoCancel(true)
                .setContentIntent(openApp(context, "/tango", 3));
        nm.notify(NOTIFICATION_ID, b.build());
    }

    /** Opens the Trusted Web Activity at a path of the site. */
    static PendingIntent openApp(Context context, String path, int requestCode) {
        Intent open = new Intent(Intent.ACTION_VIEW, Uri.parse("https://" + BuildConfigHost.HOST + path));
        open.setPackage(context.getPackageName());
        open.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        return PendingIntent.getActivity(context, requestCode, open,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
}
