'use client';

import { useRouter, useParams } from 'next/navigation';
import { loadConsultDraft } from '@/components/ConsultDraft';
import { useEffect, useState } from 'react';

interface Consultant {
  name: string;
  department: string;
  expertise: string;
  channelId?: string;
  mentionUserId?: string;
}

interface AnalyticsData {
  summary: string;
  questions: string[];
  consultants: Consultant[];
  analysis_metadata: {
    confidence: number;
    generated_at: string;
  };
}

export default function SummaryPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const draft = loadConsultDraft();
  const question = draft?.text ?? '（直前の相談文を取得できませんでした）';

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // ページ読み込み時に分析データを取得
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!question || question === '（直前の相談文を取得できませんでした）') {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: question,
          }),
        });

        const result = await response.json();
        if (result.success) {
          setAnalyticsData(result.data);
        }
      } catch (error) {
        console.error('Analytics fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [question]);

  // Teams送信処理
  const handleSendToTeams = async (consultant: Consultant) => {
    if (!analyticsData) return;

    setIsSending(true);

    try {
      const questionsText = analyticsData.questions
        .map((q, i) => `${i + 1}. ${q}`)
        .join('\n');

      const message = `【相談依頼】

【相談内容】
${analyticsData.summary}

【質問事項】
${questionsText}

【相談者より】
上記について、ご知見をお聞かせいただけますでしょうか。
よろしくお願いいたします。`;

      const response = await fetch('/api/teams/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          consultantName: consultant.name,
          consultantDepartment: consultant.department,
          channelId: consultant.channelId,
          mentionUserId: consultant.mentionUserId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`${consultant.name}さんにTeamsで相談を送信しました！`);
      } else {
        alert(`送信に失敗しました: ${result.message}`);
      }
    } catch (error) {
      console.error('Teams send error:', error);
      alert('Teams送信中にエラーが発生しました');
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="relative min-h-screen">
      {/* ← consult/layout.tsx で全画面ドット背景を敷いているので、ここでの背景指定は不要 */}
      <div className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
        {/* トップ中央の小アイコン群（飾り） */}
        <div className="flex items-center justify-center gap-6 mb-6">
          {/* 吹き出しアイコン */}
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white">
            <BubbleSvg className="h-4 w-4" />
          </span>
          {/* おにぎりアイコン（ロゴ） */}
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white">
            <OnigiriSvg className="h-4 w-4" />
          </span>
        </div>

        {/* 顔カード風ヘッダー */}
        <div className="rounded-3xl bg-gradient-to-b from-[#2b2b2b] to-[#1f1f1f] text-white p-6 shadow-lg flex items-center gap-4">
          <div className="h-14 w-14 rounded-full overflow-hidden shrink-0 bg-white/10" />
          <div className="flex-1">
            <div className="text-xs text-white/70">
              {analyticsData?.consultants[0]?.department || '品質保証部'}
            </div>
            <div className="text-xl font-semibold">
              {analyticsData?.consultants[0]?.name || '佐々木 昌平'} さん
            </div>
            <div className="mt-2 flex gap-2">
        {/* ▼ SVG( /TeamsIcon.svg ) を埋め込んだピル型ボタン */}
        {/* public/TeamsButton.svg をそのままボタンとして使う */}
            <button
            onClick={() => {
              if (analyticsData?.consultants[0]) {
                handleSendToTeams(analyticsData.consultants[0]);
              }
            }}
            disabled={isSending || !analyticsData}
            className="p-0 border-0 bg-transparent cursor-pointer disabled:opacity-50"
            title="Teamsで連絡する"
            >
            <img
                src="/TeamsIcon.svg" // ← public直下に置いた完成デザインのSVG
                alt="Teamsで連絡する"
                className="h-[40px] w-auto" // 高さなど調整
            />
            </button>

        {/* 既存のメールボタンはそのまま */}
        <button
            className="px-3 py-1.5 text-xs rounded-md bg-white/10 border border-white/20"
            onClick={() => alert('準備中です（メール連絡）')}
        >
            メールで連絡する
        </button>
        </div>


          </div>
          <div className="hidden sm:block">
            <span className="inline-block px-3 py-1 text-xs rounded-full bg-emerald-500 text-white">フレンドリー</span>
          </div>
        </div>

        {/* 本文カード */}
        <div className="mt-6 rounded-xl bg-white shadow p-6">
          <h2 className="text-lg font-bold mb-2">打ち込んだ内容の要約</h2>
          <p className="text-sm text-gray-600 mb-4">相談ID: {params.id}</p>

          {/* 相談内容（AI要約） */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <BubbleSvg className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm text-gray-500">相談内容（AI要約）</h3>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 whitespace-pre-wrap text-[15px] text-gray-800">
              {analyticsData?.summary || question}
            </div>
          </div>

          {/* 質問事項（AIが生成） */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <BubbleSvg className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm text-gray-500">質問事項</h3>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 leading-7 text-gray-800">
              {isLoading ? (
                <div className="text-gray-500">質問事項を生成中...</div>
              ) : analyticsData?.questions ? (
                <ul className="space-y-2">
                  {analyticsData.questions.map((q, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 font-medium">{index + 1}.</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500">質問事項の生成に失敗しました。</div>
              )}
            </div>
          </div>

          {/* 関連根拠セクション（ダミー） */}
          <div className="mb-6">
            <h3 className="text-sm text-gray-500 mb-2">関連根拠</h3>
            <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
              根拠リンクや引用をここに表示します。
            </div>
          </div>


          {/* --- 「関連が近い相談」セクション --- */}
            <div className="mb-6">
            <h3 className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                <img src="/Omusubi2.svg" alt="" width={40} height={40} />
                関連が近い相談
            </h3>
            <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-700 space-y-2">
                <p>過去の相談：「酒税法に関する納税猶予申請について」</p>
                <p>過去の相談：「特定酒類の分類基準に関する照会」</p>
            </div>
            </div>

          {/* アクション列 */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
            <button
              className="inline-flex items-center justify-center gap-3 rounded-lg
                         bg-white px-5 py-2 shadow-sm hover:shadow border border-black/10 text-[rgba(39,39,39,0.9)]"
              onClick={() => router.push('/consult/new')}
              title="もう一度質問する（直前の内容は自動で復元されます）"
            >
              {/* おにぎりロゴ（SVG） */}
              <OnigiriSvg className="h-[18px] w-[22px] text-[#2b2b2b]" />
              <span className="text-[15px] font-bold">再度質問する</span>
            </button>

            <button
              className="px-4 py-2 rounded-lg bg-gray-100 border border-gray-200 text-gray-700"
              onClick={() => window.print()}
            >
              この結果を印刷
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== SVGs（このファイル内だけで完結） ===== */
function OnigiriSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 22" className={className} fill="currentColor" aria-hidden>
      {/* 丸みのある三角（本体） */}
      <path
        d="M7.45 2.45C10 -0.82 14.99 -0.82 17.55 2.45c.24.31.52.79 1.1 1.77l4.34 7.36c.58.98.86 1.46 1.02 1.84 1.62 3.8-.9 8.06-5.04 8.56-.39.05-.96.05-2.1.05H8.16c-1.14 0-1.71 0-2.11-.05-4.16-.5-6.66-4.76-5.04-8.56.16-.38.44-.86 1.02-1.84L6.37 4.22c.58-.98.86-1.46 1.08-1.77Z"
      />
      {/* 中央の白い穴 */}
      <circle cx="12" cy="13" r="2.6" fill="#ffffff" />
    </svg>
  );
}

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
