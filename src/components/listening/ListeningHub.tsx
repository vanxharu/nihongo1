import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Headphones, 
  Search, 
  Filter, 
  Bookmark, 
  History, 
  CheckCircle2, 
  Play, 
  RotateCcw, 
  Flame, 
  Layers, 
  Award, 
  ArrowRight, 
  X, 
  SlidersHorizontal,
  PlusCircle,
  ExternalLink,
  BookOpen,
  BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { YouTubeListeningVideo, UserVideoProgress, JLPTLevel, YouTubeListeningCategory } from '../../types';
import { DEFAULT_YOUTUBE_LISTENING_VIDEOS } from '../../data/youtubeListeningSeedData';
import { YouTubeVideoCard } from './YouTubeVideoCard';
import { YouTubeVideoDetailModal } from './YouTubeVideoDetailModal';
import { formatDuration } from '../../utils/youtubeUtils';
import { 
  getAllLocalProgress, 
  saveToLocalStorage, 
  resolveLatestProgress, 
  syncProgressToServer,
  isProgressCompleted,
  flushPendingSync
} from '../../utils/listeningProgressStorage';

interface ListeningHubProps {
  userId?: string;
  currentLevel: JLPTLevel;
  onLevelChange?: (level: JLPTLevel) => void;
  onEarnXp?: (xp: number, reason: string) => void;
  isAdmin?: boolean;
  initialExamId?: string;
  onSelectExam?: (examId: string | null) => void;
}

export const ListeningHub: React.FC<ListeningHubProps> = ({
  userId = 'default_user',
  currentLevel = 'N4',
  onLevelChange,
  onEarnXp,
  isAdmin = false,
  initialExamId,
  onSelectExam
}) => {
  // 1. Data state
  const [videos, setVideos] = useState<YouTubeListeningVideo[]>(DEFAULT_YOUTUBE_LISTENING_VIDEOS);
  const [progressMap, setProgressMap] = useState<Record<string, UserVideoProgress>>(() => {
    return getAllLocalProgress();
  });

  // 2. Active filters & tab state
  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel | 'ALL'>(currentLevel || 'N4');
  const [activeTab, setActiveTab] = useState<'all' | 'bookmarks' | 'history'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'not_started' | 'in_progress' | 'completed'>('ALL');

  // 3. Modal for viewing a video
  const [activeVideo, setActiveVideo] = useState<YouTubeListeningVideo | null>(null);

  // Sync initial exam from URL route
  useEffect(() => {
    if (initialExamId && videos.length > 0) {
      const found = videos.find(v => v.id === initialExamId || v.youtube_video_id === initialExamId);
      if (found) {
        setActiveVideo(found);
      }
    }
  }, [initialExamId, videos]);

  const handleSelectVideo = (v: YouTubeListeningVideo) => {
    setActiveVideo(v);
    onSelectExam?.(v.id);
  };

  const handleCloseVideo = () => {
    setActiveVideo(null);
    onSelectExam?.(null);
  };

  // Sync selected level when prop changes
  useEffect(() => {
    if (currentLevel) {
      setSelectedLevel(currentLevel);
    }
  }, [currentLevel]);

  // Load videos from backend API with fallback to local seed
  useEffect(() => {
    fetch('/api/listening/videos')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.videos) && data.videos.length > 0) {
          setVideos(data.videos);
        }
      })
      .catch(() => {
        // Fallback to DEFAULT_YOUTUBE_LISTENING_VIDEOS already loaded
      });

    // Load progress from backend API and merge with local storage
    fetch(`/api/listening/progress?userId=${encodeURIComponent(userId)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.progress) {
          setProgressMap(prev => {
            const serverMap: Record<string, UserVideoProgress> = data.progress;
            const merged: Record<string, UserVideoProgress> = { ...prev };

            // Merge server records with conflict resolution
            Object.keys(serverMap).forEach(vId => {
              const localRec = prev[vId];
              const serverRec = serverMap[vId];
              const resolved = resolveLatestProgress(localRec, serverRec);
              if (resolved) {
                merged[vId] = resolved;
                saveToLocalStorage(resolved);

                // If local had a strictly newer timestamp, push back to server
                const localTs = localRec?.updatedAt || (localRec?.lastWatchedAt ? new Date(localRec.lastWatchedAt).getTime() : 0);
                const serverTs = serverRec?.updatedAt || (serverRec?.lastWatchedAt ? new Date(serverRec.lastWatchedAt).getTime() : 0);
                if (localTs > serverTs + 1000) {
                  syncProgressToServer(userId, resolved);
                }
              }
            });

            return merged;
          });
        }
      })
      .catch(() => {});
  }, [userId]);

  // Handle bookmark toggle
  const handleToggleBookmark = useCallback((videoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setProgressMap(prev => {
      const current = prev[videoId] || {
        videoId,
        currentTime: 0,
        duration: 0,
        completed: false,
        progressPercent: 0,
        bookmarked: false,
        lastWatchedAt: new Date().toISOString()
      };

      const newBookmark = !current.bookmarked;
      const now = Date.now();
      const updatedRecord: UserVideoProgress = {
        ...current,
        bookmarked: newBookmark,
        updatedAt: now,
        lastWatchedAt: new Date(now).toISOString()
      };

      saveToLocalStorage(updatedRecord);
      syncProgressToServer(userId, updatedRecord);

      return { ...prev, [videoId]: updatedRecord };
    });
  }, [userId]);

  // Handle completed toggle
  const handleToggleCompleted = useCallback((videoId: string) => {
    setProgressMap(prev => {
      const current = prev[videoId] || {
        videoId,
        currentTime: 0,
        duration: 0,
        completed: false,
        progressPercent: 0,
        bookmarked: false,
        lastWatchedAt: new Date().toISOString()
      };

      const newCompleted = !current.completed;
      const now = Date.now();
      const updatedRecord: UserVideoProgress = {
        ...current,
        completed: newCompleted,
        progressPercent: newCompleted ? 100 : current.progressPercent,
        updatedAt: now,
        lastWatchedAt: new Date(now).toISOString()
      };

      if (newCompleted && onEarnXp) {
        onEarnXp(50, 'Hoàn thành bài thi nghe JLPT');
      }

      saveToLocalStorage(updatedRecord);
      syncProgressToServer(userId, updatedRecord);

      return { ...prev, [videoId]: updatedRecord };
    });
  }, [userId, onEarnXp]);

  // Handle progress update from video player
  const handleProgressUpdate = useCallback((videoId: string, currentTime: number, duration: number, isCompleted?: boolean) => {
    setProgressMap(prev => {
      const current = prev[videoId] || {
        videoId,
        currentTime: 0,
        duration: 0,
        completed: false,
        progressPercent: 0,
        bookmarked: false,
        lastWatchedAt: new Date().toISOString()
      };

      const percent = duration > 0 ? Math.min(100, Math.round((currentTime / duration) * 100)) : 0;
      const completed = isCompleted !== undefined ? isCompleted : isProgressCompleted(currentTime, duration, current.completed);

      if (!current.completed && completed && onEarnXp) {
        onEarnXp(50, 'Hoàn thành bài thi nghe JLPT');
      }

      const now = Date.now();
      const updatedRecord: UserVideoProgress = {
        ...current,
        currentTime,
        duration: duration || current.duration || 0,
        progressPercent: completed ? 100 : percent,
        completed,
        updatedAt: now,
        lastWatchedAt: new Date(now).toISOString()
      };

      saveToLocalStorage(updatedRecord);
      return { ...prev, [videoId]: updatedRecord };
    });
  }, [onEarnXp]);

  // Handle reset progress (from beginning)
  const handleResetProgress = useCallback((videoId: string) => {
    setProgressMap(prev => {
      const current = prev[videoId];
      const now = Date.now();
      const resetRecord: UserVideoProgress = {
        videoId,
        currentTime: 0,
        duration: current?.duration || 0,
        completed: false,
        progressPercent: 0,
        bookmarked: current?.bookmarked || false,
        updatedAt: now,
        lastWatchedAt: new Date(now).toISOString()
      };

      saveToLocalStorage(resetRecord);
      syncProgressToServer(userId, resetRecord);
      return { ...prev, [videoId]: resetRecord };
    });
  }, [userId]);

  // Handle completed trigger from player onEnded
  const handlePlayerCompleted = useCallback((videoId: string) => {
    setProgressMap(prev => {
      const current = prev[videoId];
      const dur = current?.duration || 1800;
      const now = Date.now();
      const completedRecord: UserVideoProgress = {
        videoId,
        currentTime: dur,
        duration: dur,
        completed: true,
        progressPercent: 100,
        bookmarked: current?.bookmarked || false,
        updatedAt: now,
        lastWatchedAt: new Date(now).toISOString()
      };
      saveToLocalStorage(completedRecord);
      syncProgressToServer(userId, completedRecord);
      if (onEarnXp && !current?.completed) {
        onEarnXp(50, 'Hoàn thành bài thi nghe JLPT');
      }
      return { ...prev, [videoId]: completedRecord };
    });
  }, [userId, onEarnXp]);

  // Calculate stats for current level or overall
  const levelStats = useMemo(() => {
    const targetLvl = selectedLevel === 'ALL' ? (currentLevel || 'N4') : selectedLevel;
    const levelVideos = videos.filter(v => v.level === targetLvl && v.status !== 'hidden');
    const total = levelVideos.length;
    let completedCount = 0;
    let totalSeconds = 0;
    let inProgressVideo: YouTubeListeningVideo | null = null;
    let latestWatchedTime = 0;

    levelVideos.forEach(v => {
      const p = progressMap[v.id];
      if (p?.completed) {
        completedCount++;
        totalSeconds += (v.durationSeconds || p.duration || 1800);
      } else if (p && p.currentTime > 10) {
        totalSeconds += p.currentTime;
        const watchDate = new Date(p.lastWatchedAt || 0).getTime();
        if (watchDate > latestWatchedTime) {
          latestWatchedTime = watchDate;
          inProgressVideo = v;
        }
      }
    });

    const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

    return {
      level: targetLvl,
      total,
      completedCount,
      percent,
      totalSeconds,
      inProgressVideo: inProgressVideo || (total > 0 ? levelVideos[0] : null)
    };
  }, [videos, progressMap, selectedLevel, currentLevel]);

  // Filtered list of videos
  const filteredVideos = useMemo(() => {
    return videos.filter(v => {
      if (v.status === 'hidden') return false;

      // Tab filter
      if (activeTab === 'bookmarks') {
        if (!progressMap[v.id]?.bookmarked) return false;
      } else if (activeTab === 'history') {
        const p = progressMap[v.id];
        if (!p || (p.currentTime <= 5 && !p.completed)) return false;
      }

      // Level filter
      if (selectedLevel !== 'ALL' && v.level !== selectedLevel) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL' && v.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'ALL') {
        const p = progressMap[v.id];
        const isComp = p?.completed;
        const inProg = !isComp && (p?.progressPercent || 0) > 0;
        if (selectedStatus === 'completed' && !isComp) return false;
        if (selectedStatus === 'in_progress' && !inProg) return false;
        if (selectedStatus === 'not_started' && (isComp || inProg)) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = v.title.toLowerCase().includes(q);
        const matchCode = v.code?.toLowerCase().includes(q);
        const matchLevel = v.level.toLowerCase().includes(q);
        const matchSource = v.source.toLowerCase().includes(q);
        const matchDesc = v.description.toLowerCase().includes(q);
        if (!matchTitle && !matchCode && !matchLevel && !matchSource && !matchDesc) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (activeTab === 'history') {
        const timeA = new Date(progressMap[a.id]?.lastWatchedAt || 0).getTime();
        const timeB = new Date(progressMap[b.id]?.lastWatchedAt || 0).getTime();
        return timeB - timeA;
      }
      return (a.order || 99) - (b.order || 99);
    });
  }, [videos, progressMap, activeTab, selectedLevel, selectedCategory, selectedStatus, searchQuery]);

  // Bookmarks count & History count
  const bookmarkCount = useMemo(() => {
    return videos.filter(v => progressMap[v.id]?.bookmarked).length;
  }, [videos, progressMap]);

  const historyCount = useMemo(() => {
    return videos.filter(v => {
      const p = progressMap[v.id];
      return p && (p.currentTime > 5 || p.completed);
    }).length;
  }, [videos, progressMap]);

  return (
    <div className="w-full min-h-screen bg-[#0b0f19] text-slate-100 p-3 sm:p-5 lg:p-6 space-y-4">
      {/* Top Header & Level Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-transparent border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/10 shrink-0">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                <span>JLPT Listening</span>
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[11px] font-extrabold border border-emerald-500/30">
                聴解
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Luyện nghe tiếng Nhật thực tế từ YouTube • Tự động lưu tiến độ
            </p>
          </div>
        </div>

        {/* Level Selector Pills - Compact & No cut-off */}
        <div className="flex items-center gap-1 p-1 bg-[#121927] border border-slate-800 rounded-xl shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSelectedLevel('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedLevel === 'ALL'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tất cả
          </button>
          {(['N5', 'N4', 'N3', 'N2', 'N1'] as JLPTLevel[]).map((lvl) => {
            const isSelected = selectedLevel === lvl;
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  setSelectedLevel(lvl);
                  if (onLevelChange) onLevelChange(lvl);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {lvl}
              </button>
            );
          })}
        </div>
      </div>

      {/* Compact Study Progress & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:px-4 sm:py-2.5 rounded-2xl bg-[#101726] border border-slate-800 text-xs shadow-sm">
        {/* Left: Progress info for selected level */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-extrabold text-[11px] border border-emerald-500/30">
              {selectedLevel === 'ALL' ? 'TẤT CẢ' : `JLPT ${selectedLevel}`}
            </span>
            <span className="font-bold text-white text-xs sm:text-sm">
              {levelStats.completedCount}/{levelStats.total}
            </span>
            <span className="text-slate-400">đã hoàn thành ({levelStats.percent}%)</span>
          </div>

          {/* Mini Progress Bar */}
          <div className="w-24 sm:w-32 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(levelStats.percent, levelStats.completedCount > 0 ? 5 : 0)}%` }}
            />
          </div>

          {levelStats.totalSeconds > 0 && (
            <span className="text-slate-400 hidden sm:inline">
              ⏱ Đã luyện: <strong className="text-slate-200">{formatDuration(levelStats.totalSeconds)}</strong>
            </span>
          )}
        </div>

        {/* Right: Quick Resume or Motivation chip */}
        {levelStats.inProgressVideo ? (
          <div className="flex items-center gap-2">
            <span className="text-slate-400 hidden md:inline text-[11px]">Đang học gần nhất:</span>
            <button
              type="button"
              onClick={() => setActiveVideo(levelStats.inProgressVideo)}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer truncate max-w-xs sm:max-w-sm shadow-sm"
              title={`Tiếp tục học: ${levelStats.inProgressVideo.title}`}
            >
              <Play className="w-3.5 h-3.5 text-emerald-400 fill-current shrink-0" />
              <span className="truncate">
                {levelStats.inProgressVideo.code ? `${levelStats.inProgressVideo.code}: ` : ''}
                {levelStats.inProgressVideo.title}
              </span>
              <span className="text-[10px] text-emerald-400/80 shrink-0 font-semibold">
                ({progressMap[levelStats.inProgressVideo.id]?.progressPercent || 0}%)
              </span>
              <ArrowRight className="w-3 h-3 text-emerald-400 shrink-0" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
            <Award className="w-3.5 h-3.5" />
            <span>Mỗi bài hoàn thành nhận +50 XP</span>
          </div>
        )}
      </div>

      {/* Unified Filter & Tab Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 p-2 rounded-2xl bg-[#121927] border border-slate-800">
        {/* Main Navigation Tabs */}
        <div className="flex items-center gap-1 shrink-0 p-1 bg-slate-900/80 rounded-xl border border-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tất cả bài nghe</span>
            <span className="px-1.5 py-0.2 rounded-md bg-slate-800 text-[10px] font-semibold text-slate-300">
              {videos.filter(v => v.status !== 'hidden').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bookmarks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'bookmarks'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span>Bài đã lưu</span>
            {bookmarkCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-md bg-amber-500/30 text-[10px] font-extrabold text-amber-300">
                {bookmarkCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5 text-teal-400" />
            <span>Lịch sử nghe</span>
            {historyCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-md bg-teal-500/30 text-[10px] font-extrabold text-teal-300">
                {historyCount}
              </span>
            )}
          </button>
        </div>

        {/* Filter Controls: Search & Category & Status */}
        <div className="flex flex-wrap items-center gap-2 flex-1 lg:justify-end">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm bài nghe theo tên, nguồn..."
              className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="py-1.5 px-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">Tất cả loại bài</option>
            <option value="Official Sample">Đề mẫu chính thức</option>
            <option value="Sample Exam">Đề thi mẫu</option>
            <option value="Listening Practice">Luyện tập nghe</option>
            <option value="Mock Test">Thi thử</option>
            <option value="JLPT-style">Dạng đề JLPT</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e: any) => setSelectedStatus(e.target.value)}
            className="py-1.5 px-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="not_started">Chưa học</option>
            <option value="in_progress">Đang học</option>
            <option value="completed">Đã hoàn thành</option>
          </select>
        </div>
      </div>

      {/* Main Content Area: Video List Grid */}
      {filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVideos.map((video) => (
            <YouTubeVideoCard
              key={video.id}
              video={video}
              progress={progressMap[video.id]}
              onSelect={handleSelectVideo}
              onToggleBookmark={handleToggleBookmark}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-[#121927] border border-slate-800 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-white">Không tìm thấy bài nghe phù hợp</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn lại cấp độ / bộ lọc trạng thái.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedLevel('ALL');
              setSelectedCategory('ALL');
              setSelectedStatus('ALL');
              setActiveTab('all');
            }}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all cursor-pointer"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      )}

      {/* Video Detail Modal */}
      {activeVideo && (
        <YouTubeVideoDetailModal
          video={activeVideo}
          userId={userId}
          progress={progressMap[activeVideo.id]}
          onClose={handleCloseVideo}
          onToggleBookmark={handleToggleBookmark}
          onToggleCompleted={handleToggleCompleted}
          onProgressUpdate={handleProgressUpdate}
          onCompleted={handlePlayerCompleted}
          onResetProgress={handleResetProgress}
          onEarnXp={onEarnXp}
        />
      )}
    </div>
  );
};
