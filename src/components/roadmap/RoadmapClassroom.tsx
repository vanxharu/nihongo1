import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Headphones, RotateCcw, Send, Volume2 } from 'lucide-react';
import type { JLPTLevel } from '../../types';
import { dailyExercises, EXERCISE_TYPES, exerciseText } from '../../data/roadmapExercises';
import { speakJapanese, stopJapaneseSpeech } from '../../utils/audio';
import { showLearningFeedback } from '../../utils/learningMotion';
import ShibaMascot from '../mascot/ShibaMascot';
import './classroom.css';
const sections = { 'moji-goi': '文字・語彙 · Từ vựng', bunpou: '文法 · Ngữ pháp', dokkai: '読解 · Đọc hiểu', choukai: '聴解 · Nghe hiểu' };
export default function RoadmapClassroom({ level, day, storageKey, onComplete }: {
    level: JLPTLevel;
    day: number;
    storageKey: string;
    onComplete: () => void;
}) {
    const questions = useMemo(() => dailyExercises(level, day), [level, day]);
    const fingerprint = JSON.stringify(questions.map(q => [q.id, q.question, q.options, q.correctIndex]));
    const key = `roadmap-exercises-v1:${storageKey}:${level}:${day}`;
    const [restored] = useState(() => { try {
        const value = JSON.parse(localStorage.getItem(key) || 'null');
        if (value?.fingerprint === fingerprint)
            return value;
    }
    catch { } return null; });
    const [answers, setAnswers] = useState<Record<string, number>>(() => { const safe: Record<string, number> = {}; for (const q of questions) {
        const a = restored?.answers?.[q.id];
        if (Number.isInteger(a) && a >= 0 && a < q.options.length)
            safe[q.id] = a;
    } return safe; });
    const [graded, setGraded] = useState(!!restored?.graded && questions.length > 0 && questions.every(q => Number.isInteger(restored?.answers?.[q.id]) && restored.answers[q.id] >= 0 && restored.answers[q.id] < q.options.length));
    const [index, setIndex] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [audioFailed, setAudioFailed] = useState(false);
    const [audioMessage, setAudioMessage] = useState('');
    const [saveMessage, setSaveMessage] = useState('');
    const audioRef = useRef<HTMLAudioElement>(null);
    const notified = useRef(false);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const q = questions[index];
    const count = Object.keys(answers).length;
    const correct = questions.filter(item => answers[item.id] === item.correctIndex).length;
    useEffect(() => { try {
        localStorage.setItem(key, JSON.stringify({ fingerprint, answers, graded }));
        setSaveMessage('');
    }
    catch {
        setSaveMessage('Trình duyệt không lưu được bài làm. Hãy hoàn thành trước khi đóng trang.');
    } }, [answers, graded, key, fingerprint]);
    useEffect(() => { if (graded && !notified.current) {
        notified.current = true;
        onComplete();
    } if (!graded)
        notified.current = false; }, [graded, onComplete]);
    useEffect(() => { const audio = audioRef.current; setPlaying(false); setAudioFailed(false); setAudioMessage(''); return () => { audio?.pause(); stopJapaneseSpeech(); }; }, [index]);
    const move = (next: number) => { setIndex(next); headingRef.current?.focus(); };
    const replay = () => { setAudioMessage(''); speakJapanese(exerciseText(q.audioScript || ''), 1, () => setPlaying(false), { isSentence: true, onStatus: s => { setPlaying(s.state === 'playing'); if (s.state === 'failed')
            setAudioMessage('Chưa phát được giọng đọc. Hãy thử lại hoặc chọn giọng khác trong cài đặt.'); } }); };
    if (!q)
        return <section className="roadmap-classroom"><p>Chưa có bộ bài tập cho cấp độ này.</p></section>;
    const audioUrl = q.audioUrl || (q.audioTrack ? `/audio/${q.audioTrack.replace(/\.mp3$/, '')}.mp3` : '');
    return <section className="roadmap-classroom exercise-classroom" aria-label={`Bài tập JLPT ngày ${day}`}>
    <header><ShibaMascot pose={graded ? 'celebration' : 'studying'} size={72} animated={false}/><div><small>LUYỆN DẠNG ĐỀ JLPT · {level}</small><h2>Bài tập ngày {day}</h2><p>{questions.length} câu · {new Set(questions.map(item => item.type)).size} dạng bài · làm và chữa lỗi ngay tại đây.</p></div></header>
    <div className="exercise-overview"><span>{graded ? `${correct}/${questions.length} câu đúng` : `Đã làm ${count}/${questions.length} câu`}</span><progress aria-label="Số câu đã trả lời" value={count} max={questions.length}/><small>Đề luyện theo dạng JLPT; kết quả là số câu đúng, không quy đổi thành điểm thi chính thức.</small></div>
    <nav className="exercise-numbers" aria-label="Chọn câu hỏi">{questions.map((item, i) => <button key={item.id} aria-label={`Câu ${i + 1}: ${EXERCISE_TYPES[item.type].name}`} aria-current={i === index ? 'step' : undefined} className={graded ? answers[item.id] === item.correctIndex ? 'answer-correct' : 'answer-wrong' : answers[item.id] !== undefined ? 'answer-selected' : ''} onClick={() => move(i)}>{i + 1}</button>)}</nav>
    <div className="classroom-panel"><div className="exercise-heading"><span>{sections[q.section]}</span><span>Câu {index + 1}/{questions.length}</span></div><h3 ref={headingRef} tabIndex={-1}>{EXERCISE_TYPES[q.type].name}</h3><p className="exercise-instruction">{EXERCISE_TYPES[q.type].instruction}</p>
      {q.contextPassage && q.contextPassage !== q.question && <div className="classroom-passage" lang="ja">{q.contextPassage}</div>}
      {q.readingPassage && q.readingPassage !== q.contextPassage && <div className="classroom-passage" lang="ja">{exerciseText(q.readingPassage)}</div>}
      {q.section === 'choukai' && <div className="exercise-listening"><Headphones size={22}/><div><b>Nghe trước khi chọn đáp án</b>{audioUrl && !audioFailed ? <audio key={q.id} ref={audioRef} controls preload="none" src={audioUrl} onError={() => setAudioFailed(true)}/> : q.audioScript ? <><p>Giọng đọc hệ thống từ bản chép của câu hỏi.</p><button onClick={replay}><Volume2 size={18}/>{playing ? 'Phát lại' : 'Nghe câu hỏi'}</button><button onClick={() => { stopJapaneseSpeech(); setPlaying(false); }}>Dừng</button></> : <p role="alert">Chưa tải được audio cho câu này.</p>}{audioMessage && <p role="alert">{audioMessage}</p>}</div></div>}
      {q.imageUrl && <img className="exercise-image" src={q.imageUrl} alt="Hình minh họa câu hỏi"/>}
      {q.imageSvg && !q.imageUrl && <img className="exercise-image" src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(q.imageSvg)}`} alt="Hình minh họa câu hỏi"/>}
      <p className="exercise-question" lang="ja">{q.question}</p><fieldset className="classroom-options"><legend className="sr-only">Chọn đáp án cho câu {index + 1}</legend>{q.options.map((option, i) => <button key={i} disabled={graded} aria-pressed={answers[q.id] === i} className={graded ? i === q.correctIndex ? 'answer-correct' : answers[q.id] === i ? 'answer-wrong' : '' : answers[q.id] === i ? 'answer-selected' : ''} onClick={() => setAnswers(old => ({ ...old, [q.id]: i }))}><span><b>{i + 1}.</b> {exerciseText(option)}</span>{graded && i === q.correctIndex && <Check size={18}/>}</button>)}</fieldset>
      {graded && <div className={`exercise-explanation ${answers[q.id] === q.correctIndex ? 'answer-correct' : 'answer-wrong'}`} role="status"><b>{answers[q.id] === q.correctIndex ? 'Đúng rồi!' : 'Cần ôn lại'} · Đáp án {q.correctIndex + 1}</b><p>{q.explanation || q.hint || `Đáp án đúng: ${q.options[q.correctIndex]}`}</p>{q.audioScript && <details><summary>Xem bản chép đoạn nghe</summary><p lang="ja">{exerciseText(q.audioScript)}</p></details>}</div>}
      <div className="exercise-navigation"><button disabled={index === 0} onClick={() => move(index - 1)}><ChevronLeft size={17}/>Câu trước</button><button disabled={index === questions.length - 1} onClick={() => move(index + 1)}>Câu tiếp<ChevronRight size={17}/></button></div>
      {!graded ? <button className="classroom-primary exercise-submit" disabled={count !== questions.length} onClick={() => { audioRef.current?.pause(); stopJapaneseSpeech(); setGraded(true); showLearningFeedback(correct === questions.length ? 'correct' : 'incorrect'); }}><Send size={18}/>Nộp bài · {count}/{questions.length}</button> : <div className="exercise-results"><h3>Kết quả ngày {day}: {correct}/{questions.length}</h3><div className="exercise-section-results">{Object.entries(sections).map(([section, label]) => { const items = questions.filter(item => item.section === section); return items.length ? <p key={section}>{label}<b>{items.filter(item => answers[item.id] === item.correctIndex).length}/{items.length}</b></p> : null; })}</div><button onClick={() => { const wrong = questions.findIndex(item => answers[item.id] !== item.correctIndex); move(wrong >= 0 ? wrong : 0); }}>Xem lại câu sai</button><button onClick={() => { setAnswers({}); setGraded(false); move(0); }}><RotateCcw size={16}/>Làm lại cả bài</button></div>}
      {saveMessage && <p role="alert">{saveMessage}</p>}
    </div></section>;
}
