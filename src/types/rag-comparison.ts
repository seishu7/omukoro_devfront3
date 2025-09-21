// RAG比較結果の型定義

export interface RAGChunk {
  id: string;
  content: string;
  source: string;
  metadata: {
    prefLabel: string;
    section_label: string;
    chunk_id: string;
    graph_keywords?: string[];
  };
  score: number;
  search_type: 'vector' | 'graph' | 'keyword';
  node_id?: string | null;
  edge_info?: Record<string, unknown> | null;
}

export interface TraditionalRAGChunk {
  chunk_id: string;
  prefLabel: string;
  section_label: string;
  text: string;
  score: number;
  search_type: string;
}

export interface RAGSearchResult {
  search_type: 'vector' | 'graph' | 'keyword';
  total_count: number;
  execution_time_ms: number;
}

export interface RAGComparisonResult {
  rag_type: 'traditional' | 'hybrid';
  query?: string;
  expanded_query?: string;
  chunks?: TraditionalRAGChunk[]; // 従来RAG用
  final_chunks?: RAGChunk[]; // ハイブリッドRAG用
  search_results?: {
    vector?: RAGSearchResult;
    graph?: RAGSearchResult;
    keyword?: RAGSearchResult;
  };
  total_count: number;
  execution_time_ms: number;
  search_methods?: string[];
  data_sources?: string[];
}

export interface RAGComparisonResponse {
  query: string;
  traditional_rag_labels: string[];
  hybrid_rag_labels: string[];
  traditional_rag: RAGComparisonResult;
  hybrid_rag: RAGComparisonResult;
  comparison_metrics: {
    time_comparison: {
      traditional_time_ms: number;
      hybrid_time_ms: number;
      time_difference_ms: number;
      faster_method: string;
    };
    count_comparison: {
      traditional_count: number;
      hybrid_count: number;
      count_difference: number;
      more_results_method: string;
    };
    score_comparison: {
      traditional: {
        average_score: number;
        max_score: number;
        min_score: number;
      };
      hybrid: {
        average_score: number;
        max_score: number;
        min_score: number;
      };
      comparison: {
        higher_average: string;
        score_difference: number;
      };
    };
    diversity_comparison: {
      traditional_unique_sources: number;
      hybrid_unique_search_types: number;
      traditional_sources: string[];
      hybrid_search_types: string[];
      diversity_winner: string;
    };
    summary: {
      traditional_advantages: string[];
      hybrid_advantages: string[];
    };
  };
  // バックエンドからの解説コメント
  analysis?: {
    analysis: string;
    traditional_advantages: string[];
    hybrid_advantages: string[];
    recommendation: string;
  };
  total_execution_time_ms: number;
  success: boolean;
  error_message?: string | null;
}

export interface RAGComparisonRequest {
  query: string;
}

