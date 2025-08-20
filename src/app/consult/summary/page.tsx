'use client';

import { useRouter } from 'next/navigation';
import { loadConsultDraft } from '@/components/ConsultDraft';
import { useEffect, useState } from 'react';

// 型定義
interface CategoryItem {
  category_id: string;
  category_name: string;
}

interface AlcoholType {
  type_id: string;
  type_name: string;
}

interface Regulation {
  prefLabel?: string;
  section_label?: string;
  score?: number;
  text: string;
}

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
  relevant_regulations?: Regulation[];
}

export default function SummaryPage() {
  const router = useRouter();
  const draft = loadConsultDraft();
  const question = draft?.text ?? '（直前の相談文を取得できませんでした）';
  const [consultationDetail, setConsultationDetail] = useState<ConsultationDetail | null>(null);
  const [categoryMappings, setCategoryMappings] = useState<{
    industry: Record<string, string>;
    alcohol: Record<string, string>;
  }>({ industry: {}, alcohol: {} });
  const [isTeamsSending, setIsTeamsSending] = useState(false);
  
  // 相談IDを取得
  const consultationId = localStorage.getItem('consultation_id');
  
  // APIのベースURL
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  
  // カテゴリマッピングを取得
  useEffect(() => {
    const fetchCategoryMappings = async () => {
      try {
        
        // 業種カテゴリの取得
        const industryResponse = await fetch(`${apiUrl}/api/consultations/industry-categories`);
        if (industryResponse.ok) {
          const industryData = await industryResponse.json();
          console.log('業種カテゴリAPIレスポンス:', industryData);
          
          // 配列かどうかチェック
          if (Array.isArray(industryData)) {
            const industryMap: Record<string, string> = {};
            industryData.forEach((cat: CategoryItem) => {
              industryMap[cat.category_id] = cat.category_name;
            });
            
            // 酒類タイプの取得
            const alcoholResponse = await fetch(`${apiUrl}/api/consultations/alcohol-types`);
            if (alcoholResponse.ok) {
              const alcoholData = await alcoholResponse.json();
              console.log('酒類タイプAPIレスポンス:', alcoholData);
              
              // 配列かどうかチェック
              if (Array.isArray(alcoholData)) {
                const alcoholMap: Record<string, string> = {};
                alcoholData.forEach((type: AlcoholType) => {
                  alcoholMap[type.type_id] = type.type_name;
                });
                
                setCategoryMappings({ industry: industryMap, alcohol: alcoholMap });
                console.log('カテゴリマッピング設定完了:', { industry: industryMap, alcohol: alcoholMap });
              } else {
                console.warn('酒類タイプデータが配列ではありません:', alcoholData);
                setDefaultCategoryMappings();
              }
            } else {
              console.warn('酒類タイプAPIエラー:', alcoholResponse.status);
              setDefaultCategoryMappings();
            }
          } else {
            console.warn('業種カテゴリデータが配列ではありません:', industryData);
            setDefaultCategoryMappings();
          }
        } else {
          console.warn('業種カテゴリAPIエラー:', industryResponse.status);
          setDefaultCategoryMappings();
        }
      } catch (error) {
        console.error('カテゴリマッピングの取得に失敗:', error);
        setDefaultCategoryMappings();
      }
    };
    
    const setDefaultCategoryMappings = () => {
      // フォールバック用のデフォルトマッピング
      const defaultMappings = {
        industry: {
          'cat0001': 'マーケティング商品企画',
          'cat0002': '製造',
          'cat0003': '研究開発',
          'cat0004': '中身開発',
          'cat0005': '物流'
        },
        alcohol: {
          'alc0001': 'ビールテイスト',
          'alc0002': 'RTD/RTS',
          'alc0003': 'ワイン',
          'alc0004': '和酒',
          'alc0005': 'ノンアルコール'
        }
      };
      setCategoryMappings(defaultMappings);
      console.log('デフォルトカテゴリマッピングを設定:', defaultMappings);
    };
    
    fetchCategoryMappings();
  }, []);
  
  // 相談詳細を取得
  useEffect(() => {
    console.log('useEffect実行 - consultationId:', consultationId);
    
    if (consultationId) {
      // localStorageから保存されたデータを取得
      const savedData = localStorage.getItem('consultation_data');
      console.log('localStorageから取得したデータ:', savedData);
      
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          console.log('パースしたデータ:', parsedData);
          setConsultationDetail(parsedData);
        } catch (error) {
          console.error('保存されたデータの解析に失敗:', error);
        }
      }
      
      // バックエンドAPIから最新データを取得（タイムアウトを短縮）
      const timer = setTimeout(async () => {
        try {
          console.log('バックエンドAPI呼び出し開始:', `${apiUrl}/api/consultations/${consultationId}`);
          const response = await fetch(`${apiUrl}/api/consultations/${consultationId}`);
          console.log('APIレスポンス:', response);
          
          if (response.ok) {
            const data = await response.json();
            console.log('バックエンドから相談詳細を取得:', data);
            
            // バックエンドのデータが存在する場合のみ更新
            if (data && Object.keys(data).length > 0) {
              // 既存のデータとマージして、空のフィールドを上書きしない
              setConsultationDetail(prevDetail => {
                const mergedData = { ...prevDetail, ...data };
                
                // 空のフィールドは既存データを維持
                if (!mergedData.key_issues && prevDetail?.key_issues) {
                  mergedData.key_issues = prevDetail.key_issues;
                }
                if (!mergedData.suggested_questions && prevDetail?.suggested_questions) {
                  mergedData.suggested_questions = prevDetail.suggested_questions;
                }
                if (!mergedData.action_items && prevDetail?.action_items) {
                  mergedData.action_items = prevDetail.action_items;
                }
                if (!mergedData.relevant_regulations && prevDetail?.relevant_regulations) {
                  mergedData.relevant_regulations = prevDetail.relevant_regulations;
                }
                
                // マージされたデータをlocalStorageにも保存
                localStorage.setItem('consultation_data', JSON.stringify(mergedData));
                console.log('バックエンドデータとマージしてlocalStorageに保存:', mergedData);
                
                return mergedData;
              });
            } else {
              console.log('バックエンドデータが空のため、既存データを維持');
            }
          } else {
            console.error('APIエラー:', response.status, response.statusText);
            // APIエラーの場合、既存データを維持
          }
        } catch (error) {
          console.error('バックエンドからの相談詳細取得に失敗:', error);
          // エラーの場合、既存データを維持
        }
      }, 1000); // タイムアウトを1秒に短縮
      
      return () => clearTimeout(timer);
    }
  }, [consultationId]);
  
  // Teams送信処理
  const handleTeamsSend = async () => {
    if (!consultationDetail) {
      alert('相談データが読み込まれていません。しばらく待ってから再度お試しください。');
      return;
    }

    setIsTeamsSending(true);
    
    try {
      // 送信メッセージを作成
      const message = `
【酒税法リスク判断支援システムからの相談】

■ 相談タイトル
${consultationDetail.title || '相談内容'}

■ 相談内容要約
${consultationDetail.summary_title || consultationDetail.initial_content || question}

■ 主要論点
${consultationDetail.key_issues || '分析中...'}

■ 提案質問
${consultationDetail.suggested_questions && consultationDetail.suggested_questions.length > 0 
  ? consultationDetail.suggested_questions.map((q, i) => `${i + 1}. ${q}`).join('\n')
  : '質問生成中...'}

■ 次のアクション
${consultationDetail.action_items || 'アクション項目分析中...'}

相談ID: ${consultationId}
      `.trim();

      const response = await fetch('/api/teams/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          consultantName: '佐々木 昌平',
          consultantDepartment: '品質保証部'
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Teamsに正常に送信されました！');
      } else {
        alert(`送信に失敗しました: ${result.message}`);
      }
    } catch (error) {
      console.error('Teams送信エラー:', error);
      alert('送信中にエラーが発生しました。ネットワーク接続を確認してください。');
    } finally {
      setIsTeamsSending(false);
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
            <div className="text-xs text-white/70">品質保証部</div>
            <div className="text-xl font-semibold">佐々木 昌平 さん</div>
            <div className="mt-2 flex gap-2">
        {/* ▼ SVG( /TeamsIcon.svg ) を埋め込んだピル型ボタン */}
        {/* public/TeamsButton.svg をそのままボタンとして使う */}
            <button
            onClick={handleTeamsSend}
            disabled={isTeamsSending}
            className="p-0 border-0 bg-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title={isTeamsSending ? "送信中..." : "Teamsで連絡する"}
            >
            <img
                src="/TeamsIcon.svg" // ← public直下に置いた完成デザインのSVG
                alt={isTeamsSending ? "送信中..." : "Teamsで連絡する"}
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
          <h2 className="text-lg font-bold mb-2">相談結果サマリー</h2>
          <p className="text-sm text-gray-600 mb-4">相談ID: {consultationId || '生成中...'}</p>

          {/* タイトル */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <BubbleSvg className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm text-gray-500">タイトル</h3>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-[15px] text-gray-800 font-medium">
              {consultationDetail?.title || '相談内容'}
            </div>
          </div>

          {/* 相談内容要約 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <BubbleSvg className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm text-gray-500">相談内容要約</h3>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-[15px] text-gray-800">
              {consultationDetail?.summary_title || `相談内容: ${question}`}
            </div>
          </div>

          {/* 入力内容 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <BubbleSvg className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm text-gray-500">入力内容</h3>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 whitespace-pre-wrap text-[15px] text-gray-800">
              {consultationDetail?.initial_content || question}
            </div>
          </div>

          {/* 業種・酒類カテゴリ */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <BubbleSvg className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm text-gray-500">カテゴリ分類</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                <h4 className="font-medium text-blue-900 mb-2 text-sm">業種カテゴリ</h4>
                <p className="text-blue-700 text-sm">
                  {consultationDetail?.industry_category_id ? 
                    categoryMappings.industry[consultationDetail.industry_category_id] || '不明' : 
                    '分析中...'}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                <h4 className="font-medium text-green-900 mb-2 text-sm">酒類タイプ</h4>
                <p className="text-blue-700 text-sm">
                  {consultationDetail?.alcohol_type_id ? 
                    categoryMappings.alcohol[consultationDetail.alcohol_type_id] || '不明' : 
                    '分析中...'}
                </p>
              </div>
            </div>
          </div>

          {/* 主要論点 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <BubbleSvg className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm text-gray-500">主要論点</h3>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 leading-7 text-gray-800">
              {consultationDetail?.key_issues ? (
                <div className="whitespace-pre-wrap text-sm">
                  {consultationDetail.key_issues}
                </div>
              ) : (
                <p className="text-gray-500">データを取得できていません。AIによる主要論点分析が完了していない可能性があります。</p>
              )}
            </div>
          </div>

          {/* 提案質問 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <BubbleSvg className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm text-gray-500">提案質問</h3>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 leading-7 text-gray-800">
              {consultationDetail?.suggested_questions && consultationDetail.suggested_questions.length > 0 ? (
                <ul className="space-y-2">
                  {consultationDetail.suggested_questions.map((question: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 font-medium">{index + 1}.</span>
                      <span>{question}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">データを取得できていません。AIによる質問生成が完了していない可能性があります。</p>
              )}
            </div>
          </div>

          {/* 次のアクション */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <BubbleSvg className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm text-gray-500">次のアクション</h3>
            </div>
            <div className="rounded-lg border border-gray-200 p-4 text-sm text-gray-700">
              {consultationDetail?.action_items ? (
                <div className="whitespace-pre-wrap text-sm">
                  {consultationDetail.action_items}
                </div>
              ) : (
                <p className="text-gray-500">データを取得できていません。AIによるアクション項目生成が完了していない可能性があります。</p>
              )}
            </div>
          </div>

          {/* 関連法令の表示 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <BubbleSvg className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm text-gray-500">関連法令</h3>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              {consultationDetail?.relevant_regulations && consultationDetail.relevant_regulations.length > 0 ? (
                <div className="space-y-3">
                  {consultationDetail.relevant_regulations.map((regulation: Regulation, index: number) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-3">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium text-gray-900">{regulation.prefLabel || regulation.section_label}</h4>
                        <span className="text-sm text-gray-500">
                          関連度: {regulation.score ? (regulation.score * 100).toFixed(1) : 'N/A'}%
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{regulation.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">データを取得できていません。ベクトル検索による関連法令の抽出が完了していない可能性があります。</p>
              )}
            </div>
          </div>

          {/* 類似相談案件 */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <img src="/Omusubi2.svg" alt="" width={20} height={20} />
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
