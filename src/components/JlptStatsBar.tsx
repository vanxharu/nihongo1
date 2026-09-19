/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { JlptStats } from '../types';
import { ExternalLink, Share2, Facebook, Copy, Check, Filter, X, List } from 'lucide-react';
import { JLPT_LEVEL_CONFIG } from './JlptUnderlineArticle';

interface JlptStatsBarProps {
  stats?: JlptStats | null;
  sourceName?: string;
  sourceUrl?: string;
  selectedFilter: 'N1' | 'N2' | 'N3' | 'N4' | 'N5' | null;
  onSelectFilter: (level: 'N1' | 'N2' | 'N3' | 'N4' | 'N5' | null) => void;
  onOpenLevelWordsModal?: (level: 'N1' | 'N2' | 'N3' | 'N4' | 'N5') => void;
  articleTitle?: string;
}

export const JlptStatsBar: React.FC<JlptStatsBarProps> = ({
  stats,
  sourceName = 'TODAII',
  sourceUrl,
  selectedFilter,
  onSelectFilter,
  onOpenLevelWordsModal,
  articleTitle = 'Bài đọc tiếng Nhật'
}) => {
  const [copied, setCopied] = useState(false);

  // If no stats provided, calculate defaults or return null
  if (!stats) return null;

  const levels: Array<{ key: 'N5' | 'N4' | 'N3' | 'N2' | 'N1'; count: number; percent: number }> = [
    { key: 'N5', count: stats.n5, percent: stats.n5Percent },
    { key: 'N4', count: stats.n4, percent: stats.n4Percent },
    { key: 'N3', count: stats.n3, percent: stats.n3Percent },
    { key: 'N2', count: stats.n2, percent: stats.n2Percent },
    { key: 'N1', count: stats.n1, percent: stats.n1Percent }
  ];

  const handleCopyLink = () => {
    const url = sourceUrl || window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleShareFacebook = () => {
    const url = encodeURIComponent(sourceUrl || window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="pt-4 border-t border-slate-800/80 space-y-3 select-none">
      {/* Top row: Source & Share (Exact match to Todaii layout) */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-medium">Nguồn:</span>
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 transition"
            >
              <span>{sourceName || 'TODAII'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className="font-bold text-indigo-400">{sourceName || 'TODAII'}</span>
          )}
        </div>

        {/* Social Share Buttons */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Chia sẻ:</span>
          <button
            type="button"
            onClick={handleShareFacebook}
            className="w-6 h-6 rounded-md bg-[#1877F2]/20 hover:bg-[#1877F2]/40 text-[#1877F2] border border-[#1877F2]/40 flex items-center justify-center transition cursor-pointer"
            title="Chia sẻ lên Facebook"
          >
            <Facebook className="w-3.5 h-3.5 fill-current" />
          </button>
          <button
            type="button"
            onClick={handleCopyLink}
            className={`w-6 h-6 rounded-md flex items-center justify-center border transition cursor-pointer ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
            title="Sao chép liên kết bài viết"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Bottom row: The 5 JLPT Pills matching user's screenshot */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {levels.map(({ key, count, percent }) => {
          const config = JLPT_LEVEL_CONFIG[key];
          const isSelected = selectedFilter === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectFilter(isSelected ? null : key)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                config.badgeBg
              } ${config.badgeBorder} ${
                isSelected
                  ? `ring-2 ring-offset-1 ring-offset-slate-950 ${config.badgeText} shadow-md scale-105`
                  : 'hover:brightness-125'
              }`}
              title={`Cấp độ ${key}: ${count} từ (${percent}%). Nhấn để bật/tắt lọc trong bài.`}
            >
              {/* Level Tag Pill */}
              <span className={`px-1.5 py-0.2 rounded text-[11px] font-extrabold ${config.badgeText}`}>
                {key}
              </span>
              {/* Percentage */}
              <span className="text-white font-mono font-semibold">
                {percent}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Filter Notification with Clear and View List options */}
      {selectedFilter && (
        <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-300 animate-fadeIn">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                JLPT_LEVEL_CONFIG[selectedFilter].badgeBg
              } ${JLPT_LEVEL_CONFIG[selectedFilter].badgeBorder} border`}
            />
            <span>
              Đang làm nổi bật từ vựng cấp độ{' '}
              <strong className={JLPT_LEVEL_CONFIG[selectedFilter].badgeText}>{selectedFilter}</strong> trong bài đọc
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onOpenLevelWordsModal && (
              <button
                type="button"
                onClick={() => onOpenLevelWordsModal(selectedFilter)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer"
              >
                <List className="w-3 h-3" />
                <span>Xem danh sách</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onSelectFilter(null)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer"
              title="Tắt lọc"
            >
              <X className="w-3.5 h-3.5" />
              <span>Bỏ lọc</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(JlptStatsBar);
