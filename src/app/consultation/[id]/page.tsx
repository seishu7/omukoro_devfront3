'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import AppHeader from '@/components/AppHeader';
import SimilarCasesDisplay from '@/components/SimilarCasesDisplay';
import { useSimilarCases } from '@/hooks/useSimilarCases';

/* ========= Types ========= */
interface CategoryItem { category_id: string; category_name: string; }
interface AlcoholType { type_id: string; type_name: string; }
interface Regulation { prefLabel?: string; section_label?: string; score?: number; text: string; }
interface Advisor { user_id: string; name: string; department: string; email?: string; }

interface ConsultationDetail {
  consultation_id?: string;
  title?: string;
  summary_title?: string;
  initial_content?: string;
  content?: string;
  created_at?: string;
  status?: string;
  industry_category_id?: string;
  alcohol_type_id?: string;
  key_issues?: string;
  suggested_questions?: string[];
  action_items?: string;
  omusubi_score?: number;
  relevant_regulations?: Regulation[];
  recommended_advisor?: Advisor;
  //主要論点と質問のブロックを追加
  key_issue_1?: string;
  key_issue_2?: string;
  key_issue_3?: string;
  suggested_question_1?: string;
  suggested_question_2?: string;
  suggested_question_3?: string;
  issue_question_pair_1?: string; 
  issue_question_pair_2?: string;
  issue_question_pair_3?: string;
}

/* ========= UI badges ========= */
interface AdvisorBadges {
  topLeft?: string;
  topRight?: string;
  bottomRight?: string;
}

/* ========= Small UI parts ========= */
function CornerPill({ children, color = 'orange', className = '' }: { children: React.ReactNode; color?: 'orange' | 'green'; className?: string; }) {
  const bg = color === 'green' ? 'bg-[#12c06a]' : 'bg-[#ff5a3c]';
  return (
    <span className={['inline-flex items-center rounded-full', 'px-6 py-3 text-[14px] sm:text-[15px] font-bold text-white', 'shadow-md pointer-events-none z-20', bg, className].join(' ')}>
      {children}
    </span>
  );
}

/* ===== SVGs ===== */
function OnigiriSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 22" className={className} fill="currentColor" aria-hidden>
      <path d="M7.45 2.45C10 -0.82 14.99 -0.82 17.55 2.45c.24.31.52.79 1.1 1.77l4.34 7.36c.58.98.86 1.46 1.02 1.84 1.62 3.8-.9 8.06-5.04 8.56-.39.05-.96.05-2.1.05H8.16c-1.14 0-1.71 0-2.11-.05-4.16-.5-6.66-4.76-5.04-8.56.16-.38.44-.86 1.02-1.84L6.37 4.22c.58-.98.86-1.46 1.08-1.77Z" />
      <circle cx="12" cy="13" r="2.6" fill="#ffffff" />
    </svg>
  );
}

function BubbleSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M5 6a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H11l-3.8 3.1c-.7.57-1.7.06-1.7-.83V16A3 3 0 0 1 5 13V6Z" fill="currentColor" />
    </svg>
  );
}

function OmusubiIcon({
  active,
  color,               // 追加: 有効時の色
  className = '',
}: {
  active: boolean;
  color?: string;
  className?: string;
}) {
  const inactive = '#D1D5DB'; // gray-300 相当

  return (
    <svg
      viewBox="0 0 24 22"
      aria-hidden
      className={className}
      style={{ color: active ? color : inactive }} // ← ここで色を渡す
      fill="currentColor"
    >
      <path d="M7.45 2.45C10 -0.82 14.99 -0.82 17.55 2.45c.24.31.52.79 1.1 1.77l4.34 7.36c.58.98.86 1.46 1.02 1.84 1.62 3.8-.9 8.06-5.04 8.56-.39.05-.96.05-2.1.05H8.16c-1.14 0-1.71 0-2.11-.05-4.16-.5-6.66-4.76-5.04-8.56.16-.38.44-.86 1.02-1.84L6.37 4.22c.58-.98.86-1.46 1.08-1.77Z" />
    </svg>
  );
}

function OmusubiMeter({ count = 0, color = '#959595' }: { count: number; color?: string }) {
  return (
    <div className="flex items-center gap-2" style={{ color }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <OmusubiIcon key={i} active={i < count} color={color} className="h-5 w-5" />
      ))}
    </div>
  );
}

export default function ConsultationDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const consultationId = params.id;
  
  // 類似相談案件の取得
  const { data: similarCasesData, isLoading: isLoadingSimilarCases, error: similarCasesError, fetchByCategoryAndTitle } = useSimilarCases();
  
  const [consultationDetail, setConsultationDetail] = useState<ConsultationDetail | null>(null);
  const [categoryMappings, setCategoryMappings] = useState<{ industry: Record<string, string>; alcohol: Record<string, string>; }>({ industry: {}, alcohol: {} });
  const [isTeamsSending, setIsTeamsSending] = useState(false);
  const [omusubiCount, setOmusubiCount] = useState<number>(0);
  const omusubiColor = useMemo(() => {
    const map: Record<number, string> = {
      1: '#959595',
      2: '#959595',
      3: '#C6AA0E',
      4: '#FF753E',
      5: '#16C47F',
    };
    return map[omusubiCount] ?? '#959595';
  }, [omusubiCount]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Badges（ダミー）
  const [advisorBadges, setAdvisorBadges] = useState<AdvisorBadges>({});
  useEffect(() => {
    setAdvisorBadges({
      topLeft: '酒税法を扱って5年目',
      topRight: 'この領域はまかせろ！',
      bottomRight: 'フレンドリー',
    });
  }, []);

  // API エンドポイント
  const api02 = process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://aps-omu-02.azurewebsites.net';
  const api01 = 'https://aps-omu-01.azurewebsites.net';

  // 追加: 動的フィールドを型で表現
  type NumStr = '1' | '2' | '3';
  type PairKeys =
    | `issue_question_pair_${NumStr}`
    | `key_issue_${NumStr}`
    | `suggested_question_${NumStr}`;

  // consultationDetail にこれらのキーが来る想定を足す
  type DetailWithPairs = ConsultationDetail & Partial<Record<PairKeys, string>>;

  // 追加: 型ガード
  const isNonEmptyString = (v: unknown): v is string =>
    typeof v === 'string' && v.trim().length > 0;

  type IssueQuestionPair = { issue: string; question: string };

  const issueQuestionPairs: IssueQuestionPair[] = useMemo(() => {
    const d = (consultationDetail ?? {}) as DetailWithPairs;

    const pairs: IssueQuestionPair[] = [];

    const norm = (s: unknown) =>
      String(s ?? '')
        .replace(/\r/g, '')
        .replace(/^[\s　]+|[\s　]+$/g, '')   // 前後の全角/半角スペース
        .replace(/^(\d+[\.\)]\s*)/, '')      // 先頭の「1. 」などを削除
        .replace(/^論点[:：]\s*/, '')        // ラベル消し
        .replace(/^質問[:：]\s*/, '');

    const pushUnique = (
      issueRaw: unknown,
      questionRaw: unknown,
      seen: Set<string>
    ) => {
      const issue = norm(issueRaw);
      const question = norm(questionRaw);
      if (!issue && !question) return;
      const key = `${issue}__${question}`;

      if (seen.has(key)) return;
      seen.add(key);
      pairs.push({ issue, question });
    };

    const seen = new Set<string>();

    // 1) まとめ済み（最優先）
    const packed = (['1', '2', '3'] as const)
      .map((n) => d[`issue_question_pair_${n}`])
      .filter(isNonEmptyString);

    if (packed.length > 0) {
      packed.forEach((raw) => {
        // 期待形式「論点：...\n質問：...」を頑健に抽出
        const lines = String(raw).split(/\n+/);
        const issueLine = lines.find((s) => /論点[:：]/.test(s)) ?? '';
        const questionLine = lines.find((s) => /質問[:：]/.test(s)) ?? '';
        pushUnique(issueLine, questionLine, seen);
      });
      return pairs; // ここで終了（個別フィールドへは進まない）
    }

    // 2) 個別フィールドを同番号で結合（①が無いときだけ）
    (['1', '2', '3'] as const).forEach((n) => {
      const issue = d[`key_issue_${n}`];
      const question = d[`suggested_question_${n}`];

      pushUnique(issue, question, seen);
    });

    return pairs;
  }, [consultationDetail]);

  /* ========= カテゴリ名マッピング ========= */
  useEffect(() => {
    const fetchCategoryMappings = async () => {
      try {
        const [industryResponse, alcoholResponse] = await Promise.all([
          fetch(`${api02}/api/consultations/industry-categories`),
          fetch(`${api02}/api/consultations/alcohol-types`),
        ]);

        if (industryResponse.ok && alcoholResponse.ok) {
          const industryData = await industryResponse.json();
          const alcoholData = await alcoholResponse.json();

          if (Array.isArray(industryData) && Array.isArray(alcoholData)) {
            const industryMap: Record<string, string> = {};
            industryData.forEach((cat: CategoryItem) => (industryMap[cat.category_id] = cat.category_name));

            const alcoholMap: Record<string, string> = {};
            alcoholData.forEach((t: AlcoholType) => (alcoholMap[t.type_id] = t.type_name));

            setCategoryMappings({ industry: industryMap, alcohol: alcoholMap });
          }
        }
      } catch {
        // 失敗時はデフォルト
        setCategoryMappings({
          industry: {
            cat0001: 'マーケティング商品企画',
            cat0002: '製造',
            cat0003: '研究開発',
            cat0004: '中身開発',
            cat0005: '物流',
          },
          alcohol: {
            alc0001: 'ビールテイスト',
            alc0002: 'RTD/RTS',
            alc0003: 'ワイン',
            alc0004: '和酒',
            alc0005: 'ノンアルコール',
          },
        });
      }
    };
    fetchCategoryMappings();
  }, [api02]);

  /* ========= おむすびメーター ========= */
  useEffect(() => {
    const fromDetail = consultationDetail?.omusubi_score;
    if (typeof fromDetail === 'number') {
      setOmusubiCount(Math.max(0, Math.min(5, Math.floor(fromDetail))));
    }
  }, [consultationDetail]);

  /* ========= 相談詳細の取得 ========= */
  useEffect(() => {
    if (!consultationId) return;

    const fetchConsultationDetail = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // API 02 から相談詳細を取得
        const res = await fetch(`${api02}/api/consultations/${consultationId}`);
        if (res.ok) {
          const data = (await res.json()) as ConsultationDetail;
          setConsultationDetail(data);
        } else {
          throw new Error('相談詳細の取得に失敗しました');
        }

        // API 01 から推薦アドバイザーを取得（補完）
        try {
          const a = await fetch(`${api01}/api/consultations/${consultationId}`);
          if (a.ok) {
            const advData = (await a.json()) as ConsultationDetail;
            if (advData?.recommended_advisor) {
              setConsultationDetail((prev) => ({
                ...prev,
                recommended_advisor: advData.recommended_advisor
              }));
            }
          }
        } catch {
          // アドバイザー取得の失敗は無視
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '相談詳細の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchConsultationDetail();
  }, [consultationId, api02, api01]);

  // 類似相談案件の取得
  useEffect(() => {
    if (consultationDetail?.industry_category_id && consultationDetail?.title) {
      // 類似ケース取得のエラーは silent で処理（ページ全体に影響しないように）
      fetchByCategoryAndTitle(
        consultationDetail.industry_category_id,
        consultationDetail.title,
        2
      ).catch((error) => {
        console.warn('類似相談案件の取得に失敗しましたが、処理を続行します:', error);
      });
    }
  }, [consultationDetail, fetchByCategoryAndTitle]);

  /* ========= 推薦アドバイザーの表示準備 ========= */
  const advisor = consultationDetail?.recommended_advisor ?? null;
  const advisorPhotoSrc = useMemo(() => {
    const uid = advisor?.user_id;
    return uid ? `/advisors/${uid}.png` : '/advisors/noavatar.png';
  }, [advisor?.user_id]);

  /* ========= Teams 送信 ========= */
  const handleTeamsSend = async () => {
    if (!consultationDetail) {
      alert('相談データが読み込まれていません。');
      return;
    }
    setIsTeamsSending(true);
    try {
              const message = `
【Sherpathからの相談】

■ 相談タイトル
${consultationDetail.title || '相談内容'}

■ 相談内容
${consultationDetail.initial_content || '内容なし'}

■ 質問
${consultationDetail.suggested_questions?.length
  ? consultationDetail.suggested_questions.map((q, i) => `${i + 1}. ${q}`).join('\n')
  : '質問生成中...'}

相談ID: ${consultationId}
      `.trim();

      const response = await fetch('/api/teams/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          consultantName: advisor?.name ?? '担当者',
          consultantDepartment: advisor?.department ?? '所属',
        }),
      });
      const result = await response.json();
      alert(result.success ? 'Teamsに正常に送信されました！' : `送信に失敗しました: ${result.message}`);
    } catch (error) {
      console.error('Teams送信エラー:', error);
      alert('送信中にエラーが発生しました。ネットワーク接続を確認してください。');
    } finally {
      setIsTeamsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dot-pattern">
        <AppHeader />
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF5A23]"></div>
            <p className="mt-3 text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dot-pattern">
        <AppHeader />
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-red-800 mb-2">エラーが発生しました</h2>
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ========= Render ========= */
  return (
    <div className="min-h-screen bg-dot-pattern">
      <AppHeader />
      
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



        {/* 本文カード */}
        <div className="mt-6 rounded-xl bg-white shadow p-6">
          <h2 className="text-lg font-bold mb-2">相談詳細</h2>
          <p className="text-sm text-gray-600 mb-4">相談ID: {consultationId}</p>

          {/* タイトル */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-semibold text-gray-700">タイトル</h3>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-[15px] text-gray-800 font-medium">
              {consultationDetail?.title || '相談内容'}
            </div>
          </div>

          {/* 充足度 + 要約（全文） */}
          <section className="mt-2 mb-10">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">相談内容の充足度</span>
              <OmusubiMeter count={omusubiCount} color={omusubiColor} />
            </div>
            <h3 className="mt-5 mb-2 text-[15px] font-semibold text-gray-700">相談内容の要約</h3>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-[15px] leading-7 text-gray-800 whitespace-pre-wrap">
              {consultationDetail?.content
                || consultationDetail?.summary_title
                || consultationDetail?.initial_content
                || '内容が取得できませんでした'}
            </div>
          </section>

          {/* 業種・酒類カテゴリ */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                <h4 className="font-medium text-blue-900 mb-2 text-sm">業種カテゴリ</h4>
                <p className="text-blue-700 text-sm">
                  {consultationDetail?.industry_category_id
                    ? categoryMappings.industry[consultationDetail.industry_category_id] || '不明'
                    : '分析中...'}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                <h4 className="font-medium text-green-900 mb-2 text-sm">酒類タイプ</h4>
                <p className="text-blue-700 text-sm">
                  {consultationDetail?.alcohol_type_id
                    ? categoryMappings.alcohol[consultationDetail.alcohol_type_id] || '不明'
                    : '分析中...'}
                </p>
              </div>
            </div>
          </div>

          {/* ===== 主要論点 × 対応質問（1:1） ===== */}
          {issueQuestionPairs.length > 0 && (
            <section className="mb-8">
              <div className="rounded-xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-4 py-3">
                  <h3 className="text-base font-semibold text-gray-700">こういう論点がありそう</h3>
                </div>

                <div className="px-4 py-4 space-y-8">
                  {issueQuestionPairs.map((pair, idx) => (
                    <div
                      key={idx}
                      className="space-y-3 border-b border-gray-100 pb-6 last:border-0 last:pb-0"
                    >
                      {/* 論点：黒太字 */}
                      <p className="text-[15px] leading-7 font-bold text-gray-900">
                        {pair.issue || '（論点データなし）'}
                      </p>

                      {/* 質問：先頭に Q. */}
                      <div className="rounded-lg bg-gray-50 border border-gray-200 p-3">
                        <p className="text-[15px] leading-7 text-gray-800 whitespace-pre-wrap">
                          Q. {pair.question || '（質問データなし）'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* 相談内容（AI要約） */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <BubbleSvg className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm text-gray-500">相談内容（AI要約）</h3>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 whitespace-pre-wrap text-[15px] text-gray-800">
              {consultationDetail?.initial_content || consultationDetail?.content || '内容が取得できませんでした'}
            </div>
          </div>

          {/* 質問事項（AIが生成） */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <BubbleSvg className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm text-gray-500">質問事項</h3>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 leading-7 text-gray-800">
              {consultationDetail?.suggested_questions?.length ? (
                <ul className="space-y-2">
                  {consultationDetail.suggested_questions.map((q, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-600 font-medium">{i + 1}.</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">データを取得できていません。AIによる質問生成が完了していない可能性があります。</p>
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

          {/* 類似相談案件 */}
          <SimilarCasesDisplay
            similarCases={similarCasesData?.similar_cases || []}
            isLoading={isLoadingSimilarCases}
            error={similarCasesError}
            totalCandidates={similarCasesData?.total_candidates || 0}
            message={similarCasesData?.message || ''}
            className="mb-6"
            categoryMappings={categoryMappings}
          />

          {/* 質問本文（折りたたみ） */}
          <section className="mb-10">
            <details className="group rounded-lg border border-gray-200 bg-white open:bg-gray-50">
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3">
                <span className="text-base font-semibold text-gray-700">元の質問本文</span>
                <span className="ml-3 text-gray-400 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <div className="px-4 pb-4 pt-1 text-[15px] leading-7 text-gray-800 whitespace-pre-wrap">
                {consultationDetail?.initial_content || consultationDetail?.content || '内容が取得できませんでした'}
              </div>
            </details>
          </section>
        </div>

        {/* 顔カード */}
        <div className="mx-auto max-w-[960px] px-4 py-6 sm:py-10">
          <div className="relative w-full rounded-[32px] sm:rounded-[40px] text-white px-6 sm:px-10 pt-8 pb-14 shadow-[0_18px_40px_rgba(0,0,0,0.28)] bg-[radial-gradient(120%_120%_at_20%_0%,#3a3a3a,transparent_60%),linear-gradient(to_bottom,#2b2b2b,#1f1f1f)]">
            {/* 角ピル（ダミー表示は維持） */}
            {advisorBadges.topLeft && <CornerPill color="orange" className="absolute -top-6 -left-6">{advisorBadges.topLeft}</CornerPill>}
            {advisorBadges.topRight && <CornerPill color="orange" className="absolute -top-6 -right-6">{advisorBadges.topRight}</CornerPill>}
            {advisorBadges.bottomRight && <CornerPill color="green" className="absolute -bottom-6 -right-6">{advisorBadges.bottomRight}</CornerPill>}

            <div className="flex flex-row items-center gap-6">
              {/* 顔サムネ */}
              <div className="h-[144px] w-[144px] rounded-[50%] overflow-hidden shrink-0 bg-white/10 ring-1 ring-white/10">
                <Image
                  src={advisorPhotoSrc}
                  alt={advisor?.name ?? '担当者'}
                  width={144}
                  height={144}
                  className="object-cover w-full h-full"
                />
              </div>
              {/* 文字＋ボタン */}
              <div className="flex-1 min-w-0">
                <div className="text-xs text-white/70 mb-1">{advisor?.department ?? '所属不明'}</div>
                <div className="text-[26px] sm:text-[30px] font-extrabold tracking-tight leading-tight whitespace-nowrap">
                  {(advisor?.name ?? '担当者未設定') + ' さん'}
                </div>
                <div className="mt-4 flex flex-row items-center gap-3">
                  <button
                    onClick={handleTeamsSend}
                    disabled={isTeamsSending}
                    className="p-0 border-0 bg-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isTeamsSending ? '送信中...' : 'Teamsで連絡する'}
                  >
                    <Image src="/TeamsIcon.svg" alt="Teamsで連絡する" width={40} height={40} className="h-[40px] w-auto" />
                  </button>
                  <button
                    className="px-4 py-2 text-xs rounded-md bg-white/10 border border-white/20"
                    onClick={() => alert('準備中です（メール連絡）')}
                  >
                    メールで連絡する
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* アクション列 */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
          <button
            className="inline-flex items-center justify-center gap-3 rounded-lg bg-white px-5 py-2 shadow-sm hover:shadow border border-black/10 text-[rgba(39,39,39,0.9)]"
            onClick={() => router.back()}
            title="前のページに戻る"
          >
            <span className="text-[15px] font-bold">戻る</span>
          </button>

          <button className="px-4 py-2 rounded-lg bg-gray-100 border border-gray-200 text-gray-700" onClick={() => window.print()}>
            この結果を印刷
          </button>
        </div>
      </div>
    </div>
  );
}
