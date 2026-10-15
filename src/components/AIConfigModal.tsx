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
import { authHeaders } from '../utils/authHeaders';

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
      const res = await fetch('/api/ai/config', { headers: await authHeaders() });
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
        headers: await authHeaders({ 'Content-Type': 'application/json' }),
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
        headers: await authHeaders({ 'Content-Type': 'application/json' }),
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
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Dùng chung cho mọi tính năng AI
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
              {/* Trạng thái */}
              <div className="flex items-center justify-between gap-3 text-xs text-slate-300">
                <span className="flex items-center gap-2 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${config?.hasOpenAIKey ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="truncate">
                    {config?.hasOpenAIKey ? `${config.openAIKeyMasked} · sẵn sàng` : 'Chưa có API Key · đang dùng Gemini dự phòng'}
                  </span>
                </span>
                <button type="button" onClick={fetchConfig} title="Làm mới trạng thái" className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer">
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Provider Selection */}
              <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#161b22] border border-[#30363d]" role="group" aria-label="AI engine ưu tiên">
                {([['chatgpt', 'ChatGPT'], ['gemini', 'Gemini (dự phòng)']] as const).map(([id, label]) => (
                  <button
                    key={id} type="button" aria-pressed={selectedProvider === id} onClick={() => setSelectedProvider(id)}
                    className={`py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${selectedProvider === id ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >{label}</button>
                ))}
              </div>

              {/* API Key Input */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-purple-400" />
                    OpenAI API Key
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
              </div>

              {/* Model Choice */}
              <label className="flex items-center justify-between gap-3 text-xs font-bold text-slate-300">
                Model
                <select
                  value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}
                  className="bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-slate-200 outline-hidden focus:border-purple-500"
                >
                  <option value="gpt-4o-mini">GPT-4o Mini · nhanh, tiết kiệm</option>
                  <option value="gpt-4o">GPT-4o · thông minh nhất</option>
                  <option value="gpt-4.1-turbo">GPT-4 Turbo · ngữ cảnh lớn</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo · cơ bản</option>
                </select>
              </label>

              {/* Test Connection Button & Result Box */}
              <div className="border-t border-[#30363d] pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-300">Kiểm tra kết nối</span>
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
