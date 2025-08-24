'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { loadConsultDraft } from '@/components/ConsultDraft';
import SimilarCasesDisplay from '@/components/SimilarCasesDisplay';
import { useSimilarCases } from '@/hooks/useSimilarCases';
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

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
  recommended_advisor?: Advisor; // 追加
}

/* ========= UI badges（ダミーのまま保持） ========= */
interface AdvisorBadges {
  topLeft?: string;
  topRight?: string;
  bottomRight?: string;
}

export default function SummaryPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const draft = loadConsultDraft();
  const question = draft?.text ?? '（直前の相談文を取得できませんでした）';
  
  // 類似相談案件の取得
  const { data: similarCasesData, isLoading: isLoadingSimilarCases, error: similarCasesError, fetchByCategoryAndTitle } = useSimilarCases();
  
  // 業種カテゴリと酒類タイプのマッピング
  const categoryMappings = {
    industry: {
      'cat_001': '製造業',
      'cat_002': '卸売業',
      'cat_003': '小売業',
      'cat_004': 'サービス業',
      'cat_005': 'その他'
    },
    alcohol: {
      'alc_001': '清酒',
      'alc_002': '焼酎',
      'alc_003': 'ウイスキー',
      'alc_004': 'ワイン',
      'alc_005': 'ビール',
      'alc_006': 'その他'
    }
  };

  // 相談詳細の取得（ダミーデータ）
  const consultationDetail = {
    industry_category_id: 'cat_001',
    summary_title: '酒税法に関する製造工程での副産物活用について'
  };

  // 類似相談案件の取得
  useEffect(() => {
    if (consultationDetail?.industry_category_id && consultationDetail?.summary_title) {
      fetchByCategoryAndTitle(
        consultationDetail.industry_category_id,
        consultationDetail.summary_title,
        2
      );
    }
  }, [consultationDetail, fetchByCategoryAndTitle]);


  const [consultationDetail, setConsultationDetail] = useState<ConsultationDetail | null>(null);
  const [categoryMappings, setCategoryMappings] = useState<{ industry: Record<string, string>; alcohol: Record<string, string>; }>({ industry: {}, alcohol: {} });
  const [isTeamsSending, setIsTeamsSending] = useState(false);
  const [omusubiCount, setOmusubiCount] = useState<number>(0);

  // Badges（ダミー）
  const [advisorBadges, setAdvisorBadges] = useState<AdvisorBadges>({});
  useEffect(() => {
    setAdvisorBadges({
      topLeft: '酒税法を扱って5年目',
      topRight: 'この領域はまかせろ！',
      bottomRight: 'フレンドリー',
    });
  }, []);

  // consult ID は localStorage を使用（要件通り維持）
  const consultationId = typeof window !== 'undefined' ? localStorage.getItem('consultation_id') : null;

  // 既存の API ベース（02）は維持。アドバイザー取得のため 01 も併用（フォールバック含む）
  const api02 = process.env.NEXT_PUBLIC_API_ENDPOINT || 'https://aps-omu-02.azurewebsites.net';
  const api01 = 'https://aps-omu-01.azurewebsites.net';

  /* ========= カテゴリ名マッピング（従来通り維持） ========= */
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
        // 失敗時は従来のデフォルト
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

  /* ========= おむすびメーター（localStorage を活かす） ========= */
  useEffect(() => {
    // APIに omusubi_score が来ていれば最優先
    const fromDetail = consultationDetail?.omusubi_score;
    if (typeof fromDetail === 'number') {
      setOmusubiCount(Math.max(0, Math.min(5, Math.floor(fromDetail))));
      return;
    }
    // フォールバック：consult ページが保存した localStorage
    const stored = typeof window !== 'undefined' ? localStorage.getItem('consult_omusubi') : null;
    if (stored) {
      const n = parseInt(stored, 10);
      if (!Number.isNaN(n)) setOmusubiCount(Math.max(0, Math.min(5, n)));
    }
  }, [consultationDetail]);

  /* ========= 相談詳細の取得（localStorage → API 02 → API 01 で補完） ========= */
  useEffect(() => {
    if (!consultationId) return;

    // 1) localStorage の初期値（そのまま維持）
    const saved = localStorage.getItem('consultation_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as ConsultationDetail;
        setConsultationDetail(parsed);
      } catch {
        /* noop */
      }
    }

    // 2) API 02 の最新をマージ（既存ロジック維持）
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${api02}/api/consultations/${consultationId}`);
        if (res.ok) {
          const data = (await res.json()) as ConsultationDetail;
          setConsultationDetail((prev) => {
            const merged: ConsultationDetail = { ...prev, ...data };
            // 空は上書きしない（従来仕様）
            if (!merged.key_issues && prev?.key_issues) merged.key_issues = prev.key_issues;
            if (!merged.suggested_questions && prev?.suggested_questions) merged.suggested_questions = prev.suggested_questions;
            if (!merged.action_items && prev?.action_items) merged.action_items = prev.action_items;
            if (!merged.relevant_regulations && prev?.relevant_regulations) merged.relevant_regulations = prev.relevant_regulations;
            // localStorage も更新
            localStorage.setItem('consultation_data', JSON.stringify(merged));
            return merged;
          });
        }
      } catch {
        /* noop */
      }

      // 3) 推薦アドバイザーは 01 で補完（なければ localStorage のまま）
      try {
        const a = await fetch(`${api01}/api/consultations/${consultationId}`);
        if (a.ok) {
          const advData = (await a.json()) as ConsultationDetail;
          if (advData?.recommended_advisor) {
            setConsultationDetail((prev) => {
              const merged = { ...prev, recommended_advisor: advData.recommended_advisor };
              localStorage.setItem('consultation_data', JSON.stringify(merged));
              return merged;
            });
          }
        }
      } catch {
        /* noop */
      }
    }, 800); // 少し短めの遅延

    return () => clearTimeout(timer);
  }, [consultationId, api02, api01]);

  /* ========= 推薦アドバイザーの表示準備 ========= */
  const advisor = consultationDetail?.recommended_advisor ?? null;
  const advisorPhotoSrc = useMemo(() => {
    const uid = advisor?.user_id;
    return uid ? `/advisors/${uid}.png` : '/advisors/_placeholder.png';
  }, [advisor?.user_id]);

  /* ========= Teams 送信 ========= */
  const handleTeamsSend = async () => {
    if (!consultationDetail) {
      alert('相談データが読み込まれていません。しばらく待ってから再度お試しください。');
      return;
    }
    setIsTeamsSending(true);
    try {
      const message = `
【酒税法リスク判断支援システムからの相談】

■ 相談タイトル
${consultationDetail.title || '相談内容'}

■ 相談内容要約
${consultationDetail.summary_title || consultationDetail.initial_content || question}

■ 主要論点
${consultationDetail.key_issues || '分析中...'}

■ 提案質問
${consultationDetail.suggested_questions?.length
  ? consultationDetail.suggested_questions.map((q, i) => `${i + 1}. ${q}`).join('\n')
  : '質問生成中...'}

■ 次のアクション
${consultationDetail.action_items || 'アクション項目分析中...'}

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

  /* ========= Render ========= */
  return (
    <div className="relative min-h-screen">
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
            <div className="text-xs text-white/70">品質保証部</div>
            <div className="text-xl font-semibold">佐々木 昌平 さん</div>
            <div className="mt-2 flex gap-2">
        {/* ▼ SVG( /TeamsIcon.svg ) を埋め込んだピル型ボタン */}
        {/* public/TeamsButton.svg をそのままボタンとして使う */}
            <button
            onClick={() => alert('準備中です（Teams連絡）')}
            className="p-0 border-0 bg-transparent cursor-pointer"
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


          </div>
          <div className="hidden sm:block">
            <span className="inline-block px-3 py-1 text-xs rounded-full bg-emerald-500 text-white">フレンドリー</span>
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
              <OmusubiMeter count={omusubiCount} />
            </div>
            <h3 className="mt-5 mb-2 text-[15px] font-semibold text-gray-700">相談内容の要約</h3>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-[15px] leading-7 text-gray-800 whitespace-pre-wrap">
              {consultationDetail?.content
                || consultationDetail?.summary_title
                || consultationDetail?.initial_content
                || question}
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
              {question}
            </div>
          </div>

          {/* 質問事項（AIが生成） */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <BubbleSvg className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm text-gray-500">質問事項</h3>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 leading-7 text-gray-800">
              {/* TODO: AIによる質問生成結果をリストで表示 */}
              ここにAIが生成した質問が入ります。
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

          {/* 質問本文（折りたたみ） */}
          <section className="mb-10">
            <details className="group rounded-lg border border-gray-200 bg-white open:bg-gray-50">
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3">
                <span className="text-base font-semibold text-gray-700">元の質問本文</span>
                <span className="ml-3 text-gray-400 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <div className="px-4 pb-4 pt-1 text-[15px] leading-7 text-gray-800 whitespace-pre-wrap">
                {consultationDetail?.initial_content || question}
              </div>
            </details>
          </section>

          {/* 類似相談（ダミー） */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Image src="/Omusubi2.svg" alt="" width={20} height={20} />
              <h3 className="text-sm text-gray-500">類似相談案件</h3>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-700 space-y-2">
              <p>過去の相談：「酒税法に関する納税猶予申請について」</p>
              <p>過去の相談：「特定酒類の分類基準に関する照会」</p>
            </div>
          </div>

          {/* アクション列 */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
            <button
              className="inline-flex items-center justify-center gap-3 rounded-lg bg-white px-5 py-2 shadow-sm hover:shadow border border-black/10 text-[rgba(39,39,39,0.9)]"
              onClick={() => router.push('/consult/new')}
              title="もう一度質問する（直前の内容は自動で復元されます）"
            >
              {/* おにぎりロゴ（SVG） */}
              <OnigiriSvg className="h-[18px] w-[22px] text-[#2b2b2b]" />
              <OmusubiSvg className="h-[18px] w-[22px] text-[#2b2b2b]" />
              <span className="text-[15px] font-bold">再度質問する</span>
            </button>

            <button className="px-4 py-2 rounded-lg bg-gray-100 border border-gray-200 text-gray-700" onClick={() => window.print()}>
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
/* ========= Small UI parts ========= */
function CornerPill({ children, color = 'orange', className = '' }: { children: React.ReactNode; color?: 'orange' | 'green'; className?: string; }) {
  const bg = color === 'green' ? 'bg-[#12c06a]' : 'bg-[#ff5a3c]';
  return (
    <span className={['inline-flex items-center rounded-full', 'px-6 py-3 text-[14px] sm:text-[15px] font-bold text-white', 'shadow-md pointer-events-none z-20', bg, className].join(' ')}>
      {children}
    </span>
  );
}
function OmusubiSvg({ className }: { className?: string }) {
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
function OmusubiIcon({ active, className = '' }: { active: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 22" aria-hidden className={className + ' ' + (active ? 'text-gray-800' : 'text-gray-300')} fill="currentColor">
      <path d="M7.45 2.45C10 -0.82 14.99 -0.82 17.55 2.45c.24.31.52.79 1.1 1.77l4.34 7.36c.58.98.86 1.46 1.02 1.84 1.62 3.8-.9 8.06-5.04 8.56-.39.05-.96.05-2.1.05H8.16c-1.14 0-1.71 0-2.11-.05-4.16-.5-6.66-4.76-5.04-8.56.16-.38.44-.86 1.02-1.84L6.37 4.22c.58-.98.86-1.46 1.08-1.77Z" />
    </svg>
  );
}
function OmusubiMeter({ count = 0 }: { count: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <OmusubiIcon key={i} active={i < count} className="h-5 w-5" />
      ))}
    </div>
  );
}
