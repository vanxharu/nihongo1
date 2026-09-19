import React from 'react';
import { ExamHistoryRecord, DailyExam } from '../types';
import { HandwrittenExamQuestionAnnotator } from './HandwrittenExamQuestionAnnotator';
import { CheckCircle2, FileText, Printer, XCircle, X } from 'lucide-react';

interface PrintableExamBookletProps {
  record: ExamHistoryRecord | {
    examSnapshot: DailyExam;
    userAnswers: Record<string, number>;
    score: number;
    totalQuestions: number;
    percentage: number;
    passed: boolean;
    formattedDate: string;
  };
  onClose?: () => void;
}

export const PrintableExamBooklet: React.FC<PrintableExamBookletProps> = ({
  record,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  const exam = record.examSnapshot;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex flex-col p-2 sm:p-6 overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Top Toolbar (Hidden when printing) */}
      <div className="max-w-4xl w-full mx-auto mb-4 bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between shadow-xl print:hidden">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="font-bold text-base sm:text-lg">Bản In & Xuất PDF Đề Thi JLPT</h3>
            <p className="text-xs text-slate-400">Chọn "Save as PDF" trong hộp thoại in để lưu file PDF về máy</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>In / Lưu PDF ngay</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div className="max-w-4xl w-full mx-auto bg-[#fbf9f4] print:bg-white border-2 border-slate-400 print:border-none rounded-2xl print:rounded-none p-6 sm:p-10 shadow-2xl print:shadow-none text-slate-900 print:w-full">
        {/* Exam Title Header */}
        <div className="border-b-2 border-slate-900 pb-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold tracking-widest text-slate-600 uppercase">
              BẢN CHẤM ĐIỂM & SỬA ĐỀ THI CHÍNH THỨC JLPT
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Thời gian lưu: {record.formattedDate}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-jlpt-exam text-slate-950 mb-3">
            {exam.title}
          </h1>

          {/* Score & Evaluation Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-amber-50/80 border border-amber-300 print:bg-slate-50">
            <div>
              <div className="text-xs text-slate-600">Trình độ</div>
              <div className="text-lg font-bold text-amber-950">{exam.level}</div>
            </div>
            <div>
              <div className="text-xs text-slate-600">Điểm số</div>
              <div className="text-lg font-bold text-slate-950">{record.score} / {record.totalQuestions}</div>
            </div>
            <div>
              <div className="text-xs text-slate-600">Tỷ lệ chính xác</div>
              <div className={`text-lg font-bold ${record.passed ? 'text-emerald-700' : 'text-rose-700'}`}>
                {record.percentage}%
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-600">Kết quả</div>
              <div className={`text-lg font-bold flex items-center gap-1 ${record.passed ? 'text-emerald-700' : 'text-rose-700'}`}>
                {record.passed ? <CheckCircle2 className="w-5 h-5 text-emerald-600 inline" /> : <XCircle className="w-5 h-5 text-rose-600 inline" />}
                {record.passed ? 'ĐỖ (合格)' : 'CHƯA ĐỖ'}
              </div>
            </div>
          </div>
        </div>

        {/* Color Legend for Review */}
        <div className="mb-6 p-3 rounded-lg bg-slate-100 border border-slate-300 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="font-bold text-slate-700">Quy ước màu chấm bài:</div>
          <div className="flex items-center gap-1 text-blue-700 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            <span>Xanh dương: Phiên âm Furigana & Nghĩa Tiếng Việt</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-700 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
            <span>Xanh lá: Câu đúng (⭕) & Giải thích</span>
          </div>
          <div className="flex items-center gap-1 text-rose-700 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
            <span>Đỏ: Câu sai (❌) & Phân tích lỗi</span>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {exam.questions.map((q, idx) => (
            <div key={q.id} className="break-inside-avoid">
              <HandwrittenExamQuestionAnnotator
                question={q}
                questionNumber={idx + 1}
                userAnswer={record.userAnswers[q.id]}
                isSubmitted={true}
                disabled={true}
              />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-10 pt-4 border-t-2 border-slate-300 text-center text-xs text-slate-500">
          NihonGo! - Nền tảng học Tiếng Nhật & Luyện thi JLPT Chuẩn Bản Xứ • Trang tài liệu lưu trữ cá nhân
        </div>
      </div>
    </div>
  );
};
