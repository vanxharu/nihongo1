package app.nihongo.study;

import android.content.Context;
import android.content.SharedPreferences;

import org.json.JSONArray;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Calendar;
import java.util.Random;

/** Tango N5/N4/N3 words bundled in assets/words.json: [word, reading, meaning, level, example, exampleVi]. */
final class WordRepository {
    static final class Word {
        final int index;
        final String word, reading, meaning, level, example, exampleVi;
        Word(int index, JSONArray a) {
            this.index = index;
            word = a.optString(0); reading = a.optString(1); meaning = a.optString(2);
            level = a.optString(3); example = a.optString(4); exampleVi = a.optString(5);
        }
    }

    private static JSONArray words;
    private static final String PREFS = "vocab_widget";

    private static synchronized JSONArray all(Context context) {
        if (words != null) return words;
        try (InputStream in = context.getAssets().open("words.json")) {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buf = new byte[16384];
            int n;
            while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
            words = new JSONArray(new String(out.toByteArray(), StandardCharsets.UTF_8));
        } catch (Exception e) {
            words = new JSONArray();
        }
        return words;
    }

    private static Word at(Context context, int index) {
        JSONArray list = all(context);
        if (list.length() == 0) return null;
        int i = ((index % list.length()) + list.length()) % list.length();
        return new Word(i, list.optJSONArray(i));
    }

    /** Same word for everyone on a given day (local date), spread over the whole list. */
    static Word ofTheDay(Context context) {
        Calendar c = Calendar.getInstance();
        long day = c.get(Calendar.YEAR) * 1000L + c.get(Calendar.DAY_OF_YEAR);
        return at(context, (int) ((day * 2654435761L) & 0x7fffffff));
    }

    /** The widget shows a new word every 5 minutes. */
    static final long WIDGET_ROTATE_MS = 5 * 60 * 1000L;

    private static long currentSlot() {
        return System.currentTimeMillis() / WIDGET_ROTATE_MS;
    }

    /** Word shown on the widget: one per 5-minute slot; a tap on refresh overrides it until the next slot. */
    static Word forWidget(Context context) {
        SharedPreferences p = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        long slot = currentSlot();
        if (p.getLong("slot", -1) == slot) {
            Word w = at(context, p.getInt("index", 0));
            if (w != null) return w;
        }
        return at(context, (int) ((slot * 2654435761L) & 0x7fffffff));
    }

    static Word next(Context context) {
        JSONArray list = all(context);
        if (list.length() == 0) return null;
        Word w = at(context, new Random().nextInt(list.length()));
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
                .putLong("slot", currentSlot()).putInt("index", w.index).apply();
        return w;
    }

    private WordRepository() {}
}
