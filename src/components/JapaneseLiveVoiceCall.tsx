import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Globe, 
  Languages, 
  Lightbulb, 
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Plus,
  Brain,
  Sparkles,
  RotateCcw, 
  X, 
  Send,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Zap,
  Volume1,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { speakJapanese } from '../utils/audio';
import { AiPersona } from './JapaneseAiChat';

export interface VoiceChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  furiganaHtml?: string;
  romaji?: string;
  vietnamese?: string;
  explanation?: string;
  correctionAdvice?: string;
  liked?: boolean;
  disliked?: boolean;
  topicTag?: string;
}

export interface JapaneseLiveVoiceCallProps {
  isOpen: boolean;
  onClose: () => void;
  persona: AiPersona;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  onPersonaChange: (persona: AiPersona) => void;
  onLevelChange: (level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1') => void;
  availablePersonas: AiPersona[];
  onMessageLogged?: (msg: {
    sender: 'user' | 'ai';
    text: string;
    furigana?: string;
    furiganaHtml?: string;
    romaji?: string;
    explanation?: string;
    correctionAdvice?: string;
    vietnameseTranslation?: string;
  }) => void;
}

export default function JapaneseLiveVoiceCall({
  isOpen,
  onClose,
  persona,
  level,
  onPersonaChange,
  onLevelChange,
  availablePersonas,
  onMessageLogged
}: JapaneseLiveVoiceCallProps) {
  // Call status: 'idle' | 'listening' | 'recording' | 'processing' | 'speaking' | 'muted'
  const [callStatus, setCallStatus] = useState<'idle' | 'listening' | 'recording' | 'processing' | 'speaking' | 'muted'>('listening');
  const [callDuration, setCallDuration] = useState<number>(0);
  
  // Microphone permission & visualizer state
  const [micErrorMsg, setMicErrorMsg] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0); // 0 to 100

  // Messages List (ChatGPT Stream style)
  const [messages, setMessages] = useState<VoiceChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Interaction options
  const [isHandsFree, setIsHandsFree] = useState<boolean>(true);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [showFurigana, setShowFurigana] = useState<boolean>(true);
  const [showVietnamese, setShowVietnamese] = useState<boolean>(true);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  
  // Popups & Drawers
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState<boolean>(false);
  const [isReasoningOpen, setIsReasoningOpen] = useState<boolean>(false);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // Live Recognition Text & Streaming Word State (ChatGPT Real-Time streaming)
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [liveInterimChunk, setLiveInterimChunk] = useState<string>('');
  const [liveFinalChunk, setLiveFinalChunk] = useState<string>('');
  const [silenceProgress, setSilenceProgress] = useState<number>(0);
  const silenceIntervalRef = useRef<any>(null);
  
  // References
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  
  const isSpeakingRef = useRef<boolean>(false);
  const isProcessingRef = useRef<boolean>(false);
  const isMutedRef = useRef<boolean>(false);
  const silenceTimerRef = useRef<any>(null);
  const conversationHistoryRef = useRef<Array<{ sender: 'user' | 'ai'; text: string }>>([]);

  isMutedRef.current = isMicMuted;

  // Auto scroll to bottom smoothly
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, liveTranscript, callStatus]);

  // Call duration timer
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Request Microphone Access & Setup Real-time Audio Level Analyser
  const requestMicAccess = async (): Promise<boolean> => {
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      mediaStreamRef.current = stream;
      setMicErrorMsg(null);

      // Web Audio API volume detection
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const updateAudioLevel = () => {
          if (!analyserRef.current || isMutedRef.current) {
            setAudioLevel(0);
            animFrameRef.current = requestAnimationFrame(updateAudioLevel);
            return;
          }
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const normalized = Math.min(100, Math.round((avg / 128) * 100));
          setAudioLevel(normalized);
          animFrameRef.current = requestAnimationFrame(updateAudioLevel);
        };
        updateAudioLevel();
      }

      return true;
    } catch (err: any) {
      console.warn("Microphone access error:", err);
      setMicErrorMsg("Không thể truy cập Microphone. Vui lòng cấp quyền Microphone trên trình duyệt.");
      return false;
    }
  };

  // Start Real-time Speech Recognition
  const startSpeechRecognition = () => {
    if (isMutedRef.current || isSpeakingRef.current || isProcessingRef.current) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      try {
        if (recognitionRef.current) {
          try { recognitionRef.current.abort(); } catch (e) {}
        }

        const rec = new SpeechRecognition();
        rec.lang = 'ja-JP';
        rec.continuous = true;
        rec.interimResults = true;
        rec.maxAlternatives = 1;

        rec.onstart = () => {
          if (!isMutedRef.current && !isSpeakingRef.current) {
            setCallStatus('listening');
          }
        };

        rec.onresult = (event: any) => {
          if (isSpeakingRef.current || isProcessingRef.current) return;

          let finalStr = '';
          let interimStr = '';

          for (let i = 0; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalStr += transcript;
            } else {
              interimStr += transcript;
            }
          }

          const combinedText = (finalStr + (interimStr ? ' ' + interimStr : '')).trim();
          
          if (combinedText) {
            setLiveFinalChunk(finalStr.trim());
            setLiveInterimChunk(interimStr.trim());
            setLiveTranscript(combinedText);

            // If hands-free mode is enabled, auto-send after 1.5s of silence
            if (isHandsFree) {
              if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
              if (silenceIntervalRef.current) clearInterval(silenceIntervalRef.current);
              
              setSilenceProgress(0);
              const startTime = Date.now();
              const SILENCE_DURATION = 1500;

              silenceIntervalRef.current = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(100, Math.round((elapsed / SILENCE_DURATION) * 100));
                setSilenceProgress(progress);
                if (progress >= 100) {
                  clearInterval(silenceIntervalRef.current);
                }
              }, 50);

              silenceTimerRef.current = setTimeout(() => {
                if (combinedText && !isSpeakingRef.current && !isProcessingRef.current) {
                  setSilenceProgress(100);
                  handleProcessUserUtterance(combinedText);
                }
              }, SILENCE_DURATION);
            }
          }
        };

        rec.onerror = (err: any) => {
          if (err.error !== 'no-speech' && err.error !== 'aborted') {
            console.warn("Speech recognition error:", err.error);
          }
          if (err.error === 'not-allowed') {
            setMicErrorMsg("Quyền Micro bị chặn. Vui lòng cho phép Micro trên thanh địa chỉ.");
            setCallStatus('muted');
          }
        };

        rec.onend = () => {
          if (!isMutedRef.current && !isSpeakingRef.current && !isProcessingRef.current && isOpen) {
            try {
              rec.start();
            } catch (e) {}
          }
        };

        recognitionRef.current = rec;
        rec.start();
      } catch (err) {
        console.warn("Speech recognition init error:", err);
      }
    }
  };

  const stopSpeechRecognition = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (silenceIntervalRef.current) clearInterval(silenceIntervalRef.current);
    setSilenceProgress(0);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
      mediaRecorderRef.current = null;
    }
  };

  // Play AI greeting and initialize chat history on open
  useEffect(() => {
    if (!isOpen) return;

    setCallDuration(0);
    setIsMicMuted(false);
    setLiveTranscript('');
    setLiveInterimChunk('');
    setLiveFinalChunk('');
    setSilenceProgress(0);
    setMicErrorMsg(null);

    const greeting = persona.greeting[level];
    
    // Set initial greeting message
    const initialAiMsg: VoiceChatMessage = {
      id: 'greeting-' + Date.now(),
      sender: 'ai',
      text: greeting.japanese,
      vietnamese: greeting.vietnamese,
      explanation: greeting.explanation,
      topicTag: `${persona.japaneseName} · ${level}`
    };

    setMessages([initialAiMsg]);
    conversationHistoryRef.current = [{ sender: 'ai', text: greeting.japanese }];

    // Fetch Furigana for initial message
    fetch('/api/furigana', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: greeting.japanese })
    })
      .then(res => res.json())
      .then(data => {
        if (data?.furiganaHtml) {
          setMessages(prev => prev.map(m => m.id === initialAiMsg.id ? { ...m, furiganaHtml: data.furiganaHtml } : m));
        }
      })
      .catch(() => {});

    // Request Mic permission immediately on opening & Speak greeting
    requestMicAccess().then(() => {
      setCallStatus('speaking');
      isSpeakingRef.current = true;
      speakJapanese(
        greeting.japanese,
        speechRate,
        () => {
          isSpeakingRef.current = false;
          if (!isMutedRef.current) {
            setCallStatus('listening');
            startSpeechRecognition();
          } else {
            setCallStatus('muted');
          }
        },
        { voice: persona.voice }
      );
    });

    return () => {
      stopSpeechRecognition();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
        mediaStreamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [isOpen, persona.id, level]);

  // Process user speech and get AI answer
  const handleProcessUserUtterance = async (saidText: string) => {
    if (!saidText.trim() || isProcessingRef.current) return;

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (silenceIntervalRef.current) clearInterval(silenceIntervalRef.current);
    setSilenceProgress(0);
    stopSpeechRecognition();

    isProcessingRef.current = true;
    setCallStatus('processing');
    setLiveTranscript('');
    setLiveInterimChunk('');
    setLiveFinalChunk('');

    // Append user message
    const userMsgId = 'user-' + Date.now();
    const newUserMsg: VoiceChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: saidText.trim()
    };

    setMessages(prev => [...prev, newUserMsg]);
    conversationHistoryRef.current.push({ sender: 'user', text: saidText.trim() });
    
    if (onMessageLogged) {
      onMessageLogged({ sender: 'user', text: saidText.trim() });
    }

    try {
      const res = await fetch('/api/japanese-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistoryRef.current,
          persona: {
            name: persona.japaneseName,
            role: persona.roleJapanese,
            description: persona.description,
            speakingStyle: persona.speakingStyle
          },
          level: level,
          responseLength: 'natural',
          aiProvider: 'chatgpt'
        })
      });

      if (!res.ok) throw new Error('Failed to get AI response');
      const data = await res.json();

      const aiText = data.japaneseResponse || 'はい、分かりました！';
      conversationHistoryRef.current.push({ sender: 'ai', text: aiText });

      const aiMsgId = 'ai-' + Date.now();
      const newAiMsg: VoiceChatMessage = {
        id: aiMsgId,
        sender: 'ai',
        text: aiText,
        furiganaHtml: data.furiganaHtml,
        romaji: data.romajiText,
        vietnamese: data.vietnameseTranslation,
        explanation: data.japaneseExplanation,
        correctionAdvice: data.correctionAdvice,
        topicTag: `${persona.japaneseName} · ${level}`
      };

      setMessages(prev => [...prev, newAiMsg]);

      if (onMessageLogged) {
        onMessageLogged({
          sender: 'ai',
          text: aiText,
          furigana: data.furiganaText,
          furiganaHtml: data.furiganaHtml,
          romaji: data.romajiText,
          explanation: data.japaneseExplanation,
          correctionAdvice: data.correctionAdvice,
          vietnameseTranslation: data.vietnameseTranslation
        });
      }

      // Speak response with Azure Neural voice
      setCallStatus('speaking');
      isSpeakingRef.current = true;
      isProcessingRef.current = false;

      speakJapanese(
        aiText,
        speechRate,
        () => {
          isSpeakingRef.current = false;
          if (!isMutedRef.current) {
            setCallStatus('listening');
            startSpeechRecognition();
          } else {
            setCallStatus('muted');
          }
        },
        { voice: persona.voice }
      );
    } catch (err) {
      isProcessingRef.current = false;
      const fallbackAiText = 'はい、よく分かりました！もっとお話ししましょう。';
      
      const newAiMsg: VoiceChatMessage = {
        id: 'ai-fallback-' + Date.now(),
        sender: 'ai',
        text: fallbackAiText,
        vietnamese: 'Vâng, tôi hiểu rồi! Hãy cùng trò chuyện nhiều hơn nhé.',
        topicTag: `${persona.japaneseName} · ${level}`
      };
      setMessages(prev => [...prev, newAiMsg]);

      setCallStatus('speaking');
      isSpeakingRef.current = true;
      speakJapanese(
        fallbackAiText,
        speechRate,
        () => {
          isSpeakingRef.current = false;
          if (!isMutedRef.current) {
            setCallStatus('listening');
            startSpeechRecognition();
          } else {
            setCallStatus('muted');
          }
        },
        { voice: persona.voice }
      );
    }
  };

  // Toggle Mute / Unmute
  const handleToggleMute = async () => {
    if (isMicMuted) {
      setIsMicMuted(false);
      isMutedRef.current = false;
      
      const granted = await requestMicAccess();
      if (granted && !isSpeakingRef.current && !isProcessingRef.current) {
        setCallStatus('listening');
        startSpeechRecognition();
      }
    } else {
      setIsMicMuted(true);
      isMutedRef.current = true;
      stopSpeechRecognition();
      if (!isSpeakingRef.current && !isProcessingRef.current) {
        setCallStatus('muted');
      }
    }
  };

  // Repeat AI Speech
  const handleReplayAiSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCallStatus('speaking');
    isSpeakingRef.current = true;
    speakJapanese(
      text,
      speechRate,
      () => {
        isSpeakingRef.current = false;
        if (!isMutedRef.current) {
          setCallStatus('listening');
          startSpeechRecognition();
        }
      },
      { voice: persona.voice }
    );
  };

  // Copy text to clipboard
  const handleCopyText = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  // Like / Dislike message
  const handleToggleLike = (msgId: string, type: 'like' | 'dislike') => {
    setMessages(prev => prev.map(m => {
      if (m.id !== msgId) return m;
      if (type === 'like') {
        return { ...m, liked: !m.liked, disliked: false };
      } else {
        return { ...m, disliked: !m.disliked, liked: false };
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#000000] text-white flex flex-col justify-between overflow-hidden select-none font-sans">
      
      {/* Permission Warning Banner (if Mic blocked) */}
      <AnimatePresence>
        {micErrorMsg && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="relative z-30 bg-rose-950/90 border-b border-rose-500/40 px-4 py-2.5 text-xs text-rose-200 flex items-center justify-between gap-3 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{micErrorMsg}</span>
            </div>
            <button
              type="button"
              onClick={async () => {
                const granted = await requestMicAccess();
                if (granted) {
                  startSpeechRecognition();
                }
              }}
              className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold text-xs shrink-0 cursor-pointer flex items-center gap-1 shadow"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Cấp quyền Micro</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Stream Container (ChatGPT Voice style) */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 pt-8 pb-4 max-w-4xl w-full mx-auto space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
        
        {messages.map((msg) => {
          if (msg.sender === 'user') {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="bg-[#1e40af] hover:bg-[#1d4ed8] text-white text-[15px] sm:text-base font-jp px-5 py-2.5 rounded-full max-w-[85%] sm:max-w-[75%] shadow-md transition leading-relaxed">
                  {msg.text}
                </div>
              </div>
            );
          }

          // AI Message
          return (
            <div key={msg.id} className="flex flex-col items-start space-y-2 max-w-[95%] sm:max-w-[85%]">
              
              {/* Green/Emerald Pill Header Badge (as seen in screenshot "🏷️ Dán vào Facebook") */}
              <div className="inline-flex items-center gap-1.5 bg-[#059669] text-slate-900 font-semibold px-3 py-1 rounded-full text-xs shadow-sm">
                <span>🏷️</span>
                <span className="font-bold text-white tracking-wide">
                  {msg.topicTag || `${persona.japaneseName} · ${level}`}
                </span>
              </div>

              {/* Japanese AI Spoken Content */}
              <div className="text-[15px] sm:text-base text-zinc-100 font-jp leading-relaxed pl-1 space-y-1">
                {showFurigana && msg.furiganaHtml ? (
                  <div 
                    className="leading-relaxed [&_ruby]:text-[15px] [&_ruby]:sm:text-base [&_rt]:text-[11px] [&_rt]:text-emerald-400" 
                    dangerouslySetInnerHTML={{ __html: msg.furiganaHtml }} 
                  />
                ) : (
                  <p>{msg.text}</p>
                )}

                {/* Vietnamese Translation */}
                {showVietnamese && msg.vietnamese && (
                  <p className="text-xs sm:text-sm text-zinc-400 font-sans pt-1">
                    {msg.vietnamese}
                  </p>
                )}

                {/* Correction or Grammar Advice */}
                {msg.explanation && (
                  <div className="text-xs text-amber-300 bg-amber-950/40 border border-amber-500/30 rounded-xl p-2.5 mt-1.5 flex items-start gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{msg.explanation}</span>
                  </div>
                )}
              </div>

              {/* Message Bottom Action Icons (Thumbs Up, Thumbs Down, Three Dots, Replay, Copy) */}
              <div className="flex items-center gap-3 text-zinc-500 pl-1 pt-1">
                <button
                  type="button"
                  onClick={() => handleToggleLike(msg.id, 'like')}
                  className={`hover:text-zinc-200 transition cursor-pointer ${msg.liked ? 'text-emerald-400' : ''}`}
                  title="Thích câu trả lời"
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleLike(msg.id, 'dislike')}
                  className={`hover:text-zinc-200 transition cursor-pointer ${msg.disliked ? 'text-rose-400' : ''}`}
                  title="Chưa hài lòng"
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleReplayAiSpeech(msg.text)}
                  className="hover:text-zinc-200 transition cursor-pointer"
                  title="Nghe lại giọng phát âm"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleCopyText(msg.id, msg.text)}
                  className="hover:text-zinc-200 transition cursor-pointer"
                  title="Sao chép câu tiếng Nhật"
                >
                  {copiedMsgId === msg.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsReasoningOpen(true)}
                  className="hover:text-zinc-200 transition cursor-pointer"
                  title="Xem phân tích ngữ pháp & chi tiết"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Live Spoken Utterance Stream (Real-Time Word-by-Word as you speak) */}
        {liveTranscript && (
          <div className="flex justify-end pt-2">
            <div className="bg-[#1e40af]/90 border border-blue-400/50 text-white text-[15px] sm:text-base font-jp px-5 py-2.5 rounded-full max-w-[85%] sm:max-w-[75%] shadow-lg transition leading-relaxed flex items-center gap-2">
              <span>{liveTranscript}</span>
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Center Animated Glowing Orb (ChatGPT Voice Orb) */}
      <div className="relative flex flex-col items-center justify-center py-2 shrink-0">
        
        {/* Iridescent Glowing Fluid Orb */}
        <div className="relative flex items-center justify-center">
          {/* Subtle Outer Glow Rings */}
          {callStatus === 'speaking' && (
            <>
              <div className="absolute w-24 h-24 rounded-full bg-blue-500/30 blur-xl animate-ping duration-1000" />
              <div className="absolute w-32 h-32 rounded-full bg-indigo-500/20 blur-2xl animate-pulse duration-700" />
            </>
          )}

          {callStatus === 'listening' && (
            <>
              <div 
                className="absolute rounded-full bg-cyan-500/25 blur-xl transition-all duration-100"
                style={{ 
                  width: `${Math.max(80, 80 + audioLevel * 0.8)}px`, 
                  height: `${Math.max(80, 80 + audioLevel * 0.8)}px` 
                }} 
              />
              <div 
                className="absolute rounded-full bg-blue-400/20 blur-2xl transition-all duration-150"
                style={{ 
                  width: `${Math.max(100, 100 + audioLevel * 1.2)}px`, 
                  height: `${Math.max(100, 100 + audioLevel * 1.2)}px` 
                }} 
              />
            </>
          )}

          {/* Spherical Orb Canvas with Radial Iridescent Gradients (as in user screenshot) */}
          <div 
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center cursor-pointer ${
              callStatus === 'speaking'
                ? 'scale-110 shadow-[0_0_40px_rgba(96,165,250,0.8)] ring-2 ring-white/60'
                : callStatus === 'listening' && audioLevel > 15
                ? 'scale-105 shadow-[0_0_35px_rgba(56,189,248,0.7)]'
                : 'shadow-[0_0_20px_rgba(147,197,253,0.4)]'
            }`}
            style={{
              background: 'radial-gradient(circle at 35% 30%, #ffffff 0%, #93c5fd 35%, #3b82f6 70%, #1e3a8a 100%)'
            }}
            onClick={handleToggleMute}
            title={isMicMuted ? 'Nhấn để bật Micro' : 'Đang lắng nghe... Nói tiếng Nhật vào mic'}
          >
            {/* Fluid inner reflection */}
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Live Status Hint */}
        <div className="mt-2 text-center text-xs text-zinc-400 font-medium">
          {callStatus === 'speaking' && (
            <span className="text-blue-300 flex items-center gap-1.5 justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span>{persona.japaneseName} đang nói chuyện...</span>
            </span>
          )}
          {callStatus === 'listening' && (
            <span className="text-zinc-400 flex items-center gap-1.5 justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>{audioLevel > 15 ? 'Đang nhận diện giọng nói...' : 'Đang lắng nghe... Hãy nói tiếng Nhật'}</span>
            </span>
          )}
          {callStatus === 'processing' && (
            <span className="text-amber-300 flex items-center gap-1.5 justify-center">
              <Sparkles className="w-3 h-3 animate-spin" />
              <span>Đang suy nghĩ...</span>
            </span>
          )}
          {callStatus === 'muted' && (
            <span className="text-rose-400 flex items-center gap-1.5 justify-center">
              <MicOff className="w-3 h-3" />
              <span>Microphone đang tắt</span>
            </span>
          )}
        </div>
      </div>

      {/* Bottom Floating Pill Dock (Exact layout matching user screenshot) */}
      <div className="p-4 sm:p-6 flex justify-center shrink-0">
        <div className="bg-[#1f1f23] border border-zinc-800 rounded-full px-4 py-2 flex items-center justify-between gap-4 sm:gap-8 shadow-2xl max-w-xl w-full">
          
          {/* Left Button: "+ Loại" (Opens Level / Persona / Speed selector) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsTypeMenuOpen(!isTypeMenuOpen)}
              className="flex items-center gap-1.5 text-zinc-300 hover:text-white font-semibold text-xs sm:text-sm px-3 py-1.5 rounded-full hover:bg-zinc-800 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Loại</span>
            </button>

            {/* Type Popover Menu */}
            <AnimatePresence>
              {isTypeMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-12 left-0 z-50 bg-[#18181b] border border-zinc-800 rounded-2xl p-4 shadow-2xl w-72 space-y-3 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="font-bold text-white">Tùy Chọn Hội Thoại</span>
                    <button onClick={() => setIsTypeMenuOpen(false)} className="text-zinc-400 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Level selector */}
                  <div className="space-y-1">
                    <span className="text-zinc-400 text-[11px] font-medium">Trình độ JLPT:</span>
                    <div className="grid grid-cols-5 gap-1">
                      {(['N5', 'N4', 'N3', 'N2', 'N1'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => {
                            onLevelChange(lvl);
                            setIsTypeMenuOpen(false);
                          }}
                          className={`py-1 rounded font-bold transition cursor-pointer ${
                            level === lvl ? 'bg-blue-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Persona selector */}
                  <div className="space-y-1">
                    <span className="text-zinc-400 text-[11px] font-medium">Chọn đối tác AI:</span>
                    <div className="grid grid-cols-3 gap-1">
                      {availablePersonas.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            onPersonaChange(p);
                            setIsTypeMenuOpen(false);
                          }}
                          className={`p-1.5 rounded-lg border text-center transition cursor-pointer flex flex-col items-center ${
                            p.id === persona.id
                              ? 'bg-blue-950 border-blue-500 text-white'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                          }`}
                        >
                          <span className="text-base">{p.avatar}</span>
                          <span className="text-[10px] font-bold font-jp truncate">{p.japaneseName}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Speed */}
                  <div className="space-y-1">
                    <span className="text-zinc-400 text-[11px] font-medium">Tốc độ đọc:</span>
                    <div className="flex gap-1">
                      {[0.8, 1.0, 1.2].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => setSpeechRate(spd)}
                          className={`flex-1 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                            speechRate === spd ? 'bg-blue-600 text-white' : 'bg-zinc-900 text-zinc-400'
                          }`}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Display toggles */}
                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setShowFurigana(!showFurigana)}
                      className={`flex-1 py-1 rounded text-[11px] font-bold transition cursor-pointer border ${
                        showFurigana ? 'bg-emerald-950 border-emerald-500/50 text-emerald-300' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      Furigana: {showFurigana ? 'Bật' : 'Tắt'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowVietnamese(!showVietnamese)}
                      className={`flex-1 py-1 rounded text-[11px] font-bold transition cursor-pointer border ${
                        showVietnamese ? 'bg-blue-950 border-blue-500/50 text-blue-300' : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                      }`}
                    >
                      Dịch Việt: {showVietnamese ? 'Bật' : 'Tắt'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Controls: "🧠 Suy luận", Mic Toggle, and "✕" (Exit) */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Suy luận (Reasoning & Insights Button) */}
            <button
              type="button"
              onClick={() => setIsReasoningOpen(!isReasoningOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer ${
                isReasoningOpen ? 'bg-zinc-800 text-white' : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Brain className="w-4 h-4 text-purple-400" />
              <span>Suy luận</span>
            </button>

            {/* Microphone Mute / Unmute Button */}
            <button
              type="button"
              onClick={handleToggleMute}
              className={`p-2 rounded-full transition cursor-pointer flex items-center justify-center ${
                isMicMuted 
                  ? 'bg-rose-950/80 text-rose-400 border border-rose-500/40' 
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
              }`}
              title={isMicMuted ? 'Bật micro' : 'Tắt micro'}
            >
              {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Exit Close Button (White circle with dark cross icon as in screenshot) */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white hover:bg-zinc-200 text-zinc-900 flex items-center justify-center transition cursor-pointer shadow-md"
              title="Đóng chế độ thoại"
            >
              <X className="w-4 h-4 font-bold" />
            </button>
          </div>
        </div>
      </div>

      {/* Reasoning Drawer (When "🧠 Suy luận" is clicked) */}
      <AnimatePresence>
        {isReasoningOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-x-0 bottom-24 max-w-2xl mx-auto z-40 bg-[#18181b] border border-zinc-800 rounded-3xl p-5 shadow-2xl space-y-3"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                <Brain className="w-4 h-4" />
                <span>Phân Tích Suy Luận & Ngữ Pháp (AI Reasoning)</span>
              </div>
              <button onClick={() => setIsReasoningOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-zinc-300 space-y-2 leading-relaxed max-h-60 overflow-y-auto">
              <p>
                <strong className="text-white">Trình độ mục tiêu:</strong> JLPT {level} - Giọng đọc {persona.japaneseName} ({persona.speakingStyle})
              </p>
              <p>
                <strong className="text-white">Cơ chế xử lý:</strong> Mô hình Gemini tự động điều chỉnh ngữ pháp, kính ngữ/thể thông thường phù hợp với ngữ cảnh đàm thoại tiếng Nhật thực tế.
              </p>
              <p className="text-zinc-400">
                Mỗi câu bạn nói sẽ được nhận diện theo thời gian thực (Real-time Word-by-Word Streaming) và đối chiếu với mẫu câu bản xứ.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
