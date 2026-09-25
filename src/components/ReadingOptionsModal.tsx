/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  Award,
  Eye,
  Type,
  Radio,
  Compass,
  Volume2,
  VolumeX,
  Palette,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReadingOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Furigana
  showFurigana: boolean;
  onToggleFurigana: () => void;
  // Vietnamese
  showVietnamese: boolean;
  onToggleVietnamese: () => void;
  // Font size
  fontSize: 'xs' | 'sm' | 'md' | 'base' | 'lg' | 'xl' | string;
  onChangeFontSize: (size: any) => void;
  // POS Highlight
  showPosHighlight: boolean;
  onTogglePosHighlight: () => void;
  // JLPT Underline
  showJlptUnderline: boolean;
  onToggleJlptUnderline: () => void;
  // Audio Karaoke
  hasAudio: boolean;
  readingFollowMode: 'karaoke' | 'classic';
  onToggleFollowMode: () => void;
  // Auto scroll
  autoScroll?: boolean;
  autoScrollAudioText?: boolean;
  onToggleAutoScroll: () => void;
  // TTS AI
  isPlayingAudio: boolean;
  onToggleAudioTts?: () => void;
  onToggleAudioTTS?: () => void;
  // Copy
  onCopyPassage: () => void;
  copyFeedback: boolean;
  // Source URL
  sourceUrl?: string;
}

export const ReadingOptionsModal: React.FC<ReadingOptionsModalProps> = ({
  isOpen,
  onClose,
  showFurigana,
  onToggleFurigana,
  showVietnamese,
  onToggleVietnamese,
  fontSize,
  onChangeFontSize,
  showPosHighlight,
  onTogglePosHighlight,
  showJlptUnderline,
  onToggleJlptUnderline,
  hasAudio,
  readingFollowMode,
  onToggleFollowMode,
  autoScroll = false,
  autoScrollAudioText,
  onToggleAutoScroll,
  isPlayingAudio,
  onToggleAudioTts,
  onToggleAudioTTS,
  onCopyPassage,
  copyFeedback,
  sourceUrl
}) => {
  const isAutoScrollActive = autoScrollAudioText !== undefined ? autoScrollAudioText : autoScroll;
  const handleToggleTts = onToggleAudioTTS || onToggleAudioTts || (() => {});
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm">
        {/* Backdrop click to close */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Tùy chọn đọc hiểu</h3>
                <p className="text-xs text-slate-400">Cá nhân hóa giao diện và trải nghiệm đọc</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Options */}
          <div className="overflow-y-auto p-5 space-y-5 text-sm">
            {/* Section 1: Hiển thị chữ */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                Hiển thị & Văn bản
              </span>

              {/* Furigana */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 transition">
                <div className="space-y-0.5 pr-2">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-cyan-400" />
                    <span className="font-semibold text-slate-100">Phiên âm Furigana</span>
                  </div>
                  <p className="text-xs text-slate-400">Hiện cách đọc Hiragana trên đầu chữ Hán</p>
                </div>
                <button
                  type="button"
                  onClick={onToggleFurigana}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    showFurigana ? 'bg-cyan-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      showFurigana ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Bản dịch tiếng Việt */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 transition">
                <div className="space-y-0.5 pr-2">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold text-slate-100">Bản dịch tiếng Việt</span>
                  </div>
                  <p className="text-xs text-slate-400">Hiện nghĩa tiếng Việt chi tiết dưới các câu</p>
                </div>
                <button
                  type="button"
                  onClick={onToggleVietnamese}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    showVietnamese ? 'bg-amber-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      showVietnamese ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Cỡ chữ */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Type className="w-4 h-4 text-indigo-400" />
                    <span className="font-semibold text-slate-100">Cỡ chữ bài đọc</span>
                  </div>
                  <p className="text-xs text-slate-400">Điều chỉnh độ lớn của chữ</p>
                </div>
                <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
                  <button
                    type="button"
                    onClick={() => onChangeFontSize('sm')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      fontSize === 'sm' || fontSize === 'xs'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Nhỏ
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeFontSize('base')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      fontSize === 'base' || fontSize === 'md'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Vừa
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeFontSize('lg')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      fontSize === 'lg' || fontSize === 'xl'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Lớn
                  </button>
                </div>
              </div>
            </div>

            {/* Section 2: Màu sắc & Phân tích từ */}
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                Tô màu & Phân tích
              </span>

              {/* Tô màu Từ loại (Danh từ & Động từ) */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 transition">
                <div className="space-y-0.5 pr-2">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-sky-400" />
                    <span className="font-semibold text-slate-100">Tô màu Từ loại</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    <span className="text-sky-300 font-bold">Danh từ (Xanh lam)</span> &{' '}
                    <span className="text-orange-400 font-bold">Động từ (Cam)</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onTogglePosHighlight}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    showPosHighlight ? 'bg-sky-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      showPosHighlight ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Gạch chân JLPT */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 transition">
                <div className="space-y-0.5 pr-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-slate-100">Gạch chân cấp độ JLPT</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Phân biệt các cấp độ từ vựng N5, N4, N3, N2, N1
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onToggleJlptUnderline}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    showJlptUnderline ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      showJlptUnderline ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Section 3: Âm thanh & Cuộn */}
            {hasAudio && (
              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                  Âm thanh & Đồng bộ
                </span>

                {/* Karaoke sync */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 transition">
                  <div className="space-y-0.5 pr-2">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-purple-400" />
                      <span className="font-semibold text-slate-100">Chữ chạy theo audio (Karaoke)</span>
                    </div>
                    <p className="text-xs text-slate-400">Sáng từng từ đồng bộ theo giọng phát thanh viên</p>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleFollowMode}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      readingFollowMode === 'karaoke' ? 'bg-purple-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        readingFollowMode === 'karaoke' ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Cuộn theo chữ */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 transition">
                  <div className="space-y-0.5 pr-2">
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-emerald-400" />
                      <span className="font-semibold text-slate-100">Tự động cuộn trang</span>
                    </div>
                    <p className="text-xs text-slate-400">Tự động cuộn nhìn rõ câu đang phát âm thanh</p>
                  </div>
                  <button
                    type="button"
                    onClick={onToggleAutoScroll}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isAutoScrollActive ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isAutoScrollActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Section 4: Thao tác & Tiện ích */}
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                Tiện ích
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Sao chép bài đọc */}
                <button
                  type="button"
                  onClick={onCopyPassage}
                  className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-slate-800 hover:bg-slate-700/90 border border-slate-700 text-slate-200 transition cursor-pointer font-semibold text-xs"
                >
                  {copyFeedback ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300">Đã sao chép!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-400" />
                      <span>Sao chép văn bản</span>
                    </>
                  )}
                </button>

                {/* Đọc AI (TTS) */}
                <button
                  type="button"
                  onClick={handleToggleTts}
                  className={`flex items-center justify-center gap-2 p-3 rounded-2xl border font-semibold text-xs transition cursor-pointer ${
                    isPlayingAudio
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                      : 'bg-slate-800 hover:bg-slate-700/90 text-slate-200 border-slate-700'
                  }`}
                >
                  {isPlayingAudio ? (
                    <>
                      <VolumeX className="w-4 h-4 text-rose-400" />
                      <span>Dừng đọc AI</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                      <span>Giọng đọc AI (TTS)</span>
                    </>
                  )}
                </button>
              </div>

              {sourceUrl && (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 border border-cyan-500/20 transition text-xs font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Mở trang báo gốc</span>
                  </span>
                  <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
                    {sourceUrl}
                  </span>
                </a>
              )}
            </div>
          </div>

          {/* Footer Done button */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/95 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-indigo-600/30"
            >
              Hoàn tất
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReadingOptionsModal;
