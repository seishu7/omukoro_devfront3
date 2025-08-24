"use client";


import { ConsultTextArea } from '@/components/ConsultTextArea';
import { RealtimeProgressBar, type CompletenessLevel } from '@/components/RealtimeProgressBar';
// import { SuggestionBadges } from '@/components/SuggestionBadges';
import { SuggestionList } from '@/components/SuggestionList';
import { useRealtimeAnalysis } from '@/hooks/useRealtimeAnalysis';
// import { ArrowRight } from 'lucide-react';
import Bubble from '@/components/Bubble';
import CompletenessIcon from '@/components/icons/CompletenessIcon';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveConsultDraft, loadConsultDraft } from '@/components/ConsultDraft';
import LoadingModal from '@/components/LoadingModal'; // ← 追加
import { UploadedFileList } from '@/components/UploadedFileList'; // ← 追加


export default function Page() {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { 
    analysis, 
    isLoading, 
    analyzeInput, 
    handleFileUpload, 
    isFileUploading, 
    uploadedFiles, 
    removeFile 
  } = useRealtimeAnalysis();
  const level: CompletenessLevel = analysis?.completeness ?? 1;
  // 既にある level 定義のすぐ下あたりに追加
useEffect(() => {
  const n = Math.max(0, Math.min(5, Math.round(Number(level))));
  const map: Record<number, string> = {
    1: '#959595',
    2: '#959595',
    3: '#C6AA0E',
    4: '#FF753E',
    5: '#16C47F',
  };
  const color = map[n] || '#959595';
  try {
    localStorage.setItem('consult_omusubi', String(n));
    localStorage.setItem('consult_omusubi_color', color);
  } catch {}
}, [level]);

  const suggestions = analysis?.suggestions ?? [];
  const showProgress = text.trim().length > 0 && !isLoading && !isFileUploading && !!analysis;
  const router = useRouter();

   useEffect(() => {
       const d = loadConsultDraft();
       if (d?.text) setText(d.text);
     }, []);    


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

  const handleSubmit = async () => {
    if (!text.trim() || submitting) return;
    setSubmitting(true);
  
    try {
      saveConsultDraft(text);

      try {
        localStorage.setItem('consult_omusubi', String(level ?? 0));
      } catch {}
      
      // 相談提案生成APIを呼び出し
      const formData = new FormData();
      formData.append('text', text);
      
      // APIのベースURL（環境変数から取得、フォールバックは本番環境のURL）
      const apiUrl = process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://aps-omu-02.azurewebsites.net';
      const response = await fetch(`${apiUrl}/api/consultations/generate-suggestions`, {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        // 相談IDとAPIレスポンス全体を保存
        localStorage.setItem('consultation_id', result.consultation_id);
        localStorage.setItem('consultation_data', JSON.stringify(result));
        
        // 2秒間解析中モーダルを表示
        setTimeout(() => {
          router.push(`/consult/summary`);
        }, 2000);
      } else {
        throw new Error('相談提案生成に失敗しました');
      }
    } catch (e) {
      console.error('送信に失敗:', e);
      setSubmitting(false);
      alert('送信に失敗しました。時間をおいて再度お試しください。');
    }
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
      <h1 className="text-center text-white text-3xl font-bold mb-30">何を相談したいですか？</h1>

      {/* 入力カード（吹き出しはカード外・左下に表示） */}
      <div className="relative w-full">
        <section className="bg-white rounded-2xl p-0 shadow-sm">
          <ConsultTextArea
            value={text}
            onChange={(v) => {
              setText(v);
              analyzeInput(v);
            }}
            onFilesSelect={handleFileUpload}
          />
          <UploadedFileList files={uploadedFiles} onRemoveFile={removeFile} />
          
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
                className="absolute left-6 z-10 max-w-[30vw]" //表示幅を調整
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
        disabled={isSubmitDisabled || submitting}   // ← 送信中も無効化
        className="inline-flex items-center gap-3 rounded-md px-6 py-3 text-base font-bold"
        style={{
          backgroundColor: (isSubmitDisabled || submitting) ? '#FFFFFF99' : '#FFFFFF',
          color: '#272727',
        }}
      >
          <CompletenessIcon  // 修正: 送信ボタンのアイコン
            color="#000000"
            size={20}
            className="shrink-0"
          />
          送信
        </button>
        
      </div>
      <LoadingModal open={submitting} label="解析中…" />

    </div>
  );
}

