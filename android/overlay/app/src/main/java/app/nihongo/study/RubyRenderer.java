package app.nihongo.study;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Typeface;

import org.json.JSONArray;

import java.util.ArrayList;
import java.util.List;

/**
 * Draws Japanese text with furigana (small reading above the kanji) into a bitmap, because widgets
 * (RemoteViews TextView) cannot lay out ruby text. Parts: plain strings and [base, reading] pairs.
 * Wraps to the given width; after maxLines the last line ends with "…".
 */
final class RubyRenderer {
    static final class Style {
        float textPx, rubyPx;
        int textColor, rubyColor;
        boolean bold;
        int maxLines;
    }

    /** One unbreakable piece: a single character, or a whole ruby pair. */
    private static final class Unit {
        final String base, ruby;
        float width;
        Unit(String base, String ruby) { this.base = base; this.ruby = ruby; }
    }

    static Bitmap render(JSONArray parts, int widthPx, Style s) {
        Paint text = new Paint(Paint.ANTI_ALIAS_FLAG | Paint.SUBPIXEL_TEXT_FLAG);
        text.setTextSize(s.textPx);
        text.setColor(s.textColor);
        text.setTypeface(s.bold ? Typeface.DEFAULT_BOLD : Typeface.DEFAULT);
        Paint ruby = new Paint(Paint.ANTI_ALIAS_FLAG | Paint.SUBPIXEL_TEXT_FLAG);
        ruby.setTextSize(s.rubyPx);
        ruby.setColor(s.rubyColor);

        boolean anyRuby = false;
        List<Unit> units = new ArrayList<>();
        for (int i = 0; i < parts.length(); i++) {
            Object p = parts.opt(i);
            if (p instanceof JSONArray) {
                JSONArray pair = (JSONArray) p;
                Unit u = new Unit(pair.optString(0), pair.optString(1));
                u.width = Math.max(text.measureText(u.base), ruby.measureText(u.ruby));
                units.add(u);
                anyRuby = true;
            } else if (p != null) {
                String str = String.valueOf(p);
                for (int k = 0; k < str.length(); ) {
                    int cp = str.codePointAt(k);
                    Unit u = new Unit(new String(Character.toChars(cp)), null);
                    u.width = text.measureText(u.base);
                    units.add(u);
                    k += Character.charCount(cp);
                }
            }
        }

        Paint.FontMetrics tm = text.getFontMetrics();
        Paint.FontMetrics rm = ruby.getFontMetrics();
        float rubyH = anyRuby ? (rm.descent - rm.ascent) : 0f;
        float textH = tm.descent - tm.ascent;
        float lineH = rubyH + textH + s.textPx * 0.12f;

        // Greedy wrapping; prefer breaking after a space or a Japanese punctuation mark.
        List<List<Unit>> lines = new ArrayList<>();
        List<Unit> line = new ArrayList<>();
        float x = 0;
        for (Unit u : units) {
            if (x + u.width > widthPx && !line.isEmpty()) {
                int brk = -1;
                for (int j = line.size() - 1; j > line.size() / 2; j--) {
                    String b = line.get(j).base;
                    if (b.equals(" ") || b.equals("、") || b.equals("。") || b.equals("　")) { brk = j; break; }
                }
                List<Unit> carry = new ArrayList<>();
                if (brk >= 0) {
                    carry.addAll(line.subList(brk + 1, line.size()));
                    line = new ArrayList<>(line.subList(0, brk + 1));
                }
                lines.add(line);
                line = carry;
                x = 0;
                for (Unit c : carry) x += c.width;
            }
            if (line.isEmpty() && u.base.equals(" ")) continue;
            line.add(u);
            x += u.width;
        }
        if (!line.isEmpty()) lines.add(line);
        if (lines.isEmpty()) lines.add(new ArrayList<>());

        boolean truncated = lines.size() > s.maxLines;
        if (truncated) lines = new ArrayList<>(lines.subList(0, s.maxLines));

        int height = (int) Math.ceil(lineH * lines.size());
        Bitmap bmp = Bitmap.createBitmap(Math.max(1, widthPx), Math.max(1, height), Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bmp);
        String ellipsis = "…";
        float ellW = text.measureText(ellipsis);
        for (int li = 0; li < lines.size(); li++) {
            List<Unit> l = lines.get(li);
            boolean last = truncated && li == lines.size() - 1;
            float top = li * lineH;
            float baseline = top + rubyH - tm.ascent;
            float cx = 0;
            for (Unit u : l) {
                if (last && cx + u.width + ellW > widthPx) break;
                float baseW = text.measureText(u.base);
                canvas.drawText(u.base, cx + (u.width - baseW) / 2f, baseline, text);
                if (u.ruby != null && !u.ruby.isEmpty()) {
                    float rw = ruby.measureText(u.ruby);
                    canvas.drawText(u.ruby, cx + (u.width - rw) / 2f, top - rm.ascent, ruby);
                }
                cx += u.width;
            }
            if (last) canvas.drawText(ellipsis, cx, baseline, text);
        }
        return bmp;
    }

    private RubyRenderer() {}
}
