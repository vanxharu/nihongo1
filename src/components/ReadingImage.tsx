import React, { useState } from 'react';
import { readingImageUrl } from '../utils/readingImage';
type Props = { src: string; alt?: string; className?: string; loading?: 'lazy' | 'eager' };
function ImageView({ src, alt = '', className, loading }: Props) {
  const [attempt, setAttempt] = useState(0);
  const proxy = readingImageUrl(src);
  if (attempt >= (proxy === src ? 1 : 2)) return <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-3 text-center text-xs text-[var(--ui-muted)]" role="status">
    <span>Không tải được ảnh bài đọc.</span>
    <button type="button" className="rounded-lg border border-[var(--ui-line)] px-3 py-2" onClick={event => { event.stopPropagation(); setAttempt(0); }}>Thử lại ảnh</button>
  </div>;
  return <img src={attempt === 0 ? proxy : src} alt={alt} className={className} loading={loading} referrerPolicy="no-referrer" onError={() => setAttempt(n => n + 1)} />;
}
export default function ReadingImage(props: Props) { return <ImageView key={props.src} {...props} />; }
