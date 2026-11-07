// Copies the native additions (vocabulary widget + daily word notification) into the Android project
// that `bubblewrap update` generates, and registers them in AndroidManifest.xml.
// Usage (from android/): node overlay/apply.mjs
import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(new URL(import.meta.url).pathname);
const project = path.resolve(here, '..');
const twa = JSON.parse(fs.readFileSync(path.join(project, 'twa-manifest.json'), 'utf8'));

function copyDir(src, dst) {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) { fs.mkdirSync(d, { recursive: true }); copyDir(s, d); }
    else fs.copyFileSync(s, d);
  }
}
copyDir(path.join(here, 'app'), path.join(project, 'app'));

const pkgDir = path.join(project, 'app/src/main/java', ...twa.packageId.split('.'));
const hostFile = path.join(pkgDir, 'BuildConfigHost.java');
fs.writeFileSync(hostFile, fs.readFileSync(hostFile, 'utf8').replace('__TWA_HOST__', twa.host));

const manifestPath = path.join(project, 'app/src/main/AndroidManifest.xml');
let manifest = fs.readFileSync(manifestPath, 'utf8');
if (manifest.includes('VocabWidgetProvider')) {
  console.log('AndroidManifest.xml already patched');
} else {
  const permissions = ['android.permission.RECEIVE_BOOT_COMPLETED', 'android.permission.POST_NOTIFICATIONS']
    .filter((p) => !manifest.includes(`"${p}"`))
    .map((p) => `    <uses-permission android:name="${p}" />\n`).join('');
  manifest = manifest.replace(/(<application[\s>])/, `${permissions}$1`);
  const components = `
        <!-- NihonGo!: "Từ vựng hôm nay" home-screen widget -->
        <receiver android:name=".VocabWidgetProvider" android:exported="false" android:label="@string/widget_label">
            <intent-filter>
                <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
                <action android:name="app.nihongo.study.widget.NEXT" />
            </intent-filter>
            <meta-data android:name="android.appwidget.provider" android:resource="@xml/vocab_widget_info" />
        </receiver>
        <!-- NihonGo!: daily vocabulary notification (20:00) -->
        <receiver android:name=".DailyWord" android:exported="false">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
                <action android:name="android.intent.action.MY_PACKAGE_REPLACED" />
                <action android:name="android.intent.action.TIMEZONE_CHANGED" />
            </intent-filter>
        </receiver>
        <provider android:name=".DailyWordInit" android:authorities="${twa.packageId}.dailywordinit" android:exported="false" />
`;
  if (!manifest.includes('</application>')) throw new Error('</application> not found in AndroidManifest.xml');
  manifest = manifest.replace('</application>', `${components}    </application>`);
  fs.writeFileSync(manifestPath, manifest);
  console.log('AndroidManifest.xml patched');
}
