'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import { RAGComparisonResult } from '@/components/RAGComparisonResult';
import { RAGAnalysisDisplay } from '@/components/RAGAnalysisDisplay';
import { useRAGComparison } from '@/hooks/useRAGComparison';
import LoadingModal from '@/components/LoadingModal';
import { ArrowLeft, RefreshCw } from 'lucide-react';

function CompareRAGContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { comparisonResult, loading, error, compareRAG } = useRAGComparison();
  const [query, setQuery] = useState('');

  useEffect(() => {
    // URLパラメータからクエリを取得
    const queryParam = searchParams.get('query');
    if (queryParam) {
      setQuery(queryParam);
      // 自動的にRAG比較を実行
      compareRAG(queryParam);
    }
  }, [searchParams, compareRAG]);

  const handleBack = () => {
    router.push('/consult/new');
  };

  const handleRetry = () => {
    if (query.trim()) {
      compareRAG(query);
    }
  };

  return (
    <div className="min-h-screen bg-dot-pattern">
      <AppHeader />
      
      <main className="mx-auto max-w-7xl px-6 pb-24 pt-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              戻る
            </button>
            <h1 className="text-2xl font-bold text-white">RAG比較結果</h1>
          </div>
          
          {error && (
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              再試行
            </button>
          )}
        </div>

        {/* ローディング表示 */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
              <p className="text-white">RAG比較中...</p>
            </div>
          </div>
        )}

        {/* エラー表示 */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">エラーが発生しました</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* 結果表示 */}
        {comparisonResult && !loading && (
          <>
            <RAGComparisonResult result={comparisonResult} />
            
            {/* バックエンドからのRAG分析結果 */}
            <RAGAnalysisDisplay result={comparisonResult} />
          </>
        )}

        {/* 結果がない場合 */}
        {!comparisonResult && !loading && !error && (
          <div className="text-center py-12">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-white">RAG比較結果がありません</p>
            <p className="mt-1 text-sm text-white/70">クエリを入力してRAG比較を実行してください</p>
          </div>
        )}

        {/* 戻るボタン（下部固定） */}
        <div className="fixed bottom-6 right-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            戻る
          </button>
        </div>
      </main>

      {/* ローディングモーダル */}
      <LoadingModal open={loading} label="RAG比較中…" />
    </div>
  );
}

export default function CompareRAGPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dot-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
          <p className="text-white">読み込み中...</p>
        </div>
      </div>
    }>
      <CompareRAGContent />
    </Suspense>
  );
}
