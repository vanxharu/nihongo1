package app.nihongo.study;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapShader;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Shader;
import android.graphics.Typeface;
import android.os.Bundle;
import android.os.SystemClock;
import android.text.TextUtils;
import android.view.View;
import android.widget.RemoteViews;

/** Home-screen widget: illustration, word with furigana, meaning, example with furigana + translation. */
public class VocabWidgetProvider extends AppWidgetProvider {
    static final String ACTION_NEXT = "app.nihongo.study.widget.NEXT";
    static final String ACTION_ROTATE = "app.nihongo.study.widget.ROTATE";

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        ensureRotation(context);
        renderAll(context, manager, ids, WordRepository.forWidget(context));
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager manager, int id, Bundle options) {
        renderAll(context, manager, new int[]{id}, WordRepository.forWidget(context));
    }

    @Override
    public void onEnabled(Context context) {
        DailyWord.ensureScheduled(context);
        ensureRotation(context);
    }

    @Override
    public void onDisabled(Context context) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am != null) am.cancel(rotationIntent(context));
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        if (ACTION_NEXT.equals(action)) {
            renderAll(context, AppWidgetManager.getInstance(context), ids(context), WordRepository.next(context));
            return;
        }
        if (ACTION_ROTATE.equals(action)) {
            refreshAll(context);
            return;
        }
        super.onReceive(context, intent);
    }

    private static int[] ids(Context context) {
        return AppWidgetManager.getInstance(context).getAppWidgetIds(new ComponentName(context, VocabWidgetProvider.class));
    }

    static void refreshAll(Context context) {
        int[] ids = ids(context);
        if (ids.length > 0) renderAll(context, AppWidgetManager.getInstance(context), ids, WordRepository.forWidget(context));
    }

    /**
     * Rotation alarm with the interval from settings, while widgets exist. Non-wakeup: it never wakes the
     * phone; while the screen is off it waits and fires when the device is awake again.
     */
    static void ensureRotation(Context context) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        if (ids(context).length == 0) { am.cancel(rotationIntent(context)); return; }
        long period = Math.min(Prefs.intervalMinutes(context), 1440) * 60_000L;
        long untilNext = period >= 86_400_000L ? 60 * 60_000L : period - (System.currentTimeMillis() % period);
        // "Mỗi ngày": check hourly; the word itself follows the local date, so it changes once a day.
        long repeat = period >= 86_400_000L ? 60 * 60_000L : period;
        am.setRepeating(AlarmManager.ELAPSED_REALTIME, SystemClock.elapsedRealtime() + untilNext, repeat,
                rotationIntent(context));
    }

    private static PendingIntent rotationIntent(Context context) {
        Intent i = new Intent(context, VocabWidgetProvider.class).setAction(ACTION_ROTATE);
        return PendingIntent.getBroadcast(context, 4, i, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    private static void renderAll(Context context, AppWidgetManager manager, int[] ids, WordRepository.Word w) {
        for (int id : ids) {
            Bundle o = manager.getAppWidgetOptions(id);
            int widthDp = o.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 0);
            int heightDp = o.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 0);
            manager.updateAppWidget(id, build(context, w, widthDp > 0 ? widthDp : 300, heightDp > 0 ? heightDp : 150));
        }
    }

    /** Builds the widget views for a word at a given size (also used by the settings preview). */
    static RemoteViews build(Context context, WordRepository.Word w, int widthDp, int heightDp) {
        float d = context.getResources().getDisplayMetrics().density;
        float sp = context.getResources().getDisplayMetrics().scaledDensity;
        RemoteViews v = new RemoteViews(context.getPackageName(), R.layout.widget_vocab);
        int contentPx = (int) ((widthDp - 12 - 8 - 4) * d);   // root padding + end inset
        int wordPx = contentPx - (int) ((76 + 10) * d);        // minus image and gap

        if (w != null) {
            v.setTextViewText(R.id.widget_level, w.level);
            v.setTextViewText(R.id.widget_meaning, w.meaning);

            RubyRenderer.Style ws = new RubyRenderer.Style();
            ws.textPx = 24 * sp; ws.rubyPx = 10 * sp; ws.bold = true; ws.maxLines = 1;
            ws.textColor = 0xFFFFFFFF; ws.rubyColor = 0xFFF9A8B4;
            v.setImageViewBitmap(R.id.widget_word, RubyRenderer.render(w.wordRuby, Math.max(wordPx, 1), ws));

            Bitmap img = w.image(context);
            v.setImageViewBitmap(R.id.widget_image, img != null ? rounded(img, (int) (76 * d), 12 * d)
                    : placeholder(w.word, (int) (76 * d), 12 * d));

            // 4x2 (~110-150dp tall): word + one example line; taller (resized to 3 rows): + translation.
            boolean hasExample = w.exampleRuby.length() > 0 && heightDp >= 120;
            v.setViewVisibility(R.id.widget_divider, hasExample ? View.VISIBLE : View.GONE);
            v.setViewVisibility(R.id.widget_example, hasExample ? View.VISIBLE : View.GONE);
            if (hasExample) {
                RubyRenderer.Style es = new RubyRenderer.Style();
                es.textPx = 14 * sp; es.rubyPx = 8 * sp; es.bold = false;
                es.maxLines = heightDp >= 220 ? 2 : 1;
                es.textColor = 0xFFE2E8F0; es.rubyColor = 0xFF94A3B8;
                v.setImageViewBitmap(R.id.widget_example, RubyRenderer.render(w.exampleRuby, Math.max(contentPx, 1), es));
            }
            boolean showVi = hasExample && !TextUtils.isEmpty(w.exampleVi) && heightDp >= 170;
            v.setViewVisibility(R.id.widget_example_vi, showVi ? View.VISIBLE : View.GONE);
            if (showVi) v.setTextViewText(R.id.widget_example_vi, w.exampleVi);
        }

        v.setOnClickPendingIntent(R.id.widget_root, DailyWord.openApp(context, "/tango", 1));
        Intent next = new Intent(context, VocabWidgetProvider.class).setAction(ACTION_NEXT);
        v.setOnClickPendingIntent(R.id.widget_next, PendingIntent.getBroadcast(context, 2, next,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
        Intent settings = new Intent(context, SettingsActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        v.setOnClickPendingIntent(R.id.widget_settings, PendingIntent.getActivity(context, 5, settings,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
        return v;
    }

    private static Bitmap rounded(Bitmap src, int size, float radius) {
        Bitmap out = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888);
        Canvas c = new Canvas(out);
        Bitmap scaled = Bitmap.createScaledBitmap(src, size, size, true);
        Paint p = new Paint(Paint.ANTI_ALIAS_FLAG);
        p.setShader(new BitmapShader(scaled, Shader.TileMode.CLAMP, Shader.TileMode.CLAMP));
        c.drawRoundRect(new RectF(0, 0, size, size), radius, radius, p);
        return out;
    }

    /** For words without an illustration: the first character on a soft tile. */
    private static Bitmap placeholder(String word, int size, float radius) {
        Bitmap out = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888);
        Canvas c = new Canvas(out);
        Paint bg = new Paint(Paint.ANTI_ALIAS_FLAG);
        bg.setColor(0xFF1E293B);
        c.drawRoundRect(new RectF(0, 0, size, size), radius, radius, bg);
        // First Japanese letter (skips brackets, 〜 and other marks).
        String ch = "語";
        for (int i = 0; i < word.length(); ) {
            int cp = word.codePointAt(i);
            Character.UnicodeBlock b = Character.UnicodeBlock.of(cp);
            if (b == Character.UnicodeBlock.HIRAGANA || b == Character.UnicodeBlock.KATAKANA
                    || b == Character.UnicodeBlock.CJK_UNIFIED_IDEOGRAPHS) { ch = new String(Character.toChars(cp)); break; }
            i += Character.charCount(cp);
        }
        Paint t = new Paint(Paint.ANTI_ALIAS_FLAG);
        t.setColor(0xFFF36A78);
        t.setTypeface(Typeface.DEFAULT_BOLD);
        t.setTextSize(size * 0.5f);
        Paint.FontMetrics fm = t.getFontMetrics();
        float tw = t.measureText(ch);
        c.drawText(ch, (size - tw) / 2f, size / 2f - (fm.ascent + fm.descent) / 2f, t);
        return out;
    }
}
