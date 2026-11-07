package app.nihongo.study;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.text.TextUtils;
import android.view.View;
import android.widget.RemoteViews;

/** Home-screen widget "Từ vựng hôm nay": level, word, reading, meaning, refresh button. */
public class VocabWidgetProvider extends AppWidgetProvider {
    static final String ACTION_NEXT = "app.nihongo.study.widget.NEXT";

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        render(context, manager, ids, WordRepository.forWidget(context));
    }

    @Override
    public void onEnabled(Context context) {
        DailyWord.ensureScheduled(context);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        if (ACTION_NEXT.equals(intent.getAction())) {
            AppWidgetManager manager = AppWidgetManager.getInstance(context);
            int[] ids = manager.getAppWidgetIds(new ComponentName(context, VocabWidgetProvider.class));
            render(context, manager, ids, WordRepository.next(context));
            return;
        }
        super.onReceive(context, intent);
    }

    static void refreshAll(Context context) {
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        int[] ids = manager.getAppWidgetIds(new ComponentName(context, VocabWidgetProvider.class));
        if (ids.length > 0) render(context, manager, ids, WordRepository.forWidget(context));
    }

    private static void render(Context context, AppWidgetManager manager, int[] ids, WordRepository.Word w) {
        for (int id : ids) {
            RemoteViews v = new RemoteViews(context.getPackageName(), R.layout.widget_vocab);
            if (w != null) {
                v.setTextViewText(R.id.widget_level, w.level);
                v.setTextViewText(R.id.widget_word, w.word);
                v.setTextViewText(R.id.widget_reading, w.reading);
                v.setViewVisibility(R.id.widget_reading, TextUtils.isEmpty(w.reading) ? View.GONE : View.VISIBLE);
                v.setTextViewText(R.id.widget_meaning, w.meaning);
            }
            v.setOnClickPendingIntent(R.id.widget_root, DailyWord.openApp(context, "/tango", 1));
            Intent next = new Intent(context, VocabWidgetProvider.class).setAction(ACTION_NEXT);
            v.setOnClickPendingIntent(R.id.widget_next, PendingIntent.getBroadcast(context, 2, next,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
            manager.updateAppWidget(id, v);
        }
    }
}
