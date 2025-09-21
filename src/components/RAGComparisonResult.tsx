'use client';

import React, { useState } from 'react';
import { RAGComparisonResponse, RAGChunk } from '@/types/rag-comparison';
import { ChevronDown, ChevronRight, Clock, FileText, Search, Network } from 'lucide-react';

interface RAGComparisonResultProps {
  result: RAGComparisonResponse;
}

interface RAGChunkItemProps {
  chunk: RAGChunk;
  index: number;
}

const RAGChunkItem: React.FC<RAGChunkItemProps> = ({ chunk, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSearchTypeIcon = (searchType: string) => {
    switch (searchType) {
      case 'vector':
        return <Search className="w-4 h-4" />;
      case 'graph':
        return <Network className="w-4 h-4" />;
      case 'keyword':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getSearchTypeLabel = (searchType: string) => {
    switch (searchType) {
      case 'vector':
        return 'ベクトル検索';
      case 'graph':
        return 'グラフ検索';
      case 'keyword':
        return 'キーワード検索';
      default:
        return searchType;
    }
  };

  const getSearchTypeColor = (searchType: string) => {
    switch (searchType) {
      case 'vector':
        return 'bg-blue-100 text-blue-800';
      case 'graph':
        return 'bg-green-100 text-green-800';
      case 'keyword':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg mb-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
            <h4 className="font-medium text-gray-900 truncate">
              {chunk.metadata.prefLabel}
            </h4>
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getSearchTypeColor(chunk.search_type)}`}>
              {getSearchTypeIcon(chunk.search_type)}
              {getSearchTypeLabel(chunk.search_type)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </div>
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="mt-3 space-y-3">
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">条文内容</h5>
              <div className="bg-gray-50 p-3 rounded text-sm text-gray-800 whitespace-pre-wrap">
                {chunk.content}
              </div>
            </div>
            
            {chunk.metadata.graph_keywords && chunk.metadata.graph_keywords.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-1">関連キーワード</h5>
                <div className="flex flex-wrap gap-1">
                  {chunk.metadata.graph_keywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const RAGComparisonResult: React.FC<RAGComparisonResultProps> = ({ result }) => {
  const traditionalChunks = result.traditional_rag.chunks || [];
  const hybridChunks = result.hybrid_rag.final_chunks || [];

  return (
    <div className="space-y-6">
      {/* ヘッダー情報 */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">RAG比較結果</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">クエリ</h3>
            <p className="text-gray-900">{result.query}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-700 mb-2">実行時間</h3>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-900">
                {result.total_execution_time_ms.toFixed(0)}ms
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 比較結果 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 従来RAG */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">従来RAG</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{traditionalChunks.length}件</span>
              <span>•</span>
              <span>{result.traditional_rag.execution_time_ms.toFixed(0)}ms</span>
            </div>
          </div>
          
          <div className="space-y-2">
            {traditionalChunks.length > 0 ? (
              traditionalChunks.map((chunk, index) => (
                <RAGChunkItem
                  key={chunk.chunk_id}
                  chunk={{
                    id: chunk.chunk_id,
                    content: chunk.text,
                    source: chunk.prefLabel,
                    metadata: {
                      prefLabel: chunk.prefLabel,
                      section_label: chunk.section_label,
                      chunk_id: chunk.chunk_id,
                    },
                    score: chunk.score,
                    search_type: chunk.search_type as 'vector' | 'graph' | 'keyword', // バックエンドから取得
                    node_id: null,
                    edge_info: null,
                  }}
                  index={index}
                />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">結果がありません</p>
            )}
          </div>
        </div>

        {/* ハイブリッドRAG */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">ハイブリッドRAG</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{hybridChunks.length}件</span>
              <span>•</span>
              <span>{result.hybrid_rag.execution_time_ms.toFixed(0)}ms</span>
            </div>
          </div>
          
          <div className="space-y-2">
            {hybridChunks.length > 0 ? (
              hybridChunks.map((chunk, index) => (
                <RAGChunkItem
                  key={chunk.id}
                  chunk={chunk}
                  index={index}
                />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">結果がありません</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
