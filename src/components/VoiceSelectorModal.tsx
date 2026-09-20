import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, Check, X, Sparkles, Smartphone, Play, Square } from 'lucide-react';
import { 
  AzureVoiceChoice, 
  getPreferredVoice, 
  setPreferredVoice, 
  speakJapanese, 
  PRESET_JAPANESE_VOICES, 
  getDeviceJapaneseVoices,
  JapaneseVoiceOption 
} from '../utils/audio';

interface VoiceSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVoiceSelected?: (voice: AzureVoiceChoice) => void;
}

export default function VoiceSelectorModal({
  isOpen,
  onClose,
  onVoiceSelected,
}: VoiceSelectorModalProps) {
  const [selectedVoice, setSelectedVoice] = useState<AzureVoiceChoice>(getPreferredVoice());
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [deviceVoices, setDeviceVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [activeTab, setActiveTab] = useState<'neural' | 'device'>('neural');

  // Load and refresh available device voices
  useEffect(() => {
    const updateVoices = () => {
      const voices = getDeviceJapaneseVoices();
      setDeviceVoices(voices);
    };

    updateVoices();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
      };
    }
  }, []);

  // Synchronize with external voice changes
  useEffect(() => {
    const handleVoiceChanged = (e: any) => {
      if (e.detail?.voice) {
        setSelectedVoice(e.detail.voice);
      } else {
        setSelectedVoice(getPreferredVoice());
      }
    };

    window.addEventListener('jlpt_voice_changed', handleVoiceChanged);
    return () => {
      window.removeEventListener('jlpt_voice_changed', handleVoiceChanged);
    };
  }, []);

  // Update selected voice when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedVoice(getPreferredVoice());
      setPlayingVoiceId(null);
    } else {
      // Stop audio preview when closed
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [isOpen]);

  const handleSelectVoice = useCallback((voiceId: AzureVoiceChoice) => {
    setSelectedVoice(voiceId);
    setPreferredVoice(voiceId);
    if (onVoiceSelected) {
      onVoiceSelected(voiceId);
    }
    // Close modal upon selection
    setTimeout(() => {
      onClose();
    }, 200);
  }, [onClose, onVoiceSelected]);

  const handlePreviewVoice = useCallback((e: React.MouseEvent, voiceOption: JapaneseVoiceOption | { id: string; name: string; sampleText: string }) => {
    e.stopPropagation();

    if (playingVoiceId === voiceOption.id) {
      // Stop playing
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setPlayingVoiceId(null);
      return;
    }

    setPlayingVoiceId(voiceOption.id);

    const sample = voiceOption.sampleText || 'こんにちは！日本語の勉強を一緒に頑張りましょう！';
    speakJapanese(
      sample,
      1.0,
      () => setPlayingVoiceId(null),
      { voice: voiceOption.id as AzureVoiceChoice, isSentence: true }
    );
  }, [playingVoiceId]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4 transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full sm:max-w-md bg-[#0E1322] border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle */}
        <div className="w-full pt-3 pb-1 flex justify-center sm:hidden">
          <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-amber-400" />
                Chọn giọng đọc tiếng Nhật
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Phát âm chuẩn bản xứ dùng cho hội thoại, từ vựng & đề thi
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher (AI Neural vs Device Voices) */}
        {deviceVoices.length > 0 && (
          <div className="px-5 pt-3 shrink-0">
            <div className="grid grid-cols-2 gap-1 p-1 bg-[#161D31] rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('neural')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'neural'
                    ? 'bg-[#E89A3C] text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Giọng đọc AI Chuẩn (7)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('device')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'device'
                    ? 'bg-[#E89A3C] text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Giọng máy ({deviceVoices.length})
              </button>
            </div>
          </div>
        )}

        {/* Voice List */}
        <div className="p-4 space-y-2.5 overflow-y-auto max-h-[60vh] scrollbar-thin">
          {activeTab === 'neural' ? (
            PRESET_JAPANESE_VOICES.map((v) => {
              const isSelected = selectedVoice === v.id || 
                (v.id.includes('Nanami') && selectedVoice === 'nanami') ||
                (v.id.includes('Keita') && selectedVoice === 'keita');
              const isPlaying = playingVoiceId === v.id;

              return (
                <div
                  key={v.id}
                  onClick={() => handleSelectVoice(v.id as AzureVoiceChoice)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/80 ring-1 ring-amber-500/50 shadow-md shadow-amber-950/20'
                      : 'bg-[#151B2E] border-slate-800 hover:border-slate-700 hover:bg-[#1A223B]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Gender Icon / Avatar */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-bold text-lg ${
                      v.gender === 'female' 
                        ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' 
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {v.gender === 'female' ? '👩' : '👨'}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-white">
                          {v.name}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                          v.gender === 'female'
                            ? 'bg-pink-950/60 text-pink-300 border border-pink-800/40'
                            : 'bg-blue-950/60 text-blue-300 border border-blue-800/40'
                        }`}>
                          {v.genderLabel}
                        </span>
                        {v.badge && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            {v.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                        {v.description}
                      </p>
                    </div>
                  </div>

                  {/* Right Actions: Test Play Button & Selected Checkmark */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handlePreviewVoice(e, v)}
                      title={isPlaying ? 'Dừng đọc thử' : 'Nghe thử giọng này'}
                      className={`min-w-[44px] min-h-[44px] px-2.5 rounded-xl border flex items-center justify-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                        isPlaying
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm animate-pulse'
                          : 'bg-[#1E2742] border-slate-700 text-slate-300 hover:bg-[#283457] hover:text-white'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span className="text-[11px]">Dừng</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span className="text-[11px]">Thử</span>
                        </>
                      )}
                    </button>

                    <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950'
                        : 'border border-slate-700 text-transparent'
                    }`}>
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            // Device Voices
            deviceVoices.map((v) => {
              const voiceId = `device:${v.name}`;
              const isSelected = selectedVoice === voiceId;
              const isPlaying = playingVoiceId === voiceId;

              return (
                <div
                  key={v.name}
                  onClick={() => handleSelectVoice(voiceId as AzureVoiceChoice)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/80 ring-1 ring-amber-500/50 shadow-md shadow-amber-950/20'
                      : 'bg-[#151B2E] border-slate-800 hover:border-slate-700 hover:bg-[#1A223B]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0 text-lg">
                      📱
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-white truncate">
                        {v.name}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {v.lang} • Giọng thiết bị
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handlePreviewVoice(e, {
                        id: voiceId,
                        name: v.name,
                        sampleText: 'こんにちは！お使いの端末の音声です。'
                      })}
                      className={`min-w-[44px] min-h-[44px] px-2.5 rounded-xl border flex items-center justify-center gap-1 text-xs font-bold transition-all cursor-pointer ${
                        isPlaying
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm animate-pulse'
                          : 'bg-[#1E2742] border-slate-700 text-slate-300 hover:bg-[#283457] hover:text-white'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span className="text-[11px]">Dừng</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span className="text-[11px]">Thử</span>
                        </>
                      )}
                    </button>

                    <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950'
                        : 'border border-slate-700 text-transparent'
                    }`}>
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer / Info Banner */}
        <div className="p-4 border-t border-slate-800/80 bg-[#0B0F1B] flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-400">
            Đang chọn: <span className="font-bold text-amber-400">{selectedVoice.replace('ja-JP-', '').replace('Neural', '').replace('device:', '')}</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
