'use client';

type Props = {
  open: boolean;
  message?: string;
};

export default function AnalyzingModal({ open, message = '解析中…' }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60"
      aria-live="assertive"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-[min(92vw,420px)] rounded-2xl bg-white px-6 py-8 shadow-xl text-center">
        {/* オレンジおむすび（転がる） */}
        <div className="mx-auto mb-5 h-12 w-16 overflow-visible">
          <OnigiriRolling />
        </div>
        <p className="text-base font-semibold text-gray-800">{message}</p>
        <p className="mt-1 text-xs text-gray-500">しばらくお待ちください</p>
      </div>
    </div>
  );
}

function OnigiriRolling() {
  return (
    <svg
      viewBox="0 0 24 22"
      className="mx-auto h-10 w-12 animate-onigiri-roll drop-shadow-sm"
      aria-hidden
    >
      {/* 本体（オレンジ） */}
      <path
        d="M7.45 2.45C10 -0.82 14.99 -0.82 17.55 2.45c.24.31.52.79 1.1 1.77l4.34 7.36c.58.98.86 1.46 1.02 1.84 1.62 3.8-.9 8.06-5.04 8.56-.39.05-.96.05-2.1.05H8.16c-1.14 0-1.71 0-2.11-.05-4.16-.5-6.66-4.76-5.04-8.56.16-.38.44-.86 1.02-1.84L6.37 4.22c.58-.98.86-1.46 1.08-1.77Z"
        fill="#FF753E"
      />
      {/* 具（白丸） */}
      <circle cx="12" cy="13" r="2.6" fill="#ffffff" />
    </svg>
  );
}
