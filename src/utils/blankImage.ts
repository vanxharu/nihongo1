/** True when an image is (nearly) one flat colour or fully transparent — e.g. a crop saved before the photo loaded. */
export function isBlankImage(src: string): Promise<boolean> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      try {
        const c = document.createElement('canvas'); c.width = c.height = 24;
        const g = c.getContext('2d')!; g.drawImage(img, 0, 0, 24, 24);
        const d = g.getImageData(0, 0, 24, 24).data;
        let lo = 765, hi = 0, opaque = 0;
        for (let i = 0; i < d.length; i += 4) { if (d[i + 3] > 16) { opaque++; const v = d[i] + d[i + 1] + d[i + 2]; lo = Math.min(lo, v); hi = Math.max(hi, v); } }
        resolve(opaque === 0 || hi - lo < 24);
      } catch { resolve(false); } // cross-origin pixels unreadable: assume fine
    };
    img.onerror = () => resolve(true);
    img.src = src;
  });
}

export const describeAvatar = (a?: string | null) => !a ? 'Chưa có (dùng ảnh Google)'
  : a.startsWith('data:image/') ? `Ảnh lưu trong hồ sơ (${Math.round(a.length * 0.75 / 1024)} KB)`
  : /^https?:\/\//.test(a) ? `Link ảnh: ${new URL(a).hostname}` : `Emoji / chữ: "${a}"`;

/** Admin diagnostics: what the browser actually gets from a stored avatar. */
export function inspectImage(src: string): Promise<string> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      void isBlankImage(src).then(blank => {
        let avg = '';
        try {
          const c = document.createElement('canvas'); c.width = c.height = 8; const g = c.getContext('2d')!; g.drawImage(img, 0, 0, 8, 8);
          const d = g.getImageData(0, 0, 8, 8).data; let r = 0, gr = 0, b = 0, a = 0;
          for (let i = 0; i < d.length; i += 4) { r += d[i]; gr += d[i + 1]; b += d[i + 2]; a += d[i + 3]; }
          avg = ` · màu TB rgb(${Math.round(r / 64)},${Math.round(gr / 64)},${Math.round(b / 64)}) alpha ${Math.round(a / 64)}`;
        } catch { /* cross-origin */ }
        resolve(`${img.naturalWidth}×${img.naturalHeight}${blank ? ' · ẢNH TRỐNG' : ''}${avg}`);
      });
    };
    img.onerror = () => resolve('LỖI: trình duyệt không mở được ảnh');
    img.src = src;
  });
}
