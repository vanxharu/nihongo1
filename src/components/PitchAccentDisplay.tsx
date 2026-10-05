import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useDialogFocus } from '../hooks/useDialogFocus';
import { getPitchAccent, calculateMoraPitches } from '../utils/pitchAccent';
import { Volume2, X } from 'lucide-react';
import { speakJapanese } from '../utils/audio';

interface PitchAccentDisplayProps {
  kanji: string;
  reading: string;
  showExplanation?: boolean;
  className?: string;
  variant?: 'badge' | 'transparent';
}

function PitchAccentDisplayComponent({
  kanji,
  reading,
  showExplanation = false,
  className = '',
  variant = 'badge'
}: PitchAccentDisplayProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const dialogRef = useDialogFocus(showTooltip, () => setShowTooltip(false));
  const accent = useMemo(() => getPitchAccent(kanji, reading), [kanji, reading]);
  const pitches = useMemo(() => calculateMoraPitches(reading, accent.type), [reading, accent.type]);

  // Helper for pitch type details
  const details = useMemo(() => {
    const type = accent.type;
    const N = pitches.length;
    if (type === 0) {
      return {
        label: 'Heiban (平板)',
        vietnameseName: 'Bằng phẳng (Heiban)',
        short: '⓪',
        badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60',
        lineColor: 'border-emerald-500',
        particleHigh: true,
        particleText: 'Trợ từ "ga" đi kèm giữ GIỌNG CAO',
      };
    }
    if (type === 1) {
      return {
        label: 'Atamadaka (頭高)',
        vietnameseName: 'Cao đầu (Atamadaka)',
        short: '①',
        badgeClass: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/60',
        lineColor: 'border-rose-500',
        particleHigh: false,
        particleText: 'Trợ từ "ga" đi kèm GIỌNG THẤP',
      };
    }
    if (type === N && N > 1) {
      return {
        label: 'Odaka (尾高)',
        vietnameseName: 'Cao đuôi (Odaka)',
        short: `[${type}]`,
        badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60',
        lineColor: 'border-amber-500',
        particleHigh: false,
        particleText: 'Trợ từ "ga" đi kèm GIỌNG THẤP',
      };
    }
    return {
      label: 'Nakadaka (中高)',
      vietnameseName: `Cao giữa (Nakadaka)`,
      short: `[${type}]`,
      badgeClass: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60',
      lineColor: 'border-indigo-500',
      particleHigh: false,
      particleText: 'Trợ từ "ga" đi kèm GIỌNG THẤP',
    };
  }, [accent.type, pitches.length]);

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      {/* Mini Interactive Badge */}
      <div 
        role="button" tabIndex={0} aria-expanded={showTooltip} aria-label="Xem cao độ phát âm"
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); setShowTooltip(!showTooltip); } if (e.key === "Escape") setShowTooltip(false); }}
        onClick={(e) => { e.stopPropagation(); setShowTooltip(!showTooltip); }}
        className={`group relative inline-flex items-center gap-2 ${variant === 'badge' ? 'px-2 py-1 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 rounded-lg shadow-3xs hover:shadow-2xs' : 'px-1 py-0.5'} transition-all cursor-pointer select-none`}
      >
        {/* Simplified Overline Pitch Notation */}
        <div className="flex items-end font-mono text-xs sm:text-sm font-semibold tracking-wide">
          {pitches.map((p, idx) => {
            // Standard dictionary style overline markup
            let borderStyle = "border-t border-transparent pt-0.5 px-0.25";
            let textColor = variant === 'transparent' ? "text-blue-300/70" : "text-slate-500 dark:text-slate-400";
            
            if (p.isHigh) {
              borderStyle = variant === 'transparent' ? "border-t-2 border-orange-500 pt-0.5 px-0.25" : "border-t-2 border-slate-700 dark:border-slate-300 pt-0.5 px-0.25";
              textColor = variant === 'transparent' ? "text-blue-300 font-extrabold" : "text-slate-800 dark:text-slate-100 font-extrabold";
            }
            if (p.hasDrop) {
              // Right border represents pitch drop
              borderStyle = variant === 'transparent' ? "border-t-2 border-r-2 border-orange-500 rounded-tr-[2px] pt-0.5 px-0.25 pr-0.5" : "border-t-2 border-r border-rose-500 dark:border-rose-400 rounded-tr-xs pt-0.5 px-0.25 pr-0.5";
              textColor = variant === 'transparent' ? "text-blue-300 font-extrabold" : "text-slate-800 dark:text-slate-100 font-extrabold";
            }
            
            return (
              <span key={idx} className={`${borderStyle} ${textColor} relative inline-block transition-colors duration-200`}>
                {p.char}
              </span>
            );
          })}
        </div>

        {/* Pitch type badge indicator */}
        {variant === 'badge' && (
          <span className={`text-[9px] font-bold font-mono px-1 py-0.25 rounded-md border shadow-3xs transition-all ${details.badgeClass}`}>
            {details.short}
          </span>
        )}
      </div>

      {/* Tooltip detail card */}
      {showTooltip && createPortal(
        <div className="fixed inset-0 z-[230] flex items-center justify-center p-4 bg-black/30" onClick={(e) => { e.stopPropagation(); setShowTooltip(false); }}>
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Cao độ phát âm" onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 p-4 rounded-xl shadow-xl max-w-full w-72 border border-slate-200/90 dark:border-slate-800/80 space-y-3 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
              <span className="font-extrabold text-xs text-slate-900 dark:text-slate-50">
                {accent.vietnameseName}
              </span>
              <button type="button" aria-label="Đóng cao độ" onClick={() => setShowTooltip(false)} className="p-2 rounded-lg"><X className="w-4 h-4" /></button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  speakJapanese(reading || kanji);
                }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-md text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors cursor-pointer"
                title="Nghe phát âm"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {accent.explanation}
            </p>

            <div className="p-2 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-800 text-xs leading-relaxed text-slate-400 dark:text-slate-500 font-semibold">
              <span className="text-slate-600 dark:text-slate-300 block mb-0.5">Trợ từ đi kèm (が):</span>
              {details.particleText}
            </div>
          </div>
        </div>, document.getElementById('app-root-container') || document.body
      )}

      {/* Static inline description if requested */}
      {showExplanation && (
        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold block mt-1 text-center max-w-xs leading-none">
          {details.label}
        </span>
      )}
    </div>
  );
}

const PitchAccentDisplay = React.memo(PitchAccentDisplayComponent);
export default PitchAccentDisplay;
