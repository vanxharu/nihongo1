#!/usr/bin/env bash
# Emulator smoke test for the Android app (run by .github/workflows/android-apk.yml).
# Checks the native parts at runtime and saves screenshots to ./shots.
set -u
PKG=app.nihongo.study
mkdir -p shots
fail() { echo "::error::$1"; adb logcat -d | grep -iE "nihongo|AndroidRuntime" | tail -60; exit 1; }
shot() { sleep "${2:-2}"; adb exec-out screencap -p > "shots/$1.png"; echo "screenshot $1 ($(stat -c%s "shots/$1.png") bytes)"; }

adb install -r apk/*.apk || fail "install failed"
adb shell pm grant $PKG android.permission.POST_NOTIFICATIONS
adb logcat -c

# Process start (any component) runs DailyWordInit, which schedules the daily notification.
adb shell am start -W -n $PKG/.SettingsActivity >/dev/null || fail "SettingsActivity did not start"
shot 1-settings 4
echo "== settings UI text"; adb shell uiautomator dump /sdcard/ui.xml >/dev/null 2>&1; adb shell cat /sdcard/ui.xml | grep -oE 'text="[^"]+"' | head -25
adb shell input swipe 540 1800 540 500 300; shot 2-settings-scrolled 2
adb shell input keyevent KEYCODE_BACK; sleep 1

echo "== alarm"; adb shell dumpsys alarm | grep -A4 "$PKG" | grep -E "origWhen|repeatInterval|tag=" | head -6
adb shell dumpsys alarm | grep -q "$PKG" || echo "::warning::daily alarm not found"

# Non-exported receivers (only reachable by our own PendingIntents): root may call them.
adb root >/dev/null; sleep 3; adb wait-for-device
for i in 3 4; do
  adb shell am broadcast -f 32 -a $PKG.widget.NEXT -n $PKG/.VocabWidgetProvider >/dev/null
  adb shell am start -W -n $PKG/.SettingsActivity >/dev/null; shot "$i-preview-next" 3
  adb shell input keyevent KEYCODE_BACK; sleep 1
done
adb shell am broadcast -f 32 -a $PKG.widget.ROTATE -n $PKG/.VocabWidgetProvider >/dev/null

adb shell am broadcast -f 32 -a $PKG.DAILY_WORD -n $PKG/.DailyWord >/dev/null; sleep 3
echo "== notification"; adb shell dumpsys notification --noredact | grep -A30 "pkg=$PKG" | grep -E "android.title|android.text=|android.subText|largeIcon" | head -6
adb shell dumpsys notification --noredact | grep -q "pkg=$PKG" || fail "daily word notification not posted"
adb shell cmd statusbar expand-notifications; shot 5-notification 3
adb shell cmd statusbar collapse

echo "== widget provider"; adb shell dumpsys appwidget | grep -q "VocabWidgetProvider" || fail "widget provider not registered"
echo "== crashes"; adb logcat -d -b crash | tee crash.txt | head -30
if grep -q "$PKG" crash.txt; then fail "app crashed"; fi
echo "smoke test passed"
