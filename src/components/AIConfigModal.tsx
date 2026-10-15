import React, { useEffect, useState } from 'react';
import { X, Loader2, Zap, Eye, EyeOff } from 'lucide-react';
import { authHeaders } from '../utils/authHeaders';
import { useDialogFocus } from '../hooks/useDialogFocus';
import { toast } from './ui/Toasts';
import { readCustomLlm, saveCustomLlm } from '../utils/aiCustomKey';

const MODELS = [
  { id: '', name: 'Mặc định', desc: 'Hệ thống tự chọn model Gemini phù hợp' },
  { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', desc: 'Nhanh, cân bằng' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', desc: 'Rất nhanh, nhẹ' },
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro', desc: 'Chậm hơn, chính xác hơn' },
];

interface AIConfigModalProps { isOpen: boolean; onClose: () => void; onConfigSaved?: () => void }

const field = 'w-full h-10 px-3 rounded-xl border border-[color:var(--ui-line)] bg-[color:var(--ui-soft)] text-sm text-[color:var(--ui-text)] outline-none focus:border-[color:var(--ui-accent)]';

export default function AIConfigModal({ isOpen, onClose, onConfigSaved }: AIConfigModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [busy, setBusy] = useState(false);
  const [test, setTest] = useState<{ ok: boolean; text: string } | null>(null);
  const dialogRef = useDialogFocus<HTMLDivElement>(isOpen, onClose);

  useEffect(() => {
    if (!isOpen) return;
    const c = readCustomLlm();
    setApiKey(c?.apiKey || ''); setModel(c?.model || ''); setTest(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const runTest = async () => {
    setBusy(true); setTest(null);
    try {
      const res = await fetch('/api/ai/free-test', { method: 'POST', headers: await authHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify({ apiKey: apiKey.trim() || undefined, model: model || undefined }) });
      const data = await res.json().catch(() => ({}));
      setTest(data.success ? { ok: true, text: `${data.reply} · ${data.ms}ms` } : { ok: false, text: data.error || 'Kết nối thất bại' });
    } catch { setTest({ ok: false, text: 'Không gọi được máy chủ.' }); }
    setBusy(false);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    saveCustomLlm(apiKey.trim() ? { apiKey: apiKey.trim(), model } : null);
    toast(apiKey.trim() ? 'Đã lưu Gemini key cho trình duyệt này' : 'Đã xóa key riêng, dùng key của hệ thống');
    onConfigSaved?.(); onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Gemini API" className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl bg-[color:var(--ui-card,#fff)] border border-[color:var(--ui-line)] shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 className="text-lg font-black text-[color:var(--ui-text)]">Gemini API</h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className="w-9 h-9 grid place-items-center rounded-full hover:bg-[color:var(--ui-soft)] text-[color:var(--ui-muted)]"><X size={18} /></button>
        </div>
        <form onSubmit={save} className="p-5 space-y-5">
          <div>
            <label className="block text-xs font-bold text-[color:var(--ui-muted)] mb-2" htmlFor="gemini-key">API key của bạn</label>
            <div className="relative">
              <input id="gemini-key" className={`${field} pr-10`} type={showKey ? 'text' : 'password'} value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Để trống = dùng key của hệ thống" autoComplete="off" />
              <button type="button" onClick={() => setShowKey(s => !s)} aria-label={showKey ? 'Ẩn key' : 'Hiện key'} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[color:var(--ui-muted)]">{showKey ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
            <p className="text-xs text-[color:var(--ui-muted)] mt-2">Lấy key miễn phí tại aistudio.google.com/apikey. Key chỉ lưu trên trình duyệt này.</p>
          </div>

          <div className="space-y-2" role="radiogroup" aria-label="Model">
            {MODELS.map(m => (
              <button key={m.id} type="button" role="radio" aria-checked={model === m.id} onClick={() => { setModel(m.id); setTest(null); }}
                className={`w-full text-left p-3 rounded-2xl border transition-colors ${model === m.id ? 'border-[color:var(--ui-accent)] bg-[color:color-mix(in_srgb,var(--ui-accent)_8%,transparent)]' : 'border-[color:var(--ui-line)] hover:bg-[color:var(--ui-soft)]'}`}>
                <b className="block text-sm text-[color:var(--ui-text)]">{m.name}</b>
                <span className="block text-xs text-[color:var(--ui-muted)]">{m.desc}</span>
              </button>
            ))}
          </div>

          {test && <p role="status" className={`text-xs rounded-xl px-3 py-2 ${test.ok ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>{test.text}</p>}

          <div className="flex gap-2">
            <button type="button" onClick={runTest} disabled={busy} className="h-11 px-4 rounded-full border border-[color:var(--ui-line)] text-sm font-bold inline-flex items-center gap-2 text-[color:var(--ui-text)] disabled:opacity-50">
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />} Thử
            </button>
            <button type="submit" disabled={busy} className="h-11 flex-1 rounded-full bg-[color:var(--ui-accent)] text-white text-sm font-black disabled:opacity-50">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  );
}
