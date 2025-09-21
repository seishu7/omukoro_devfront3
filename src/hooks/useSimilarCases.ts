import { useState, useCallback } from 'react';
import { similarCasesApi, SimilarCasesResponse, SimilarCasesRequest } from '../services/similarCasesApi';

// フックの戻り値の型定義
interface UseSimilarCasesReturn {
  // データ
  data: SimilarCasesResponse | null;
  // 状態
  isLoading: boolean;
  error: string | null;
  // アクション
  fetchSimilarCases: (params: SimilarCasesRequest) => Promise<void>;
  fetchByCategoryAndTitle: (industry_category_id: string, summary_title: string, limit?: number) => Promise<void>;
  fetchRecentCases: (limit?: number) => Promise<void>;
  // ユーティリティ
  clearError: () => void;
  reset: () => void;
}

/**
 * 類似相談案件の取得を管理するカスタムフック
 * @returns 類似相談案件の状態とアクション
 */
export const useSimilarCases = (): UseSimilarCasesReturn => {
  // 状態管理
  const [data, setData] = useState<SimilarCasesResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * エラーをクリアする
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * 状態をリセットする
   */
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  /**
   * 類似相談案件を取得する（汎用）
   * @param params リクエストパラメータ
   */
  const fetchSimilarCases = useCallback(async (params: SimilarCasesRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await similarCasesApi.getSimilarCases(params);
      setData(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
      setError(errorMessage);
      console.error('類似相談案件取得エラー:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 業種カテゴリと要約タイトルを指定して類似相談案件を取得する
   * @param industry_category_id 業種カテゴリID
   * @param summary_title 要約タイトル
   * @param limit 取得件数（デフォルト: 2）
   */
  const fetchByCategoryAndTitle = useCallback(async (
    industry_category_id: string,
    summary_title: string,
    limit: number = 2
  ) => {
    await fetchSimilarCases({
      industry_category_id,
      summary_title,
      limit,
    });
  }, [fetchSimilarCases]);

  /**
   * 最新の相談案件を取得する（要約タイトル未指定）
   * @param limit 取得件数（デフォルト: 2）
   */
  const fetchRecentCases = useCallback(async (limit: number = 2) => {
    await fetchSimilarCases({ limit });
  }, [fetchSimilarCases]);

  return {
    // データ
    data,
    // 状態
    isLoading,
    error,
    // アクション
    fetchSimilarCases,
    fetchByCategoryAndTitle,
    fetchRecentCases,
    // ユーティリティ
    clearError,
    reset,
  };
};

