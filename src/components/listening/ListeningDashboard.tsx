import React from 'react';
import { 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  BarChart3, 
  Clock, 
  Target, 
  RotateCcw, 
  ArrowRight,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { ListeningDashboardStats, ListeningExamAttempt } from '../../types/listeningExamTypes';

interface ListeningDashboardProps {
  stats: ListeningDashboardStats;
  attempts: ListeningExamAttempt[];
  onSelectAttemptForReview: (attempt: ListeningExamAttempt) => void;
  onSelectVideoToPractice?: (videoId: string) => void;
}

export const ListeningDashboard: React.FC<ListeningDashboardProps> = ({
  stats,
  attempts,
  onSelectAttemptForReview,
  onSelectVideoToPractice
}) => {
  if (stats.totalExamsTaken === 0) {
    return (
      <div className="p-8 sm:p-12 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
          <BarChart3 className="w-8 h-8" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-lg font-bold text-white">Chưa có dữ liệu thi nghe JLPT</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Hãy chọn một video bài nghe bất kỳ để bắt đầu làm bài luyện tập hoặc thi thử JLPT. 
            Hệ thống sẽ tự động tổng hợp tiến độ và phân tích điểm ước tính tại đây.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Exams Done */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Đề thi đã làm</span>
            <BookOpen className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {stats.totalExamsTaken}
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Tổng {stats.totalQuestionsAnswered} câu hỏi
          </span>
        </div>

        {/* Card 2: Overall Accuracy */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Tỉ lệ chính xác</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className={`text-2xl sm:text-3xl font-black ${
            stats.overallAccuracy >= 70 ? 'text-emerald-400' : 'text-amber-400'
          }`}>
            {stats.overallAccuracy}%
          </div>
          <span className="text-[11px] text-emerald-400 font-medium">
            {stats.totalQuestionsCorrect}/{stats.totalQuestionsAnswered} câu đúng
          </span>
        </div>

        {/* Card 3: Average Estimated Score */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Điểm TB ước tính</span>
            <Award className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-teal-400">
            {stats.averageEstimatedScore}
            <span className="text-sm font-bold text-slate-500 ml-1">/50</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Thang điểm luyện tập JLPT
          </span>
        </div>

        {/* Card 4: Best Score */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Điểm cao nhất</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">
            {stats.bestEstimatedScore}
            <span className="text-sm font-bold text-slate-500 ml-1">/50</span>
          </div>
          <span className="text-[11px] text-amber-400/80 font-medium">
            Thành tích tốt nhất
          </span>
        </div>
      </div>

      {/* Grid: Question Type Breakdown + Score Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Box: Breakdown by Question Type */}
        <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              Độ chính xác theo dạng câu hỏi
            </h4>
            <span className="text-[11px] text-slate-400">Dạng bài JLPT</span>
          </div>

          <div className="space-y-3 pt-1">
            {Object.keys(stats.typeStats).length === 0 ? (
              <p className="text-xs text-slate-400">Chưa có phân loại câu hỏi.</p>
            ) : (
              Object.entries(stats.typeStats).map(([typeName, tStat]) => (
                <div key={typeName} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">{typeName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[11px]">
                        {tStat.correct}/{tStat.total} câu
                      </span>
                      <span className={`font-black ${
                        tStat.accuracy >= 70 ? 'text-emerald-400' : tStat.accuracy >= 50 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {tStat.accuracy}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/80">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        tStat.accuracy >= 70 ? 'bg-emerald-500' : tStat.accuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${tStat.accuracy}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Box: Score Progression List */}
        <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Tiến trình cải thiện điểm số
            </h4>
            <span className="text-[11px] text-slate-400">Ước tính /50</span>
          </div>

          <div className="space-y-2.5 pt-1 max-h-56 overflow-y-auto pr-1">
            {stats.progression.map((prog, index) => {
              const prev = index > 0 ? stats.progression[index - 1] : null;
              const diff = prev ? prog.estimatedScore - prev.estimatedScore : null;

              return (
                <div
                  key={prog.attemptId}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-white block">
                        {prog.shortTitle}: {prog.examTitle}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(prog.date).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {diff !== null && (
                      <span className={`text-[11px] font-bold ${
                        diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-rose-400' : 'text-slate-400'
                      }`}>
                        {diff > 0 ? `+${diff}` : `${diff}`}
                      </span>
                    )}
                    <span className="px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 font-extrabold text-xs">
                      {prog.estimatedScore}/50
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 space-y-4">
        <h4 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          Lịch sử các lần làm bài
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Bài thi</th>
                <th className="py-3 px-4">Chế độ</th>
                <th className="py-3 px-4">Kết quả</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Điểm ước tính</th>
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {attempts.map((att) => (
                <tr key={att.attemptId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-bold text-white block truncate max-w-xs">
                      {att.examTitle}
                    </span>
                    <span className="text-[10px] text-indigo-400 font-semibold">
                      {att.level}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      att.mode === 'exam'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {att.mode === 'exam' ? 'Thi thử' : 'Luyện tập'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold">
                    <span className="text-emerald-400">{att.correct}</span>
                    <span className="text-slate-500">/{att.total}</span>
                  </td>
                  <td className="py-3 px-4 font-bold">
                    <span className={att.accuracy >= 70 ? 'text-emerald-400' : 'text-amber-400'}>
                      {att.accuracy}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-extrabold text-white bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                      {att.estimatedScore}/50
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {new Date(att.completedAt).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectAttemptForReview(att)}
                      className="px-2.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white font-bold text-[11px] transition-all cursor-pointer"
                    >
                      Xem câu sai
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
