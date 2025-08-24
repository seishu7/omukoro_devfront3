// 類似相談案件取得APIの型定義
export interface SimilarCase {
  consultation_id: string;
  title: string;
  summary_title?: string;
  initial_content?: string;
  created_at?: string;
  industry_category_id?: string;
  alcohol_type_id?: string;
  key_issues: string[];
  suggested_questions: string[];
  action_items: string[];
  relevant_regulations: Array<{
    text: string;
    score: number;
    chunk_id: string;
    prefLabel: string;
    section_label: string;
  }>;
  detected_terms: Array<{
    text: string;
    score: number;
    chunk_id: string;
    prefLabel: string;
    section_label: string;
  }>;
  similarity_score?: number;
  reason?: string;
}

export interface SimilarCasesResponse {
  similar_cases: SimilarCase[];
  total_candidates: number;
  message: string;
}

export interface SimilarCasesRequest {
  industry_category_id?: string;
  summary_title?: string;
  limit?: number;
}

// 類似相談案件取得APIクライアント
export class SimilarCasesApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    // 環境変数またはデフォルトのAPIエンドポイントを使用
    this.baseUrl = baseUrl || 
      process.env.NEXT_PUBLIC_API_ENDPOINT || 
      'https://aps-omu-02.azurewebsites.net';
  }

  /**
   * 類似相談案件を取得する
   * @param params リクエストパラメータ
   * @returns 類似相談案件のレスポンス
   */
  async getSimilarCases(params: SimilarCasesRequest = {}): Promise<SimilarCasesResponse> {
    try {
      // クエリパラメータを構築
      const queryParams = new URLSearchParams();
      
      if (params.industry_category_id) {
        queryParams.append('industry_category_id', params.industry_category_id);
      }
      
      if (params.summary_title) {
        queryParams.append('summary_title', params.summary_title);
      }
      
      if (params.limit) {
        queryParams.append('limit', params.limit.toString());
      }

      const url = `${this.baseUrl}/api/similar-cases?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SimilarCasesResponse = await response.json();
      return data;
    } catch (error) {
      console.error('類似相談案件取得エラー:', error);
      throw new Error('類似相談案件の取得に失敗しました');
    }
  }

  /**
   * 業種カテゴリと要約タイトルを指定して類似相談案件を取得する
   * @param industry_category_id 業種カテゴリID
   * @param summary_title 要約タイトル
   * @param limit 取得件数
   * @returns 類似相談案件のレスポンス
   */
  async getSimilarCasesByCategoryAndTitle(
    industry_category_id: string,
    summary_title: string,
    limit: number = 2
  ): Promise<SimilarCasesResponse> {
    return this.getSimilarCases({
      industry_category_id,
      summary_title,
      limit,
    });
  }

  /**
   * 最新の相談案件を取得する（要約タイトル未指定）
   * @param limit 取得件数
   * @returns 最新の相談案件のレスポンス
   */
  async getRecentCases(limit: number = 2): Promise<SimilarCasesResponse> {
    return this.getSimilarCases({ limit });
  }
}

// デフォルトインスタンスをエクスポート
export const similarCasesApi = new SimilarCasesApiClient();

