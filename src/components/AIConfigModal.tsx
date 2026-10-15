import React, { useEffect, useState } from 'react';
import { X, Check, Loader2, Zap, Eye, EyeOff } from 'lucide-react';
import { authHeaders } from '../utils/authHeaders';
import { useDialogFocus } from '../hooks/useDialogFocus';
import { toast } from './ui/Toasts';
import { readCustomLlm, saveCustomLlm } from '../utils/aiCustomKey';

interface Preset { id: string; name: string; desc: string; baseUrl: string; model: string; needsKey: boolean }
const PRESETS: Preset[] = [
  { id: 'pollinations', name: 'Pollinations (GPT-OSS 20B)', desc: 'Miễn phí, không cần API key. Mặc định.', baseUrl: 'https://text.pollinations.ai/openai', model: 'openai-fast', needsKey: false },
  { id: 'openrouter', name: 'OpenRouter (model :free)', desc: 'Key miễn phí từ openrouter.ai/keys.', baseUrl: 'https://openrouter.ai/api/v1/chat/completions', model: 'meta-llama/llama-3.3-70b-instruct:free', needsKey: true },
  { id: 'groq', name: 'Groq (Llama 3.3 70B)', desc: 'Rất nhanh, key miễn phí từ console.groq.com.', baseUrl: 'https://api.groq.com/openai/v1/chat/completions', model: 'llama-3.3-70b-versatile', needsKey: true },
];

interface AIConfigModalProps { isOpen: boolean; onClose: () => void; onConfigSaved?: () => void }

const field = 'w-full h-10 px-3 rounded-xl border border-[color:var(--ui-line)] bg-[color:var(--ui-soft)] text-sm text-[color:var(--ui-text)] outline-none focus:border-[color:var(--ui-accent)]';

export default function AIConfigModal({ isOpen, onClose, onConfigSaved }: AIConfigModalProps) {
  const [baseUrl, setBaseUrl] = useState(PRESETS[0].baseUrl);
  const [model, setModel] = useState(PRESETS[0].model);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [busy, setBusy] = useState(false);
  const [test, setTest] = useState<{ ok: boolean; text: string } | null>(null);
  const dialogRef = useDialogFocus<HTMLDivElement>(isOpen, onClose);

  useEffect(() => {
    if (!isOpen) return;
    const c = readCustomLlm();
    setBaseUrl(c?.baseUrl || PRESETS[0].baseUrl); setModel(c?.model || PRESETS[0].model); setApiKey(c?.apiKey || ''); setTest(null);
  }, [isOpen]);

  if (!isOpen) return null;
  const active = PRESETS.find(p => p.baseUrl === baseUrl && p.model === model);

  const runTest = async () => {
    setBusy(true); setTest(null);
    try {
      const res = await fetch('/api/ai/free-test', { method: 'POST', headers: await authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify({ baseUrl, model, apiKey: apiKey || undefined }) });
      const data = await res.json().catch(() => ({}));
      setTest(data.success ? { ok: true, text: `${data.reply} · ${data.ms}ms` } : { ok: false, text: data.error || 'Kết nối thất bại' });
    } catch { setTest({ ok: false, text: 'Không gọi được máy chủ.' }); }
    setBusy(false);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    // Mặc định (Pollinations) = dùng cấu hình của hệ thống, không cần gửi gì kèm.
    saveCustomLlm(active?.id === 'pollinations' ? null : { baseUrl: baseUrl.trim(), model: model.trim(), apiKey: apiKey.trim() });
    toast('Đã lưu model AI cho trình duyệt này');
    onConfigSaved?.(); onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Model AI" className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl bg-[color:var(--ui-card,#fff)] border border-[color:var(--ui-line)] shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 className="text-lg font-black text-[color:var(--ui-text)]">Model cho Chat AI</h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className="w-9 h-9 grid place-items-center rounded-full hover:bg-[color:var(--ui-soft)] text-[color:var(--ui-muted)]"><X size={18} /></button>
        </div>
        <form onSubmit={save} className="p-5 space-y-5">
          <div className="space-y-2" role="radiogroup" aria-label="Nhà cung cấp">
            {PRESETS.map(p => (
              <button key={p.id} type="button" role="radio" aria-checked={active?.id === p.id}
                onClick={() => { setBaseUrl(p.baseUrl); setModel(p.model); setTest(null); }}
                className={`w-full text-left flex items-center gap-3 p-3 rounded-2xl border transition-colors ${active?.id === p.id ? 'border-[color:var(--ui-accent)] bg-[color:color-mix(in_srgb,var(--ui-accent)_8%,transparent)]' : 'border-[color:var(--ui-line)] hover:bg-[color:var(--ui-soft)]'}`}>
                <span className="min-w-0 flex-1">
                  <b className="block text-sm text-[color:var(--ui-text)]">{p.name}</b>
                  <span className="block text-xs text-[color:var(--ui-muted)]">{p.desc}</span>
                </span>
                {active?.id === p.id && <Check size={18} className="text-[color:var(--ui-accent)] shrink-0" />}
              </button>
            ))}
          </div>

          {(!active || active.needsKey) && (
            <div className="space-y-2">
              {!active && (<>
                <input className={field} value={baseUrl} onChange={e => setBaseUrl(e.target.value)} placeholder="https://…/v1/chat/completions" aria-label="Địa chỉ API" />
                <input className={field} value={model} onChange={e => setModel(e.target.value)} placeholder="Tên model" aria-label="Tên model" />
              </>)}
              <div className="relative">
                <input className={`${field} pr-10`} type={showKey ? 'text' : 'password'} value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder={'API key'} aria-label="API key" autoComplete="off" />
                <button type="button" onClick={() => setShowKey(s => !s)} aria-label={showKey ? 'Ẩn key' : 'Hiện key'} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[color:var(--ui-muted)]">{showKey ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            </div>
          )}

          {test && <p role="status" className={`text-xs rounded-xl px-3 py-2 ${test.ok ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>{test.text}</p>}

          <div className="flex gap-2">
            <button type="button" onClick={runTest} disabled={busy} className="h-11 px-4 rounded-full border border-[color:var(--ui-line)] text-sm font-bold inline-flex items-center gap-2 text-[color:var(--ui-text)] disabled:opacity-50">
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />} Thử
            </button>
            <button type="submit" disabled={busy} className="h-11 flex-1 rounded-full bg-[color:var(--ui-accent)] text-white text-sm font-black disabled:opacity-50">
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
