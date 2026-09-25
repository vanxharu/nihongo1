/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Bookmark, Check, X, FolderPlus } from 'lucide-react';
import { 
  getStoredNotebooks, 
  addWordToNotebook, 
  createNewNotebook, 
  NotebookFolder 
} from '../utils/notebookStorage';
import { JLPTLevel } from '../types';

export interface SaveWordPayload {
  kanji: string;
  furigana?: string;
  romaji?: string;
  meaning: string;
  hanViet?: string;
  example?: string;
  exampleMeaning?: string;
  level?: JLPTLevel;
  note?: string;
  source?: 'reading' | 'dictionary' | 'video' | 'lesson' | 'manual' | 'exam';
}

export default function SaveToNotebookModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [payload, setPayload] = useState<SaveWordPayload | null>(null);
  const [notebooks, setNotebooks] = useState<NotebookFolder[]>([]);
  const [selectedNotebookId, setSelectedNotebookId] = useState<string>('');
  const [noteText, setNoteText] = useState('');
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newNbName, setNewNbName] = useState('');
  const [newNbColor, setNewNbColor] = useState('#3b82f6');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleSaveEvent = (e: CustomEvent<SaveWordPayload>) => {
      if (e.detail) {
        setPayload(e.detail);
        setNoteText(e.detail.note || '');
        const nbs = getStoredNotebooks();
        setNotebooks(nbs);
        setSelectedNotebookId(nbs[0]?.id || 'default_fav');
        setIsOpen(true);
      }
    };

    window.addEventListener('save_to_notebook' as any, handleSaveEvent);
    return () => {
      window.removeEventListener('save_to_notebook' as any, handleSaveEvent);
    };
  }, []);

  const handleSave = () => {
    if (!payload) return;
    const res = addWordToNotebook({
      ...payload,
      notebookId: selectedNotebookId,
      note: noteText.trim()
    });

    setToastMessage(res.message);
    setTimeout(() => {
      setToastMessage(null);
      setIsOpen(false);
      setPayload(null);
    }, 1200);
  };

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNbName.trim()) return;
    const newNb = createNewNotebook(newNbName, newNbColor);
    const updated = getStoredNotebooks();
    setNotebooks(updated);
    setSelectedNotebookId(newNb.id);
    setNewNbName('');
    setShowCreateNew(false);
  };

  if (!isOpen || !payload) return null;

  return (
    <div 
      id="save-to-notebook-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={() => setIsOpen(false)}
    >
      <div 
        id="save-to-notebook-modal"
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Lưu vào Sổ tay
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ghi chép từ vựng để ôn tập qua Flashcard & Trắc nghiệm
              </p>
            </div>
          </div>
          <button 
            id="close-save-notebook-btn"
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Word Info Preview */}
        <div className="my-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                {payload.kanji}
              </span>
              {payload.furigana && payload.furigana !== payload.kanji && (
                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                  【{payload.furigana}】
                </span>
              )}
            </div>
            {payload.level && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                {payload.level}
              </span>
            )}
          </div>
          {payload.hanViet && (
            <div className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Hán Việt: {payload.hanViet}
            </div>
          )}
          <div className="mt-1.5 text-sm text-slate-700 dark:text-slate-300 font-medium">
            {payload.meaning}
          </div>
        </div>

        {/* Choose Notebook Folder */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            <span>Chọn Sổ tay lưu:</span>
            <button
              id="toggle-create-notebook-btn"
              type="button"
              onClick={() => setShowCreateNew(!showCreateNew)}
              className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-semibold lowercase"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              {showCreateNew ? 'hủy tạo mới' : '+ tạo sổ mới'}
            </button>
          </div>

          {showCreateNew ? (
            <form onSubmit={handleCreateFolder} className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800/60 space-y-2">
              <input
                id="new-notebook-name-input"
                type="text"
                placeholder="Tên sổ tay mới (vd: Từ vựng N3)..."
                value={newNbName}
                onChange={e => setNewNbName(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5">
                  {['#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#f59e0b'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewNbColor(color)}
                      className={`w-6 h-6 rounded-full transition-transform ${newNbColor === color ? 'scale-125 ring-2 ring-slate-800 dark:ring-white' : 'opacity-70 hover:opacity-100'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <button
                  id="submit-create-notebook-btn"
                  type="submit"
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm"
                >
                  Tạo sổ
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
              {notebooks.map(nb => {
                const isSelected = selectedNotebookId === nb.id;
                return (
                  <button
                    key={nb.id}
                    id={`select-notebook-${nb.id}`}
                    type="button"
                    onClick={() => setSelectedNotebookId(nb.id)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-500'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span 
                        className="w-3 h-3 rounded-full shrink-0" 
                        style={{ backgroundColor: nb.color || '#3b82f6' }}
                      />
                      <span className="font-semibold text-sm truncate">
                        {nb.name}
                      </span>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Personal Note */}
          <div className="space-y-1 pt-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Ghi chú thêm (tùy chọn):
            </label>
            <input
              id="save-word-note-input"
              type="text"
              placeholder="Ví dụ: Hay dùng trong bài đọc, chú ý trợ từ..."
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            id="cancel-save-notebook-btn"
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Hủy
          </button>
          <button
            id="confirm-save-notebook-btn"
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-md shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Bookmark className="w-4 h-4" />
            Lưu vào Sổ tay
          </button>
        </div>

        {/* Success Toast */}
        {toastMessage && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-emerald-600 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
              <Check className="w-4 h-4" />
              {toastMessage}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
