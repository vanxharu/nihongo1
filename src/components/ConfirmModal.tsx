import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
  isDanger?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title = 'Xác nhận hành động',
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  onConfirm,
  onClose,
  isDanger = true
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        id="custom-confirm-overlay" 
        className="fixed inset-0 bg-slate-950/45 backdrop-blur-xs z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-sm bg-white border border-slate-100 rounded-3xl shadow-2xl p-6 relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top warning line decoration */}
          <div className={`absolute top-0 left-0 right-0 h-1.5 ${isDanger ? 'bg-rose-500' : 'bg-indigo-500'}`} />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon and Title */}
          <div className="flex items-start gap-3.5 mb-4">
            <div className={`p-2.5 rounded-2xl shrink-0 ${isDanger ? 'bg-rose-50 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                {title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                {message}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 mt-5">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all border border-slate-200/80 cursor-pointer text-center"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 py-2.5 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer text-center ${
                isDanger 
                  ? 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 shadow-rose-600/10' 
                  : 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-indigo-600/10'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
