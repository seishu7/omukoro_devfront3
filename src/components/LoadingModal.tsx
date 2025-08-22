// components/LoadingModal.tsx
'use client';

import Image from 'next/image';

export default function LoadingModal({ open }: { open: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="rounded-2xl bg-white/95 p-6 shadow-xl">
      <div className="onigiri-arc-wrap mx-auto">
      <div className="onigiri-mover">
        <Image src="/Omusubi2.svg" alt="" width={50} height={50} className="onigiri-rotor" />
      </div>
      <div className="onigiri-shadow" />
    </div>
        <p className="mt-3 text-center text-sm text-gray-700">解析中…</p>
      </div>
    </div>
  );
}
