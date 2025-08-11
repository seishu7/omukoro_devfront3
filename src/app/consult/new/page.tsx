"use client";

import { useState } from 'react';
import { ConsultTextArea } from '@/components/ConsultTextArea';
import { RealtimeProgressBar, type CompletenessLevel } from '@/components/RealtimeProgressBar';
// import { SuggestionBadges } from '@/components/SuggestionBadges';
import { SuggestionList } from '@/components/SuggestionList';
import { useRealtimeAnalysis } from '@/hooks/useRealtimeAnalysis';
// import { ArrowRight } from 'lucide-react';
import Bubble from '@/components/Bubble';
import CompletenessIcon from '@/components/icons/CompletenessIcon';

export default function Page() {
  const [text, setText] = useState('');
  const { analysis, isLoading, analyzeInput, handleFileUpload, isFileUploading } = useRealtimeAnalysis();
  const level: CompletenessLevel = analysis?.completeness ?? 1;
  const suggestions = analysis?.suggestions ?? [];
  const showProgress = text.trim().length > 0 && !isLoading && !isFileUploading && !!analysis;

  // const categories = (() => {
  //   // ルールベース簡易推定：入力テキストに基づく不足カテゴリ推定
  //   const defs: { label: string; patterns: RegExp[] }[] = [
  //     { label: '商品/サービス', patterns: [/商品|サービス|企画|施策|プロダクト/] },
  //     { label: 'ターゲット顧客', patterns: [/ターゲット|顧客|対象|ユーザー|ペルソナ/] },
  //     { label: 'スケジュール・時期', patterns: [/スケジュール|時期|期日|日程|月|週|いつ|開始|終了/] },
  //     { label: '目的・目標', patterns: [/目的|目標|KPI|ゴール|狙い|意図/] },
  //   ];
  //   const textLower = (text || '').toLowerCase();
  //   const missing: string[] = [];
  //   defs.forEach((d) => {
  //     const hit = d.patterns.some((p) => p.test(textLower));
  //     if (!hit) missing.push(d.label);
  //   });
  //   if (level >= 4) return [];
  //   return missing;
  // })();

  const handleSubmit = () => {
    // TODO: 次画面（論点・相談先表示）へ遷移 or /api/analytics 呼び出し
    // ここではプレースホルダ
    alert('送信しました（ダミー）');
  };

  const isSubmitDisabled = !text.trim() || isLoading || isFileUploading;
  const bubbleColor = (() => {
    const map: Record<number, string> = {
      1: '#959595',
      2: '#959595',
      3: '#C6AA0E',
      4: '#FF753E',
      5: '#16C47F',
    };
    return map[level] || '#959595';
  })();

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-12 space-y-10 my-10">
      {/* ▼▼▼ デバッグ用コード：このブロックを追加 ▼▼▼ */}
      <div style={{ position: 'fixed', top: 0, left: 0, background: 'white', color: 'red', padding: '10px', zIndex: 9999, border: '2px solid red' }}>
        <strong>[Debug] API Endpoint:</strong> {process.env.NEXT_PUBLIC_API_ENDPOINT || "【環境変数が設定されていません】"}
      </div>
      {/* ▲▲▲ デバッグ用コード：ここまで ▲▲▲ */}
      <h1 className="text-center text-white text-3xl font-bold mb-30">何を相談したいですか？</h1>

      {/* 入力カード（吹き出しはカード外・左下に表示） */}
      <div className="relative w-full">
        <section className="bg-white rounded-2xl p-0 space-y-10 shadow-sm">
          <div className="relative">
            <ConsultTextArea
              value={text}
              onChange={(v) => {
                setText(v);
                analyzeInput(v);
              }}
              onFilesSelect={(files) => handleFileUpload(files)}
            />
          </div>
          {(isLoading || isFileUploading) && (
            <div className="px-6 pb-4">
              <p className="text-xs text-gray-600">解析中...</p>
            </div>
          )}
        </section>

        {showProgress && (
          <div>
            {/* 充足度（現在の位置：上側のまま） */}
            <div className="absolute -top-18 z-10">
              <Bubble color={bubbleColor} tailSide="bottom" tailOffsetClass="left-8">
                <div className="w-44 text-white">
                  <RealtimeProgressBar level={level} withLabel className="flex-col items-center gap-1" />
                </div>
              </Bubble>
            </div>

            {/* 提案のみ：ConsultTextArea 左下（入力カード外） */}
            {suggestions.length > 0 && (
              <div
                className="absolute left-6 z-10 max-w-[25vw]"
                style={{ top: 'calc(100% + 8px)' }}
              >
                <Bubble color={bubbleColor} tailSide="top" tailOffsetClass="left-8">
                  <div className="max-h-48 overflow-auto text-white break-words whitespace-pre-wrap">
                    <SuggestionList suggestions={suggestions} />
                  </div>
                </Bubble>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* 独立した送信ボタン（カード外・右寄せ） */}
      <div className="flex justify-end hover:opacity-80 transition-opacity">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className="inline-flex items-center gap-3 rounded-md px-6 py-3 text-base font-bold"
          style={{
            backgroundColor: isSubmitDisabled ? '#FFFFFF99' : '#FFFFFF',
            color: '#272727',
          }}
        >
          <CompletenessIcon
            active
            color="#000000"
            background="transparent"
            width={20}
            height={18}
            ariaLabel="送信"
            className="shrink-0"
          />
          送信
        </button>
      </div>
    </div>
  );
}

