import React, { useState } from 'react';
import { ExamHistoryRecord } from '../types';
import { getExamHistory, deleteExamAttempt, groupHistoryByDate } from '../utils/examHistoryStorage';
import { Calendar, CheckCircle, Clock, Eye, FileDown, History, RefreshCw, Trash2, X, AlertCircle } from 'lucide-react';

export interface ExamHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewAttempt?: (record: ExamHistoryRecord) => void;
  onRetakeExam?: (examId: string, level: string) => void;
  onExportPDF?: (record: ExamHistoryRecord) => void;
  onSelectAttempt?: (record: ExamHistoryRecord) => void;
  onPrintAttempt?: (record: ExamHistoryRecord) => void;
}

export const ExamHistoryModal: React.FC<ExamHistoryModalProps> = ({
  isOpen,
  onClose,
  onReviewAttempt,
  onRetakeExam,
  onExportPDF,
  onSelectAttempt,
  onPrintAttempt
}) => {
  const [historyList, setHistoryList] = useState<ExamHistoryRecord[]>([]);

  const handleReviewAction = onReviewAttempt || onSelectAttempt || onExportPDF || onPrintAttempt;
  const handlePrintAction = onExportPDF || onPrintAttempt || onReviewAttempt || onSelectAttempt;

  React.useEffect(() => {
    if (isOpen) {
      setHistoryList(getExamHistory());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa bản lưu bài thi này?')) {
      deleteExamAttempt(id);
      setHistoryList(getExamHistory());
    }
  };

  const grouped = groupHistoryByDate(historyList);
  const groupKeys = Object.keys(grouped);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-[#fbf9f4] border-2 border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-amber-50 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg sm:text-xl tracking-tight">Lịch Sử Làm Bài & Các Phiên Bản Lưu</h2>
              <p className="text-xs text-slate-400">Tự động lưu theo ngày • Mở xem lại bất kỳ lúc nào • Tải PDF</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {historyList.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-500">
                <History className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">Chưa có lịch sử làm bài nào</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Khi bạn hoàn thành bất kỳ đề thi JLPT nào, hệ thống sẽ tự động lưu lại phiên bản đầy đủ với toàn bộ câu trả lời, lời giải và điểm số theo từng ngày.
              </p>
            </div>
          ) : (
            groupKeys.map((groupKey) => {
              const records = grouped[groupKey];
              return (
                <div key={groupKey} className="space-y-3">
                  {/* Date Group Header */}
                  <div className="flex items-center gap-2 text-slate-800 font-bold text-sm sm:text-base border-b-2 border-slate-300 pb-1.5">
                    <Calendar className="w-4 h-4 text-amber-700" />
                    <span>{groupKey}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 ml-auto">
                      {records.length} phiên bản
                    </span>
                  </div>

                  {/* List of Attempt Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {records.map((record) => {
                      const minutes = Math.floor(record.timeSpentSeconds / 60);
                      const seconds = record.timeSpentSeconds % 60;

                      return (
                        <div
                          key={record.id}
                          className="bg-white border-2 border-slate-300/90 hover:border-slate-800 rounded-xl p-4 transition-all shadow-xs hover:shadow-md flex flex-col justify-between group"
                        >
                          <div>
                            {/* Card Top */}
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <span className="font-bold text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                {record.level}
                              </span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                record.passed
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}>
                                {record.passed ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                {record.passed ? 'ĐỖ (合格)' : 'CHƯA ĐỖ'}
                              </span>
                            </div>

                            {/* Title */}
                            <h4 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 mb-2 font-jlpt-exam">
                              {record.examTitle}
                            </h4>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-center mb-3">
                              <div>
                                <div className="text-[11px] text-slate-500">Điểm số</div>
                                <div className="text-base font-bold text-slate-900">
                                  {record.score}/{record.totalQuestions}
                                </div>
                              </div>
                              <div>
                                <div className="text-[11px] text-slate-500">Tỷ lệ đúng</div>
                                <div className={`text-base font-bold ${record.passed ? 'text-emerald-700' : 'text-rose-700'}`}>
                                  {record.percentage}%
                                </div>
                              </div>
                              <div>
                                <div className="text-[11px] text-slate-500">Thời gian</div>
                                <div className="text-base font-bold text-slate-800 flex items-center justify-center gap-0.5">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  <span>{minutes}p{seconds}s</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                              <span>🕒 Lưu lúc:</span>
                              <span className="font-medium text-slate-700">{record.formattedDate}</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => {
                                if (handleReviewAction) {
                                  handleReviewAction(record);
                                }
                                onClose();
                              }}
                              className="flex-1 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                            >
                              <Eye className="w-3.5 h-3.5 text-amber-400" />
                              <span>Mở xem lại / In PDF</span>
                            </button>

                            {onRetakeExam && (
                              <button
                                type="button"
                                onClick={() => {
                                  onRetakeExam(record.examId, record.level);
                                  onClose();
                                }}
                                title="Làm lại đề này từ đầu"
                                className="py-2 px-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Làm lại</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                if (handlePrintAction) {
                                  handlePrintAction(record);
                                }
                              }}
                              title="Xuất file PDF / In bài thi"
                              className="py-2 px-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <FileDown className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleDelete(record.id, e)}
                              title="Xóa bản lưu này"
                              className="py-2 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-300 flex items-center justify-between text-xs text-slate-600">
          <span>Tổng số phiên bản đã lưu: <strong>{historyList.length}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-white font-bold hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
