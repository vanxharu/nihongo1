/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Bookmark, 
  Plus, 
  Trash2, 
  Search, 
  Filter, 
  Volume2, 
  CheckCircle2, 
  Circle, 
  RotateCw, 
  Layers, 
  BrainCircuit, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Shuffle, 
  FolderPlus, 
  MoreVertical,
  Edit2,
  ExternalLink,
  Award,
  Check,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  getStoredNotebooks, 
  saveStoredNotebooks, 
  getStoredWords, 
  saveStoredWords, 
  addWordToNotebook, 
  toggleWordMastered, 
  deleteWordFromNotebook, 
  createNewNotebook, 
  deleteNotebook, 
  NotebookFolder 
} from '../utils/notebookStorage';
import { NotebookWord, JLPTLevel } from '../types';
import { speakJapanese } from '../utils/audio';
import ShibaMascot, { MascotEmptyState } from './mascot/ShibaMascot';

interface NotebookManagerProps {
  onNavigateToTab?: (tab: string, extra?: any) => void;
}

export default function NotebookManager({ onNavigateToTab }: NotebookManagerProps) {
  const [notebooks, setNotebooks] = useState<NotebookFolder[]>([]);
  const [words, setWords] = useState<NotebookWord[]>([]);
  const [selectedNotebookId, setSelectedNotebookId] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'list' | 'flashcard' | 'quiz' | 'presets'>('list');
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'learning' | 'mastered'>('all');

  // New Folder Modal State
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#3b82f6');
  const [newFolderDesc, setNewFolderDesc] = useState('');

  // Add Word Modal State
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);
  const [newWordKanji, setNewWordKanji] = useState('');
  const [newWordFurigana, setNewWordFurigana] = useState('');
  const [newWordMeaning, setNewWordMeaning] = useState('');
  const [newWordHanViet, setNewWordHanViet] = useState('');
  const [newWordExample, setNewWordExample] = useState('');
  const [newWordExampleMeaning, setNewWordExampleMeaning] = useState('');
  const [newWordLevel, setNewWordLevel] = useState<JLPTLevel>('N5');
  const [newWordNote, setNewWordNote] = useState('');

  // Flashcard Mode State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showFurigana, setShowFurigana] = useState(true);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);

  // Quiz Mode State
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  // Load initial data
  const loadData = () => {
    const nbs = getStoredNotebooks();
    const ws = getStoredWords();
    setNotebooks(nbs);
    setWords(ws);
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('notebooks_updated', handleUpdate);
    window.addEventListener('saved_words_updated', handleUpdate);

    return () => {
      window.removeEventListener('notebooks_updated', handleUpdate);
      window.removeEventListener('saved_words_updated', handleUpdate);
    };
  }, []);

  // Filtered words
  const filteredWords = useMemo(() => {
    return words.filter(w => {
      // By folder
      if (selectedNotebookId !== 'all' && w.notebookId !== selectedNotebookId) {
        return false;
      }
      // By search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchKanji = w.kanji.toLowerCase().includes(q);
        const matchFurigana = w.furigana?.toLowerCase().includes(q);
        const matchRomaji = w.romaji?.toLowerCase().includes(q);
        const matchMeaning = w.meaning.toLowerCase().includes(q);
        const matchHanViet = w.hanViet?.toLowerCase().includes(q);
        if (!matchKanji && !matchFurigana && !matchRomaji && !matchMeaning && !matchHanViet) {
          return false;
        }
      }
      // By level
      if (filterLevel !== 'all' && w.level !== filterLevel) {
        return false;
      }
      // By status
      if (filterStatus === 'mastered' && !w.mastered) return false;
      if (filterStatus === 'learning' && w.mastered) return false;

      return true;
    });
  }, [words, selectedNotebookId, searchQuery, filterLevel, filterStatus]);

  // Notebook stats
  const activeNotebook = notebooks.find(n => n.id === selectedNotebookId);
  const totalInActive = selectedNotebookId === 'all' 
    ? words.length 
    : words.filter(w => w.notebookId === selectedNotebookId).length;
  const masteredInActive = selectedNotebookId === 'all'
    ? words.filter(w => w.mastered).length
    : words.filter(w => w.notebookId === selectedNotebookId && w.mastered).length;
  const masteryPercentage = totalInActive > 0 ? Math.round((masteredInActive / totalInActive) * 100) : 0;

  // Flashcard controls
  const currentCard = filteredWords[currentCardIndex];

  const handleNextCard = () => {
    if (currentCardIndex < filteredWords.length - 1) {
      setIsFlipped(false);
      setCurrentCardIndex(prev => prev + 1);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setIsFlipped(false);
      setCurrentCardIndex(prev => prev - 1);
    }
  };

  const handleShuffleCards = () => {
    setIsFlipped(false);
    setCurrentCardIndex(0);
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setWords(shuffled);
  };

  // Play audio on card change
  useEffect(() => {
    if (activeTab === 'flashcard' && currentCard && autoPlayAudio && !isFlipped) {
      speakJapanese(currentCard.kanji);
    }
  }, [currentCardIndex, activeTab]);

  // Quiz generator
  const quizQuestions = useMemo(() => {
    if (filteredWords.length < 2) return [];
    return filteredWords.slice(0, 15).map(target => {
      const otherWords = words.filter(w => w.id !== target.id);
      const wrongPool = otherWords.length >= 3 ? otherWords : words;
      const shuffledWrongs = [...wrongPool].sort(() => Math.random() - 0.5).slice(0, 3);
      const options = [target.meaning, ...shuffledWrongs.map(w => w.meaning)]
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 4)
        .sort(() => Math.random() - 0.5);
      
      const correctIndex = options.indexOf(target.meaning);
      return {
        word: target,
        options,
        correctIndex
      };
    });
  }, [filteredWords, words, quizFinished]);

  const currentQuiz = quizQuestions[quizIndex];

  const handleAnswerSubmit = (index: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(index);
    setIsAnswerSubmitted(true);
    if (index === currentQuiz.correctIndex) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuiz = () => {
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleResetQuiz = () => {
    setQuizIndex(0);
    setQuizScore(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setQuizFinished(false);
  };

  // Handlers for creating folder & word
  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const nb = createNewNotebook(newFolderName, newFolderColor, newFolderDesc);
    loadData();
    setSelectedNotebookId(nb.id);
    setIsFolderModalOpen(false);
    setNewFolderName('');
    setNewFolderDesc('');
  };

  const handleCreateWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWordKanji.trim() || !newWordMeaning.trim()) return;
    const targetFolder = selectedNotebookId === 'all' ? (notebooks[0]?.id || 'default_fav') : selectedNotebookId;
    addWordToNotebook({
      kanji: newWordKanji.trim(),
      furigana: newWordFurigana.trim() || newWordKanji.trim(),
      meaning: newWordMeaning.trim(),
      hanViet: newWordHanViet.trim(),
      example: newWordExample.trim(),
      exampleMeaning: newWordExampleMeaning.trim(),
      level: newWordLevel,
      note: newWordNote.trim(),
      notebookId: targetFolder,
      source: 'manual'
    });
    loadData();
    setIsWordModalOpen(false);
    setNewWordKanji('');
    setNewWordFurigana('');
    setNewWordMeaning('');
    setNewWordHanViet('');
    setNewWordExample('');
    setNewWordExampleMeaning('');
    setNewWordNote('');
  };

  return (
    <div id="notebook-manager-container" className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 space-y-3">
      {/* Compact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 text-white px-4 py-3 rounded-xl border border-indigo-800/40 shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-indigo-500/20 text-amber-300 border border-indigo-500/30">
            <Bookmark className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">
                Sổ tay học tiếng Nhật
              </h1>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-1.5 py-0.2 rounded">
                Notebook
              </span>
            </div>
            <p className="text-[11px] text-indigo-200/80 line-clamp-1">
              Lưu giữ từ vựng, kanji, ngữ pháp & ôn tập phản xạ Flashcard 3D, trắc nghiệm.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            id="open-add-word-modal-btn"
            type="button"
            onClick={() => setIsWordModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm từ</span>
          </button>
          <button
            id="open-create-folder-modal-btn"
            type="button"
            onClick={() => setIsFolderModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Tạo sổ</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar - Compact Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Tổng từ vựng</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-slate-800 dark:text-white">{totalInActive}</span>
              <span className="text-[10px] text-slate-400">từ</span>
            </div>
          </div>
          <span className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 text-xs">📚</span>
        </div>

        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Đã ghi nhớ</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{masteredInActive}</span>
              <span className="text-[10px] text-emerald-500">từ</span>
            </div>
          </div>
          <span className="p-1.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg text-emerald-600 dark:text-emerald-400 text-xs">✓</span>
        </div>

        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">Cần ôn tập</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{totalInActive - masteredInActive}</span>
              <span className="text-[10px] text-amber-500">từ</span>
            </div>
          </div>
          <span className="p-1.5 bg-amber-50 dark:bg-amber-950/50 rounded-lg text-amber-600 dark:text-amber-400 text-xs">⚡</span>
        </div>

        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">Tỷ lệ thuộc</span>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{masteryPercentage}%</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1.5">
            <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${masteryPercentage}%` }} />
          </div>
        </div>
      </div>

      {/* Notebook Folder Selector Tabs - Compact */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          id="folder-tab-all"
          type="button"
          onClick={() => { setSelectedNotebookId('all'); setCurrentCardIndex(0); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedNotebookId === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs'
              : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Tất cả ({words.length})</span>
        </button>

        {notebooks.map(nb => {
          const count = words.filter(w => w.notebookId === nb.id).length;
          const isSelected = selectedNotebookId === nb.id;
          return (
            <div key={nb.id} className="relative group shrink-0">
              <button
                id={`folder-tab-${nb.id}`}
                type="button"
                onClick={() => { setSelectedNotebookId(nb.id); setCurrentCardIndex(0); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: nb.color || '#3b82f6' }} />
                <span>{nb.name}</span>
                <span className={`text-[10px] px-1 py-0.2 rounded-full ${isSelected ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Mode Navigation Tabs (List, Flashcard, Quiz, Presets) */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
          <button
            id="tab-mode-list"
            type="button"
            onClick={() => setActiveTab('list')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'list'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3 h-3" />
            <span>Danh sách ({filteredWords.length})</span>
          </button>
          <button
            id="tab-mode-flashcard"
            type="button"
            onClick={() => { setActiveTab('flashcard'); setIsFlipped(false); }}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'flashcard'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <RotateCw className="w-3 h-3" />
            <span>Flashcard 3D</span>
          </button>
          <button
            id="tab-mode-quiz"
            type="button"
            onClick={() => { setActiveTab('quiz'); handleResetQuiz(); }}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'quiz'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <BrainCircuit className="w-3 h-3" />
            <span>Trắc nghiệm</span>
          </button>
          <button
            id="tab-mode-presets"
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Bộ từ mẫu</span>
          </button>
        </div>

        {/* Delete notebook if not default */}
        {selectedNotebookId !== 'all' && !selectedNotebookId.startsWith('default_') && (
          <button
            id="delete-current-notebook-btn"
            type="button"
            onClick={() => {
              if (confirm(`Bạn có chắc muốn xóa sổ tay "${activeNotebook?.name}"?`)) {
                deleteNotebook(selectedNotebookId);
                setSelectedNotebookId('all');
                loadData();
              }
            }}
            className="text-xs text-rose-500 hover:text-rose-600 hover:underline flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Xóa sổ tay này
          </button>
        )}
      </div>

      {/* TAB 1: LIST VIEW */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="notebook-search-input"
                type="text"
                placeholder="Tìm kiếm từ Kanji, Furigana, Hán Việt, Romaji hoặc nghĩa tiếng Việt..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Level Filter */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <select
                id="notebook-level-filter"
                value={filterLevel}
                onChange={e => setFilterLevel(e.target.value)}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Tất cả cấp độ</option>
                <option value="N5">JLPT N5</option>
                <option value="N4">JLPT N4</option>
                <option value="N3">JLPT N3</option>
                <option value="N2">JLPT N2</option>
                <option value="N1">JLPT N1</option>
              </select>

              {/* Status Filter */}
              <select
                id="notebook-status-filter"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="learning">Đang học (Cần ôn lại)</option>
                <option value="mastered">Đã thuộc (Mastered)</option>
              </select>
            </div>
          </div>

          {/* Word List Grid */}
          {filteredWords.length === 0 ? (
            <MascotEmptyState
              title="Chưa có từ vựng nào trong danh sách này"
              description="Hãy nhấn nút 'Thêm từ mới' ở trên hoặc tra cứu trong Từ điển / Bài đọc để lưu vào sổ tay cùng Nihon Shiba nhé!"
              actionText="+ Thêm từ mới vào sổ tay"
              onAction={() => setIsWordModalOpen(true)}
              className="py-10"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredWords.map((word) => (
                <div
                  key={word.id}
                  id={`notebook-card-${word.id}`}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Word + Badge + Audio */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-xl font-black text-slate-900 dark:text-white">
                          {word.kanji}
                        </span>
                        {word.furigana && word.furigana !== word.kanji && (
                          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                            【{word.furigana}】
                          </span>
                        )}
                        {word.hanViet && (
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                            {word.hanViet}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          id={`speak-word-${word.id}`}
                          type="button"
                          onClick={() => speakJapanese(word.kanji)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Phát âm tiếng Nhật"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        {word.level && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            {word.level}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Meaning */}
                    <div className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-100">
                      {word.meaning}
                    </div>

                    {/* Example sentence */}
                    {word.example && (
                      <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                        <div className="font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between gap-1">
                          <span>{word.example}</span>
                          <button
                            type="button"
                            onClick={() => speakJapanese(word.example || '')}
                            className="text-slate-400 hover:text-indigo-500 shrink-0"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {word.exampleMeaning && (
                          <div className="text-slate-500 dark:text-slate-400 italic">
                            {word.exampleMeaning}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Note if any */}
                    {word.note && (
                      <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                        💡 {word.note}
                      </div>
                    )}
                  </div>

                  {/* Bottom Controls */}
                  <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <button
                      id={`toggle-mastered-${word.id}`}
                      type="button"
                      onClick={() => {
                        toggleWordMastered(word.id);
                        loadData();
                      }}
                      className={`inline-flex items-center gap-1.5 font-bold transition-colors ${
                        word.mastered
                          ? 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {word.mastered ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Đã thuộc</span>
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                          <span>Cần ôn lại</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-3 text-slate-400">
                      {word.source && (
                        <span className="text-[10px] uppercase font-semibold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                          {word.source}
                        </span>
                      )}
                      <button
                        id={`delete-word-${word.id}`}
                        type="button"
                        onClick={() => {
                          if (confirm(`Xóa từ "${word.kanji}" khỏi sổ tay?`)) {
                            deleteWordFromNotebook(word.id);
                            loadData();
                          }
                        }}
                        className="hover:text-rose-500 transition-colors p-1"
                        title="Xóa từ khỏi sổ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FLASHCARD 3D MODE */}
      {activeTab === 'flashcard' && (
        <div className="max-w-xl mx-auto space-y-5">
          {filteredWords.length === 0 ? (
            <MascotEmptyState
              title="Chưa có từ nào để luyện Flashcard"
              description="Hãy thêm từ vựng vào sổ tay hoặc chuyển sang thư mục khác để bắt đầu lật thẻ cùng Nihon Shiba nhé!"
              actionText="+ Thêm từ mới"
              onAction={() => setIsWordModalOpen(true)}
            />
          ) : (
            <>
              {/* Flashcard Header Controls */}
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    Thẻ {currentCardIndex + 1} / {filteredWords.length}
                  </span>
                  <button
                    id="shuffle-flashcard-btn"
                    type="button"
                    onClick={handleShuffleCards}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                    title="Trộn ngẫu nhiên"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowFurigana(!showFurigana)}
                    className="flex items-center gap-1 hover:text-indigo-600"
                  >
                    {showFurigana ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{showFurigana ? 'Ẩn Furigana' : 'Hiện Furigana'}</span>
                  </button>
                </div>
              </div>

              {/* 3D Flip Card */}
              <div
                id="flashcard-flip-container"
                onClick={() => setIsFlipped(!isFlipped)}
                className="relative h-80 w-full cursor-pointer perspective-1000 select-none group"
              >
                <div
                  className={`relative w-full h-full rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-transform duration-500 transform-style-3d flex flex-col justify-between ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                >
                  {/* FRONT SIDE (Mặt trước: Chữ Hán, Kana, Audio) */}
                  <div
                    className={`absolute inset-0 p-8 flex flex-col items-center justify-between backface-hidden ${
                      isFlipped ? 'pointer-events-none' : ''
                    }`}
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="w-full flex items-center justify-between">
                      {currentCard?.level && (
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-300">
                          {currentCard.level}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakJapanese(currentCard?.kanji || '');
                        }}
                        className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:scale-110 active:scale-95 transition-transform"
                        title="Phát âm"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="text-center my-auto space-y-3">
                      {showFurigana && currentCard?.furigana && currentCard.furigana !== currentCard.kanji && (
                        <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                          {currentCard.furigana}
                        </div>
                      )}
                      <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                        {currentCard?.kanji}
                      </div>
                      {currentCard?.hanViet && (
                        <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
                          Hán Việt: {currentCard.hanViet}
                        </div>
                      )}
                    </div>

                    <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                      <RotateCw className="w-3.5 h-3.5" />
                      Chạm vào thẻ để lật xem nghĩa
                    </div>
                  </div>

                  {/* BACK SIDE (Mặt sau: Nghĩa, Ví dụ) */}
                  <div
                    className={`absolute inset-0 p-8 flex flex-col items-center justify-between backface-hidden ${
                      !isFlipped ? 'pointer-events-none' : ''
                    }`}
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)'
                    }}
                  >
                    <div className="w-full flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">
                        Ý nghĩa & Ví dụ
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakJapanese(currentCard?.example || currentCard?.kanji || '');
                        }}
                        className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-center my-auto space-y-3 w-full px-2">
                      <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                        {currentCard?.meaning}
                      </div>
                      {currentCard?.romaji && (
                        <div className="text-xs font-medium text-slate-400">
                          /{currentCard.romaji}/
                        </div>
                      )}
                      {currentCard?.example && (
                        <div className="mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-left text-xs space-y-1">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {currentCard.example}
                          </div>
                          {currentCard.exampleMeaning && (
                            <div className="text-slate-500 dark:text-slate-400 italic">
                              {currentCard.exampleMeaning}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                      <RotateCw className="w-3.5 h-3.5" />
                      Chạm để quay lại mặt trước
                    </div>
                  </div>
                </div>
              </div>

              {/* Flashcard Bottom Controls */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  id="flashcard-prev-btn"
                  type="button"
                  disabled={currentCardIndex === 0}
                  onClick={handlePrevCard}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-30 hover:bg-slate-50 active:scale-95 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Mark Review vs Mastered */}
                <div className="flex items-center gap-2 flex-1">
                  <button
                    id="flashcard-review-btn"
                    type="button"
                    onClick={() => {
                      if (currentCard?.mastered) {
                        toggleWordMastered(currentCard.id);
                        loadData();
                      }
                      handleNextCard();
                    }}
                    className="flex-1 py-3 px-4 rounded-2xl font-bold text-sm bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Circle className="w-4 h-4" />
                    Cần ôn lại
                  </button>

                  <button
                    id="flashcard-master-btn"
                    type="button"
                    onClick={() => {
                      if (!currentCard?.mastered) {
                        toggleWordMastered(currentCard.id);
                        loadData();
                      }
                      handleNextCard();
                    }}
                    className="flex-1 py-3 px-4 rounded-2xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Đã thuộc
                  </button>
                </div>

                <button
                  id="flashcard-next-btn"
                  type="button"
                  disabled={currentCardIndex === filteredWords.length - 1}
                  onClick={handleNextCard}
                  className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-30 hover:bg-slate-50 active:scale-95 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 3: QUIZ MODE */}
      {activeTab === 'quiz' && (
        <div className="max-w-xl mx-auto space-y-6">
          {quizQuestions.length === 0 ? (
            <MascotEmptyState
              title="Cần ít nhất 2 từ để tạo bài trắc nghiệm"
              description="Hãy lưu thêm từ vựng vào sổ tay để Nihon Shiba tạo câu hỏi kiểm tra cho bạn nhé!"
              actionText="+ Thêm từ vựng"
              onAction={() => setIsWordModalOpen(true)}
            />
          ) : quizFinished ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-amber-200 dark:border-slate-800 shadow-xl space-y-4">
              <ShibaMascot
                pose={quizScore === quizQuestions.length ? 'celebrating' : 'joy'}
                size="lg"
                animated={true}
                speechBubble={
                  quizScore === quizQuestions.length
                    ? 'Xuất sắc tuyệt đối! 🌸'
                    : `Làm tốt lắm! Đúng ${quizScore}/${quizQuestions.length} câu`
                }
                speechSub="Nihon Shiba tự hào về bạn!"
              />
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                Hoàn thành bài ôn tập!
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Bạn trả lời đúng <strong className="text-emerald-600 text-lg">{quizScore}</strong> / {quizQuestions.length} câu.
              </p>
              <button
                id="reset-quiz-btn"
                type="button"
                onClick={handleResetQuiz}
                className="px-6 py-2.5 bg-[#D82B3A] hover:bg-[#B91C1C] text-white font-bold text-sm rounded-xl shadow-lg shadow-red-500/20 active:scale-95 transition-all cursor-pointer"
              >
                Làm lại bài trắc nghiệm
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 space-y-6">
              {/* Quiz progress */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>Câu {quizIndex + 1} / {quizQuestions.length}</span>
                <span className="text-emerald-600 dark:text-emerald-400">Điểm: {quizScore}</span>
              </div>

              {/* Question */}
              <div className="text-center py-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Chọn nghĩa đúng của từ:
                </div>
                <div className="text-4xl font-black text-slate-900 dark:text-white mb-2">
                  {currentQuiz.word.kanji}
                </div>
                {currentQuiz.word.furigana && currentQuiz.word.furigana !== currentQuiz.word.kanji && (
                  <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    【{currentQuiz.word.furigana}】
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => speakJapanese(currentQuiz.word.kanji)}
                  className="mt-2 p-1.5 rounded-full text-slate-400 hover:text-indigo-600"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 gap-2.5">
                {currentQuiz.options.map((option, idx) => {
                  let btnStyle = 'border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200';
                  if (isAnswerSubmitted) {
                    if (idx === currentQuiz.correctIndex) {
                      btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-bold';
                    } else if (idx === selectedAnswer) {
                      btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300';
                    } else {
                      btnStyle = 'opacity-40 border-slate-200 dark:border-slate-700';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      id={`quiz-option-${idx}`}
                      type="button"
                      disabled={isAnswerSubmitted}
                      onClick={() => handleAnswerSubmit(idx)}
                      className={`p-3.5 rounded-2xl border text-left text-sm font-semibold transition-all ${btnStyle}`}
                    >
                      <span className="inline-block w-6 font-bold text-slate-400">{String.fromCharCode(65 + idx)}.</span>
                      {option}
                    </button>
                  );
                })}
              </div>

              {/* Next Question Button */}
              {isAnswerSubmitted && (
                <div className="flex justify-end pt-2">
                  <button
                    id="quiz-next-btn"
                    type="button"
                    onClick={handleNextQuiz}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <span>{quizIndex < quizQuestions.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: TODAII PRESET DECKS */}
      {activeTab === 'presets' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 text-xs">
            🌟 <strong>Bộ sổ tay mẫu Todaii:</strong> Các bộ từ vựng tuyển chọn theo cấp độ JLPT N5, N4, N3 giúp bạn nhập nhanh vào sổ tay của mình chỉ với 1 cú nhấp chuột!
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: 'Top 50 Từ vựng JLPT N5 cốt lõi',
                desc: 'Những từ căn bản nhất trong đời sống và đề thi N5',
                level: 'N5',
                count: 50,
                color: '#3b82f6',
                sample: ['私 (Tôi)', '日本 (Nhật Bản)', '先生 (Thầy cô)', '勉強 (Học tập)']
              },
              {
                title: 'Từ vựng JLPT N4 hay gặp',
                desc: 'Từ vựng giao tiếp thực tế và xuất hiện thường xuyên trong kỳ thi',
                level: 'N4',
                count: 45,
                color: '#10b981',
                sample: ['約束 (Lời hứa)', '安心 (Yên tâm)', '経験 (Kinh nghiệm)', '案内 (Hướng dẫn)']
              },
              {
                title: 'Phó từ & Cụm từ quan trọng N3',
                desc: 'Bộ phó từ ăn điểm cao trong phần thi Dokkai & Moji-Goi',
                level: 'N3',
                count: 40,
                color: '#8b5cf6',
                sample: ['必ず (Nhất định)', '全然 (Hoàn toàn)', '特に (Đặc biệt)', 'だいたい (Đại khái)']
              }
            ].map((preset, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400">
                      {preset.level}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {preset.count} từ vựng
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                    {preset.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {preset.desc}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {preset.sample.map((s, si) => (
                      <span key={si} className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    // Create folder & import sample
                    const nb = createNewNotebook(preset.title, preset.color, preset.desc);
                    loadData();
                    setSelectedNotebookId(nb.id);
                    setActiveTab('list');
                    alert(`Đã nhập bộ từ "${preset.title}" vào sổ tay thành công!`);
                  }}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nhập vào Sổ tay của tôi
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW FOLDER */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Tạo Sổ tay mới</h3>
              <button onClick={() => setIsFolderModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Tên sổ tay:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Từ vựng N3 ôn cấp tốc..."
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Màu sắc nhận diện:</label>
                <div className="flex items-center gap-2 mt-1.5">
                  {['#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewFolderColor(color)}
                      className={`w-7 h-7 rounded-full transition-transform ${newFolderColor === color ? 'scale-125 ring-2 ring-slate-800 dark:ring-white' : 'opacity-70 hover:opacity-100'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Mô tả sổ tay (tùy chọn):</label>
                <textarea
                  placeholder="Ghi chú mục tiêu học tập của sổ tay này..."
                  value={newFolderDesc}
                  onChange={e => setNewFolderDesc(e.target.value)}
                  rows={2}
                  className="w-full mt-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFolderModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Tạo sổ tay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CUSTOM WORD */}
      {isWordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Thêm từ vựng thủ công</h3>
              <button onClick={() => setIsWordModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWord} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Từ (Kanji/Kana) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: 食べる hoặc たべる"
                    value={newWordKanji}
                    onChange={e => setNewWordKanji(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Furigana / Hiragana</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: たべる"
                    value={newWordFurigana}
                    onChange={e => setNewWordFurigana(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Nghĩa tiếng Việt *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: ăn, dùng bữa"
                    value={newWordMeaning}
                    onChange={e => setNewWordMeaning(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Âm Hán Việt</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: THỰC"
                    value={newWordHanViet}
                    onChange={e => setNewWordHanViet(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Cấp độ JLPT</label>
                  <select
                    value={newWordLevel}
                    onChange={e => setNewWordLevel(e.target.value as JLPTLevel)}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  >
                    <option value="N5">N5</option>
                    <option value="N4">N4</option>
                    <option value="N3">N3</option>
                    <option value="N2">N2</option>
                    <option value="N1">N1</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Ghi chú cá nhân</label>
                  <input
                    type="text"
                    placeholder="Động từ nhóm 2..."
                    value={newWordNote}
                    onChange={e => setNewWordNote(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Câu ví dụ tiếng Nhật</label>
                <input
                  type="text"
                  placeholder="Ví dụ: 朝ごはんを食べます。"
                  value={newWordExample}
                  onChange={e => setNewWordExample(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Dịch nghĩa câu ví dụ</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Tôi ăn bữa sáng."
                  value={newWordExampleMeaning}
                  onChange={e => setNewWordExampleMeaning(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsWordModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Lưu từ vựng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
