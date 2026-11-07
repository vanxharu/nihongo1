package app.nihongo.study;

import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;

import org.json.JSONArray;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;
import java.util.Random;
import java.util.Set;

/**
 * Tango N5/N4/N3 words bundled in assets/words.json (built by android/overlay/build-words.ts):
 * [id, word, reading, meaning, level, example, exampleVi, wordRuby, exampleRuby, hasImage].
 * Ruby arrays hold plain strings and [base, reading] pairs. Illustrations: assets/illus/{id}.webp.
 */
final class WordRepository {
    static final class Word {
        final int index;
        final String id, word, reading, meaning, level, example, exampleVi;
        final JSONArray wordRuby, exampleRuby;
        final boolean hasImage;

        Word(int index, JSONArray a) {
            this.index = index;
            id = a.optString(0); word = a.optString(1); reading = a.optString(2); meaning = a.optString(3);
            level = a.optString(4); example = a.optString(5); exampleVi = a.optString(6);
            JSONArray wr = a.optJSONArray(7), er = a.optJSONArray(8);
            wordRuby = wr != null ? wr : new JSONArray().put(word);
            exampleRuby = er != null ? er : new JSONArray();
            hasImage = a.optInt(9) == 1;
        }

        Bitmap image(Context context) {
            if (!hasImage) return null;
            try (InputStream in = context.getAssets().open("illus/" + id + ".webp")) {
                return BitmapFactory.decodeStream(in);
            } catch (Exception e) {
                return null;
            }
        }
    }

    private static JSONArray words;
    private static final String STATE = "vocab_widget";

    private static synchronized JSONArray all(Context context) {
        if (words != null) return words;
        try (InputStream in = context.getAssets().open("words.json")) {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buf = new byte[32768];
            int n;
            while ((n = in.read(buf)) > 0) out.write(buf, 0, n);
            words = new JSONArray(new String(out.toByteArray(), StandardCharsets.UTF_8));
        } catch (Exception e) {
            words = new JSONArray();
        }
        return words;
    }

    /** Indexes of the words in the levels chosen in settings (all words if none match). */
    private static List<Integer> pool(Context context) {
        JSONArray list = all(context);
        Set<String> levels = Prefs.levels(context);
        List<Integer> out = new ArrayList<>();
        for (int i = 0; i < list.length(); i++) {
            JSONArray row = list.optJSONArray(i);
            if (row != null && levels.contains(row.optString(4))) out.add(i);
        }
        if (out.isEmpty()) for (int i = 0; i < list.length(); i++) out.add(i);
        return out;
    }

    private static Word pick(Context context, long seed) {
        List<Integer> pool = pool(context);
        if (pool.isEmpty()) return null;
        int i = pool.get((int) (((seed * 2654435761L) & 0x7fffffffL) % pool.size()));
        return new Word(i, all(context).optJSONArray(i));
    }

    private static long localDay() {
        Calendar c = Calendar.getInstance();
        return c.get(Calendar.YEAR) * 1000L + c.get(Calendar.DAY_OF_YEAR);
    }

    /** Word of the day for the daily notification. */
    static Word ofTheDay(Context context) {
        return pick(context, localDay() * 7 + 3);
    }

    /** Current rotation slot of the widget (interval from settings; "Mỗi ngày" follows the local date). */
    static long currentSlot(Context context) {
        int minutes = Prefs.intervalMinutes(context);
        if (minutes >= 1440) return localDay();
        return System.currentTimeMillis() / (minutes * 60_000L);
    }

    /** Word on the widget: one per slot; refresh overrides it until the next slot. */
    static Word forWidget(Context context) {
        SharedPreferences p = context.getSharedPreferences(STATE, Context.MODE_PRIVATE);
        long slot = currentSlot(context);
        if (p.getLong("slot", -1) == slot && p.getInt("interval", -1) == Prefs.intervalMinutes(context)) {
            int i = p.getInt("index", -1);
            JSONArray list = all(context);
            if (i >= 0 && i < list.length()) {
                Word w = new Word(i, list.optJSONArray(i));
                if (Prefs.levels(context).contains(w.level)) return w;
            }
        }
        return pick(context, slot);
    }

    static Word next(Context context) {
        Word w = pick(context, new Random().nextLong());
        if (w != null) {
            context.getSharedPreferences(STATE, Context.MODE_PRIVATE).edit()
                    .putLong("slot", currentSlot(context))
                    .putInt("interval", Prefs.intervalMinutes(context))
                    .putInt("index", w.index).apply();
        }
        return w;
    }

    private WordRepository() {}
}
