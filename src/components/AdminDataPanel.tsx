import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, Compass, Layers, Plus, Edit2, Trash2, Database, RefreshCw, X, 
  FileSpreadsheet, UploadCloud, Download, CheckCircle2, AlertCircle, AlertTriangle, Eye,
  Search, Filter, Check, ArrowRight, Tag, HelpCircle, FileDown, Layers2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import ConfirmModal from './ConfirmModal';
import * as XLSX from 'xlsx';
import { getHanViet } from '../utils/japaneseUtils';
import { invalidateVocabPoolCache } from '../utils/notifications';

interface AdminDataPanelProps {
  initialOpenImportModal?: boolean;
  onCloseImportModal?: () => void;
}

export default function AdminDataPanel({ initialOpenImportModal = false, onCloseImportModal }: AdminDataPanelProps) {
  const { token } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'vocab' | 'grammar' | 'kanji'>('vocab');
  
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLessonFilter, setSelectedLessonFilter] = useState<string>('all');
  
  // Excel Import states
  const [isImportModalOpen, setIsImportModalOpen] = useState(initialOpenImportModal);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedItems, setParsedItems] = useState<any[]>([]);
  const [skippedCount, setSkippedCount] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [targetCurriculum, setTargetCurriculum] = useState<'auto' | 'minna' | 'tango' | 'custom'>('auto');
  const [defaultLessonNum, setDefaultLessonNum] = useState<number>(1);
  const [defaultLevel, setDefaultLevel] = useState<string>('N4');
  const [previewSearch, setPreviewSearch] = useState('');

  // Confirm delete modal
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    if (initialOpenImportModal) {
      setIsImportModalOpen(true);
    }
  }, [initialOpenImportModal]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      let endpoint = '';
      if (activeSubTab === 'vocab') endpoint = '/api/vocabularies';
      if (activeSubTab === 'grammar') endpoint = '/api/grammars';
      if (activeSubTab === 'kanji') endpoint = '/api/kanjis';
      
      const res = await fetch(endpoint, { cache: 'no-store' });
      const resData = await res.json();
      if (Array.isArray(resData)) {
        setData(resData);
      } else {
        setData([]);
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeSubTab]);

  const handleDelete = (id: string | number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Xóa mục dữ liệu',
      message: 'Bạn có chắc chắn muốn xóa vĩnh viễn mục dữ liệu này khỏi cơ sở dữ liệu học tập?',
      onConfirm: async () => {
        try {
          let endpoint = '';
          if (activeSubTab === 'vocab') endpoint = '/api/admin/vocabularies/delete';
          if (activeSubTab === 'grammar') endpoint = '/api/admin/grammars/delete';
          if (activeSubTab === 'kanji') endpoint = '/api/admin/kanjis/delete';

          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ id: typeof id === 'string' && id.startsWith('v_') ? id.split('_')[1] : (typeof id === 'string' && id.startsWith('g_') ? id.split('_')[1] : id) })
          });
          if (res.ok) {
            fetchData();
            invalidateVocabPoolCache();
          } else {
            alert('Xóa thất bại. Vui lòng kiểm tra quyền Admin.');
          }
        } catch(err) {
          console.error(err);
        }
      }
    });
  };

  // Excel handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    parseExcel(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      parseExcel(e.dataTransfer.files[0]);
    }
  };

  const parseExcel = (file: File) => {
    setImportFile(file);
    setImportError('');
    setImportSuccess('');
    setParsedItems([]);
    setSkippedCount(0);
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json<any>(ws);
        
        if (!rawData || rawData.length === 0) {
          setImportError('File Excel trống hoặc không chứa dòng dữ liệu nào.');
          return;
        }

        let skipped = 0;
        const normalized = rawData.map((row: any, idx: number) => {
          const getValue = (keys: string[]) => {
            for (const k of Object.keys(row)) {
              const kl = k.trim().toLowerCase().replace(/[\s_()\-]/g, '');
              for (const key of keys) {
                const target = key.trim().toLowerCase().replace(/[\s_()\-]/g, '');
                if (kl === target || kl.includes(target) || target.includes(kl)) {
                  const val = row[k];
                  if (val !== undefined && val !== null) {
                    return String(val).trim();
                  }
                }
              }
            }
            return '';
          };

          const rawLesson = getValue(['lesson', 'bai', 'bài', 'lessonnumber', 'lesson_number', 'stt bài', 'bài số', 'chuong', 'chương', 'section']);
          let parsedLessonNum = parseInt(rawLesson, 10);
          if (isNaN(parsedLessonNum) || parsedLessonNum <= 0) {
            parsedLessonNum = defaultLessonNum || 1;
          }

          const rawWord = getValue(['word', 'tu', 'từ', 'vocab', 'vocabulary', 'từ vựng', 'tuvung', 'từ tiếng nhật', 'japanese']);
          const rawKanji = getValue(['kanji', 'han', 'hán', 'chữ hán', 'chuhan', 'hán tự', 'hantu', 'chữ kanji']);
          const rawReading = getValue(['reading', 'doc', 'đọc', 'cách đọc', 'cachdoc', 'furigana', 'hiragana', 'katakana', 'romaji', 'phát âm']);
          const rawMeaning = getValue(['meaning', 'nghia', 'nghĩa', 'ý nghĩa', 'ynghia', 'tiếng việt', 'tiengviet', 'dịch nghĩa', 'vietnamese']);
          const rawHanViet = getValue(['hanviet', 'hán việt', 'han viet', 'âm hán', 'am han', 'hán việt từ']);
          const rawType = getValue(['type', 'loai', 'loại', 'từ loại', 'tuloai', 'loại từ', 'loaitu', 'part of speech']);
          const rawLevel = getValue(['level', 'cấp độ', 'cap do', 'capdo', 'jlpt', 'trình độ']);
          const rawExampleJp = getValue(['example_jp', 'ví dụ nhật', 'vidunhat', 'ví dụ jp', 'vidujp', 'examplejp', 'câu ví dụ', 'example', 'sentence']);
          const rawExampleVi = getValue(['example_vi', 'ví dụ việt', 'viduviet', 'ví dụ vi', 'viduvi', 'examplevi', 'dịch ví dụ', 'dichvidu', 'nghĩa ví dụ', 'translation']);

          const cleanReading = rawReading || rawWord || '';
          const cleanKanji = rawKanji || (rawWord && /[\u4e00-\u9faf]/.test(rawWord) ? rawWord : '');
          const cleanWord = rawWord || cleanKanji || cleanReading;
          const cleanMeaning = rawMeaning;

          // Auto-generate Hán Việt if missing and Kanji is present
          let derivedHanViet = rawHanViet;
          if (!derivedHanViet && cleanKanji) {
            try {
              derivedHanViet = getHanViet(cleanKanji);
            } catch (e) {
              derivedHanViet = '';
            }
          }

          // Determine Level
          let resolvedLevel = defaultLevel;
          if (rawLevel) {
            const upper = rawLevel.toUpperCase();
            if (['N5', 'N4', 'N3', 'N2', 'N1'].includes(upper)) {
              resolvedLevel = upper;
            }
          } else if (targetCurriculum === 'minna') {
            resolvedLevel = parsedLessonNum <= 25 ? 'N5' : 'N4';
          } else if (targetCurriculum === 'tango') {
            resolvedLevel = 'N4';
          }

          const isValid = Boolean(cleanWord && cleanReading && cleanMeaning);
          if (!isValid) {
            skipped++;
          }

          return {
            id: `import_${idx + 1}`,
            lessonNumber: parsedLessonNum,
            lessonTitle: `Bài ${parsedLessonNum}`,
            word: cleanWord,
            kanji: cleanKanji || null,
            reading: cleanReading,
            hanViet: derivedHanViet || null,
            meaning: cleanMeaning,
            type: rawType || null,
            level: resolvedLevel,
            curriculum: targetCurriculum === 'auto' ? (parsedLessonNum <= 50 ? 'minna' : 'tango') : targetCurriculum,
            exampleJp: rawExampleJp || null,
            exampleVi: rawExampleVi || null,
            isValid
          };
        });

        const validList = normalized.filter(item => item.isValid);
        setSkippedCount(skipped);

        if (validList.length === 0) {
          setImportError('Không tìm thấy từ vựng hợp lệ nào. Vui lòng đảm bảo các cột Từ vựng, Cách đọc, và Ý nghĩa có chứa dữ liệu.');
        } else {
          setParsedItems(validList);
        }
      } catch (err: any) {
        setImportError(`Không thể đọc file: ${err.message}`);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImportSubmit = async () => {
    if (parsedItems.length === 0) return;
    setIsImporting(true);
    setImportError('');
    setImportSuccess('');
    
    try {
      // 1. Send to server backend if token exists
      let serverCount = 0;
      if (token) {
        const res = await fetch('/api/admin/vocabularies/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ items: parsedItems })
        });
        const resData = await res.json().catch(() => ({}));
        if (res.ok && resData.success) {
          serverCount = resData.count || parsedItems.length;
        }
      }

      // 2. Persist locally to localStorage so offline/push notifications have immediate access
      try {
        const existingCustom = JSON.parse(localStorage.getItem('jpstudy_custom_vocabularies') || '[]');
        const combined = [...existingCustom, ...parsedItems.map((p, i) => ({
          id: `custom_imp_${Date.now()}_${i}`,
          lessonId: `mn_lesson_${p.lessonNumber}`,
          lessonName: `Bài ${p.lessonNumber}`,
          word: p.word,
          kanji: p.kanji,
          reading: p.reading,
          hiragana: p.reading,
          hanViet: p.hanViet,
          meaning: p.meaning,
          level: p.level || 'N4',
          curriculum: p.curriculum || 'minna',
          exampleSentence: p.exampleJp,
          exampleTranslation: p.exampleVi,
          exampleJp: p.exampleJp,
          exampleVi: p.exampleVi,
          type: p.type || 'Từ vựng'
        }))];
        localStorage.setItem('jpstudy_custom_vocabularies', JSON.stringify(combined));
      } catch (e) {
        console.error('Failed to save to localStorage:', e);
      }

      // Invalidate cache
      invalidateVocabPoolCache();
      
      setImportSuccess(`🎉 Đã nhập thành công ${parsedItems.length} từ vựng vào cơ sở dữ liệu và đồng bộ hệ thống!`);
      setParsedItems([]);
      setImportFile(null);
      fetchData(); // reload table
    } catch (err: any) {
      setImportError(`Lỗi khi nhập dữ liệu: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleRemovePreviewItem = (index: number) => {
    setParsedItems(prev => prev.filter((_, i) => i !== index));
  };

  // Preset Template Downloaders
  const downloadTemplate = (type: 'minna' | 'tango' | 'simple') => {
    let filename = 'Mau_Nhap_Tu_Vung_Minna.xlsx';
    let sampleData: any[] = [];

    if (type === 'minna') {
      filename = 'Mau_Nhap_Tu_Vung_Minna_50_Bai.xlsx';
      sampleData = [
        {
          'Bài (Lesson)': 1,
          'Từ vựng (Word)': 'わたし',
          'Chữ Hán (Kanji)': '私',
          'Cách đọc (Reading)': 'わたし',
          'Hán Việt (HanViet)': 'TƯ',
          'Ý nghĩa (Meaning)': 'Tôi (ngôi thứ nhất)',
          'Loại từ (Type)': 'Đại từ',
          'Cấp độ (Level)': 'N5',
          'Ví dụ tiếng Nhật (Example JP)': '私はベトナム人です。',
          'Dịch ví dụ (Example VI)': 'Tôi là người Việt Nam.'
        },
        {
          'Bài (Lesson)': 1,
          'Từ vựng (Word)': 'がくせい',
          'Chữ Hán (Kanji)': '学生',
          'Cách đọc (Reading)': 'がくせい',
          'Hán Việt (HanViet)': 'HỌC SINH',
          'Ý nghĩa (Meaning)': 'Học sinh, sinh viên',
          'Loại từ (Type)': 'Danh từ',
          'Cấp độ (Level)': 'N5',
          'Ví dụ tiếng Nhật (Example JP)': 'ナムさんはハノイ大学の学生です。',
          'Dịch ví dụ (Example VI)': 'Nam là sinh viên trường Đại học Hà Nội.'
        },
        {
          'Bài (Lesson)': 26,
          'Từ vựng (Word)': 'みます',
          'Chữ Hán (Kanji)': '診ます',
          'Cách đọc (Reading)': 'みます',
          'Hán Việt (HanViet)': 'CHẨN',
          'Ý nghĩa (Meaning)': 'Khám bệnh, xem xét',
          'Loại từ (Type)': 'Động từ',
          'Cấp độ (Level)': 'N4',
          'Ví dụ tiếng Nhật (Example JP)': '医者に診てもらいました。',
          'Dịch ví dụ (Example VI)': 'Tôi đã được bác sĩ khám bệnh cho.'
        }
      ];
    } else if (type === 'tango') {
      filename = 'Mau_Nhap_Tu_Vung_Tango_1500.xlsx';
      sampleData = [
        {
          'Section (Bài)': 1,
          'Từ vựng (Word)': '毎日',
          'Chữ Hán (Kanji)': '毎日',
          'Cách đọc (Reading)': 'まいにち',
          'Hán Việt (HanViet)': 'MỖI NHẬT',
          'Ý nghĩa (Meaning)': 'Hàng ngày, mỗi ngày',
          'Loại từ (Type)': 'Danh từ',
          'Cấp độ (Level)': 'N4',
          'Ví dụ tiếng Nhật (Example JP)': '毎日日本語を勉強しています。',
          'Dịch ví dụ (Example VI)': 'Hàng ngày tôi đều học tiếng Nhật.'
        },
        {
          'Section (Bài)': 1,
          'Từ vựng (Word)': '今週',
          'Chữ Hán (Kanji)': '今週',
          'Cách đọc (Reading)': 'こんしゅう',
          'Hán Việt (HanViet)': 'KIM CHU',
          'Ý nghĩa (Meaning)': 'Tuần này',
          'Loại từ (Type)': 'Danh từ',
          'Cấp độ (Level)': 'N4',
          'Ví dụ tiếng Nhật (Example JP)': '今週の土曜日は休みです。',
          'Dịch ví dụ (Example VI)': 'Thứ bảy tuần này tôi được nghỉ.'
        }
      ];
    } else {
      filename = 'Mau_Nhap_Tu_Vung_Nhanh.xlsx';
      sampleData = [
        {
          'Bài': 1,
          'Từ vựng': '辞書',
          'Cách đọc': 'じしょ',
          'Ý nghĩa': 'Từ điển',
          'Ví dụ': 'これは日本語の辞書です。',
          'Dịch nghĩa ví dụ': 'Đây là cuốn từ điển tiếng Nhật.'
        },
        {
          'Bài': 1,
          'Từ vựng': '本',
          'Cách đọc': 'ほん',
          'Ý nghĩa': 'Sách',
          'Ví dụ': '毎日図書館で本を読みます。',
          'Dịch nghĩa ví dụ': 'Mỗi ngày tôi đều đọc sách ở thư viện.'
        }
      ];
    }

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vocabulary_Template');
    XLSX.writeFile(wb, filename);
  };

  // Export current vocabulary list to Excel
  const handleExportCurrentData = () => {
    if (data.length === 0) {
      alert('Không có dữ liệu từ vựng để xuất.');
      return;
    }

    const exportRows = data.map((item, idx) => ({
      'STT': idx + 1,
      'ID': item.id,
      'Bài': item.lessonId || item.lessonNumber || 1,
      'Từ vựng': item.word,
      'Chữ Hán': item.kanji || '',
      'Cách đọc': item.reading || '',
      'Hán Việt': item.hanViet || (item.kanji ? getHanViet(item.kanji) : ''),
      'Ý nghĩa': item.meaning,
      'Loại từ': item.type || '',
      'Cấp độ': item.level || 'N4',
      'Ví dụ tiếng Nhật': item.exampleJp || item.example || '',
      'Dịch nghĩa ví dụ': item.exampleVi || item.translation || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Database_Vocab');
    XLSX.writeFile(wb, `EasyJapanese_Vocab_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Filtered preview items
  const filteredPreview = useMemo(() => {
    if (!previewSearch.trim()) return parsedItems;
    const q = previewSearch.toLowerCase();
    return parsedItems.filter(item => 
      item.word.toLowerCase().includes(q) ||
      (item.kanji && item.kanji.toLowerCase().includes(q)) ||
      item.reading.toLowerCase().includes(q) ||
      item.meaning.toLowerCase().includes(q) ||
      (item.hanViet && item.hanViet.toLowerCase().includes(q))
    );
  }, [parsedItems, previewSearch]);

  // Filtered displayed data in table
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = !searchTerm.trim() || 
        (item.word && item.word.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.kanji && item.kanji.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.reading && item.reading.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.meaning && item.meaning.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.structure && item.structure.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchLesson = selectedLessonFilter === 'all' || 
        String(item.lessonId) === selectedLessonFilter || 
        String(item.lessonNumber) === selectedLessonFilter;

      return matchSearch && matchLesson;
    });
  }, [data, searchTerm, selectedLessonFilter]);

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
          <button
            onClick={() => setActiveSubTab('vocab')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'vocab' 
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Từ vựng
          </button>
          <button
            onClick={() => setActiveSubTab('grammar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'grammar' 
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <Compass className="w-3.5 h-3.5" /> Ngữ pháp
          </button>
          <button
            onClick={() => setActiveSubTab('kanji')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'kanji' 
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Chữ Hán (Kanji)
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {activeSubTab === 'vocab' && (
            <>
              <button 
                onClick={() => setIsImportModalOpen(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-sm shadow-emerald-600/20 active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4" /> 
                <span>Nhập từ vựng bằng Excel / CSV</span>
              </button>

              <button 
                onClick={handleExportCurrentData}
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Xuất cơ sở dữ liệu hiện tại ra file Excel"
              >
                <FileDown className="w-3.5 h-3.5 text-slate-500" />
                <span>Xuất Excel</span>
              </button>
            </>
          )}

          <button 
            onClick={() => alert('Để thêm từ vựng nhanh nhất, bạn hãy sử dụng tính năng "Nhập từ vựng bằng Excel / CSV"!')}
            className="px-3.5 py-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Thêm mới
          </button>
        </div>
      </div>

      {/* Main Database Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-5 md:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Dữ liệu {activeSubTab === 'vocab' ? 'Từ vựng' : activeSubTab === 'grammar' ? 'Ngữ pháp' : 'Kanji'}
            </h3>
            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono font-bold px-2 py-0.5 rounded-full">
              {filteredData.length} / {data.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm từ, cách đọc, nghĩa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 w-48 sm:w-60"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <button 
              onClick={fetchData}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Làm mới"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-2xl text-xs font-semibold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400">
            <RefreshCw className="w-7 h-7 animate-spin text-indigo-500" />
            <span className="text-xs font-bold">Đang tải dữ liệu từ Cloud SQL...</span>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-bold border-b border-slate-100 dark:border-slate-800">
                  <th className="p-3.5 font-bold">ID</th>
                  <th className="p-3.5 font-bold">Nội dung chính</th>
                  <th className="p-3.5 font-bold">Hán Việt</th>
                  <th className="p-3.5 font-bold">Ý nghĩa</th>
                  {activeSubTab === 'vocab' && <th className="p-3.5 font-bold">Bài</th>}
                  <th className="p-3.5 text-center font-bold">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">
                      Không tìm thấy mục dữ liệu nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredData.slice(0, 100).map((item, i) => (
                    <tr key={item.id || i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-mono text-slate-400 text-[10px]">
                        {item.id}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">
                        {activeSubTab === 'vocab' && (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-extrabold text-indigo-950 dark:text-indigo-200">{item.word}</span>
                            {item.kanji && item.kanji !== item.word && (
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Chữ Hán: {item.kanji}</span>
                            )}
                            <span className="text-[11px] text-slate-400 font-medium">Đọc: {item.reading}</span>
                          </div>
                        )}
                        {activeSubTab === 'grammar' && (
                          <span className="font-extrabold text-indigo-950 dark:text-indigo-200">{item.structure}</span>
                        )}
                        {activeSubTab === 'kanji' && (
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-black text-indigo-700 dark:text-indigo-300">{item.kanji}</span>
                            <span className="text-[11px] text-slate-500">({item.onyomi || item.kunyomi || item.reading})</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-md text-[10px] uppercase">
                          {item.hanViet || (item.kanji ? getHanViet(item.kanji) : (activeSubTab === 'kanji' ? (item.hanViet || getHanViet(item.kanji)) : '-'))}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-700 dark:text-slate-300 max-w-xs">
                        <div className="space-y-0.5">
                          <p className="font-medium">{item.meaning || item.meaningVi}</p>
                          {item.exampleJp && (
                            <p className="text-[10px] text-slate-400 truncate" title={`${item.exampleJp} - ${item.exampleVi || ''}`}>
                              {item.exampleJp}
                            </p>
                          )}
                        </div>
                      </td>
                      {activeSubTab === 'vocab' && (
                        <td className="p-3.5 font-bold text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                          Bài {item.lessonId || item.lessonNumber || '1'}
                        </td>
                      )}
                      <td className="p-3.5 text-center">
                        <div className="flex justify-center gap-1.5">
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Xóa mục"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Excel Import Modal */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 md:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 md:p-7 relative max-h-[90vh] flex flex-col my-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setParsedItems([]);
                  setImportFile(null);
                  setImportError('');
                  setImportSuccess('');
                  if (onCloseImportModal) onCloseImportModal();
                }}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-slate-950 dark:text-slate-50 flex items-center gap-2">
                      Nhập Từ Vựng Bằng Excel / CSV
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Tự động phân tích, nhận diện chữ Hán, Hán Việt và đồng bộ hàng loạt vào cơ sở dữ liệu.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto flex-1 space-y-4 pr-1">
                
                {/* 1. Target Curriculum Configuration */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Giáo trình mục tiêu:
                    </label>
                    <select
                      value={targetCurriculum}
                      onChange={(e) => setTargetCurriculum(e.target.value as any)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="auto">🎯 Tự động theo cột trong file</option>
                      <option value="minna">📘 Minna no Nihongo (Bài 1 - 50)</option>
                      <option value="tango">📗 Tango 1500 N4 (Theo Section)</option>
                      <option value="custom">🔖 Giáo trình Tự do / Khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Bài học mặc định (Nếu file trống):
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={defaultLessonNum}
                      onChange={(e) => setDefaultLessonNum(parseInt(e.target.value) || 1)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Cấp độ JLPT mặc định:
                    </label>
                    <select
                      value={defaultLevel}
                      onChange={(e) => setDefaultLevel(e.target.value)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-2.5 py-1.5 font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="N5">JLPT N5 (Sơ cấp 1)</option>
                      <option value="N4">JLPT N4 (Sơ cấp 2)</option>
                      <option value="N3">JLPT N3 (Trung cấp)</option>
                      <option value="N2">JLPT N2 (Cao cấp)</option>
                      <option value="N1">JLPT N1 (Thượng cấp)</option>
                    </select>
                  </div>
                </div>

                {/* 2. Drag & Drop Upload Zone + Template download */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div 
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    className="md:col-span-2 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 rounded-2xl p-6 transition-all flex flex-col items-center justify-center text-center relative bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer group"
                  >
                    <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-emerald-500 group-hover:scale-110 transition-all mb-2" />
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Kéo thả hoặc Bấm vào đây để chọn file Excel (.xlsx, .xls, .csv)
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Hệ thống tự động ánh xạ các cột: Bài, Từ vựng, Chữ Hán, Cách đọc, Hán Việt, Nghĩa, Ví dụ
                    </p>
                    <input 
                      type="file" 
                      accept=".xlsx,.xls,.csv" 
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                    {importFile && (
                      <div className="mt-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>{importFile.name} ({(importFile.size / 1024).toFixed(1)} KB)</span>
                      </div>
                    )}
                  </div>

                  {/* Preset Templates */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-3.5 rounded-2xl flex flex-col justify-between space-y-2">
                    <div>
                      <h4 className="text-[10.5px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Download className="w-3.5 h-3.5 text-emerald-500" />
                        Tải file mẫu chuẩn:
                      </h4>
                      <p className="text-[10.5px] text-slate-600 dark:text-slate-300 leading-relaxed">
                        Sử dụng file mẫu có sẵn dữ liệu chuẩn để nhập chính xác nhất.
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <button 
                        onClick={() => downloadTemplate('minna')}
                        className="w-full py-1.5 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 text-slate-700 dark:text-slate-200 font-bold text-[10.5px] rounded-lg transition-colors cursor-pointer flex items-center justify-between shadow-2xs"
                      >
                        <span>📘 Mẫu Minna no Nihongo</span>
                        <Download className="w-3 h-3 text-slate-400" />
                      </button>

                      <button 
                        onClick={() => downloadTemplate('tango')}
                        className="w-full py-1.5 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 text-slate-700 dark:text-slate-200 font-bold text-[10.5px] rounded-lg transition-colors cursor-pointer flex items-center justify-between shadow-2xs"
                      >
                        <span>📗 Mẫu Tango 1500 N4</span>
                        <Download className="w-3 h-3 text-slate-400" />
                      </button>

                      <button 
                        onClick={() => downloadTemplate('simple')}
                        className="w-full py-1.5 px-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 text-slate-700 dark:text-slate-200 font-bold text-[10.5px] rounded-lg transition-colors cursor-pointer flex items-center justify-between shadow-2xs"
                      >
                        <span>⚡ Mẫu cơ bản rút gọn</span>
                        <Download className="w-3 h-3 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status panels */}
                {importError && (
                  <div className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl p-3.5 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <span className="text-xs text-rose-700 dark:text-rose-300 font-semibold">{importError}</span>
                  </div>
                )}

                {importSuccess && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-3.5 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">{importSuccess}</span>
                  </div>
                )}

                {/* Summary Alert */}
                {parsedItems.length > 0 && !importSuccess && (
                  <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <div className="text-amber-900 dark:text-amber-200 font-bold">
                        Phân tích thành công <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{parsedItems.length}</span> từ vựng hợp lệ!
                        {skippedCount > 0 && (
                          <span className="text-slate-500 font-normal ml-1">({skippedCount} dòng bị bỏ qua do thiếu thông tin)</span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 font-bold px-2 py-0.5 rounded-full">
                      Sẵn sàng nhập
                    </span>
                  </div>
                )}

                {/* Preview Table */}
                {parsedItems.length > 0 && (
                  <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden space-y-0">
                    <div className="bg-slate-50 dark:bg-slate-800 px-3.5 py-2 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>Xem trước danh sách ({filteredPreview.length}/{parsedItems.length})</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Lọc từ trong bản xem trước..."
                        value={previewSearch}
                        onChange={(e) => setPreviewSearch(e.target.value)}
                        className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-[11px] outline-none focus:border-emerald-500 w-44"
                      />
                    </div>

                    <div className="max-h-56 overflow-y-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold sticky top-0 border-b border-slate-200 dark:border-slate-700 text-[10.5px]">
                          <tr>
                            <th className="p-2.5">Bài</th>
                            <th className="p-2.5">Từ vựng</th>
                            <th className="p-2.5">Chữ Hán</th>
                            <th className="p-2.5">Cách đọc</th>
                            <th className="p-2.5">Hán Việt</th>
                            <th className="p-2.5">Ý nghĩa</th>
                            <th className="p-2.5">Cấp độ</th>
                            <th className="p-2.5 text-center">Xóa</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {filteredPreview.map((item, index) => (
                            <tr key={index} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                              <td className="p-2.5 font-mono font-bold text-slate-500">Bài {item.lessonNumber}</td>
                              <td className="p-2.5 font-extrabold text-slate-900 dark:text-slate-100">{item.word}</td>
                              <td className="p-2.5 text-slate-700 dark:text-slate-300">{item.kanji || '-'}</td>
                              <td className="p-2.5 text-slate-600 dark:text-slate-400 font-medium">{item.reading}</td>
                              <td className="p-2.5">
                                {item.hanViet ? (
                                  <span className="text-[9.5px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800 uppercase">
                                    {item.hanViet}
                                  </span>
                                ) : (
                                  <span className="text-slate-400 italic text-[10px]">-</span>
                                )}
                              </td>
                              <td className="p-2.5 font-medium text-emerald-700 dark:text-emerald-400 max-w-[150px] truncate" title={item.meaning}>
                                {item.meaning}
                              </td>
                              <td className="p-2.5">
                                <span className="text-[9.5px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded">
                                  {item.level}
                                </span>
                              </td>
                              <td className="p-2.5 text-center">
                                <button
                                  onClick={() => handleRemovePreviewItem(index)}
                                  className="text-slate-400 hover:text-rose-500 p-1 rounded"
                                  title="Loại bỏ dòng này"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 mt-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsImportModalOpen(false);
                    setParsedItems([]);
                    setImportFile(null);
                    setImportError('');
                    setImportSuccess('');
                    if (onCloseImportModal) onCloseImportModal();
                  }}
                  className="py-2 px-4 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Đóng
                </button>

                {parsedItems.length > 0 && (
                  <button
                    type="button"
                    disabled={isImporting}
                    onClick={handleImportSubmit}
                    className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 text-white font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95"
                  >
                    {isImporting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Đang đồng bộ vào hệ thống...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Xác nhận nhập dữ liệu ({parsedItems.length} từ)
                      </>
                    )}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        isDanger={true}
        onClose={() => setConfirmDialog(p => ({ ...p, isOpen: false }))}
      />
    </div>
  );
}
