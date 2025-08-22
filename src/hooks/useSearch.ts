import { useState, useCallback, useEffect } from 'react';
import { SearchResponse, SearchFilters, SortOrder } from '@/types/search';

interface UseSearchReturn {
  // 状態
  searchResults: SearchResponse | null;
  loading: boolean;
  error: string | null;
  
  // 検索パラメータ
  query: string;
  filters: SearchFilters;
  sortOrder: SortOrder;
  
  // アクション
  setQuery: (query: string) => void;
  setFilters: (filters: SearchFilters) => void;
  setSortOrder: (sortOrder: SortOrder) => void;
  executeSearch: () => Promise<void>;
  clearSearch: () => void;
}

export const useSearch = (): UseSearchReturn => {
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    industry_categories: [],
    alcohol_types: [],
  });
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const executeSearch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (query.trim()) {
        params.append('query', query.trim());
      }
      
      if (filters.industry_categories.length > 0) {
        params.append('industry_categories', filters.industry_categories.join(','));
      }
      
      if (filters.alcohol_types.length > 0) {
        params.append('alcohol_types', filters.alcohol_types.join(','));
      }
      
      params.append('sort_order', sortOrder);
      params.append('limit', '50');
      params.append('offset', '0');

      const response = await fetch(`/api/search?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`検索エラー: ${response.status}`);
      }
      
      const data: SearchResponse = await response.json();
      setSearchResults(data);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : '検索中にエラーが発生しました');
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  }, [query, filters, sortOrder]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setFilters({
      industry_categories: [],
      alcohol_types: [],
    });
    setSortOrder('newest');
    setSearchResults(null);
    setError(null);
  }, []);

  // 初回読み込み時に空検索を実行してフィルタオプションを取得
  useEffect(() => {
    executeSearch();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // フィルタや並び替えが変更された時に自動検索を実行
  useEffect(() => {
    const timer = setTimeout(() => {
      executeSearch();
    }, 300); // 300msの遅延で連続クリックを防ぐ

    return () => clearTimeout(timer);
  }, [filters, sortOrder]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
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
    clearSearch,
  };
};
