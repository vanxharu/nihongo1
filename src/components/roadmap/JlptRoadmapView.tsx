import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Repeat, 
  Lock, 
  Check, 
  ClipboardList, 
  Sparkles, 
  Info, 
  Calendar, 
  Play, 
  Award, 
  ChevronRight,
  HelpCircle,
  Clock,
  BookOpen,
  Brain,
  Headphones
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, JLPTLevel, StudyRoadmapConfig } from '../../types';
import MiniTestModal from './MiniTestModal';
import { AchievementMascotIcon } from '../achievements/AchievementMascotIcon';

interface JlptRoadmapViewProps {
  userProfile: UserProfile;
  updateProfile: (updated: Partial<UserProfile>) => void;
  onEarnXp?: (amount: number, reason: string) => void;
}

export default function JlptRoadmapView({
  userProfile,
  updateProfile,
  onEarnXp
}: JlptRoadmapViewProps) {
  const currentLevel: JLPTLevel = userProfile.targetLevel || 'N4';
  const roadmap: StudyRoadmapConfig = userProfile.studyRoadmap || {
    targetLevel: currentLevel,
    durationDays: 60,
    startDate: new Date().toISOString().split('T')[0],
    currentDay: 1,
    completedDays: []
  };

  // State
  const [isDurationModalOpen, setIsDurationModalOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<30 | 60 | 90>(roadmap.durationDays || 60);
  const [activeMiniTestDay, setActiveMiniTestDay] = useState<number | null>(null);

  const completedCount = roadmap.completedDays?.length || 0;
  const progressPercent = Math.min(100, Math.round((completedCount / roadmap.durationDays) * 100));

  // Generate day plan curriculum
  const daysList = Array.from({ length: roadmap.durationDays }, (_, i) => {
    const day = i + 1;
    let type: 'test' | 'adaptive' | 'kanji' | 'grammar' | 'listening' | 'reading' = 'adaptive';
    let title = 'Luyện thích ứng';
    let questionCount = 7;

    if (day === 1) {
      type = 'test';
      title = 'Đề mini khởi động';
      questionCount = 7;
    } else if (day % 7 === 0) {
      type = 'test';
      title = `Mini Test tuần ${day / 7}`;
      questionCount = 10;
    } else if (day % 4 === 1) {
      type = 'kanji';
      title = 'Cách đọc kanji';
    } else if (day % 4 === 2) {
      type = 'grammar';
      title = 'Chọn mẫu ngữ pháp';
    } else if (day % 4 === 3) {
      type = 'listening';
      title = 'Luyện nghe hiểu hình ảnh';
    } else {
      type = 'reading';
      title = 'Đọc hiểu đoạn ngắn';
    }

    const isCompleted = roadmap.completedDays?.includes(day);
    const isUnlocked = day === 1 || isCompleted || (roadmap.completedDays?.includes(day - 1));

    return {
      day,
      type,
      title,
      questionCount,
      isCompleted,
      isUnlocked,
      isActive: day === roadmap.currentDay
    };
  });

  const handleSaveDuration = () => {
    const newRoadmap: StudyRoadmapConfig = {
      targetLevel: currentLevel,
      durationDays: selectedDuration,
      startDate: new Date().toISOString().split('T')[0],
      currentDay: 1,
      completedDays: []
    };
    updateProfile({ studyRoadmap: newRoadmap });
    setIsDurationModalOpen(false);
  };

  const handleCompleteDay = (day: number, correctCount: number) => {
    const nextCompleted = Array.from(new Set([...(roadmap.completedDays || []), day]));
    const nextDay = Math.min(roadmap.durationDays, day + 1);

    const newRoadmap: StudyRoadmapConfig = {
      ...roadmap,
      completedDays: nextCompleted,
      currentDay: nextDay
    };

    const earnedXp = correctCount * 15 + 25;
    const todayStr = new Date().toISOString().split('T')[0];
    const lessonTag = `roadmap_${currentLevel.toLowerCase()}_day_${day}`;
    
    // Also record in completedLessons and dailyTestResults for cross-screen sync (Progress & Achievements)
    const updatedCompletedLessons = Array.from(new Set([...(userProfile.completedLessons || []), lessonTag]));
    const updatedStudyDays = Array.from(new Set([...(userProfile.studyDays || []), todayStr]));
    const updatedDailyTestResults = [
      ...(userProfile.dailyTestResults || []),
      { date: todayStr, score: correctCount, total: 7 }
    ];

    updateProfile({ 
      studyRoadmap: newRoadmap,
      completedLessons: updatedCompletedLessons,
      studyDays: updatedStudyDays,
      dailyTestResults: updatedDailyTestResults,
      lastActiveDate: todayStr
    });

    if (onEarnXp) {
      onEarnXp(earnedXp, `Hoàn thành Ngày ${day} Lộ trình ${currentLevel}`);
    }
  };

  return (
    <div className="flex-1 w-full min-h-screen bg-[#0A0F1D] text-slate-100 flex flex-col items-center pb-24 select-none">
      {/* Container with max-width for mobile-first precision */}
      <div className="w-full max-w-md flex flex-col flex-1">
        {/* Top Header */}
        <div className="px-4 py-3.5 flex items-center justify-between border-b border-slate-800/80 bg-[#0A0F1D]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-white tracking-tight">
              Lộ trình · {currentLevel}
            </h1>
          </div>

          <button
            onClick={() => setIsDurationModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 font-bold text-xs border border-sky-400/30 transition-all cursor-pointer active:scale-95"
            title="Đổi thời gian lộ trình"
          >
            <Repeat className="w-3.5 h-3.5" />
            <span>Đổi</span>
          </button>
        </div>

        {/* Purple Banner Card (As in Screenshot_20260914_130434.png) */}
        <div className="p-4">
          <div className="rounded-3xl p-5 bg-gradient-to-r from-[#7B5CF8] via-[#6E44E8] to-[#5B2BD4] text-white shadow-xl shadow-purple-950/40 relative overflow-hidden">
            {/* Background sparkle accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-3 relative z-10">
              <span className="text-xl font-black tracking-tight">
                Ngày {roadmap.currentDay} / {roadmap.durationDays}
              </span>
              <span className="text-sm font-bold bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                {completedCount}/{roadmap.durationDays} ✓
              </span>
            </div>

            {/* Smooth Rounded Progress bar */}
            <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-white rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${Math.max(5, progressPercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Gamified Road Map View (Winding path for all durationDays) */}
        <div className="flex-1 px-4 py-2 relative flex flex-col items-center">
          {/* S-curve dashed background road */}
          <div className="w-full relative flex flex-col items-center space-y-7 sm:space-y-8 pt-10 sm:pt-12">
            {daysList.map((item, idx) => {
              // Zigzag layout offset: alternate center, slight left, center, slight right
              const offsets = [
                'translate-x-0',
                '-translate-x-12',
                'translate-x-0',
                'translate-x-12'
              ];
              const offsetClass = offsets[idx % offsets.length];

              return (
                <div 
                  key={item.day}
                  id={`roadmap-day-${item.day}`}
                  className={`relative flex items-center justify-center w-full ${offsetClass}`}
                >
                  {/* Connecting dashed line to previous node */}
                  {idx > 0 && (
                    <div className="absolute -top-7 sm:-top-8 w-1 h-7 sm:h-8 border-l-2 border-dashed border-slate-700/60 pointer-events-none" />
                  )}

                  {/* If Day 1: Display the cute Shiba mascot on top with neat speech tag */}
                  {item.day === 1 && (
                    <div className="absolute -top-16 flex flex-col items-center pointer-events-none z-20">
                      <div className="relative flex items-center justify-center">
                        <div className="w-12 h-12 flex items-center justify-center drop-shadow-md">
                          <AchievementMascotIcon
                            type="shiba-start"
                            isUnlocked={true}
                            size={48}
                          />
                        </div>
                        <span className="text-xs absolute -top-1 -right-2 filter drop-shadow">
                          🎌
                        </span>
                      </div>
                      <div className="bg-[#5B2BD4] border border-purple-400/40 text-purple-100 text-[10px] font-bold px-2 py-0.5 rounded-full shadow -mt-1 backdrop-blur-xs">
                        Bắt đầu nào!
                      </div>
                    </div>
                  )}

                  {/* Active / Unlocked Node */}
                  {item.isUnlocked ? (
                    <div className="relative flex items-center">
                      {/* Left Badge Label for Day 1 or Test Days */}
                      {item.day === 1 && (
                        <div className="absolute right-full mr-4 flex flex-col items-end whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md bg-[#6E44E8] text-white text-[10px] font-black tracking-wider uppercase shadow-md">
                            MINI TEST
                          </span>
                          <span className="text-xs font-bold text-slate-300 mt-0.5">
                            7 câu
                          </span>
                        </div>
                      )}

                      {item.day > 1 && item.type === 'test' && (
                        <div className="absolute right-full mr-4 flex flex-col items-end whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black tracking-wider uppercase shadow-md">
                            {item.day === roadmap.durationDays ? 'ĐÍCH ĐẾN' : 'TEST TUẦN'}
                          </span>
                          <span className="text-xs font-bold text-amber-300 mt-0.5">
                            {item.questionCount} câu
                          </span>
                        </div>
                      )}

                      {/* Main Interactive Circle Node */}
                      <button
                        type="button"
                        onClick={() => setActiveMiniTestDay(item.day)}
                        className={`relative w-16 h-16 rounded-full p-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-all group flex items-center justify-center ${
                          item.day === roadmap.durationDays
                            ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 shadow-[0_0_24px_rgba(245,158,11,0.6)]'
                            : 'bg-gradient-to-tr from-[#6E44E8] to-[#9367F9] shadow-[0_0_24px_rgba(123,92,248,0.6)]'
                        }`}
                      >
                        {/* Outer Glow Ring */}
                        <div className={`absolute inset-0 rounded-full border-2 animate-pulse ${
                          item.day === roadmap.durationDays ? 'border-amber-300/80' : 'border-purple-400/80'
                        }`} />

                        {/* Top Number Pin */}
                        <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-white text-[#5B2BD4] text-[11px] font-black flex items-center justify-center shadow-md">
                          {item.day}
                        </span>

                        {/* Center Icon */}
                        <div className={`w-full h-full rounded-full flex items-center justify-center ${
                          item.day === roadmap.durationDays ? 'bg-amber-600' : 'bg-[#5225CC]'
                        }`}>
                          {item.isCompleted ? (
                            <Check className="w-7 h-7 text-white font-black" />
                          ) : item.day === roadmap.durationDays ? (
                            <Award className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
                          ) : (
                            <ClipboardList className="w-7 h-7 text-white group-hover:scale-110 transition-transform" />
                          )}
                        </div>
                      </button>

                      {/* Right Label (if not Day 1) */}
                      {item.day > 1 && (
                        <div className="absolute left-full ml-4 whitespace-nowrap">
                          <span className="text-xs font-bold text-sky-400 block">Ngày {item.day}</span>
                          <span className="text-xs text-slate-300">{item.title}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Locked Node */
                    <div className="relative flex items-center">
                      {/* Left or Right Labels alternating */}
                      {idx % 2 === 1 ? (
                        <div className="absolute right-full mr-4 flex flex-col items-end whitespace-nowrap">
                          <span className="text-xs font-bold text-slate-400">Ngày {item.day}</span>
                          <span className="text-xs text-slate-500">{item.title}</span>
                        </div>
                      ) : (
                        <div className="absolute left-full ml-4 whitespace-nowrap">
                          <span className="text-xs font-bold text-slate-400">Ngày {item.day}</span>
                          <span className="text-xs text-slate-500">{item.title}</span>
                        </div>
                      )}

                      {/* Locked Gray Circle */}
                      <div className="w-14 h-14 rounded-full bg-[#182235] border-2 border-slate-700/80 flex items-center justify-center shadow-inner">
                        {item.day === roadmap.durationDays ? (
                          <Award className="w-5 h-5 text-slate-500" />
                        ) : (
                          <Lock className="w-5 h-5 text-slate-500" />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Cute Shiba mascot encouragement card at the bottom of the roadmap */}
            <div className="w-full flex justify-end pr-4 sm:pr-6 pt-6 pointer-events-none">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#141E30]/90 border border-slate-800 shadow-xl backdrop-blur-sm">
                <div className="w-12 h-12 rounded-xl bg-[#1E293B]/80 border border-slate-700/60 flex items-center justify-center shrink-0 p-0.5 shadow-inner">
                  <AchievementMascotIcon
                    type="shiba-start"
                    isUnlocked={true}
                    size={42}
                  />
                </div>
                <div className="text-right pr-1">
                  <span className="text-xs font-black text-amber-400 block">Cố lên bạn ơi!</span>
                  <span className="text-[10px] text-slate-300 font-medium">Đích đến Ngày {roadmap.durationDays} 🎯</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Chọn thời gian lộ trình (Screenshot_20260914_130452.png) */}
      <AnimatePresence>
        {isDurationModalOpen && (
          <div className="fixed inset-0 z-[160] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0D1524] border border-slate-700 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl text-slate-100"
            >
              {/* Header */}
              <div className="flex items-center gap-3 pb-1 border-b border-slate-800">
                <button
                  onClick={() => setIsDurationModalOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-black text-white">Chọn thời gian lộ trình</h3>
              </div>

              {/* Subtitle */}
              <p className="text-xs text-slate-400 leading-normal">
                Bạn muốn đạt mục tiêu JLPT {currentLevel} trong bao lâu?
              </p>

              {/* Warning Amber Box */}
              <div className="p-3.5 rounded-2xl bg-[#2A1E11] border border-amber-600/40 flex items-start gap-2.5 text-xs text-amber-200 leading-relaxed">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Hãy chọn thời gian cho lộ trình mới. Lộ trình sẽ bắt đầu lại từ Ngày 1.</span>
              </div>

              {/* 3 Duration Options */}
              <div className="space-y-3 pt-1">
                {/* 30 days */}
                <div
                  onClick={() => setSelectedDuration(30)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between ${
                    selectedDuration === 30
                      ? 'bg-[#181D33] border-purple-500 shadow-[0_0_15px_rgba(123,92,248,0.25)]'
                      : 'bg-[#121927] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-base font-black text-white block">30 ngày</span>
                    <span className="text-xs font-bold text-sky-400 block">
                      Cường độ cao · khoảng 20–30 phút/ngày
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Phù hợp nếu bạn đã có nền và muốn ôn nước rút.
                    </span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-1 shrink-0 ${
                    selectedDuration === 30 ? 'border-purple-500 bg-purple-500' : 'border-slate-600'
                  }`}>
                    {selectedDuration === 30 && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>

                {/* 60 days (Recommended) */}
                <div
                  onClick={() => setSelectedDuration(60)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between ${
                    selectedDuration === 60
                      ? 'bg-[#181D33] border-purple-500 shadow-[0_0_15px_rgba(123,92,248,0.25)]'
                      : 'bg-[#121927] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-white">60 ngày</span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                        Được đề xuất
                      </span>
                    </div>
                    <span className="text-xs font-bold text-purple-400 block">
                      Cân bằng · khoảng 15–25 phút/ngày
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Đủ thời gian luyện từng dạng bài, làm Mini Test và cải thiện điểm yếu.
                    </span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-1 shrink-0 ${
                    selectedDuration === 60 ? 'border-purple-500 bg-purple-500' : 'border-slate-600'
                  }`}>
                    {selectedDuration === 60 && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>

                {/* 90 days */}
                <div
                  onClick={() => setSelectedDuration(90)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between ${
                    selectedDuration === 90
                      ? 'bg-[#181D33] border-purple-500 shadow-[0_0_15px_rgba(123,92,248,0.25)]'
                      : 'bg-[#121927] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-base font-black text-white block">90 ngày</span>
                    <span className="text-xs font-bold text-sky-400 block">
                      Nhẹ nhàng · khoảng 10–20 phút/ngày
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Phù hợp nếu bạn muốn duy trì thói quen và tiến bộ từng bước.
                    </span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-1 shrink-0 ${
                    selectedDuration === 90 ? 'border-purple-500 bg-purple-500' : 'border-slate-600'
                  }`}>
                    {selectedDuration === 90 && <Check className="w-3 h-3 text-white" />}
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Lộ trình bắt đầu hôm nay. Học đúng thứ tự, theo nhịp của bạn.</span>
              </div>

              {/* Start Button */}
              <button
                type="button"
                onClick={handleSaveDuration}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-400 to-cyan-500 hover:from-sky-300 hover:to-cyan-400 text-slate-950 font-black text-sm shadow-lg shadow-sky-400/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Bắt đầu lộ trình {selectedDuration} ngày</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mini Test Interactive Modal */}
      {activeMiniTestDay !== null && (
        <MiniTestModal
          isOpen={true}
          dayNumber={activeMiniTestDay}
          onClose={() => setActiveMiniTestDay(null)}
          onCompleteDay={(day, score) => {
            handleCompleteDay(day, score);
            setActiveMiniTestDay(null);
          }}
        />
      )}
    </div>
  );
}
