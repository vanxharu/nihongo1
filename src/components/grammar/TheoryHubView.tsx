import React, { useMemo, useState } from 'react';
import { JLPTLevel, UserProfile, GrammarItem } from '../../types';
import { Search, ChevronRight, Play, BookOpen, PenTool, Layers, X, Flame, CheckCircle2 } from 'lucide-react';
import ShibaStudyMascot from './ShibaStudyMascot';
import { getGrammarStatusWithAliases } from '../../utils/grammarDeduplicator';
import './TheoryHubView.css';

interface TheoryHubViewProps {
  userProfile: UserProfile;
  selectedLevel: JLPTLevel;
  onChangeLevel: (level: JLPTLevel) => void;
  onOpenGrammar: () => void;
  onOpenVocab: () => void;
  onOpenKanji: () => void;
  onContinueStudy: () => void;
  grammars: GrammarItem[];
  levelStats?: Record<string, { lessons: number; grammars: number; completed: number }>;
  onSelectGrammarItem?: (grammar: GrammarItem) => void;
}
const LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];
const LEVEL_LABELS = { N5: 'Bắt đầu từ nền tảng', N4: 'Vững vàng giao tiếp cơ bản', N3: 'Kết nối những kiến thức đã học', N2: 'Hiểu sâu và diễn đạt tự nhiên', N1: 'Khám phá sắc thái tiếng Nhật' };
const SUBJECTS = [
  { key: 'vocab', title: 'Từ vựng', ja: 'ことば', description: 'Học từ, nghe phát âm và nhớ qua ví dụ.', Icon: Layers },
  { key: 'kanji', title: 'Kanji', ja: '漢字', description: 'Tra cách đọc, ý nghĩa và luyện nét viết.', Icon: PenTool },
  { key: 'grammar', title: 'Ngữ pháp', ja: '文法', description: 'Hiểu cấu trúc và cách dùng trong ngữ cảnh.', Icon: BookOpen },
] as const;
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase();

export default function TheoryHubView({ userProfile, selectedLevel, onChangeLevel, onOpenGrammar, onOpenVocab, onOpenKanji, onContinueStudy, grammars, onSelectGrammarItem }: TheoryHubViewProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'new' | 'learned'>('all');
  const [visibleCount, setVisibleCount] = useState(8);
  const learned = (item: GrammarItem) => {
    const status = getGrammarStatusWithAliases(userProfile.grammarStatus, item);
    return status === true || (typeof status === 'object' && status !== null && ((status as any).correctCount > 0 || ['learned', 'mastered'].includes((status as any).state)));
  };
  const levelItems = useMemo(() => grammars.filter(item => item.level === selectedLevel), [grammars, selectedLevel]);
  const done = levelItems.filter(learned).length;
  const percent = levelItems.length ? Math.round(done / levelItems.length * 100) : 0;
  const next = levelItems.find(item => !learned(item)) || levelItems[0];
  const results = levelItems.filter(item => {
    const match = normalize([item.structure, item.meaning, item.lessonName || '', item.exampleSentence].join(' ')).includes(normalize(query.trim()));
    return match && (filter === 'all' || (filter === 'learned' ? learned(item) : !learned(item)));
  });
  const openItem = (item: GrammarItem) => onSelectGrammarItem ? onSelectGrammarItem(item) : onContinueStudy();
  const handlers = { vocab: onOpenVocab, kanji: onOpenKanji, grammar: onOpenGrammar };
  const changeLevel = (level: JLPTLevel) => { onChangeLevel(level); setQuery(''); setVisibleCount(8); };

  return <div className="theory-hub">
    <header className="theory-heading">
      <div><span className="theory-eyebrow">THƯ VIỆN TIẾNG NHẬT</span><h1>Mỗi ngày, hiểu thêm một chút.</h1><p>Chọn môn học và khám phá kiến thức theo trình độ của bạn.</p></div>
      {userProfile.streak > 0 && <span className="theory-streak"><Flame size={16} />{userProfile.streak} ngày học liên tiếp</span>}
    </header>
    <div className="theory-levels" role="group" aria-label="Trình độ JLPT">
      {LEVELS.map(level => <button key={level} type="button" aria-pressed={level === selectedLevel} onClick={() => changeLevel(level)}>{level}<span>{level === 'N5' ? 'Sơ cấp' : level === 'N4' ? 'Cơ bản' : level === 'N3' ? 'Trung cấp' : level === 'N2' ? 'Nâng cao' : 'Chuyên sâu'}</span></button>)}
    </div>
    <section className="theory-subject-section" aria-labelledby="theory-subject-title">
      <div className="theory-section-title"><h2 id="theory-subject-title">Bạn muốn học gì?</h2><span>Trình độ {selectedLevel}</span></div>
      <div className="theory-subjects">{SUBJECTS.map(({ key, title, ja, description, Icon }) => <button key={key} type="button" onClick={handlers[key]} className={`theory-subject theory-subject-${key}`}><div className="theory-subject-top"><span className="theory-subject-icon"><Icon size={23} /></span><span lang="ja">{ja}</span></div><h3>{title}</h3><p>{description}</p><span className="theory-subject-action">Khám phá <ChevronRight size={16} /></span></button>)}</div>
    </section>
    <div className="theory-dashboard">
      <section className="theory-continue" aria-labelledby="theory-continue-title">
        <div className="theory-continue-copy"><span className="theory-eyebrow">{done === levelItems.length && done > 0 ? 'ÔN LẠI KIẾN THỨC' : done > 0 ? 'TIẾP TỤC KHÁM PHÁ' : 'BẮT ĐẦU TỪ ĐÂY'}</span><h2 id="theory-continue-title">{next?.structure || `Ngữ pháp ${selectedLevel}`}</h2><p>{next?.meaning || LEVEL_LABELS[selectedLevel]}</p><button type="button" className="theory-primary" onClick={() => next ? openItem(next) : onOpenGrammar()}><Play size={16} />{done > 0 ? 'Mở bài học' : 'Học ngay'}</button></div><div className="theory-mascot"><ShibaStudyMascot size={100} /><span>Shiba học cùng bạn!</span></div>
      </section>
      <section className="theory-progress" aria-label={`Tiến độ ngữ pháp ${selectedLevel}`}><div className="theory-section-title"><h2>Ngữ pháp {selectedLevel}</h2><CheckCircle2 size={19} /></div><strong>{percent}<small>%</small></strong><div className="theory-progress-track" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Tiến độ ngữ pháp"><span style={{ width: `${percent}%` }} /></div><p><b>{done}</b> / {levelItems.length} mẫu đã học</p><span className="theory-muted">{LEVEL_LABELS[selectedLevel]}</span></section>
    </div>
    <section className="theory-library" aria-labelledby="theory-library-title">
      <div className="theory-section-title"><div><h2 id="theory-library-title">Khám phá ngữ pháp</h2><p>Tìm một mẫu câu, đọc cách dùng và ví dụ.</p></div><button type="button" className="theory-text-button" onClick={onOpenGrammar}>Xem theo bài <ChevronRight size={16} /></button></div>
      <div className="theory-search"><Search size={19} /><input aria-label="Tìm mẫu ngữ pháp" value={query} onChange={e => { setQuery(e.target.value); setVisibleCount(8); }} placeholder="Tìm cấu trúc, ý nghĩa hoặc câu ví dụ…" />{query && <button type="button" aria-label="Xóa tìm kiếm" onClick={() => setQuery('')}><X size={17} /></button>}</div>
      <div className="theory-filters" role="group" aria-label="Lọc trạng thái học">{([{ key: 'all', label: 'Tất cả', count: levelItems.length }, { key: 'new', label: 'Chưa học', count: levelItems.length - done }, { key: 'learned', label: 'Đã học', count: done }] as const).map(item => <button type="button" key={item.key} aria-pressed={filter === item.key} onClick={() => { setFilter(item.key); setVisibleCount(8); }}>{item.label}<span>{item.count}</span></button>)}</div>
      <div className="theory-results" aria-live="polite">{results.length === 0 ? <div className="theory-empty"><BookOpen size={30} /><h3>{query ? 'Chưa tìm thấy mẫu phù hợp' : filter === 'learned' ? 'Trang đầu tiên đang chờ bạn' : 'Bạn đã học hết các mẫu ở đây!'}</h3><p>{query ? 'Thử từ khóa ngắn hơn hoặc đổi trình độ nhé.' : filter === 'learned' ? 'Mở một bài học để bắt đầu tích lũy kiến thức.' : 'Đổi bộ lọc để ôn lại kiến thức.'}</p><button type="button" className="theory-text-button" onClick={() => { setQuery(''); setFilter('all'); }}>Xem tất cả</button></div> : results.slice(0, visibleCount).map(item => <button type="button" key={item.id} className="theory-grammar-card" onClick={() => openItem(item)}><div className="theory-card-meta"><span>{selectedLevel}{item.lessonNumber ? ` · Bài ${item.lessonNumber}` : ''}</span>{learned(item) ? <span className="theory-learned"><CheckCircle2 size={13} />Đã học</span> : <span>Chưa học</span>}</div><h3>{item.structure}</h3><p>{item.meaning}</p><div className="theory-card-bottom"><span>{item.lessonName || 'Cấu trúc & ví dụ'}</span><ChevronRight size={17} /></div></button>)}</div>
      {results.length > visibleCount && <button type="button" className="theory-load-more" onClick={() => setVisibleCount(count => count + 8)}>Xem thêm {Math.min(8, results.length - visibleCount)} mẫu <ChevronRight size={16} /></button>}
    </section>
  </div>;
}
