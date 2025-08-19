import { NextRequest, NextResponse } from 'next/server';

interface AnalyticsRequest {
  text: string;
}

interface Consultant {
  name: string;
  department: string;
  expertise: string;
  channelId?: string;
  mentionUserId?: string;
}

interface AnalyticsResponse {
  summary: string;
  questions: string[];
  consultants: Consultant[];
  analysis_metadata: {
    confidence: number;
    generated_at: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const { text }: AnalyticsRequest = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'validation_error',
          message: '相談内容が入力されていません' 
        }, 
        { status: 400 }
      );
    }

    // TODO: 実際のAI分析実装（OpenAI API等）
    // 現在はテスト用のモックレスポンス
    const mockResponse: AnalyticsResponse = {
      summary: `【相談内容要約】\n${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`,
      questions: [
        "この商品の酒税分類は何になりますか？",
        "製造免許の申請が必要でしょうか？",
        "販売時の表示義務について教えてください。",
        "輸出入に関する規制はありますか？"
      ],
      consultants: [
        {
          name: "佐々木 昌平",
          department: "品質保証部",
          expertise: "酒税法・製造基準",
          // 本番では相談先マッピングテーブルから取得
          channelId: process.env.NEXT_PUBLIC_TEAMS_CHANNEL_ID,
          mentionUserId: process.env.NEXT_PUBLIC_TEAMS_MENTION_USER_ID
        }
      ],
      analysis_metadata: {
        confidence: 0.85,
        generated_at: new Date().toISOString()
      }
    };

    return NextResponse.json({
      success: true,
      data: mockResponse
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'internal_server_error',
        message: 'サーバー内部エラーが発生しました',
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}