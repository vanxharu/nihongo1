/** Kanji Master N4 — source provenance index.
 * Source: user-provided scanned PDF, 154 physical pages.
 * Every page is indexed; no OCR is accepted as authoritative learning data.
 * Page 1 is the cover; page 2 begins chapter 1 / lesson 1.
 * Do not import any legacy Kanji dictionary or fabricate missing fields.
 */
export type SourcePage = { page: number; status: 'needs-verification' | 'verified'; section?: string };
export const KANJI_N4_SOURCE = {
  title: 'Kanji Master N4',
  sourceType: 'user-uploaded-scanned-pdf' as const,
  totalPages: 154,
  policy: 'pdf-only' as const,
  pages: Array.from({ length: 154 }, (_, i): SourcePage => ({
    page: i + 1,
    status: i === 0 ? 'verified' : 'needs-verification',
    ...(i === 0 ? { section: 'Bìa sách' } : {}),
    ...(i === 1 ? { section: '第1章 家族の生活 · 1 家族' } : {}),
  })),
  firstLesson: {
    chapter: '第1章 家族の生活',
    title: '1 家族',
    page: 2,
    glyphs: ['家', '族', '兄', '弟', '姉', '妹', '私', '育'],
    // Glyphs visually checked against the printed overview on PDF page 2.
    glyphsVerified: true,
    readingsVerified: false,
    strokesVerified: false,
  },
} as const;
