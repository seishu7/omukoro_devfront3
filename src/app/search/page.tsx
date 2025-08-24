'use client';

// src/app/search/page.tsx
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import { CategoryDropdown } from '@/components/CategoryDropdown';
import { SearchDropdown } from '@/components/SearchDropdown';
import { ConsultationCard } from '@/components/ConsultationCard';
import { useSearch } from '@/hooks/useSearch';
import { SortOrder } from '@/types/search';

export default function SearchPage() {
  const router = useRouter();
  const {
    searchResults,
    loading,
    error,
    query,
    filters,
    sortOrder,
    setQuery,
    setFilters,
    setSortOrder,
    executeSearch,
    clearSearch
  } = useSearch();

  // 並び替えオプション
  const sortOptions = [
    { value: 'newest', label: '最新順' },
    { value: 'oldest', label: '古い順' }
  ];

  const handleConsultationClick = (consultationId: string) => {
    // 詳細ページへの遷移処理
    router.push(`/consultation/${consultationId}`);
  };

  return (
    <div className="min-h-screen bg-dot-pattern">
      <AppHeader />

      <main className="mx-auto max-w-5xl px-6 pb-24">
        {/* 検索バーエリア（Figmaデザインに合わせた配置） */}
        <section className="mt-8">
          <div className="flex items-center gap-2 p-4 bg-white rounded-2xl shadow-sm">
            <div className="flex-1">
              <input
                type="text"
                placeholder="入力してください"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && executeSearch()}
                disabled={loading}
                className="w-full px-4 py-2 text-base font-medium text-gray-800 placeholder-gray-400 bg-transparent outline-none disabled:opacity-50"
              />
            </div>
            <div className="w-px h-10 bg-gray-200"></div>
            <CategoryDropdown
              filters={filters}
              onFiltersChange={setFilters}
              industryCategories={searchResults?.industry_categories || []}
              alcoholTypes={searchResults?.alcohol_types || []}
            />
            <SearchDropdown
              label="並び替え"
              value={sortOrder}
              options={sortOptions}
              onChange={(value) => setSortOrder(value as SortOrder)}
              placeholder="最新順"
            />
            <button
              onClick={executeSearch}
              disabled={loading}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-[#FF5A23] hover:opacity-90 active:opacity-80 disabled:opacity-50 transition-opacity"
              aria-label="検索"
            >
              <Image src="/SearchButton.svg" alt="検索" width={50} height={50} />
            </button>
          </div>
        </section>

        {/* 検索結果情報エリア */}
        <section className="mt-4 flex justify-between items-center">
          <div>
            {searchResults && (
              <p className="text-lg text-white">
                {searchResults.total_count}件の結果
              </p>
            )}
          </div>
          <button
            onClick={clearSearch}
            disabled={loading}
            className="text-sm px-4 py-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            クリア
          </button>
        </section>

        {/* エラー表示 */}
        {error && (
          <section className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </section>
        )}

        {/* 検索結果 */}
        <section className="mt-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF5A23]"></div>
              <p className="mt-3 text-gray-600">検索中...</p>
            </div>
          ) : searchResults ? (
            searchResults.results.length > 0 ? (
              <div className="space-y-4">
                {searchResults.results.map((consultation) => (
                  <ConsultationCard
                    key={consultation.consultation_id}
                    consultation={consultation}
                    onClick={handleConsultationClick}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mb-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-gray-600">検索結果が見つかりませんでした</p>
                <p className="mt-1 text-sm text-gray-500">別のキーワードやカテゴリで試してみてください</p>
              </div>
            )
          ) : null}
        </section>
      </main>
    </div>
  );
}
