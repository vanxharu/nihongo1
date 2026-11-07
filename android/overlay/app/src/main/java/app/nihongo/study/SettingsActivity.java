package app.nihongo.study;

import android.Manifest;
import android.app.Activity;
import android.app.TimePickerDialog;
import android.appwidget.AppWidgetManager;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.res.ColorStateList;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.os.Build;
import android.os.Bundle;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.RadioButton;
import android.widget.RadioGroup;
import android.widget.RemoteViews;
import android.widget.ScrollView;
import android.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

import java.util.HashSet;
import java.util.Locale;
import java.util.Set;

/**
 * Settings for the vocabulary widget and the daily notification: levels, rotation interval,
 * notification on/off and time. Also the widget's configuration screen (shown when it is added,
 * and from the ⚙ button / long-press "reconfigure").
 */
public class SettingsActivity extends Activity {
    private static final int BG = 0xFF0F172A, CARD = 0xFF1E293B, PINK = 0xFFF36A78, MUTED = 0xFF94A3B8;
    private int widgetId = AppWidgetManager.INVALID_APPWIDGET_ID;
    private final CheckBox[] levelBoxes = new CheckBox[Prefs.LEVELS.length];
    private RadioGroup intervals;
    private Switch notifySwitch;
    private Button timeButton;
    private TextView permissionNote;
    private Button permissionButton;
    private FrameLayout preview;
    private int hour, minute;
    private boolean finishAfterPermission;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        Bundle extras = getIntent().getExtras();
        if (extras != null) widgetId = extras.getInt(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID);
        // Pressing back while adding the widget still adds it, with the current settings.
        if (widgetId != AppWidgetManager.INVALID_APPWIDGET_ID) setResult(RESULT_OK, resultIntent());
        getWindow().setStatusBarColor(BG);
        getWindow().setNavigationBarColor(BG);
        hour = Prefs.notifyHour(this);
        minute = Prefs.notifyMinute(this);
        setContentView(buildUi());
        renderPreview();
    }

    @Override
    protected void onResume() {
        super.onResume();
        updatePermissionUi();
    }

    private Intent resultIntent() {
        return new Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId);
    }

    private int dp(float v) {
        return (int) TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, getResources().getDisplayMetrics());
    }

    private View buildUi() {
        ScrollView scroll = new ScrollView(this);
        scroll.setBackgroundColor(BG);
        scroll.setFillViewport(true);
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(dp(20), dp(24), dp(20), dp(24));
        scroll.addView(root);

        TextView title = text("Cài đặt từ vựng", 22, Color.WHITE, true);
        root.addView(title);
        TextView sub = text("Widget màn hình chính và thông báo từ vựng mỗi ngày", 13, MUTED, false);
        sub.setPadding(0, dp(4), 0, dp(16));
        root.addView(sub);

        root.addView(section("Xem trước"));
        preview = new FrameLayout(this);
        root.addView(preview, new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(160)));

        LinearLayout levels = card(root, "Cấp độ");
        Set<String> chosen = Prefs.levels(this);
        String[] notes = {"N5 · từ cơ bản", "N4 · có ảnh minh hoạ", "N3 · một nửa có ảnh"};
        for (int i = 0; i < Prefs.LEVELS.length; i++) {
            CheckBox cb = new CheckBox(this);
            cb.setText(notes[i]);
            cb.setTextColor(Color.WHITE);
            cb.setTextSize(15);
            cb.setButtonTintList(ColorStateList.valueOf(PINK));
            cb.setChecked(chosen.contains(Prefs.LEVELS[i]));
            cb.setMinHeight(dp(44));
            final int idx = i;
            cb.setOnCheckedChangeListener((b, checked) -> {
                if (!checked && selectedLevels().isEmpty()) {
                    b.setChecked(true);
                    Toast.makeText(this, "Cần chọn ít nhất một cấp độ", Toast.LENGTH_SHORT).show();
                    return;
                }
                renderPreview();
            });
            levelBoxes[idx] = cb;
            levels.addView(cb);
        }

        LinearLayout interval = card(root, "Đổi từ mới sau");
        intervals = new RadioGroup(this);
        intervals.setOrientation(RadioGroup.VERTICAL);
        int current = Prefs.intervalMinutes(this);
        for (int i = 0; i < Prefs.INTERVALS.length; i++) {
            RadioButton rb = new RadioButton(this);
            rb.setId(View.generateViewId());
            rb.setTag(Prefs.INTERVALS[i]);
            rb.setText(Prefs.INTERVAL_LABELS[i]);
            rb.setTextColor(Color.WHITE);
            rb.setTextSize(15);
            rb.setMinHeight(dp(44));
            rb.setButtonTintList(ColorStateList.valueOf(PINK));
            intervals.addView(rb);
            if (Prefs.INTERVALS[i] == current) intervals.check(rb.getId());
        }
        interval.addView(intervals);
        TextView hint = text("Khi màn hình tắt, widget không đổi từ để tiết kiệm pin.", 12, MUTED, false);
        hint.setPadding(0, dp(4), 0, 0);
        interval.addView(hint);

        LinearLayout notify = card(root, "Thông báo từ vựng mỗi ngày");
        LinearLayout row = new LinearLayout(this);
        row.setGravity(Gravity.CENTER_VERTICAL);
        notifySwitch = new Switch(this);
        notifySwitch.setText("Nhận thông báo");
        notifySwitch.setTextColor(Color.WHITE);
        notifySwitch.setTextSize(15);
        notifySwitch.setMinHeight(dp(44));
        notifySwitch.setChecked(Prefs.notifyEnabled(this));
        notifySwitch.setThumbTintList(ColorStateList.valueOf(PINK));
        row.addView(notifySwitch, new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        notify.addView(row);

        LinearLayout timeRow = new LinearLayout(this);
        timeRow.setGravity(Gravity.CENTER_VERTICAL);
        timeRow.setPadding(0, dp(8), 0, 0);
        timeRow.addView(text("Giờ nhận", 15, Color.WHITE, false), new LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1));
        timeButton = pill(formatTime(), CARD, Color.WHITE);
        timeButton.setOnClickListener(v -> new TimePickerDialog(this, (tp, h, m) -> {
            hour = h; minute = m; timeButton.setText(formatTime());
        }, hour, minute, true).show());
        timeRow.addView(timeButton);
        notify.addView(timeRow);
        notifySwitch.setOnCheckedChangeListener((b, on) -> {
            timeButton.setEnabled(on);
            timeButton.setAlpha(on ? 1f : 0.4f);
            updatePermissionUi();
        });
        timeButton.setEnabled(notifySwitch.isChecked());
        timeButton.setAlpha(notifySwitch.isChecked() ? 1f : 0.4f);

        permissionNote = text("Android đang chặn thông báo của NihonGo!.", 13, 0xFFFBBF24, false);
        permissionNote.setPadding(0, dp(10), 0, dp(6));
        notify.addView(permissionNote);
        permissionButton = pill("Cho phép thông báo", CARD, Color.WHITE);
        permissionButton.setOnClickListener(v -> requestNotificationPermission());
        notify.addView(permissionButton);

        Button save = pill("Lưu", PINK, Color.WHITE);
        save.setTextSize(16);
        LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(52));
        lp.topMargin = dp(20);
        root.addView(save, lp);
        save.setOnClickListener(v -> save());
        return scroll;
    }

    private TextView text(String s, float size, int color, boolean bold) {
        TextView t = new TextView(this);
        t.setText(s);
        t.setTextSize(size);
        t.setTextColor(color);
        if (bold) t.setTypeface(Typeface.DEFAULT_BOLD);
        return t;
    }

    private TextView section(String s) {
        TextView t = text(s, 13, MUTED, true);
        t.setPadding(0, dp(16), 0, dp(8));
        return t;
    }

    private LinearLayout card(LinearLayout root, String title) {
        root.addView(section(title));
        LinearLayout c = new LinearLayout(this);
        c.setOrientation(LinearLayout.VERTICAL);
        c.setPadding(dp(14), dp(6), dp(14), dp(10));
        GradientDrawable bg = new GradientDrawable();
        bg.setColor(0xFF111C33);
        bg.setStroke(dp(1), 0xFF2A3550);
        bg.setCornerRadius(dp(16));
        c.setBackground(bg);
        root.addView(c);
        return c;
    }

    private Button pill(String label, int bg, int fg) {
        Button b = new Button(this);
        b.setText(label);
        b.setAllCaps(false);
        b.setTextColor(fg);
        b.setTypeface(Typeface.DEFAULT_BOLD);
        GradientDrawable d = new GradientDrawable();
        d.setColor(bg);
        d.setCornerRadius(dp(14));
        b.setBackground(d);
        b.setMinHeight(dp(44));
        b.setPadding(dp(16), 0, dp(16), 0);
        b.setStateListAnimator(null);
        return b;
    }

    private String formatTime() {
        return String.format(Locale.ROOT, "%02d:%02d", hour, minute);
    }

    private Set<String> selectedLevels() {
        Set<String> out = new HashSet<>();
        for (int i = 0; i < levelBoxes.length; i++) if (levelBoxes[i] != null && levelBoxes[i].isChecked()) out.add(Prefs.LEVELS[i]);
        return out;
    }

    private int selectedInterval() {
        View rb = intervals.findViewById(intervals.getCheckedRadioButtonId());
        return rb != null ? (int) rb.getTag() : 5;
    }

    private boolean notificationsAllowed() {
        return Build.VERSION.SDK_INT < 33 || checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
    }

    private void updatePermissionUi() {
        if (permissionNote == null) return;
        boolean show = notifySwitch.isChecked() && !notificationsAllowed();
        permissionNote.setVisibility(show ? View.VISIBLE : View.GONE);
        permissionButton.setVisibility(show ? View.VISIBLE : View.GONE);
    }

    private void requestNotificationPermission() {
        if (Build.VERSION.SDK_INT >= 33) requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 7);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] results) {
        super.onRequestPermissionsResult(requestCode, permissions, results);
        updatePermissionUi();
        if (finishAfterPermission) finish();
    }

    /** Live preview: the same RemoteViews the widget uses, with the levels currently ticked. */
    private void renderPreview() {
        Set<String> saved = Prefs.levels(this);
        Set<String> ticked = selectedLevels();
        WordRepository.Word w;
        if (ticked.isEmpty() || ticked.equals(saved)) {
            w = WordRepository.forWidget(this);
        } else {
            // Temporarily apply the ticked levels for the preview only.
            Prefs.save(this, ticked, Prefs.intervalMinutes(this), Prefs.notifyEnabled(this), Prefs.notifyHour(this), Prefs.notifyMinute(this));
            w = WordRepository.forWidget(this);
            Prefs.save(this, saved, Prefs.intervalMinutes(this), Prefs.notifyEnabled(this), Prefs.notifyHour(this), Prefs.notifyMinute(this));
        }
        int widthDp = (int) (getResources().getDisplayMetrics().widthPixels / getResources().getDisplayMetrics().density) - 40;
        RemoteViews rv = VocabWidgetProvider.build(this, w, Math.min(widthDp, 360), 160);
        preview.removeAllViews();
        try {
            View v = rv.apply(this, preview);
            v.setClickable(false);
            preview.addView(v, new FrameLayout.LayoutParams(dp(Math.min(widthDp, 360)), ViewGroup.LayoutParams.MATCH_PARENT));
        } catch (RuntimeException e) {
            preview.addView(text("Không hiển thị được xem trước", 13, MUTED, false));
        }
    }

    private void save() {
        Prefs.save(this, selectedLevels(), selectedInterval(), notifySwitch.isChecked(), hour, minute);
        DailyWord.ensureScheduled(this);
        VocabWidgetProvider.ensureRotation(this);
        VocabWidgetProvider.refreshAll(this);
        Toast.makeText(this, "Đã lưu", Toast.LENGTH_SHORT).show();
        if (widgetId != AppWidgetManager.INVALID_APPWIDGET_ID) setResult(RESULT_OK, resultIntent());
        if (notifySwitch.isChecked() && !notificationsAllowed() && Build.VERSION.SDK_INT >= 33) {
            finishAfterPermission = true; // close once the user has answered the permission dialog
            requestNotificationPermission();
        } else {
            finish();
        }
    }
}
