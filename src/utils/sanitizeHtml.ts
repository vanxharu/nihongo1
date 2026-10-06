const escapeHtml = (s: string) => s.replace(/&(?!(?:amp|lt|gt|quot|#\d+);)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Keep only bare <ruby>/<rt>/<rp>/<rb> tags (furigana); everything else (incl. attributes, scripts, handlers) is escaped as text. */
export function sanitizeRubyHtml(html: string): string {
  return String(html ?? '').split(/(<\/?(?:ruby|rt|rp|rb)>)/i).map((part, i) => (i % 2 ? part.toLowerCase() : escapeHtml(part))).join('');
}

/** AI-generated SVG is shown through <img>, where scripts and event handlers never run. */
export const svgDataUri = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(String(svg ?? ''))}`;
