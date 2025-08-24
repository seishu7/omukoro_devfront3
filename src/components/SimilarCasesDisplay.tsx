import React from 'react';
import { SimilarCase } from '../services/similarCasesApi';

// BubbleSvgコンポーネント（既存のpage.tsxからコピー）
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

// コンポーネントのプロパティの型定義
interface SimilarCasesDisplayProps {
  // 表示する類似相談案件のデータ
  similarCases: SimilarCase[];
  // ローディング状態
  isLoading: boolean;
  // エラー状態
  error: string | null;
  // 総候補件数
  totalCandidates: number;
  // メッセージ
  message: string;
  // カスタムクラス名
  className?: string;
  // カテゴリマッピング（業種・酒類の名前表示用）
  categoryMappings?: {
    industry: Record<string, string>;
    alcohol: Record<string, string>;
  };
}

/**
 * 類似相談案件の表示コンポーネント
 */
export const SimilarCasesDisplay: React.FC<SimilarCasesDisplayProps> = ({
  similarCases,
  isLoading,
  error,
  totalCandidates,
  message,
  className = '',
  categoryMappings,
}) => {
  // 日付をフォーマットする関数
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  // 類似度スコアを表示用にフォーマットする関数
  const formatSimilarityScore = (score: number | null | undefined): string => {
    if (score === null || score === undefined) {
      return 'N/A';
    }
    return `${score}点`;
  };

  // ローディング状態の表示
  if (isLoading) {
    return (
      <div className={`similar-cases-display loading ${className}`}>
        <div className="loading-message">
          <div className="spinner"></div>
          <p>類似相談案件を検索中...</p>
        </div>
      </div>
    );
  }

  // エラー状態の表示
  if (error) {
    return (
      <div className={`similar-cases-display error ${className}`}>
        <div className="error-message">
          <p className="error-text">エラーが発生しました</p>
          <p className="error-details">{error}</p>
        </div>
      </div>
    );
  }

  // フィルタリング後の実際の表示件数を計算
  const filteredCases = similarCases.filter(caseItem => 
    caseItem.similarity_score === null || 
    caseItem.similarity_score === undefined || 
    caseItem.similarity_score > 50
  );

  // データがない場合の表示
  if (!filteredCases || filteredCases.length === 0) {
    return (
      <div className={`similar-cases-display no-data ${className}`}>
        <p className="no-data-message">類似相談案件が見つかりませんでした</p>
      </div>
    );
  }

  return (
    <div className={`similar-cases-display ${className}`}>
             {/* ヘッダー情報 */}
       <div className="flex items-center gap-2 mb-1">
         <BubbleSvg className="h-4 w-4 text-gray-500" />
         <h3 className="text-base font-semibold text-gray-700">類似相談案件</h3>
       </div>
       
               {/* 候補件数とメッセージ + 類似相談案件のリスト全体を1つの枠で囲む */}
        <div className="rounded-lg border border-gray-200 p-4 leading-7 text-gray-800">
          <div className="text-sm text-gray-600 mb-4">
            <span>同じ業種カテゴリの過去案件: {totalCandidates}件中</span>
            <span className="ml-2">{filteredCases.length}件の類似案件を特定しました</span>
          </div>

          {/* 類似相談案件のリスト */}
          <div className="space-y-3">
            {filteredCases.map((caseItem, index) => (
              <div key={caseItem.consultation_id} className="pl-3">
                {/* 案件の基本情報 */}
                <div className="mb-2">
                  <h4 className="font-medium text-gray-900 mb-1">
                    <span className="text-blue-600 font-medium mr-2">{index + 1}.</span>
                    <a 
                      href={`/consult/detail/${caseItem.consultation_id}`}
                      className="text-blue-600 hover:text-blue-800 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {caseItem.title}
                    </a>
                  </h4>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>作成日時: {caseItem.created_at ? formatDate(caseItem.created_at) : 'N/A'}</span>
                    {caseItem.similarity_score !== null && caseItem.similarity_score !== undefined && (
                      <span>類似度: {formatSimilarityScore(caseItem.similarity_score)}</span>
                    )}
                  </div>
                </div>

                {/* 折りたたみ可能な詳細情報 */}
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm text-gray-600 hover:text-gray-800">
                    <span>詳細情報を表示</span>
                    <span className="ml-2 text-gray-400 transition-transform group-open:rotate-180">▼</span>
                  </summary>
                  <div className="mt-2 space-y-2 text-sm text-gray-700">
                    {/* 要約タイトル */}
                    {caseItem.summary_title && (
                      <div>
                        <strong>要約:</strong> {caseItem.summary_title}
                      </div>
                    )}

                    {/* 類似性の理由 */}
                    {caseItem.reason && (
                      <div>
                        <strong>類似性の理由:</strong> {caseItem.reason}
                      </div>
                    )}

                    {/* 業種・酒類情報 */}
                    <div className="flex gap-4">
                      {caseItem.industry_category_id && (
                        <span>
                          <strong>業種カテゴリ:</strong> {
                            categoryMappings?.industry[caseItem.industry_category_id] || caseItem.industry_category_id
                          }
                        </span>
                      )}
                      {caseItem.alcohol_type_id && (
                        <span>
                          <strong>酒類タイプ:</strong> {
                            categoryMappings?.alcohol[caseItem.alcohol_type_id] || caseItem.alcohol_type_id
                          }
                        </span>
                      )}
                    </div>

                    {/* 案件ID */}
                    <div>
                      <strong>案件ID:</strong> {caseItem.consultation_id}
                    </div>
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  export default SimilarCasesDisplay;
