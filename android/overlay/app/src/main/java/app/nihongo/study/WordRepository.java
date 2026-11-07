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

    /** Word shown on the widget: today's word until the user taps refresh, then that choice for the day. */
    static Word forWidget(Context context) {
        SharedPreferences p = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String today = todayKey();
        if (today.equals(p.getString("day", ""))) {
            Word w = at(context, p.getInt("index", 0));
            if (w != null) return w;
        }
        return ofTheDay(context);
    }

    static Word next(Context context) {
        JSONArray list = all(context);
        if (list.length() == 0) return null;
        Word w = at(context, new Random().nextInt(list.length()));
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit()
                .putString("day", todayKey()).putInt("index", w.index).apply();
        return w;
    }

    private static String todayKey() {
        Calendar c = Calendar.getInstance();
        return c.get(Calendar.YEAR) + "-" + c.get(Calendar.DAY_OF_YEAR);
    }

    private WordRepository() {}
}
