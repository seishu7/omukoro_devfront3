import { useState, useCallback } from 'react';
import { RAGComparisonResponse, RAGComparisonRequest } from '@/types/rag-comparison';

interface UseRAGComparisonReturn {
  // 状態
  comparisonResult: RAGComparisonResponse | null;
  loading: boolean;
  error: string | null;
  
  // アクション
  compareRAG: (query: string) => Promise<void>;
  clearComparison: () => void;
}

export const useRAGComparison = (): UseRAGComparisonReturn => {
  const [comparisonResult, setComparisonResult] = useState<RAGComparisonResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compareRAG = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);

    try {
      const requestBody: RAGComparisonRequest = { query };
      
      const response = await fetch('/api/compare-rag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        throw new Error(`RAG比較エラー: ${response.status}`);
      }
      
      const data: RAGComparisonResponse = await response.json();
      setComparisonResult(data);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'RAG比較中にエラーが発生しました');
      setComparisonResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearComparison = useCallback(() => {
    setComparisonResult(null);
    setError(null);
  }, []);

  return {
    comparisonResult,
    loading,
    error,
    compareRAG,
    clearComparison,
  };
};
