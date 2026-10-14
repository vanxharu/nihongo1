// Lucian UX/UI Prompts #036 · #062 · #063 · MIT License (c) 2026 Seokwoooo · https://lucianlabs.dev/uxui-prompt/
import React, { useEffect, useId, useRef, useState } from 'react';
import './authFx.css';

const Check = () => <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5.5 10.5l3 3 6-6.5" /></svg>;

/* ── 036: ô mật khẩu có mắt + thanh đo độ mạnh ─────────────────────────── */
const RULES: [string, string, (v: string) => boolean][] = [
  ['len', '10+ ký tự', (v) => v.length >= 10],
  ['up', 'Chữ in hoa', (v) => /[A-Z]/.test(v)],
  ['num', 'Chữ số', (v) => /\d/.test(v)],
  ['sym', 'Ký hiệu', (v) => /[^A-Za-z0-9]/.test(v)],
];
const LEVELS: [string, string][] = [['Nhập mật khẩu', 'var(--u036-line)'], ['Yếu', '#E5484D'], ['Khá', '#F07A3E'], ['Tốt', '#E8B417'], ['Mạnh', '#119C72']];

export function PasswordField({ value, onChange, id, autoComplete, showStrength, placeholder = '••••••', leading }: {
  value: string; onChange: (v: string) => void; id: string; autoComplete: string; showStrength?: boolean; placeholder?: string; leading?: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  const rid = useId();
  const passed = RULES.filter(([, , t]) => t(value)).length;
  const lv = value ? Math.max(1, passed) : 0;
  return (
    <div className={`u036${show ? ' is-show' : ''}`} style={{ '--lv': LEVELS[lv][1] } as React.CSSProperties}>
      <div className="u036-box">
        {leading}
        <input className="u036-in" id={id} type={show ? 'text' : 'password'} value={value} placeholder={placeholder} autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)} aria-describedby={showStrength ? rid : undefined} required minLength={6} />
        <button className="u036-eye" type="button" aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={show} onClick={() => setShow((s) => !s)}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><g className="u036-lid"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /></g><circle className="u036-pupil" cx="12" cy="12" r="3" /><path className="u036-slash" d="M4 4l16 16" /></svg>
        </button>
      </div>
      {showStrength && (
        <>
          <div className="u036-meter" aria-hidden="true">{[0, 1, 2, 3].map((i) => <i key={i} className={i < lv ? 'on' : ''} />)}</div>
          <p className="u036-lv"><span>Độ mạnh</span><b aria-live="polite">{LEVELS[lv][0]}</b></p>
          <ul className="u036-rules" id={rid}>
            {RULES.map(([k, label, t]) => <li key={k} className={`u036-r${t(value) ? ' ok' : ''}`}><i aria-hidden="true"><Check /></i>{label}</li>)}
          </ul>
        </>
      )}
    </div>
  );
}

/* ── 062: nút gửi co thành vòng quay → dấu tick ────────────────────────── */
export function SubmitButton({ phase, label, className = '' }: { phase: 'idle' | 'loading' | 'ok'; label: string; className?: string }) {
  return (
    <button type="submit" disabled={phase !== 'idle'} className={`u062-btn ${phase !== 'idle' ? 'is-' + phase : ''} ${className}`} aria-live="polite">
      <span className="u062-lab">{label}</span>
      <svg className="u062-spin" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /></svg>
      <svg className="u062-ok" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12.5l4 4 8-9" /></svg>
    </button>
  );
}

/* ── 063: đăng ký từng câu hỏi một ─────────────────────────────────────── */
type Vals = { username: string; displayName: string; email: string; password: string };
type Step = { k: keyof Vals; label: string; type: string; ac: string; ph: string; hint: string; optional?: boolean; check: (v: string) => string };
const STEPS: Step[] = [
  { k: 'username', label: 'Chọn tên đăng nhập', type: 'text', ac: 'username', ph: 'vd: neko_chan', hint: 'Viết liền không dấu, số và gạch dưới', check: (v) => (v.length < 3 ? 'Cần ít nhất 3 ký tự' : '') },
  { k: 'displayName', label: 'Bạn muốn được gọi là gì?', type: 'text', ac: 'nickname', ph: 'Nickname (có thể bỏ qua)', hint: 'Tên hiển thị trong bảng xếp hạng', optional: true, check: () => '' },
  { k: 'email', label: 'Email để đăng nhập là gì?', type: 'email', ac: 'email', ph: 'email@example.com', hint: 'Dùng để khôi phục tài khoản', check: (v) => (/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v) ? '' : 'Đây chưa phải email · vd: ten@example.com') },
  { k: 'password', label: 'Đặt mật khẩu', type: 'password', ac: 'new-password', ph: 'Từ 6 ký tự', hint: 'Thêm số và ký hiệu để an toàn hơn', check: (v) => (v.length < 6 ? `Cần ít nhất 6 ký tự · hiện ${v.length}` : '') },
];
const score = (v: string) => (v.length >= 8 ? 1 : 0) + (/[0-9]/.test(v) ? 1 : 0) + (/[^A-Za-z0-9]/.test(v) ? 1 : 0) + (v.length >= 12 ? 1 : 0);

export function SignupSteps({ onSubmit, externalError }: { onSubmit: (v: Vals) => Promise<string>; externalError?: string }) {
  const [vals, setVals] = useState<Vals>({ username: '', displayName: '', email: '', password: '' });
  const [cur, setCur] = useState(0);
  const [err, setErr] = useState('');
  const [shake, setShake] = useState(0);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const uid = useId();

  useEffect(() => { const t = setTimeout(() => ref.current?.focus({ preventScroll: true }), 350); return () => clearTimeout(t); }, [cur]);
  useEffect(() => { if (externalError) { setErr(externalError); setShake((n) => n + 1); } }, [externalError]);

  const set = (k: keyof Vals, v: string) => { setErr(''); setVals((s) => ({ ...s, [k]: k === 'username' ? v.toLowerCase().replace(/[^a-z0-9_]/g, '') : v })); };
  const next = async () => {
    if (busy) return;
    const s = STEPS[cur]; const v = vals[s.k].trim();
    const bad = s.optional && !v ? '' : s.check(s.k === 'password' ? vals.password : v);
    if (bad) { setErr(bad); setShake((n) => n + 1); return; }
    if (cur < STEPS.length - 1) { setCur(cur + 1); return; }
    setBusy(true);
    const e = await onSubmit({ ...vals, username: vals.username.trim(), displayName: vals.displayName.trim(), email: vals.email.trim() });
    setBusy(false);
    if (e) { setErr(e); setShake((n) => n + 1); } else setDone(true);
  };

  return (
    <div className={`u063${done ? ' is-done' : ''}`}>
      <div className="u063-bar" aria-hidden="true">{STEPS.map((_, i) => <i key={i} className={i < cur || done ? 'on' : ''} />)}</div>
      <div className="u063-chips" aria-label="Câu trả lời của bạn">
        {STEPS.map((s, i) => i < cur && (vals[s.k] || !s.optional) && (
          <button key={s.k} type="button" className="u063-chip" onClick={() => { setErr(''); setCur(i); }} aria-label={`Sửa: ${s.label}`}>
            <i aria-hidden="true"><svg viewBox="0 0 10 10"><path d="M2 5.2l2 2 4-4.4" /></svg></i>
            <span>{s.k === 'password' ? '•'.repeat(Math.min(10, vals.password.length)) : vals[s.k] || 'Bỏ qua'}</span>
          </button>
        ))}
      </div>
      <form className="u063-stage" noValidate onSubmit={(e) => { e.preventDefault(); next(); }}>
        {STEPS.map((s, i) => (
          <div key={s.k} className={`u063-q${i < cur ? ' out' : i > cur ? ' wait' : ''}${i === cur && err ? ' bad' : ''}`} {...(i !== cur ? { inert: '' as any } : null)}>
            <small>{i + 1} / {STEPS.length}</small>
            <label htmlFor={`${uid}${i}`}>{s.label}</label>
            <div className="u063-in" key={i === cur ? shake : 0}>
              <input id={`${uid}${i}`} ref={i === cur ? ref : undefined} type={s.type} autoComplete={s.ac} placeholder={s.ph} value={vals[s.k]}
                onChange={(e) => set(s.k, e.target.value)} aria-describedby={`${uid}m${i}`} />
            </div>
            {s.k === 'password' && <div className="u063-meter" aria-hidden="true">{[0, 1, 2, 3].map((n) => <i key={n} style={n < score(vals.password) ? { background: ['#E5484D', '#F07A3E', '#3D8BFF', '#119C72'][score(vals.password) - 1] } : undefined} />)}</div>}
            <div className="u063-msg" id={`${uid}m${i}`} aria-live="polite">{i === cur && err ? err : s.hint}</div>
          </div>
        ))}
        <div className="u063-done" aria-hidden={!done}>
          <span><svg viewBox="0 0 36 36"><path d="M9 18.5l6 6L27 12" /></svg></span>
          <b>Đăng ký thành công</b>
          <p>{vals.displayName || vals.username}</p>
        </div>
      </form>
      <button className="u063-next" type="button" onClick={next} disabled={busy || done}>
        <span>{cur === STEPS.length - 1 ? (busy ? 'Đang tạo…' : 'Tạo tài khoản') : STEPS[cur].optional && !vals[STEPS[cur].k] ? 'Bỏ qua' : 'Tiếp'}</span>
        <svg viewBox="0 0 18 18" aria-hidden="true"><path d="M4 9h10M10 5l4 4-4 4" /></svg>
      </button>
    </div>
  );
}
