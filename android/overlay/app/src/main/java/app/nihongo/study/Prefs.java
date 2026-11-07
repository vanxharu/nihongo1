package app.nihongo.study;

import android.content.Context;
import android.content.SharedPreferences;

import java.util.HashSet;
import java.util.Set;

/** User settings for the widget and the daily notification (edited in SettingsActivity). */
final class Prefs {
    static final String[] LEVELS = {"N5", "N4", "N3"};
    /** Widget rotation choices in minutes; 1440 = once a day. */
    static final int[] INTERVALS = {5, 15, 30, 60, 180, 1440};
    static final String[] INTERVAL_LABELS = {"5 phút", "15 phút", "30 phút", "1 giờ", "3 giờ", "Mỗi ngày"};

    private static final String FILE = "nihongo_settings";

    private static SharedPreferences p(Context c) {
        return c.getSharedPreferences(FILE, Context.MODE_PRIVATE);
    }

    static Set<String> levels(Context c) {
        Set<String> s = p(c).getStringSet("levels", null);
        Set<String> out = new HashSet<>();
        if (s != null) out.addAll(s);
        if (out.isEmpty()) for (String l : LEVELS) out.add(l);
        return out;
    }

    static int intervalMinutes(Context c) {
        return p(c).getInt("interval", 5);
    }

    static boolean notifyEnabled(Context c) {
        return p(c).getBoolean("notify", true);
    }

    static int notifyHour(Context c) {
        return p(c).getInt("notifyHour", 20);
    }

    static int notifyMinute(Context c) {
        return p(c).getInt("notifyMinute", 0);
    }

    static void save(Context c, Set<String> levels, int interval, boolean notify, int hour, int minute) {
        p(c).edit()
                .putStringSet("levels", new HashSet<>(levels))
                .putInt("interval", interval)
                .putBoolean("notify", notify)
                .putInt("notifyHour", hour)
                .putInt("notifyMinute", minute)
                .apply();
    }

    private Prefs() {}
}
