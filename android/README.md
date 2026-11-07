# Android app (TWA)

`NihonGo!` for Android is a Trusted Web Activity: the APK opens
https://nihongo1-vanxharu.vercel.app full-screen in Chrome, so every web deploy updates the app
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
