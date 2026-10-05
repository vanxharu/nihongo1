import React from 'react';
import { ArrowUpRight, BookOpen, Target } from 'lucide-react';
import ShibaMascot from '../mascot/ShibaMascot';
import './studyExperience.css';

interface Props {
  kind: 'exam' | 'reading';
  level: string;
  count: number;
  completed: number;
  onHistory: () => void;
}

export default function StudyExperienceHero({ kind, level, count, completed, onHistory }: Props) {
  const exam = kind === 'exam';
  return <header className={`study-hero study-hero-${kind}`}>
    <div className="study-hero-copy">
      <span className="study-eyebrow">NIHON SHIBA · {exam ? 'JLPT PRACTICE' : 'READING ROOM'}</span>
      <h1>{exam ? 'Tự tin bước vào kỳ thi.' : 'Đọc một bài. Hiểu thêm một chút.'}</h1>
      <p>{exam ? 'Chọn đề, luyện từng kỹ năng và nhìn lại những câu cần ôn.' : 'Đọc tiếng Nhật với furigana, nghĩa từ và ngữ pháp ngay trong bài.'}</p>
      <div className="study-hero-stats">
        <span><Target size={16} /> Mục tiêu {level}</span>
        <span><BookOpen size={16} /> {count} {exam ? 'đề trong kho' : 'bài đã lưu'}</span>
        <button type="button" onClick={onHistory}>{completed} {exam ? 'lượt làm bài' : 'bài trong lịch sử'} <ArrowUpRight size={15} /></button>
      </div>
    </div>
    <div className="study-hero-mascot" aria-hidden="true"><span className="study-orbit" /><ShibaMascot pose={exam ? 'cheering' : 'reading'} size="lg" /><span className="study-mascot-note">{exam ? 'Mỗi lần luyện, một bước tiến.' : 'Cùng Shiba khám phá nhé!'}</span></div>
  </header>;
}
