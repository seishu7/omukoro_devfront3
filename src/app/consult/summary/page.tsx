'use client';

import { useRouter, useParams } from 'next/navigation';
import { loadConsultDraft } from '@/components/ConsultDraft';

export default function SummaryPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const draft = loadConsultDraft();
  const question = draft?.text ?? '（直前の相談文を取得できませんでした）';

  return (
    <div className="min-h-screen bg-[#414141] relative">
      {/* 背景ドット */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[#414141]
                   [background-image:radial-gradient(rgba(255,255,255,.12)_1.2px,transparent_1.2px)]
                   [background-size:22px_22px]"
      />

      <div className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
        {/* トップ中央の小アイコン群（飾り） */}
        <div className="flex items-center justify-center gap-6 mb-6">
          {/* 吹き出しアイコン */}
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white">
            <BubbleSvg className="h-4 w-4" />
          </span>
          {/* おにぎりアイコン（ロゴ） */}
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white">
            <OnigiriSvg className="h-4 w-4" />
          </span>
        </div>

        {/* 顔カード風ヘッダー */}
        <div className="rounded-3xl bg-gradient-to-b from-[#2b2b2b] to-[#1f1f1f] text-white p-6 shadow-lg flex items-center gap-4">
          <div className="h-14 w-14 rounded-full overflow-hidden shrink-0 bg-white/10" />
          <div className="flex-1">
            <div className="text-xs text-white/70">品質保証部</div>
            <div className="text-xl font-semibold">佐々木 昌平 さん</div>
            <div className="mt-2 flex gap-2">
        {/* ▼ SVG( /TeamsIcon.svg ) を埋め込んだピル型ボタン */}
        {/* public/TeamsButton.svg をそのままボタンとして使う */}
            <button
            onClick={() => alert('準備中です（Teams連絡）')}
            className="p-0 border-0 bg-transparent cursor-pointer"
            title="Teamsで連絡する"
            >
            <img
                src="/TeamsIcon.svg" // ← public直下に置いた完成デザインのSVG
                alt="Teamsで連絡する"
                className="h-[40px] w-auto" // 高さなど調整
            />
            </button>

        {/* 既存のメールボタンはそのまま */}
        <button
            className="px-3 py-1.5 text-xs rounded-md bg-white/10 border border-white/20"
            onClick={() => alert('準備中です（メール連絡）')}
        >
            メールで連絡する
        </button>
        </div>


          </div>
          <div className="hidden sm:block">
            <span className="inline-block px-3 py-1 text-xs rounded-full bg-emerald-500 text-white">フレンドリー</span>
          </div>
        </div>

        {/* 本文カード */}
        <div className="mt-6 rounded-xl bg-white shadow p-6">
          <h2 className="text-lg font-bold mb-2">打ち込んだ内容の要約</h2>
          <p className="text-sm text-gray-600 mb-4">相談ID: {params.id}</p>

          {/* 相談内容（AI要約） */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <BubbleSvg className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm text-gray-500">相談内容（AI要約）</h3>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 whitespace-pre-wrap text-[15px] text-gray-800">
              {question}
            </div>
          </div>

          {/* 質問事項（AIが生成） */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <BubbleSvg className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm text-gray-500">質問事項</h3>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 leading-7 text-gray-800">
              {/* TODO: AIによる質問生成結果をリストで表示 */}
              ここにAIが生成した質問が入ります。
            </div>
          </div>

          {/* 関連根拠セクション（ダミー） */}
          <div className="mb-6">
            <h3 className="text-sm text-gray-500 mb-2">関連根拠</h3>
            <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
              根拠リンクや引用をここに表示します。
            </div>
          </div>


          {/* --- 「関連が近い相談」セクション --- */}
            <div className="mb-6">
            <h3 className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                <img src="/Omusubi2.svg" alt="" width={40} height={40} />
                関連が近い相談
            </h3>
            <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-700 space-y-2">
                <p>過去の相談：「酒税法に関する納税猶予申請について」</p>
                <p>過去の相談：「特定酒類の分類基準に関する照会」</p>
            </div>
            </div>

          {/* アクション列 */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
            <button
              className="inline-flex items-center justify-center gap-3 rounded-lg
                         bg-white px-5 py-2 shadow-sm hover:shadow border border-black/10 text-[rgba(39,39,39,0.9)]"
              onClick={() => router.push('/consult/new')}
              title="もう一度質問する（直前の内容は自動で復元されます）"
            >
              {/* おにぎりロゴ（SVG） */}
              <OnigiriSvg className="h-[18px] w-[22px] text-[#2b2b2b]" />
              <span className="text-[15px] font-bold">再度質問する</span>
            </button>

            <button
              className="px-4 py-2 rounded-lg bg-gray-100 border border-gray-200 text-gray-700"
              onClick={() => window.print()}
            >
              この結果を印刷
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== SVGs（このファイル内だけで完結） ===== */
function OnigiriSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 22" className={className} fill="currentColor" aria-hidden>
      {/* 丸みのある三角（本体） */}
      <path
        d="M7.45 2.45C10 -0.82 14.99 -0.82 17.55 2.45c.24.31.52.79 1.1 1.77l4.34 7.36c.58.98.86 1.46 1.02 1.84 1.62 3.8-.9 8.06-5.04 8.56-.39.05-.96.05-2.1.05H8.16c-1.14 0-1.71 0-2.11-.05-4.16-.5-6.66-4.76-5.04-8.56.16-.38.44-.86 1.02-1.84L6.37 4.22c.58-.98.86-1.46 1.08-1.77Z"
      />
      {/* 中央の白い穴 */}
      <circle cx="12" cy="13" r="2.6" fill="#ffffff" />
    </svg>
  );
}

function BubbleSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      {/* 吹き出し：角丸矩形 + 下尾 */}
      <path
        d="M5 6a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H11l-3.8 3.1c-.7.57-1.7.06-1.7-.83V16A3 3 0 0 1 5 13V6Z"
        fill="currentColor"
      />
    </svg>
  );
}
