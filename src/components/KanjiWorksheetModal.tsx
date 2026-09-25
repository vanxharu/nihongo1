import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  CheckSquare, 
  Square, 
  Settings, 
  Grid, 
  FileText, 
  Sliders,
  Type,
  Check
} from 'lucide-react';
import { KanjiItem } from '../types';

interface KanjiWorksheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  kanjiList: KanjiItem[];
  defaultLevel: string;
}

export default function KanjiWorksheetModal({
  isOpen,
  onClose,
  kanjiList,
  defaultLevel
}: KanjiWorksheetModalProps) {
  // Filter state
  const [selectedLevel, setSelectedLevel] = useState<string>(defaultLevel || 'N5');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected kanji IDs for the sheet
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Sheet Customization Settings
  const [sheetTitle, setSheetTitle] = useState(`Bảng luyện viết Hán tự ${selectedLevel === 'ALL' ? '' : selectedLevel}`);
  const [gridStyle, setGridStyle] = useState<'cross' | 'grid' | 'dot'>('cross'); // cross: 田, grid: 囗, dot: ┼
  const [gridSize, setGridSize] = useState<'lg' | 'md' | 'sm'>('md'); // lg: 52px, md: 42px, sm: 34px
  const [traceCount, setTraceCount] = useState<number>(4); // Number of gray trace boxes
  const [blankCount, setBlankCount] = useState<number>(6); // Number of blank boxes
  const [showStrokes, setShowStrokes] = useState<boolean>(true);
  const [showReadings, setShowReadings] = useState<boolean>(true);
  const [showMeaning, setShowMeaning] = useState<boolean>(true);
  const [showExamples, setShowExamples] = useState<boolean>(true);
  const [showNotesArea, setShowNotesArea] = useState<boolean>(true);

  // Available kanjis for selected level
  const filteredKanjis = kanjiList.filter(k => {
    if (selectedLevel !== 'ALL' && k.level !== selectedLevel) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        k.character.includes(q) ||
        k.meaning.toLowerCase().includes(q) ||
        k.onyomi.toLowerCase().includes(q) ||
        k.kunyomi.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Auto initialize selected IDs if empty when opened
  useEffect(() => {
    if (isOpen && selectedIds.length === 0 && filteredKanjis.length > 0) {
      setSelectedIds(filteredKanjis.slice(0, 10).map(k => k.id));
    }
  }, [isOpen, selectedLevel, kanjiList]);

  if (!isOpen) return null;

  // Update selection when level changes
  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
    const newFiltered = kanjiList.filter(k => level === 'ALL' || k.level === level);
    setSelectedIds(newFiltered.slice(0, 12).map(k => k.id));
    setSheetTitle(`Bảng luyện viết Hán tự ${level === 'ALL' ? 'JLPT' : level}`);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredKanjis.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredKanjis.map(k => k.id));
    }
  };

  const toggleSelectKanji = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Selected Kanji items to render in worksheet
  const kanjisToRender = kanjiList.filter(k => selectedIds.includes(k.id));

  // Handle Print Action
  const handlePrint = () => {
    window.print();
  };

  // Handle Download Standalone HTML file for offline printing
  const handleDownloadHtml = () => {
    const boxPixelSize = gridSize === 'lg' ? '54px' : gridSize === 'md' ? '44px' : '36px';
    const fontPixelSize = gridSize === 'lg' ? '32px' : gridSize === 'md' ? '26px' : '20px';

    const itemsHtml = kanjisToRender.map((k, idx) => {
      const traceBoxes = Array.from({ length: traceCount }).map(() => `
        <div class="grid-box trace-box">${k.character}</div>
      `).join('');

      const blankBoxes = Array.from({ length: blankCount }).map(() => `
        <div class="grid-box blank-box"></div>
      `).join('');

      const examplesHtml = showExamples && k.exampleWords && k.exampleWords.length > 0 ? `
        <div class="examples-row">
          <strong>Ví dụ:</strong> ${k.exampleWords.map(e => `${e.word} (${e.hiragana}): ${e.meaning}`).join(' • ')}
        </div>
      ` : '';

      return `
        <div class="kanji-row">
          <div class="kanji-info">
            <div class="kanji-main-char">${k.character}</div>
            <div class="kanji-meta">
              <div class="kanji-meaning">${idx + 1}. ${k.meaning.toUpperCase()}</div>
              ${showStrokes ? `<div class="kanji-sub">${k.strokesCount} nét • ${k.level}</div>` : ''}
              ${showReadings ? `<div class="kanji-sub"><strong>Onyomi:</strong> ${k.onyomi}</div><div class="kanji-sub"><strong>Kunyomi:</strong> ${k.kunyomi}</div>` : ''}
            </div>
          </div>
          <div class="boxes-wrapper">
            <div class="grid-box master-box">${k.character}</div>
            ${traceBoxes}
            ${blankBoxes}
          </div>
          ${examplesHtml}
        </div>
      `;
    }).join('');

    const fullHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${sheetTitle}</title>
  <style>
    @page { size: A4; margin: 12mm; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      margin: 0;
      padding: 20px;
      color: #1e293b;
      background: #fff;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .header h1 {
      margin: 0 0 6px 0;
      font-size: 22px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .header p {
      margin: 0;
      font-size: 12px;
      color: #64748b;
    }
    .kanji-row {
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px dashed #cbd5e1;
      page-break-inside: avoid;
    }
    .kanji-info {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
    }
    .kanji-main-char {
      font-size: 32px;
      font-weight: bold;
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8fafc;
      border: 1px solid #94a3b8;
      border-radius: 6px;
    }
    .kanji-meta {
      font-size: 12px;
      line-height: 1.4;
    }
    .kanji-meaning {
      font-weight: bold;
      color: #0f172a;
      font-size: 13px;
    }
    .kanji-sub {
      color: #475569;
    }
    .boxes-wrapper {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .grid-box {
      width: ${boxPixelSize};
      height: ${boxPixelSize};
      border: 1px solid #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${fontPixelSize};
      font-family: 'Kozuka Gothic Pro', 'Hiragino Sans', 'Meiryo', sans-serif;
      position: relative;
      background-image: 
        linear-gradient(to right, transparent 49%, #cbd5e1 50%, transparent 51%),
        linear-gradient(to bottom, transparent 49%, #cbd5e1 50%, transparent 51%);
    }
    .master-box {
      font-weight: bold;
      color: #0f172a;
      border: 2px solid #0f172a;
      background-color: #f1f5f9;
    }
    .trace-box {
      color: #cbd5e1;
      font-weight: normal;
    }
    .blank-box {
      color: transparent;
    }
    .examples-row {
      margin-top: 6px;
      font-size: 11px;
      color: #475569;
      background: #f8fafc;
      padding: 4px 8px;
      border-radius: 4px;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
      padding-top: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${sheetTitle}</h1>
    <p>Tổng số Hán tự: ${kanjisToRender.length} chữ | Ngày tạo: ${new Date().toLocaleDateString('vi-VN')}</p>
  </div>

  ${itemsHtml}

  ${showNotesArea ? `
    <div style="margin-top:24px; border:1px solid #cbd5e1; padding:12px; border-radius:6px; page-break-inside:avoid;">
      <strong style="font-size:12px;">GHI CHÚ / TỪ VỰNG TỰ ÔN TẬP:</strong>
      <div style="height:80px; margin-top:8px; border-top:1px dashed #e2e8f0;"></div>
    </div>
  ` : ''}

  <div class="footer">
    Học tiếng Nhật cùng ứng dụng Nhại Kanji - Chúc bạn luyện tập hiệu quả!
  </div>

  <script>
    window.onload = function() {
      // Auto open print dialog if requested
    };
  </script>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sheetTitle.replace(/\s+/g, '_')}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      
      {/* Container - hide in print mode for standard layout, handle print styles */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Header bar (Hidden during print) */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Tạo File Luyện Viết Kanji
                <span className="px-2 py-0.5 text-[10px] bg-indigo-100 text-indigo-700 font-extrabold rounded-full">
                  Genkouyoushi
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Tùy chỉnh các mẫu ô vuông tập viết, in ấn PDF hoặc xuất file HTML học tập
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadHtml}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Tải về file HTML chuẩn in ấn"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Tải HTML</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In / Xuất PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden print:block">
          
          {/* Left Column: Control Settings & Character Selector (Hidden during print) */}
          <div className="lg:col-span-5 p-5 border-r border-slate-100 overflow-y-auto space-y-6 bg-slate-50/50 print:hidden">
            
            {/* Sheet Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-indigo-500" />
                Tiêu đề trang luyện viết
              </label>
              <input
                type="text"
                value={sheetTitle}
                onChange={e => setSheetTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-white"
                placeholder="Nhập tiêu đề trang luyện viết..."
              />
            </div>

            {/* Level & Character Filters */}
            <div className="space-y-3 pt-2 border-t border-slate-200/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Trình độ Kanji</label>
                <span className="text-[11px] text-slate-500 font-semibold">
                  Đã chọn {selectedIds.length} / {filteredKanjis.length} chữ
                </span>
              </div>

              <div className="flex gap-1.5">
                {['N5', 'N4', 'N3', 'N2', 'N1', 'ALL'].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => handleLevelChange(lvl)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      selectedLevel === lvl
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {lvl === 'ALL' ? 'Tất cả' : lvl}
                  </button>
                ))}
              </div>

              {/* Character selection box */}
              <div className="bg-white border border-slate-200 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Tìm chữ, nghĩa..."
                    className="flex-1 px-2.5 py-1 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={toggleSelectAll}
                    className="px-2 py-1 text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    {selectedIds.length === filteredKanjis.length ? (
                      <>
                        <CheckSquare className="w-3.5 h-3.5" />
                        Bỏ chọn
                      </>
                    ) : (
                      <>
                        <Square className="w-3.5 h-3.5" />
                        Chọn hết
                      </>
                    )}
                  </button>
                </div>

                {/* Character Grid Picker */}
                <div className="max-h-40 overflow-y-auto grid grid-cols-6 gap-1.5 p-1 scrollbar-thin">
                  {filteredKanjis.map(k => {
                    const isSelected = selectedIds.includes(k.id);
                    return (
                      <button
                        key={k.id}
                        onClick={() => toggleSelectKanji(k.id)}
                        className={`h-9 rounded-xl font-bold text-sm flex items-center justify-center border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-xs'
                            : 'bg-slate-50 border-slate-200/80 text-slate-400 hover:bg-white hover:text-slate-700'
                        }`}
                        title={`${k.character} (${k.meaning})`}
                      >
                        {k.character}
                        {isSelected && (
                          <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Layout & Grid Customization Options */}
            <div className="space-y-3 pt-2 border-t border-slate-200/60">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                Cấu hình ô vuông & hiển thị
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] font-medium text-slate-500 block mb-1">Kích thước ô</span>
                  <div className="flex bg-white border border-slate-200 rounded-xl p-0.5">
                    {(['lg', 'md', 'sm'] as const).map(sz => (
                      <button
                        key={sz}
                        onClick={() => setGridSize(sz)}
                        className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                          gridSize === sz ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {sz === 'lg' ? 'Lớn' : sz === 'md' ? 'Vừa' : 'Nhỏ'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-medium text-slate-500 block mb-1">Kiểu ô kẻ</span>
                  <div className="flex bg-white border border-slate-200 rounded-xl p-0.5">
                    <button
                      onClick={() => setGridStyle('cross')}
                      className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                        gridStyle === 'cross' ? 'bg-indigo-600 text-white' : 'text-slate-600'
                      }`}
                      title="Ô nét đứt 田"
                    >
                      Nét đứt 田
                    </button>
                    <button
                      onClick={() => setGridStyle('grid')}
                      className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                        gridStyle === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-600'
                      }`}
                      title="Ô vuông 囗"
                    >
                      Ô vuông 囗
                    </button>
                  </div>
                </div>
              </div>

              {/* Number of trace & blank boxes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[11px] font-medium text-slate-500 block mb-1">Số ô nét mờ (Trace)</span>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={traceCount}
                    onChange={e => setTraceCount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-xl bg-white font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <span className="text-[11px] font-medium text-slate-500 block mb-1">Số ô trống tự viết</span>
                  <input
                    type="number"
                    min={1}
                    max={15}
                    value={blankCount}
                    onChange={e => setBlankCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded-xl bg-white font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Checkbox Toggles for metadata */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-medium text-slate-500 block mb-1">Thông tin chi tiết đính kèm:</span>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                    <input
                      type="checkbox"
                      checked={showStrokes}
                      onChange={e => setShowStrokes(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Số nét viết</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                    <input
                      type="checkbox"
                      checked={showReadings}
                      onChange={e => setShowReadings(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Âm Onyomi/Kunyomi</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                    <input
                      type="checkbox"
                      checked={showMeaning}
                      onChange={e => setShowMeaning(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Ý nghĩa Hán Việt</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                    <input
                      type="checkbox"
                      checked={showExamples}
                      onChange={e => setShowExamples(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Ví dụ từ ghép</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium col-span-2">
                    <input
                      type="checkbox"
                      checked={showNotesArea}
                      onChange={e => setShowNotesArea(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Thêm khung ghi chú từ vựng ở cuối trang</span>
                  </label>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Live Worksheet Printable Preview */}
          <div className="lg:col-span-7 p-6 overflow-y-auto bg-slate-200/60 print:p-0 print:bg-white print:overflow-visible">
            
            {/* Sheet Page Paper Container */}
            <div id="printable-worksheet" className="bg-white rounded-2xl border border-slate-300 shadow-md p-6 max-w-2xl mx-auto space-y-6 print:shadow-none print:border-none print:p-0 print:rounded-none">
              
              {/* Printable Header */}
              <div className="text-center border-b-2 border-slate-900 pb-3">
                <h1 className="text-xl font-black text-slate-950 uppercase tracking-wide">
                  {sheetTitle}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tổng số Kanji: {kanjisToRender.length} chữ • Ngày tạo: {new Date().toLocaleDateString('vi-VN')}
                </p>
              </div>

              {/* Kanji Rows List */}
              {kanjisToRender.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs">
                  Chưa chọn Hán tự nào. Vui lòng tick chọn chữ ở danh sách bên trái.
                </div>
              ) : (
                <div className="space-y-4">
                  {kanjisToRender.map((k, idx) => {
                    const boxSizeClass = gridSize === 'lg' ? 'w-13 h-13 text-2xl' : gridSize === 'md' ? 'w-10 h-10 text-xl' : 'w-8 h-8 text-lg';

                    return (
                      <div key={k.id} className="pb-3 border-b border-dashed border-slate-300 space-y-2 page-break-inside-avoid">
                        
                        {/* Meta header row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <span className="text-sm font-black text-slate-900 tracking-wide uppercase">
                                {k.meaning}
                              </span>
                              {showStrokes && (
                                <span className="text-[11px] text-slate-500 ml-2 font-medium">
                                  ({k.strokesCount} nét • {k.level})
                                </span>
                              )}
                            </div>
                          </div>

                          {showReadings && (
                            <div className="text-right text-[11px] text-slate-600 space-x-2">
                              {k.onyomi && k.onyomi !== 'Chưa cập nhật' && (
                                <span><strong className="text-slate-800">Âm Ôn:</strong> {k.onyomi}</span>
                              )}
                              {k.kunyomi && k.kunyomi !== 'Chưa cập nhật' && (
                                <span><strong className="text-slate-800">Âm Khôn:</strong> {k.kunyomi}</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Genkouyoushi Grid Row */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          
                          {/* Master Character Box */}
                          <div className={`${boxSizeClass} border-2 border-slate-900 bg-slate-100 rounded-sm font-bold flex items-center justify-center text-slate-950 relative select-none shrink-0 shadow-2xs`}>
                            {k.character}
                            {/* Inner crosshair lines */}
                            <div className="absolute inset-0 border-r border-b border-slate-300 border-dashed pointer-events-none" style={{ top: 0, left: 0, width: '50%', height: '50%' }} />
                          </div>

                          {/* Tracing Boxes (Grey font) */}
                          {Array.from({ length: traceCount }).map((_, tIdx) => (
                            <div
                              key={`trace-${tIdx}`}
                              className={`${boxSizeClass} border border-slate-400 bg-white rounded-sm font-medium flex items-center justify-center text-slate-300 relative select-none shrink-0`}
                            >
                              {k.character}
                              {/* Inner crosshair lines */}
                              {gridStyle === 'cross' && (
                                <div className="absolute inset-0 border-r border-b border-slate-200 border-dashed pointer-events-none" style={{ top: 0, left: 0, width: '50%', height: '50%' }} />
                              )}
                            </div>
                          ))}

                          {/* Blank Boxes for User Writing */}
                          {Array.from({ length: blankCount }).map((_, bIdx) => (
                            <div
                              key={`blank-${bIdx}`}
                              className={`${boxSizeClass} border border-slate-400 bg-white rounded-sm flex items-center justify-center relative select-none shrink-0`}
                            >
                              {gridStyle === 'cross' && (
                                <div className="absolute inset-0 border-r border-b border-slate-200 border-dashed pointer-events-none" style={{ top: 0, left: 0, width: '50%', height: '50%' }} />
                              )}
                            </div>
                          ))}

                        </div>

                        {/* Examples Row */}
                        {showExamples && k.exampleWords && k.exampleWords.length > 0 && (
                          <div className="text-[11px] text-slate-600 bg-slate-50 border border-slate-100 rounded-lg p-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="font-bold text-slate-800">Ví dụ:</span>
                            {k.exampleWords.slice(0, 3).map((ex, eIdx) => (
                              <span key={eIdx}>
                                <strong className="text-slate-900">{ex.word}</strong> ({ex.hiragana}): {ex.meaning}
                              </span>
                            ))}
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              )}

              {/* Optional Notes Box at the bottom */}
              {showNotesArea && kanjisToRender.length > 0 && (
                <div className="border border-slate-300 rounded-xl p-3 space-y-2 text-xs print:mt-6">
                  <span className="font-bold text-slate-800 uppercase tracking-wide block">
                    Ghi chú & Từ vựng cần lưu ý:
                  </span>
                  <div className="h-16 border-t border-dashed border-slate-200" />
                </div>
              )}

              {/* Printable Footer */}
              <div className="text-center text-[10px] text-slate-400 pt-3 border-t border-slate-200">
                Luyện viết Hán tự Nhật Bản • Ứng dụng Nhại Kanji
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* Print Specific CSS Overrides */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          /* Hide non-printable elements */
          nav, header, sidebar, button, .print\\:hidden {
            display: none !important;
          }
          #app-main-view {
            overflow: visible !important;
          }
          #printable-worksheet {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .page-break-inside-avoid {
            page-break-inside: avoid;
          }
        }
      `}</style>

    </div>
  );
}
