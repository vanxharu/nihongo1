# Android app (TWA)

`NihonGo!` for Android is a Trusted Web Activity: the APK opens
https://nihongojlpt.vercel.app full-screen in Chrome, so every web deploy updates the app
without rebuilding the APK.

- `twa-manifest.json` — app config for [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap)
  (package `app.nihongo.study`).
- `.github/workflows/android-apk.yml` — builds and signs the APK. On `main` it publishes it to the
  GitHub Release **android-latest**.
- `public/.well-known/assetlinks.json` — proves the site and the app belong together (otherwise the
  app shows a URL bar). Its SHA-256 must match the signing key.

## Signing key
Repository secrets `ANDROID_KEYSTORE_BASE64` (base64 of `nihongo-release.jks`) and
`ANDROID_KEYSTORE_PASSWORD`. Keep a backup of the keystore: installed apps can only be updated by
APKs signed with the same key. Without the secrets the workflow signs with a throwaway test key
(the app then shows a URL bar and cannot update an installed copy).

## New version
Bump `appVersionCode` (and `appVersionName`) in `twa-manifest.json` only when the Android shell itself
changes (icon, name, colours); web changes need no new APK.

## Native additions (`overlay/`)
`overlay/apply.mjs` runs after `bubblewrap update` and copies `overlay/app/**` into the generated
project, then registers the components in `AndroidManifest.xml`:

- **"Từ vựng hôm nay" widget** (`VocabWidgetProvider`, `res/layout/widget_vocab.xml`): level, word,
  reading, meaning; ⟳ shows another word; tap opens `/tango`. A new word every day.
- **Daily word notification at 20:00** (`DailyWord`, channel "Từ vựng mỗi ngày"): scheduled at app start
  (`DailyWordInit`), when the widget is added and after reboot. Needs the notification permission,
  which Android asks for when notifications are enabled in the web app (bell icon) or in system settings.
- Words: `overlay/app/src/main/assets/words.json` — Tango N5/N4/N3 (3,702 words), generated from
  `src/data/tangoN*Vocab.ts` as `[word, reading, meaning, level, example, exampleVi]`.
