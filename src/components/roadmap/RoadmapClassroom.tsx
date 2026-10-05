import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Check, Headphones, RotateCcw, Volume2 } from 'lucide-react';
import type { JLPTLevel, LessonReadingData, LessonReadingQuiz, TodaiNewsItem } from '../../types';
import { roadmapLesson, quizChoices } from '../../data/roadmapLessons';
import { speakJapanese, stopJapaneseSpeech } from '../../utils/audio';
import { safeFetchJson } from '../../utils/safeApi';
import { showLearningFeedback } from '../../utils/learningMotion';
import ShibaMascot from '../mascot/ShibaMascot';
import JapaneseFuriganaText from '../JapaneseFuriganaText';
import './classroom.css';
export type ClassroomTab = 'words' | 'grammar' | 'kanji' | 'reading' | 'listening' | 'review';
const tabs: [
    ClassroomTab,
    string
][] = [['words', 'Từ vựng'], ['grammar', 'Ngữ pháp'], ['kanji', 'Kanji'], ['reading', 'Đọc hiểu'], ['listening', 'Nghe'], ['review', 'Bài tập']];
function Quiz({ questions, onComplete }: {
    questions: LessonReadingQuiz[];
    onComplete?: () => void;
}) {
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [graded, setGraded] = useState(false);
    if (!questions.length)
        return <p>Chưa có câu hỏi cho nội dung này.</p>;
    const score = questions.filter((q, i) => answers[i] === q.correctIndex).length;
    return <div className="classroom-quiz">
    {questions.map((q, i) => <fieldset key={i}><legend>{i + 1}. {q.question}</legend><div className="classroom-options">{q.options.map((option, j) => <button type="button" key={j} aria-pressed={answers[i] === j} disabled={graded} className={graded ? j === q.correctIndex ? 'answer-correct' : answers[i] === j ? 'answer-wrong' : '' : answers[i] === j ? 'answer-selected' : ''} onClick={() => setAnswers(a => ({ ...a, [i]: j }))}>{option}{graded && j === q.correctIndex && <Check size={16}/>}</button>)}</div>{graded && <p>{answers[i] === q.correctIndex ? 'Đúng' : 'Cần ôn lại'} · {q.explanation}</p>}</fieldset>)}
    {!graded ? <button className="classroom-primary" disabled={Object.keys(answers).length !== questions.length} onClick={() => { setGraded(true); showLearningFeedback(score === questions.length ? 'correct' : 'incorrect'); if (score === questions.length)
        onComplete?.(); }}>Kiểm tra đáp án</button> : <div role="status"><strong>{score}/{questions.length} câu đúng</strong><button onClick={() => { setAnswers({}); setGraded(false); }}><RotateCcw size={16}/>Làm lại</button></div>}
  </div>;
}
function ReadingLesson({ level, day, onComplete }: {
    level: JLPTLevel;
    day: number;
    onComplete: () => void;
}) {
    const [articles, setArticles] = useState<TodaiNewsItem[]>([]);
    const [lesson, setLesson] = useState<LessonReadingData | null>(null);
    const [busy, setBusy] = useState(true);
    const [error, setError] = useState('');
    const [translation, setTranslation] = useState(false);
    const [furigana, setFurigana] = useState(true);
    useEffect(() => { let alive = true; safeFetchJson<{
        articles: TodaiNewsItem[];
    }>('/api/reading/todai/news-list').then(r => { if (!alive)
        return; if (!r.ok)
        throw new Error(r.error || 'Không tải được bài đọc'); const all = r.data?.articles || []; const matched = all.filter(a => a.jlptLevel === level); setArticles(matched.length ? matched : all); }).catch(e => { if (alive)
        setError(e.message); }).finally(() => { if (alive)
        setBusy(false); }); return () => { alive = false; }; }, [level]);
    const load = async (article: TodaiNewsItem) => { setBusy(true); setError(''); try {
        const r = await safeFetchJson<LessonReadingData>('/api/reading/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sourceUrl: article.url, level, questionCount: 3 }) });
        if (!r.ok || !r.data?.japanesePassage)
            throw new Error(r.error || 'Không tải được bài đọc');
        setLesson(r.data);
    }
    catch (e) {
        setError(e instanceof Error ? e.message : 'Không tải được bài đọc');
    }
    finally {
        setBusy(false);
    } };
    return <div>{error && <p role="alert">{error}</p>}{busy && <p role="status">Đang tải bài và câu hỏi…</p>}{!lesson ? <><p>Chọn bài để đọc và trả lời ngay tại ngày {day}. Mức của bài gốc được ghi trên từng thẻ.</p><div className="classroom-cards">{articles.slice(((day - 1) % Math.max(1, Math.ceil(articles.length / 6))) * 6).slice(0, 6).map(a => <button disabled={busy} key={a.id} onClick={() => load(a)}><BookOpen size={20}/><strong>{a.titleJp}</strong><span>{a.titleVi}</span><small>{a.jlptLevel || 'Chưa phân loại'} · {a.prepared ? 'Đã chuẩn bị' : 'Chuẩn bị khi mở'}</small></button>)}</div>{!busy && !articles.length && !error && <p>Chưa có bài nguồn. Hãy thử lại sau.</p>}</> : <><button onClick={() => setLesson(null)}>Chọn bài khác</button><h3>{lesson.title}</h3><button aria-pressed={furigana} onClick={() => setFurigana(!furigana)}>{furigana ? 'Ẩn' : 'Xem'} furigana</button><p className="classroom-passage" lang="ja"><JapaneseFuriganaText key={String(furigana)} sentence={lesson.furiganaPassage || lesson.japanesePassage} showFurigana={furigana} forceDark size="lg"/></p><button aria-pressed={translation} onClick={() => setTranslation(!translation)}>{translation ? 'Ẩn' : 'Xem'} bản dịch</button>{translation && <p className="classroom-passage">{lesson.vietnamesePassage}</p>}<p>{lesson.questionOrigin === 'source' ? 'Câu hỏi gốc từ nguồn' : 'Câu hỏi luyện tập do AI soạn'}</p><Quiz key={lesson.sourceUrl || lesson.title} questions={lesson.quizzes} onComplete={onComplete}/>{lesson.sourceUrl && <a href={lesson.sourceUrl} target="_blank" rel="noreferrer">Bài gốc</a>}</>}</div>;
}
export default function RoadmapClassroom({ level, day, tab, onTab, onComplete }: {
    level: JLPTLevel;
    day: number;
    tab: ClassroomTab;
    onTab: (tab: ClassroomTab) => void;
    onComplete: (task: ClassroomTab) => void;
}) {
    const lesson = useMemo(() => roadmapLesson(level, day), [level, day]);
    const [finished, setFinished] = useState<ClassroomTab[]>([]);
    const finish = (id: ClassroomTab) => { const next = [...new Set([...finished, id])]; setFinished(next); if (id === 'words' || id === 'kanji') {
        if (next.includes('words') && next.includes('kanji'))
            onComplete('words');
    }
    else
        onComplete(id); };
    const [reveal, setReveal] = useState<Record<string, boolean>>({});
    const [playing, setPlaying] = useState('');
    const [rate, setRate] = useState(0.9);
    useEffect(() => () => stopJapaneseSpeech(), [tab, day, level]);
    useEffect(() => { setPlaying(''); }, [tab]);
    const play = (text: string) => { setPlaying(text); speakJapanese(text, rate, () => setPlaying(''), { isSentence: true }); };
    const wordQuiz = lesson.words.map((w, i) => { const options = quizChoices(w.meaning, lesson.wordPool.map(v => v.meaning), day + i); return { question: `${w.kanji}（${w.hiragana}） có nghĩa là gì?`, options, correctIndex: options.indexOf(w.meaning), explanation: `${w.exampleSentence} — ${w.exampleTranslation}` }; }).filter(q => q.options.length > 1);
    const listenQuiz = lesson.words.filter(w => w.exampleSentence && w.exampleTranslation).slice(0, 3).map((w, i) => { const options = quizChoices(w.exampleTranslation, lesson.wordPool.map(v => v.exampleTranslation), day + i); return { question: `Đoạn nghe ${i + 1}: chọn nghĩa phù hợp.`, options, correctIndex: options.indexOf(w.exampleTranslation), explanation: `${w.exampleSentence} — ${w.exampleTranslation}` }; }).filter(q => q.options.length > 1);
    return <section className="roadmap-classroom" aria-label={`Lớp học ngày ${day}`}>
    <header><ShibaMascot pose="studying" size={72} animated={false}/><div><small>LỚP HỌC CỦA BẠN · {level}</small><h2>Học cùng Shiba · Ngày {day}</h2><p>Khám phá kiến thức, nghe và làm bài ngay tại đây.</p></div></header>
    <div className="classroom-tabs" role="tablist" aria-label="Nội dung ngày học">{tabs.map(([id, label]) => <button id={`classroom-tab-${id}`} role="tab" aria-selected={tab === id} aria-controls={`classroom-panel-${id}`} key={id} onKeyDown={e => { const index = tabs.findIndex(([value]) => value === id); const direction = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (direction) {
        e.preventDefault();
        const next = tabs[(index + direction + tabs.length) % tabs.length][0];
        onTab(next);
        document.getElementById(`classroom-tab-${next}`)?.focus();
    } }} tabIndex={tab === id ? 0 : -1} onClick={() => onTab(id)}>{label}</button>)}</div>
    <div key={tab} className="classroom-panel" id={`classroom-panel-${tab}`} role="tabpanel" aria-labelledby={`classroom-tab-${tab}`}>
      {tab === 'words' && <><h3>{lesson.words.length} từ hôm nay · nghe, nhớ, dùng trong câu</h3>{!lesson.words.length && <p>Chưa có dữ liệu từ vựng cho cấp độ này.</p>}<div className="classroom-cards">{lesson.words.map(w => <article key={w.id}><strong lang="ja">{w.kanji}</strong><span lang="ja">{w.hiragana}</span><button aria-label={`Nghe ${w.kanji}`} onClick={() => play(w.kanji)}><Volume2 size={17}/>Nghe từ</button><button aria-expanded={!!reveal[w.id]} onClick={() => setReveal(r => ({ ...r, [w.id]: !r[w.id] }))}>{reveal[w.id] ? 'Ẩn' : 'Xem'} nghĩa và ví dụ</button>{reveal[w.id] && <><b>{w.meaning}</b><p lang="ja">{w.exampleSentence}</p><p>{w.exampleTranslation}</p></>}</article>)}</div><Quiz questions={wordQuiz} onComplete={() => finish('words')}/></>}
      {tab === 'grammar' && <>{!lesson.grammar.length && <p>Chưa có bài ngữ pháp cho cấp độ này.</p>}{lesson.grammar.map(g => <article className="classroom-grammar" key={g.id}><small>MẪU CÂU</small><h3>{g.structure}</h3><b>{g.meaning}</b><p>{g.explanation}</p><blockquote lang="ja">{g.exampleSentence}</blockquote><p>{g.exampleTranslation}</p><button onClick={() => play(g.exampleSentence)}><Volume2 size={17}/>Nghe ví dụ</button>{g.wordsToReorder?.length > 1 && <SentenceBuilder key={g.id} words={g.wordsToReorder} answer={g.correctSentence}/>}</article>)}{!!lesson.grammar.length && <button className="classroom-primary" onClick={() => finish('grammar')}>Đã học các mẫu câu hôm nay</button>}</>}
      {tab === 'kanji' && <><div className="classroom-cards">{lesson.kanji.map(k => <article key={k.id}><strong className="classroom-glyph" lang="ja">{k.character}</strong><b>{k.meaning}</b><p>Âm On: {k.onyomi || '—'}<br />Âm Kun: {k.kunyomi || '—'}<br />{k.strokesCount} nét</p>{k.exampleWords.map((w, i) => <p key={i}><ruby>{w.word}<rt>{w.hiragana}</rt></ruby> — {w.meaning}</p>)}{k.mnemonic && <p>{k.mnemonic}</p>}</article>)}</div>{lesson.kanji.length ? <button className="classroom-primary" onClick={() => finish('kanji')}>Đã ôn kanji hôm nay</button> : <p>Chưa có kanji cho cấp độ này.</p>}</>}
      {tab === 'reading' && <ReadingLesson level={level} day={day} onComplete={() => finish('reading')}/>}
      {tab === 'listening' && <><h3><Headphones size={22}/>Nghe câu và chọn nghĩa</h3><p>Audio luyện tập đọc từ câu ví dụ. Nghe trước, kiểm tra bản chép sau khi làm bài.</p><label>Tốc độ <select value={rate} onChange={e => setRate(Number(e.target.value))}><option value={0.7}>Chậm</option><option value={0.9}>Vừa</option><option value={1}>Bình thường</option></select></label><div className="classroom-audio">{lesson.words.filter(w => w.exampleSentence && w.exampleTranslation).slice(0, 3).map((w, i) => <button key={w.id} onClick={() => play(w.exampleSentence)}><Volume2 size={18}/>{playing === w.exampleSentence ? 'Đang phát' : 'Nghe đoạn'} {i + 1}</button>)}<button onClick={() => { stopJapaneseSpeech(); setPlaying(''); }}>Dừng</button></div><Quiz questions={listenQuiz} onComplete={() => finish('listening')}/></>}
      {tab === 'review' && <><h3>Kiểm tra kiến thức ngày {day}</h3><p>Ôn nghĩa từ, cách đọc kanji và mẫu câu đã học.</p><Quiz questions={[...wordQuiz.slice(0, 4), ...lesson.kanji.map((k, i) => { const options = quizChoices(k.meaning, lesson.kanji.map(x => x.meaning), day + i); return { question: `Kanji ${k.character} mang nghĩa gì?`, options, correctIndex: options.indexOf(k.meaning), explanation: `On: ${k.onyomi} · Kun: ${k.kunyomi}` }; }).filter(q => q.options.length > 1)]} onComplete={() => finish('review')}/>{lesson.grammar.map(g => <SentenceBuilder key={g.id} words={g.wordsToReorder || []} answer={g.correctSentence}/>)}</>}
    </div>
  </section>;
}
function SentenceBuilder({ words, answer }: {
    words: string[];
    answer: string;
}) {
    const shuffled = useMemo(() => words.map((text, id) => ({ text, id })).reverse(), [words]);
    const [chosen, setChosen] = useState<number[]>([]);
    const [checked, setChecked] = useState(false);
    if (words.length < 2 || !answer)
        return null;
    const sentence = chosen.map(id => words[id]).join('');
    const normalize = (s: string) => s.replace(/[\s。！？!?]/g, '');
    return <div className="classroom-builder"><h4>Sắp xếp thành câu đúng</h4><div className="classroom-built" aria-live="polite">{chosen.map((id, i) => <button key={i} disabled={checked} onClick={() => setChosen(c => c.filter((_, j) => j !== i))}>{words[id]}</button>)}</div><div className="classroom-audio">{shuffled.map(w => <button key={w.id} disabled={checked || chosen.includes(w.id)} onClick={() => setChosen(c => [...c, w.id])}>{w.text}</button>)}</div><button disabled={chosen.length !== words.length || checked} onClick={() => setChecked(true)}>Kiểm tra câu</button><button onClick={() => { setChosen([]); setChecked(false); }}>Làm lại</button>{checked && <p role="status">{normalize(sentence) === normalize(answer) ? 'Đúng rồi!' : 'Câu đúng:'} {answer}</p>}</div>;
}
