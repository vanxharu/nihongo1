import React, { useRef, useState } from 'react';

const V = 240, N = 192; // khung xem / ảnh xuất ra (px)

/** Cắt vuông ảnh đại diện: kéo để căn, thanh trượt để phóng (spec 069). */
export default function AvatarCropper({ src, onDone, onCancel }: { src: string; onDone: (dataUrl: string) => void; onCancel: () => void }) {
  const img = useRef<HTMLImageElement>(null);
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const s = nat ? (V / Math.min(nat.w, nat.h)) * zoom : 1;
  const clamp = (p: { x: number; y: number }, sc = s) => nat
    ? { x: Math.max(-(nat.w * sc - V) / 2, Math.min((nat.w * sc - V) / 2, p.x)), y: Math.max(-(nat.h * sc - V) / 2, Math.min((nat.h * sc - V) / 2, p.y)) }
    : p;
  const save = () => {
    if (!nat || !img.current) return;
    const k = N / V, c = document.createElement('canvas');
    c.width = c.height = N;
    c.getContext('2d')!.drawImage(img.current, N / 2 + pos.x * k - (nat.w * s * k) / 2, N / 2 + pos.y * k - (nat.h * s * k) / 2, nat.w * s * k, nat.h * s * k);
    onDone(c.toDataURL('image/jpeg', 0.85));
  };
  return (
    <div className="fixed inset-0 z-[130] bg-black/70 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Cắt ảnh đại diện">
      <div className="bg-[#1B223C] border border-slate-700 rounded-2xl p-4 w-full max-w-xs space-y-3 text-slate-200">
        <div
          className="mx-auto relative overflow-hidden rounded-full bg-black touch-none cursor-grab"
          style={{ width: V, height: V }}
          onPointerDown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y }; }}
          onPointerMove={(e) => drag.current && setPos(clamp({ x: drag.current.px + e.clientX - drag.current.x, y: drag.current.py + e.clientY - drag.current.y }))}
          onPointerUp={() => (drag.current = null)}
        >
          <img
            ref={img}
            src={src}
            alt=""
            draggable={false}
            onLoad={(e) => setNat({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
            className="absolute max-w-none select-none"
            style={nat ? { width: nat.w * s, height: nat.h * s, left: V / 2 - (nat.w * s) / 2 + pos.x, top: V / 2 - (nat.h * s) / 2 + pos.y } : { opacity: 0 }}
          />
        </div>
        <input
          type="range" min={1} max={3} step={0.01} value={zoom} aria-label="Phóng to"
          className="w-full"
          onChange={(e) => { const z = +e.target.value; setZoom(z); if (nat) setPos((p) => clamp(p, (V / Math.min(nat.w, nat.h)) * z)); }}
        />
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="flex-1 py-2 rounded-xl border border-slate-700 text-xs font-bold">Hủy</button>
          <button type="button" onClick={save} disabled={!nat} className="flex-1 py-2 rounded-xl bg-amber-500 text-slate-900 text-xs font-black disabled:opacity-50">Dùng ảnh này</button>
        </div>
      </div>
    </div>
  );
}
