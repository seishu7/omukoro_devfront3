'use client';

import { useRouter, useParams } from 'next/navigation';
import { loadConsultDraft } from '@/components/ConsultDraft';

export default function SummaryPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const draft = loadConsultDraft(); // 直前の相談文
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
        {/* 顔カード風ヘッダー */}
        <div className="rounded-3xl bg-gradient-to-b from-[#2b2b2b] to-[#1f1f1f] text-white p-6 shadow-lg flex items-center gap-4">
          <div className="h-14 w-14 rounded-full overflow-hidden shrink-0 bg-white/10" />
          <div className="flex-1">
            <div className="text-xs text-white/70">品質保証部</div>
            <div className="text-xl font-semibold">佐々木 昌平 さん</div>
            <div className="mt-2 flex gap-2">
              <button
                className="px-3 py-1.5 text-xs rounded-md bg-white/10 border border-white/20"
                onClick={() => alert('準備中です（Teams連絡）')}
              >
                Teamsで連絡する
              </button>
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

          <div className="mb-6">
            <h3 className="text-sm text-gray-500 mb-1">相談内容</h3>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 whitespace-pre-wrap text-[15px] text-gray-800">
              {question}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm text-gray-500 mb-1">AIサマリー</h3>
            <div className="rounded-lg border border-gray-200 p-4 leading-7">
              {/* TODO: APIで生成した要約を入れる */}
              ここにAIの要約テキストが入ります。
            </div>
          </div>

          {/* 関連根拠セクション（ダミー） */}
          <div className="mb-6">
            <h3 className="text-sm text-gray-500 mb-2">関連根拠</h3>
            <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
              根拠リンクや引用をここに表示します。
            </div>
          </div>

          {/* アクション列 */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
            <button
              className="inline-flex items-center justify-center gap-3 rounded-lg
                         bg-white px-5 py-2 shadow-sm hover:shadow border border-black/10"
              onClick={() => router.push('/consult/new')}
              title="もう一度質問する（直前の内容は自動で復元されます）"
            >
              {/* おにぎりアイコンを使ってもOK */}
              <span className="text-[15px] font-bold text-[rgba(39,39,39,0.9)]">再度質問する</span>
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
