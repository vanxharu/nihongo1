package app.nihongo.study;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.database.Cursor;
import android.net.Uri;

/**
 * Runs once when the app process starts (manifest-registered provider, like androidx.startup), so the
 * daily notification is scheduled without touching the generated LauncherActivity / Application.
 */
public class DailyWordInit extends ContentProvider {
    @Override public boolean onCreate() {
        if (getContext() != null) DailyWord.ensureScheduled(getContext());
        return true;
    }
    @Override public Cursor query(Uri uri, String[] p, String s, String[] a, String o) { return null; }
    @Override public String getType(Uri uri) { return null; }
    @Override public Uri insert(Uri uri, ContentValues v) { return null; }
    @Override public int delete(Uri uri, String s, String[] a) { return 0; }
    @Override public int update(Uri uri, ContentValues v, String s, String[] a) { return 0; }
}
