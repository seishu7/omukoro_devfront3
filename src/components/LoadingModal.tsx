// components/LoadingModal.tsx
'use client';

export default function LoadingModal({ open }: { open: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="rounded-2xl bg-white/95 p-6 shadow-xl">
      <div className="onigiri-arc-wrap mx-auto">
      <div className="onigiri-mover">
        <img src="/Omusubi2.svg" alt="" className="onigiri-rotor" />
      </div>
      <div className="onigiri-shadow" />
    </div>
        <p className="mt-3 text-center text-sm text-gray-700">解析中…</p>
      </div>
    </div>
  );
}
