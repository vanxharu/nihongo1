import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Save, 
  Play, 
  Clock, 
  Check, 
  AlertCircle, 
  Volume2, 
  ShieldCheck, 
  FileText,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Edit3,
  BookOpen
} from 'lucide-react';
import { YouTubeListeningVideo } from '../../types';
import { ListeningExamData, ListeningQuestion, OriginalExam, YouTubeTimestampMapping } from '../../types/listeningExamTypes';
import { YouTubePlayer, YouTubePlayerRef } from './YouTubePlayer';
import { formatDuration } from '../../utils/youtubeUtils';
import { getAllOriginalExams, getOriginalExamById } from '../../data/originalListeningExams';
import { 
  getMappingsForVideo, 
  saveTimestampMapping, 
  saveMappingsBatch,
  getLinkedExamIdForVideo,
  linkVideoToExam,
  buildExamWithMappings
} from '../../utils/timestampMappingManager';
import { saveExamForVideo } from '../../utils/listeningQuestionSourceManager';

interface AdminTimestampMappingModalProps {
  video: YouTubeListeningVideo;
  onClose: () => void;
  onSaved?: (updatedExam: ListeningExamData) => void;
}

export const AdminTimestampMappingModal: React.FC<AdminTimestampMappingModalProps> = ({
  video,
  onClose,
  onSaved
}) => {
  const playerRef = useRef<YouTubePlayerRef>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 1. ORIGINAL EXAMS SELECTION
  const allOriginalExams = getAllOriginalExams();
  const initialExamId = getLinkedExamIdForVideo(video.youtube_video_id);
  const [selectedExamId, setSelectedExamId] = useState<string>(
    allOriginalExams.some(e => e.examId === initialExamId) 
      ? initialExamId 
      : (allOriginalExams.find(e => e.level === video.level)?.examId || allOriginalExams[0]?.examId || 'N4-EXAM-01')
  );

  const currentOriginalExam: OriginalExam = 
    getOriginalExamById(selectedExamId) || allOriginalExams[0];

  // 2. MAPPING STATE PER QUESTION
  // Maps questionId -> YouTubeTimestampMapping
  const [mappings, setMappings] = useState<Record<string, YouTubeTimestampMapping>>({});
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number>(0);

  // Live player current time for precise 100ms display (e.g. 03:12.500)
  const [liveCurrentTime, setLiveCurrentTime] = useState<number>(0);

  // Optional manual edit mode
  const [isManualEditMode, setIsManualEditMode] = useState<boolean>(false);

  // Load existing timestamp mappings on mount or when video/exam changes
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    try {
      // 1. Get mappings from manager
      const existingMappings = getMappingsForVideo(video.youtube_video_id);
      
      // Initialize with original exam's questions
      const initialMap: Record<string, YouTubeTimestampMapping> = { ...existingMappings };

      currentOriginalExam.questions.forEach((oq, idx) => {
        if (!initialMap[oq.questionId]) {
          // If no mapping yet, assign suggested/default times
          const prevQ = currentOriginalExam.questions[idx - 1];
          const prevMapping = prevQ ? initialMap[prevQ.questionId] : null;
          const start = prevMapping ? prevMapping.endTime + 5 : 30.0 + idx * 60.0;
          initialMap[oq.questionId] = {
            questionId: oq.questionId,
            examId: currentOriginalExam.examId,
            youtubeVideoId: video.youtube_video_id,
            startTime: start,
            endTime: start + 50.0,
            timestampVerified: false
          };
        }
      });

      if (isMounted) {
        setMappings(initialMap);
        setSelectedQuestionIndex(0);
      }
    } catch (err) {
      console.error('Failed to load timestamp mappings:', err);
    } finally {
      if (isMounted) setIsLoading(false);
    }

    return () => { isMounted = false; };
  }, [video.youtube_video_id, selectedExamId]);

  // Live time ticker from player
  useEffect(() => {
    const timer = setInterval(() => {
      if (playerRef.current) {
        const t = playerRef.current.getCurrentTime();
        setLiveCurrentTime(t);
      }
    }, 200);
    return () => clearInterval(timer);
  }, []);

  const activeOriginalQuestion = currentOriginalExam.questions[selectedQuestionIndex] || currentOriginalExam.questions[0];
  const activeMapping = activeOriginalQuestion 
    ? (mappings[activeOriginalQuestion.questionId] || {
        questionId: activeOriginalQuestion.questionId,
        examId: currentOriginalExam.examId,
        youtubeVideoId: video.youtube_video_id,
        startTime: 30.0,
        endTime: 90.0,
        timestampVerified: false
      }) 
    : null;

  // Format high-precision seconds to MM:SS.s
  const formatDetailedTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '00:00.000';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  // Switch Original Exam
  const handleExamChange = (newExamId: string) => {
    setSelectedExamId(newExamId);
    linkVideoToExam(video.youtube_video_id, newExamId);
  };

  // Update active question's mapping
  const handleUpdateMapping = (updates: Partial<YouTubeTimestampMapping>) => {
    if (!activeOriginalQuestion) return;
    setMappings(prev => {
      const qId = activeOriginalQuestion.questionId;
      const cur = prev[qId] || {
        questionId: qId,
        examId: currentOriginalExam.examId,
        youtubeVideoId: video.youtube_video_id,
        startTime: 0,
        endTime: 60,
        timestampVerified: false
      };
      return {
        ...prev,
        [qId]: { ...cur, ...updates, timestampVerified: true }
      };
    });
  };

  // Capture QUESTION DISPLAY START
  const handleCaptureQuestionDisplayTime = () => {
    if (!playerRef.current || !activeOriginalQuestion) return;
    const cur = playerRef.current.getCurrentTime();
    const rounded = Math.round(cur * 10) / 10;
    handleUpdateMapping({ questionDisplayStartTime: rounded });
  };

  // Capture LISTEN START from player
  const handleCaptureStartTime = () => {
    if (!playerRef.current || !activeOriginalQuestion) return;
    const cur = playerRef.current.getCurrentTime();
    const rounded = Math.round(cur * 10) / 10;
    handleUpdateMapping({ 
      startTime: rounded,
      listeningStartTime: rounded
    });
  };

  // Capture LISTEN END from player
  const handleCaptureEndTime = () => {
    if (!playerRef.current || !activeOriginalQuestion) return;
    const cur = playerRef.current.getCurrentTime();
    const rounded = Math.round(cur * 10) / 10;
    const currentStart = activeMapping?.listeningStartTime ?? activeMapping?.startTime ?? 0;
    if (rounded <= currentStart) {
      setErrorMessage('Mốc LISTEN END phải lớn hơn mốc LISTEN START!');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    handleUpdateMapping({ 
      endTime: rounded,
      listeningEndTime: rounded 
    });
  };

  // Capture ANSWER DISPLAY START
  const handleCaptureAnswerDisplayTime = () => {
    if (!playerRef.current || !activeOriginalQuestion) return;
    const cur = playerRef.current.getCurrentTime();
    const rounded = Math.round(cur * 10) / 10;
    handleUpdateMapping({ answerDisplayStartTime: rounded });
  };

  // Jump to Start and Play
  const handleJumpStart = () => {
    if (!playerRef.current || !activeMapping) return;
    playerRef.current.seekTo(activeMapping.startTime, true);
  };

  // Jump to End
  const handleJumpEnd = () => {
    if (!playerRef.current || !activeMapping) return;
    playerRef.current.seekTo(activeMapping.endTime, true);
  };

  // Fine-tune by delta (+/- 1s or +/- 0.5s)
  const handleAdjustTime = (field: 'startTime' | 'endTime', delta: number) => {
    if (!activeMapping) return;
    const cur = activeMapping[field] ?? 0;
    const nextVal = Math.max(0, Math.round((cur + delta) * 10) / 10);
    handleUpdateMapping({ [field]: nextVal });
  };

  // Test snippet (seek to start, auto-pause at end)
  const handleTestSnippet = () => {
    if (!playerRef.current || !activeMapping || !activeOriginalQuestion) return;
    playerRef.current.playSnippet(
      activeMapping.startTime, 
      activeMapping.endTime, 
      { questionId: activeOriginalQuestion.questionId, videoId: video.youtube_video_id }
    );
  };

  // Save single question mapping
  const handleSaveSingleMapping = async () => {
    if (!activeMapping || !activeOriginalQuestion) return;
    if (activeMapping.startTime < 0) {
      setErrorMessage('Start Time phải >= 0');
      return;
    }
    if (activeMapping.endTime <= activeMapping.startTime) {
      setErrorMessage('End Time phải lớn hơn Start Time');
      return;
    }

    setIsSaving(true);
    try {
      await saveTimestampMapping({
        ...activeMapping,
        timestampVerified: true
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch {
      setErrorMessage('Không thể lưu mốc thời gian.');
    } finally {
      setIsSaving(false);
    }
  };

  // Save all mappings for this video & link exam
  const handleSaveAll = async () => {
    setErrorMessage('');
    setIsSaving(true);

    try {
      // 1. Validation
      const mappingList = Object.values(mappings);
      for (const m of mappingList) {
        if (m.startTime < 0) {
          setErrorMessage(`Câu ${m.questionId}: Start Time phải >= 0`);
          setIsSaving(false);
          return;
        }
        if (m.endTime <= m.startTime) {
          setErrorMessage(`Câu ${m.questionId}: End Time (${m.endTime}s) phải lớn hơn Start Time (${m.startTime}s)`);
          setIsSaving(false);
          return;
        }
      }

      // 2. Link video to selected exam
      linkVideoToExam(video.youtube_video_id, selectedExamId);

      // 3. Save batch mappings
      await saveMappingsBatch(mappingList);

      // 4. Build complete verified ListeningExamData
      const completeExam = buildExamWithMappings(selectedExamId, video.youtube_video_id);
      if (completeExam) {
        await saveExamForVideo(video.youtube_video_id, completeExam);
        if (onSaved) {
          onSaved(completeExam);
        }
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Error saving mappings:', err);
      setErrorMessage(err.message || 'Lỗi lưu dữ liệu ánh xạ timestamp.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-teal-500/30 w-full max-w-6xl rounded-2xl shadow-2xl flex flex-col max-h-[96vh] overflow-hidden">
        
        {/* TOP BAR */}
        <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shadow-sm">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  JLPT Listening — Timestamp Mapping
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                  {video.level}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Đề gốc xác thực 100%
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gán mốc phát audio cho từng câu hỏi gốc trong video. Không cần nhập lại câu hỏi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving || isLoading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : saveSuccess ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saveSuccess ? 'Đã lưu thành công!' : 'Lưu bộ đề & Timestamp'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* EXAM SELECTOR STRIP */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-teal-400" />
              Chọn đề JLPT gốc:
            </span>
            <select
              value={selectedExamId}
              onChange={e => handleExamChange(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-teal-300 focus:outline-none focus:border-teal-500 cursor-pointer"
            >
              {allOriginalExams.map(ex => (
                <option key={ex.examId} value={ex.examId}>
                  [{ex.level}] {ex.title} ({ex.totalQuestions} câu)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Video ID:</span>
            <code className="px-2 py-0.5 rounded bg-slate-800 text-teal-300 font-mono text-[11px]">
              {video.youtube_video_id}
            </code>
          </div>
        </div>

        {/* ERROR / SUCCESS ALERTS */}
        {errorMessage && (
          <div className="mx-5 mt-3 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* MAIN BODY: 2 COLUMNS */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* LEFT COLUMN: YOUTUBE PLAYER & TIMESTAMP CONTROLS */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* Player Container */}
            <div className="rounded-2xl overflow-hidden border border-slate-800 bg-black shadow-lg">
              <YouTubePlayer
                ref={playerRef}
                videoId={video.youtube_video_id}
                title={video.title}
                level={video.level}
                durationSeconds={video.durationSeconds}
                autoPlay={false}
                showSnippetControls={false}
              />
            </div>

            {/* Real-time Current Time Display */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Current Time:</span>
              </div>
              <span className="font-mono text-base font-extrabold text-teal-300 tracking-wider">
                {formatDetailedTime(liveCurrentTime)}
              </span>
            </div>

            {/* TIMESTAMP CONTROLS FOR ACTIVE QUESTION */}
            {activeOriginalQuestion && activeMapping && (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-teal-500/30 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-teal-500/20 text-teal-300 text-xs font-extrabold">
                      Câu {activeOriginalQuestion.questionNumber.toString().padStart(2, '0')}
                    </span>
                    <span className="text-xs font-bold text-slate-300">
                      Mốc phát audio
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Bấm Set khi phát đến đoạn câu hỏi
                  </span>
                </div>

                {/* TIMING SECTIONS: QUESTION DISPLAY -> LISTEN AUDIO -> ANSWER DISPLAY */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* QUESTION DISPLAY START */}
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400">Hiển thị chữ (Display):</span>
                      <span className="font-mono text-xs font-bold text-amber-300">
                        {activeMapping.questionDisplayStartTime !== undefined ? formatDetailedTime(activeMapping.questionDisplayStartTime) : '--:--'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCaptureQuestionDisplayTime}
                      className="py-1.5 px-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Clock className="w-3 h-3" />
                      <span>Set Hiện Câu</span>
                    </button>
                  </div>

                  {/* ANSWER DISPLAY START */}
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400">Hiện đáp án (Answer):</span>
                      <span className="font-mono text-xs font-bold text-purple-300">
                        {activeMapping.answerDisplayStartTime !== undefined ? formatDetailedTime(activeMapping.answerDisplayStartTime) : '--:--'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCaptureAnswerDisplayTime}
                      className="py-1.5 px-2 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Clock className="w-3 h-3" />
                      <span>Set Hiện Đáp Án</span>
                    </button>
                  </div>
                </div>

                {/* START TIME ROW (LISTENING AUDIO START) */}
                <div className="p-3 rounded-xl bg-slate-950 border border-teal-500/30 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5" /> Listen Start (Audio bắt đầu):
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-extrabold text-teal-400">
                        {formatDetailedTime(activeMapping.listeningStartTime ?? activeMapping.startTime)}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        ({(activeMapping.listeningStartTime ?? activeMapping.startTime).toFixed(1)}s)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={handleCaptureStartTime}
                      className="col-span-2 py-2 rounded-lg bg-teal-500/25 hover:bg-teal-500/35 border border-teal-500/50 text-teal-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>SET LISTEN START</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleJumpStart}
                      className="col-span-1 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                      title="Nhảy đến điểm LISTEN START và phát"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Nghe START</span>
                    </button>

                    <div className="col-span-1 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleAdjustTime('startTime', -1)}
                        className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono font-bold text-center cursor-pointer"
                        title="Lùi 1 giây"
                      >
                        -1s
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustTime('startTime', 1)}
                        className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono font-bold text-center cursor-pointer"
                        title="Tiến 1 giây"
                      >
                        +1s
                      </button>
                    </div>
                  </div>
                </div>

                {/* END TIME ROW (LISTENING AUDIO END) */}
                <div className="p-3 rounded-xl bg-slate-950 border border-indigo-500/30 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5" /> Listen End (Audio kết thúc):
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-extrabold text-indigo-400">
                        {formatDetailedTime(activeMapping.listeningEndTime ?? activeMapping.endTime)}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        ({(activeMapping.listeningEndTime ?? activeMapping.endTime).toFixed(1)}s)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      type="button"
                      onClick={handleCaptureEndTime}
                      className="col-span-2 py-2 rounded-lg bg-indigo-500/25 hover:bg-indigo-500/35 border border-indigo-500/50 text-indigo-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>SET LISTEN END</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleJumpEnd}
                      className="col-span-1 py-2 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer"
                      title="Nhảy đến điểm END"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Jump END</span>
                    </button>

                    <div className="col-span-1 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleAdjustTime('endTime', -1)}
                        className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono font-bold text-center cursor-pointer"
                        title="Lùi 1 giây"
                      >
                        -1s
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustTime('endTime', 1)}
                        className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono font-bold text-center cursor-pointer"
                        title="Tiến 1 giây"
                      >
                        +1s
                      </button>
                    </div>
                  </div>
                </div>

                {/* TEST SNIPPET & SAVE QUESTION MAPPING */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleTestSnippet}
                    className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-teal-500/30 to-emerald-500/30 hover:from-teal-500/40 hover:to-emerald-500/40 border border-teal-500/50 text-teal-200 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <Volume2 className="w-4 h-4 text-teal-400" />
                    <span>Test nghe câu (Auto Stop)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveSingleMapping}
                    className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Lưu mapping câu này</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: ORIGINAL EXAM DATA (LOADED AUTOMATICALLY - NO RETYPING) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* QUESTION SELECTOR TABS / CHIPS */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1.5 border-b border-slate-800 shrink-0">
              {currentOriginalExam.questions.map((q, idx) => {
                const isSelected = idx === selectedQuestionIndex;
                const m = mappings[q.questionId];
                const isMapped = m && m.timestampVerified;

                return (
                  <button
                    key={q.questionId}
                    type="button"
                    onClick={() => setSelectedQuestionIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-500 text-white shadow-md shadow-teal-500/30 ring-2 ring-teal-400/50'
                        : isMapped
                        ? 'bg-slate-800 text-teal-300 hover:bg-slate-700 border border-teal-500/30'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    <span>Câu {(idx + 1).toString().padStart(2, '0')}</span>
                    {isMapped ? (
                      <span className="text-[10px] opacity-80">✓</span>
                    ) : (
                      <span className="text-[10px] text-amber-400">⚠</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ACTIVE ORIGINAL QUESTION DETAILS (AUTO-LOADED) */}
            {activeOriginalQuestion ? (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col gap-4 flex-1">
                
                {/* Question Info Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-lg bg-teal-500/20 border border-teal-500/40 text-teal-300 font-extrabold text-xs">
                      Câu {activeOriginalQuestion.questionNumber.toString().padStart(2, '0')}
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-xs bg-slate-800 text-slate-300 font-mono">
                      ID: {activeOriginalQuestion.questionId}
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                      {activeOriginalQuestion.questionType}
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-[11px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1 font-bold">
                      <ShieldCheck className="w-3 h-3" /> Đề gốc xác thực (sourceVerified: true)
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-[11px] bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-mono">
                      Method: {activeOriginalQuestion.extractionMethod || 'MANUAL_VERIFIED'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400">
                    Bộ đề: <span className="text-teal-300 font-bold">{currentOriginalExam.examId}</span>
                  </div>
                </div>

                {/* Question Text (Japanese Source Text) */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    questionTextJa (Tiếng Nhật gốc từ đề thi/video):
                  </span>
                  <p className="text-sm font-semibold text-white leading-relaxed font-sans">
                    {activeOriginalQuestion.questionTextJa || activeOriginalQuestion.questionText}
                  </p>
                  {activeOriginalQuestion.questionTextVi && (
                    <div className="mt-2 pt-2 border-t border-slate-800/60 text-xs text-slate-400">
                      <span className="text-slate-500 font-medium">Bản dịch tham khảo (questionTextVi):</span> {activeOriginalQuestion.questionTextVi}
                    </div>
                  )}
                </div>

                {/* 4 Options from Original Exam (optionsJa) */}
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    optionsJa (4 Lựa chọn gốc tiếng Nhật):
                  </span>
                  <div className="space-y-2">
                    {(activeOriginalQuestion.optionsJa && activeOriginalQuestion.optionsJa.length > 0 
                      ? activeOriginalQuestion.optionsJa 
                      : activeOriginalQuestion.options).map((opt, optIdx) => {
                      const optNum = optIdx + 1;
                      const isCorrect = activeOriginalQuestion.correctAnswer === optNum;

                      return (
                        <div 
                          key={optIdx} 
                          className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                            isCorrect 
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200' 
                              : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                              isCorrect 
                                ? 'bg-emerald-500 text-white' 
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {optNum}
                            </span>
                            <span className="text-xs font-medium">{opt}</span>
                          </div>

                          {isCorrect ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shrink-0">
                              <Check className="w-3 h-3" /> ĐÁP ÁN ĐÚNG XÁC THỰC
                            </span>
                          ) : (
                            activeOriginalQuestion.correctAnswer === null && (
                              <span className="text-[10px] text-amber-400">Chưa xác minh</span>
                            )
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Transcript (Script) */}
                {activeOriginalQuestion.transcript && (
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-teal-400" />
                      Kịch bản hội thoại gốc (Transcript tiếng Nhật):
                    </span>
                    <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans max-h-36 overflow-y-auto">
                      {activeOriginalQuestion.transcript}
                    </p>
                  </div>
                )}

                {/* Explanation */}
                {activeOriginalQuestion.explanation && (
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Giải thích đáp án & từ vựng (Tiếng Việt):
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {activeOriginalQuestion.explanation}
                    </p>
                  </div>
                )}

                {/* Helpful note for Admin */}
                <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs flex items-start gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 text-teal-400 mt-0.5" />
                  <span>
                    Dữ liệu câu hỏi, 4 đáp án và lời thoại được nạp tự động 100% từ đề thi JLPT gốc. Admin chỉ cần phát video bên trái, bấm <strong>Đặt START</strong> và <strong>Đặt END</strong>, sau đó nhấn <strong>Lưu bộ đề & Timestamp</strong>.
                  </span>
                </div>

              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-500 text-xs">
                Không tìm thấy dữ liệu câu hỏi gốc.
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
