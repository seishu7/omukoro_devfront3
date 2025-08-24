// components/LoadingModal.tsx
'use client';

import Image from 'next/image';

export default function LoadingModal({
  open,
  label = '解析中…',   // ★ デフォルトは解析中
}: {
  open: boolean;
  label?: string;       // ★ 追加
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="rounded-2xl bg-white/95 p-6 shadow-xl">
        <div className="onigiri-arc-wrap mx-auto">
          <div className="onigiri-mover">
            <Image src="/Omusubi2.svg" alt="" width={64} height={64} className="onigiri-rotor" />
          </div>
          <div className="onigiri-shadow" />
        </div>
        <p className="mt-3 text-center text-sm text-gray-700">{label}</p> {/* ★ 可変表示 */}
      </div>
    </div>
  );
}
