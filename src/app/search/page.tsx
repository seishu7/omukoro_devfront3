// src/app/search/page.tsx
import AppHeader from '@/components/AppHeader';

export const metadata = {
  title: '検索 | Sherpath',
};

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-dot-pattern">
      <AppHeader />

      <main className="mx-auto max-w-5xl px-6 pb-24">
        {/* 検索バー＋条件 */}
        <section className="mt-8 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="入力してください"
              className="flex-1 h-11 rounded-full px-5 bg-white/95 text-neutral-800 outline-none shadow-sm"
            />
            <button
              className="flex items-center justify-center w-11 h-11 rounded-full bg-[#FF5A23] hover:opacity-90 active:opacity-80"
              aria-label="検索"
            >
              {/* 虫眼鏡マーク（アイコンファイルを public/search-icon.svg と仮定） */}
              <img src="/SearchButton.svg" alt="検索" width={100} height={100} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <button className="rounded-full bg-white/90 px-3 py-1 shadow-sm">
              カテゴリー: すべて
            </button>
            <button className="rounded-full bg-white/90 px-3 py-1 shadow-sm">
              並び替え: 最新順
            </button>
          </div>
        </section>

        {/* 結果リスト（ダミー） */}
        <section className="mt-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <article key={i} className="rounded-xl bg-white p-4 shadow-sm">
              <h3 className="font-semibold text-neutral-900">
                ビールのモニター会をしたい
              </h3>
              <div className="mt-2 text-sm text-neutral-600">
                <span className="text-orange-600">#一般小売販売</span>
                <span className="ml-3">山下一紀さん</span>
                <span className="ml-3">2025.01.07</span>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
