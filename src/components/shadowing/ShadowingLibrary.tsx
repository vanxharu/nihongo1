import { ExpressiveReveal } from '../ui/ExpressiveReveal';
import { scale } from '@animate-ui/react/utils/motion';
import { Button as AnimatedButton } from '@animate-ui/react/primitives/buttons/button';
import React, { useState } from 'react';
import { ArrowRight, ChevronRight, Headphones, Link2, PenLine, Play, Plus, Search, Video } from 'lucide-react';
import type { YouTubeListeningVideo } from '../../types';
import type { WatchMap, WatchEntry } from '../../utils/watchProgress';
import './shadowingLibrary.css';

type PersonalVideo = { videoId: string; title: string; cueCount?: number };
type Props = {
  videos: YouTubeListeningVideo[];
  personalVideos: PersonalVideo[];
  onOpen: (id: string, edit?: boolean) => void;
  onMode: (mode: 'shadowing' | 'dictation') => void;
  progress?: WatchMap;
};

function Cover({ video, featured = false, watch }: { video: YouTubeListeningVideo; featured?: boolean; watch?: WatchEntry }) {
  const pct = watch?.watched ? 100 : watch?.d ? Math.min(100, Math.round(100 * watch.t / watch.d)) : 0;
  return <div className={`listening-cover${featured ? ' is-featured' : ''}`}>
    <img src={video.thumbnail || `https://i.ytimg.com/vi/${video.youtube_video_id}/mqdefault.jpg`} alt="" loading={featured ? 'eager' : 'lazy'} referrerPolicy="no-referrer" onError={event => { const image = event.currentTarget; if (!image.dataset.fallback) { image.dataset.fallback = '1'; image.src = `https://i.ytimg.com/vi/${video.youtube_video_id}/mqdefault.jpg`; } else { image.style.visibility = 'hidden'; } }} />
    <span className="listening-level">{video.level}</span>
    {video.duration && <span className="listening-duration">{video.duration}</span>}
    {featured && <span className="listening-play"><Play size={24} fill="currentColor" /></span>}
    {watch?.watched ? <span className="listening-watched">✓ Đã xem</span> : pct > 0 && <span className="listening-watched is-partial">Đang xem {pct}%</span>}
    {pct > 0 && <span className="listening-progress" aria-label={watch?.watched ? 'Đã xem' : `Đã xem ${pct}%`}><i style={{ width: `${pct}%` }} /></span>}
  </div>;
}

export default function ShadowingLibrary({ videos, personalVideos, onOpen, onMode, progress = {} }: Props) {
  const [tab, setTab] = useState('home');
  const [query, setQuery] = useState('');
  const [url, setUrl] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const sources = [...new Set(videos.map(v => v.source))];
  const search = query.trim().toLocaleLowerCase('vi');
  const filtered = videos.filter(v => (tab === 'home' || tab === v.source) && (!search || `${v.title} ${v.source} ${v.code || ''} ${v.level}`.toLocaleLowerCase('vi').includes(search)));
  const feature = filtered[0];
  const start = (id: string, mode: 'shadowing' | 'dictation') => { onMode(mode); onOpen(id); };
  return <div className="listening-library">
    <div className="listening-banner">
      <div><span lang="ja" className="listening-welcome">ようこそ!</span><strong>Shadowing</strong><span>& Chép chính tả</span></div>
      <img src="/mascot/shiba_listening.png" alt="Nihon Shiba đeo tai nghe" width="180" height="180" />
      <div className="listening-banner-tags"><span>LUYỆN NGHE</span><span>SHADOWING</span><span>DICTATION</span><small>Nghe kỹ · Nói tự tin</small></div>
    </div>
    <header className="listening-channel">
      <ExpressiveReveal inView={false}><div className="listening-avatar"><img src="/mascot/shiba_listening.png" alt="" width="100" height="100" /></div></ExpressiveReveal>
      <div className="listening-channel-copy"><h1>Shadowing & Chép chính tả</h1><p className="listening-stats">NihonGo! · {sources.length} chủ đề · {videos.length} video</p><p>Luyện nghe, nói theo từng câu và chép chính tả cùng video tiếng Nhật có phụ đề.</p>
        <div className="listening-actions"><AnimatedButton type="button" disabled={!videos.length} onClick={() => videos[0] && start(videos[0].youtube_video_id, 'shadowing')}><Headphones size={15} /> Bắt đầu Shadowing</AnimatedButton><AnimatedButton type="button" disabled={!videos.length} onClick={() => videos[0] && start(videos[0].youtube_video_id, 'dictation')}><PenLine size={15} /> Chép chính tả</AnimatedButton><AnimatedButton type="button" onClick={() => setTab('personal')}><Video size={15} /> Video của tôi</AnimatedButton></div>
      </div>
    </header>
    <div className="listening-navigation"><nav aria-label="Chủ đề luyện nghe">{[['home', 'Trang chủ'], ['personal', 'Video của tôi'], ...sources.map(source => [source, source])].map(([id, label]) => <AnimatedButton type="button" key={id} aria-current={tab === id ? 'page' : undefined} className={tab === id ? 'is-active' : ''} onClick={() => setTab(id)}>{label}</AnimatedButton>)}</nav><label className="listening-search"><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm bài nghe…" aria-label="Tìm bài nghe" /></label></div>
    {tab === 'personal' ? <section className="listening-personal">
      <h2>Video của tôi</h2><p>Dán link YouTube để luyện nghe hoặc soạn phụ đề của riêng bạn.</p>
      <form onSubmit={e => { e.preventDefault(); onOpen(url); }} className="listening-import"><label className="sr-only" htmlFor="listening-video-url">Đường dẫn video YouTube</label><input id="listening-video-url" required value={url} onChange={e => setUrl(e.target.value)} placeholder="Dán link YouTube hoặc ID video…" /><AnimatedButton type="submit"><Link2 size={16} /> Mở video</AnimatedButton><AnimatedButton type="button" onClick={() => onOpen(url, true)}><Plus size={16} /> Soạn phụ đề</AnimatedButton></form>
      {personalVideos.length === 0 ? <div className="listening-empty"><Video size={30} /><h3>Chưa có video riêng</h3><p>Video đã lưu trong tài khoản của bạn sẽ xuất hiện tại đây.</p></div> : <div className="listening-personal-grid">{personalVideos.filter(v => !search || v.title.toLocaleLowerCase('vi').includes(search)).map(v => <AnimatedButton type="button" key={v.videoId} onClick={() => onOpen(v.videoId)}><Play size={18} /><span>{v.title}</span>{v.cueCount !== undefined && <small>{v.cueCount} câu</small>}</AnimatedButton>)}</div>}
    </section> : <>
      {feature ? <section className="listening-feature" aria-label="Bài nghe nổi bật"><AnimatedButton type="button" className="listening-feature-cover" onClick={() => start(feature.youtube_video_id, 'shadowing')} aria-label={`Mở bài nghe nổi bật: ${feature.title}`}><Cover video={feature} featured watch={progress[feature.youtube_video_id]} /></AnimatedButton><div className="listening-feature-copy"><span className="listening-eyebrow">GỢI Ý HÔM NAY</span><h2>{feature.code ? `${feature.code} · ` : ''}{feature.title}</h2><p className="listening-feature-meta"><Headphones size={13} /> {feature.level} · {feature.duration || 'Video luyện nghe'} · {feature.source}</p><p>{feature.description}</p><p>Nghe từng câu, nói theo phụ đề rồi chuyển sang chép chính tả để kiểm tra khả năng nghe.</p><div className="listening-actions"><AnimatedButton type="button" onClick={() => start(feature.youtube_video_id, 'shadowing')}>Bắt đầu luyện <ArrowRight size={15} /></AnimatedButton><AnimatedButton type="button" onClick={() => start(feature.youtube_video_id, 'dictation')}><PenLine size={14} /> Chép chính tả</AnimatedButton></div></div></section> : <div className="listening-empty"><Headphones size={30} /><h2>Chưa tìm thấy bài nghe</h2><p>Thử tìm bằng tên bài, nguồn video hoặc cấp độ N4.</p></div>}
      {sources.filter(source => tab === 'home' || tab === source).map(source => {
        const items = filtered.filter(v => v.source === source);
        if (!items.length) return null;
        return <section className="listening-shelf" key={source} aria-label={source}><div className="listening-shelf-heading"><h2>{source} <small>{items.length} bài nghe</small></h2><AnimatedButton type="button" onClick={() => start(items[0].youtube_video_id, 'shadowing')}><Play size={12} fill="currentColor" /> Bắt đầu chủ đề</AnimatedButton></div><div className={`listening-video-grid${expanded[source] ? ' is-expanded' : ''}`}>
          {(expanded[source] ? items : items.slice(0, 4)).map((v, index) => <ExpressiveReveal key={v.id} index={index}><div><AnimatedButton type="button" tapScale={scale.choice} className="listening-video-card" key={v.id} onClick={() => start(v.youtube_video_id, 'shadowing')}><Cover video={v} watch={progress[v.youtube_video_id]} /><h3>{v.code ? `${v.code} · ` : ''}{v.title}</h3><p>{v.source}</p><small><Headphones size={12} /> {v.level} · {v.has_answers ? 'Có đáp án' : 'Luyện nghe'}</small></AnimatedButton></div></ExpressiveReveal>)}
          {items.length > 4 && <AnimatedButton type="button" className="listening-see-all" aria-expanded={!!expanded[source]} onClick={() => setExpanded(prev => ({ ...prev, [source]: !prev[source] }))}><span><ChevronRight size={20} /></span><strong>{expanded[source] ? 'Thu gọn' : 'Xem tất cả'}</strong><small>{items.length} bài nghe</small></AnimatedButton>}
        </div></section>;
      })}
    </>}
  </div>;
}
