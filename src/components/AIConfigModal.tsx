import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Key, 
  Server, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCw, 
  Save, 
  Eye, 
  EyeOff, 
  Layers, 
  Check, 
  Info,
  ExternalLink,
  ShieldCheck,
  Zap,
  Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: () => void;
}

interface ServerConfigResponse {
  hasOpenAIKey: boolean;
  openAIKeyMasked: string;
  hasCustomKey: boolean;
  hasEnvKey: boolean;
  openaiModel: string;
  provider: 'chatgpt' | 'gemini';
  geminiAvailable: boolean;
  availableModels: {
    id: string;
    name: string;
    desc: string;
    recommended: boolean;
  }[];
  updatedAt?: string;
}

export default function AIConfigModal({ isOpen, onClose, onConfigSaved }: AIConfigModalProps) {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [config, setConfig] = useState<ServerConfigResponse | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [selectedProvider, setSelectedProvider] = useState<'chatgpt' | 'gemini'>('chatgpt');
  const [showKey, setShowKey] = useState(false);

  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    reply?: string;
    errorType?: string;
  } | null>(null);

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch current config on mount or open
  useEffect(() => {
    if (isOpen) {
      fetchConfig();
      setTestResult(null);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/config');
      if (res.ok) {
        const data: ServerConfigResponse = await res.json();
        setConfig(data);
        setSelectedModel(data.openaiModel || 'gpt-4o-mini');
        setSelectedProvider(data.provider || 'chatgpt');
      }
    } catch (err) {
      console.error('Failed to load AI config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          openaiApiKey: apiKeyInput.trim() || undefined,
          openaiModel: selectedModel,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message || 'Kết nối thành công!',
          reply: data.reply,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Kiểm tra kết nối thất bại.',
          errorType: data.errorType,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Không thể kết nối đến máy chủ kiểm tra API.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      const payload: any = {
        openaiModel: selectedModel,
        provider: selectedProvider,
      };
      if (apiKeyInput.trim()) {
        payload.openaiApiKey = apiKeyInput.trim();
      }

      const res = await fetch('/api/ai/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setApiKeyInput('');
        await fetchConfig();
        window.dispatchEvent(new CustomEvent('ai_config_updated'));
        if (onConfigSaved) onConfigSaved();
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Lỗi khi lưu cấu hình.');
      }
    } catch (err: any) {
      alert(err.message || 'Không thể kết nối đến máy chủ.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="ai-config-modal-card"
        className="bg-[#0d1117] border border-[#30363d] text-slate-100 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#30363d] flex items-center justify-between bg-gradient-to-r from-purple-950/40 via-blue-950/20 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                Cấu hình API kết nối hệ thống
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Dùng chung toàn web
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Áp dụng tức thì cho tất cả tính năng AI: Ngữ pháp, Phân tích câu, Kaiwa, Đọc hiểu, Hán tự, Đề thi.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm flex-1 custom-scrollbar">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400">
              <RotateCw className="w-8 h-8 animate-spin text-purple-400 mb-3" />
              <p className="text-xs font-semibold">Đang tải cấu hình AI hệ thống...</p>
            </div>
          ) : (
            <form onSubmit={handleSaveConfig} className="space-y-6">
              {/* Status Summary Banner */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-3.5 sm:p-4 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3.5 h-3.5 rounded-full ${
                    config?.hasOpenAIKey 
                      ? selectedProvider === 'chatgpt' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse' : 'bg-blue-500'
                      : 'bg-amber-500'
                  }`} />
                  <div>
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <span>Nhà cung cấp hiện tại:</span>
                      <span className="text-purple-400 font-mono font-bold">
                        {selectedProvider === 'chatgpt' ? `ChatGPT (${selectedModel})` : 'Gemini 3.8 Flash (Dự phòng)'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>API Key ChatGPT:</span>
                      {config?.hasOpenAIKey ? (
                        <span className="font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40 text-[10px]">
                          {config.openAIKeyMasked} (Đã sẵn sàng)
                        </span>
                      ) : (
                        <span className="text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40 text-[10px]">
                          Chưa có API Key (Đang dùng Gemini dự phòng)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={fetchConfig}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Làm mới trạng thái"
                  >
                    <RotateCw className="w-3 h-3" />
                    Làm mới
                  </button>
                </div>
              </div>

              {/* Provider Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  1. Chọn AI Engine ưu tiên (Mặc định cho toàn bộ ứng dụng)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setSelectedProvider('chatgpt')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      selectedProvider === 'chatgpt'
                        ? 'bg-purple-950/40 border-purple-500/80 text-white shadow-lg shadow-purple-950/30 ring-1 ring-purple-500/50'
                        : 'bg-[#161b22] border-[#30363d] text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-purple-400" />
                        <span className="font-bold text-sm text-slate-200">ChatGPT (OpenAI)</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Khuyên dùng
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Phân tích ngữ pháp chính xác, tự nhiên, hội thoại phong phú và chuẩn sư phạm tiếng Nhật.
                    </p>
                  </div>

                  <div
                    onClick={() => setSelectedProvider('gemini')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      selectedProvider === 'gemini'
                        ? 'bg-blue-950/40 border-blue-500/80 text-white shadow-lg shadow-blue-950/30 ring-1 ring-blue-500/50'
                        : 'bg-[#161b22] border-[#30363d] text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-400" />
                        <span className="font-bold text-sm text-slate-200">Google Gemini</span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Dự phòng
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Tự động kích hoạt thay thế khi OpenAI hết số dư hoặc gặp lỗi mạng, đảm bảo bài học không bị gián đoạn.
                    </p>
                  </div>
                </div>
              </div>

              {/* API Key Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-purple-400" />
                    2. OpenAI API Key (Thay đổi nhanh tại đây)
                  </label>
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 hover:underline"
                  >
                    Lấy API key mới trên OpenAI
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder={config?.hasOpenAIKey ? `Đang dùng: ${config.openAIKeyMasked} (Nhập mã mới để thay thế)` : 'sk-proj-... (Dán mã OpenAI API Key của bạn vào đây)'}
                    className="w-full bg-[#161b22] border border-[#30363d] focus:border-purple-500 rounded-xl px-3.5 py-3 text-xs sm:text-sm font-mono text-white placeholder:text-slate-500 outline-hidden pr-20 transition-all shadow-inner"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                      title={showKey ? 'Ẩn mã key' : 'Hiện mã key'}
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {apiKeyInput && (
                      <button
                        type="button"
                        onClick={() => setApiKeyInput('')}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer text-xs font-bold"
                        title="Xóa ô nhập"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Khóa được lưu bảo mật trên máy chủ backend và áp dụng ngay lập tức mà không cần khởi động lại.</span>
                </p>
              </div>

              {/* Model Choice */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-purple-400" />
                  3. Chọn Model ChatGPT sử dụng
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', tag: 'Nhanh & Tiết kiệm (Khuyên dùng)', desc: 'Tốc độ phản hồi cực nhanh, chuẩn ngữ pháp, chi phí tiết kiệm nhất.' },
                    { id: 'gpt-4o', name: 'GPT-4o', tag: 'Thông minh nhất', desc: 'Sâu sắc và sắc bén nhất trong hội thoại & phân tích đọc hiểu chuyên sâu.' },
                    { id: 'gpt-4.1-turbo', name: 'GPT-4 Turbo', tag: 'Ngữ cảnh lớn', desc: 'Tối ưu cho văn bản dài và phân tích đề thi nhiều câu.' },
                    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', tag: 'Cơ bản', desc: 'Mô hình truyền thống cho các câu giao tiếp cơ bản.' }
                  ].map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setSelectedModel(m.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        selectedModel === m.id
                          ? 'bg-purple-950/50 border-purple-500 text-white shadow-sm ring-1 ring-purple-500/40'
                          : 'bg-[#161b22] border-[#30363d] text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-slate-200">{m.name}</span>
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                          selectedModel === m.id ? 'bg-purple-500/30 text-purple-300' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {m.tag}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                        {m.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Test Connection Button & Result Box */}
              <div className="border-t border-[#30363d] pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-300">Kiểm tra kết nối API:</span>
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testing || (!apiKeyInput.trim() && !config?.hasOpenAIKey)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-purple-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-purple-500/30 shadow-sm"
                  >
                    {testing ? (
                      <>
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                        Đang kết nối OpenAI...
                      </>
                    ) : (
                      <>
                        <Key className="w-3.5 h-3.5 text-purple-400" />
                        Kiểm tra kết nối ngay
                      </>
                    )}
                  </button>
                </div>

                {/* Test Result Message Box */}
                {testResult && (
                  <div className={`p-3.5 rounded-xl border text-xs leading-relaxed animate-fadeIn ${
                    testResult.success
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : testResult.errorType === 'quota_exceeded'
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                      : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                  }`}>
                    <div className="flex items-start gap-2">
                      {testResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="font-bold mb-1">{testResult.message}</div>
                        {testResult.reply && (
                          <div className="mt-2 p-2 bg-black/40 rounded-lg border border-emerald-500/30 font-mono text-[11px] text-emerald-300">
                            🤖 AI Phản hồi: &ldquo;{testResult.reply}&rdquo;
                          </div>
                        )}
                        {testResult.errorType === 'quota_exceeded' && (
                          <div className="mt-2 text-[11px] text-amber-300 flex items-center gap-2">
                            <span>👉 Nạp thêm credits:</span>
                            <a
                              href="https://platform.openai.com/settings/organization/billing/overview"
                              target="_blank"
                              rel="noreferrer"
                              className="underline font-bold text-amber-200 hover:text-white flex items-center gap-1"
                            >
                              platform.openai.com/billing
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Powered Features Checklist */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                <div className="text-xs font-bold text-slate-300 mb-2.5 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  Tính năng sử dụng chung cấu hình ChatGPT này:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Phân tích cú pháp & ngắt câu dài</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Luyện nói & hội thoại Kaiwa</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Chấm điểm dịch câu & bài tập ngữ pháp</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Chat AI đối thoại 100% tiếng Nhật</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Mẹo nhớ Hán tự Kanji bằng liên tưởng</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Giải thích đề thi JLPT & sách luyện thi</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Chữa lỗi ghi chú học viên</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Gia sư AI & tạo câu hỏi tương tự</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-[#30363d] hover:bg-slate-800 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      Đang lưu cấu hình...
                    </>
                  ) : saveSuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                      Đã lưu thành công!
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      Lưu cấu hình AI
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
