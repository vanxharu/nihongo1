export function readingImageUrl(value: string): string {
  try {
    const url = new URL(value.startsWith('//') ? `https:${value}` : value);
    if (url.hostname === 'jp-admin.todaiinews.com' && !url.port && !url.username && !url.password &&
      /^\/images\/news\/[\w.-]+\.(?:jpe?g|png|webp|gif|avif)$/i.test(url.pathname)) {
      url.protocol = 'https:';
      return `/api/reading/image?url=${encodeURIComponent(url.href)}`;
    }
  } catch { /* Other image sources retain their original URL. */ }
  return value;
}
