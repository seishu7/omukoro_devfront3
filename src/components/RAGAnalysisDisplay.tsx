'use client';

import React from 'react';
import { RAGComparisonResponse } from '@/types/rag-comparison';
import { CheckCircle, Lightbulb, TrendingUp, Target } from 'lucide-react';

interface RAGAnalysisDisplayProps {
  result: RAGComparisonResponse;
}

export const RAGAnalysisDisplay: React.FC<RAGAnalysisDisplayProps> = ({ result }) => {
  // バックエンドからの解説が存在しない場合は何も表示しない
  if (!result.analysis) {
    return null;
  }

  const { analysis } = result;

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-yellow-500" />
        RAG比較分析結果
      </h3>
      
      {/* 分析内容 */}
      <div className="mb-8">
        <h4 className="font-semibold text-gray-800 mb-3 text-base">📊 詳細分析</h4>
        <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-400">
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{analysis.analysis}</p>
        </div>
      </div>

      {/* 従来RAGの優位性 */}
      <div className="mb-8">
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-base">
          <CheckCircle className="w-5 h-5 text-blue-500" />
          従来RAGの優位性
        </h4>
        <div className="space-y-3">
          {analysis.traditional_advantages.map((advantage, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-gray-800 font-medium">{advantage}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ハイブリッドRAGの優位性 */}
      <div className="mb-8">
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 text-base">
          <TrendingUp className="w-5 h-5 text-green-500" />
          ハイブリッドRAGの優位性
        </h4>
        <div className="space-y-3">
          {analysis.hybrid_advantages.map((advantage, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-gray-800 font-medium">{advantage}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 推奨事項 */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg border-l-4 border-purple-400 shadow-sm">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-base">
          <Target className="w-5 h-5 text-purple-500" />
          推奨事項
        </h4>
        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{analysis.recommendation}</p>
      </div>
    </div>
  );
};
