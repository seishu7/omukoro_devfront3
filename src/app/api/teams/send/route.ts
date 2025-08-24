import { NextRequest, NextResponse } from 'next/server';

interface TeamsSendRequest {
  message: string;
  consultantName: string;
  consultantDepartment: string;
  channelId?: string;
  mentionUserId?: string;
}

// Microsoft Graph APIトークン取得関数（内部関数として実装）
async function getAccessToken(): Promise<string> {
  const refreshToken = process.env.GRAPH_REFRESH_TOKEN;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;
  const tenantId = process.env.AZURE_TENANT_ID;

  // 必要な環境変数のチェック
  if (!refreshToken || !clientId || !clientSecret || !tenantId) {
    throw new Error('Missing required environment variables for Microsoft Graph API');
  }

  const params = new URLSearchParams();
  params.set('client_id', clientId);
  params.set('scope', 'openid offline_access https://graph.microsoft.com/ChannelMessage.Send');
  params.set('refresh_token', refreshToken);
  params.set('grant_type', 'refresh_token');
  params.set('client_secret', clientSecret);

  const response = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    }
  );

  const data = await response.json();
  
  if (response.ok) {
    return data.access_token;
  } else {
    throw new Error(`Token refresh failed: ${data.error_description || data.error}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, channelId, mentionUserId, consultantName, consultantDepartment }: TeamsSendRequest = await req.json();

    // 入力値の検証
    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'validation_error',
          message: 'メッセージが入力されていません' 
        }, 
        { status: 400 }
      );
    }

    if (!consultantName || !consultantDepartment) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'validation_error',
          message: '相談先の情報が不足しています' 
        }, 
        { status: 400 }
      );
    }

    // アクセストークンを取得（内部関数を使用）
    let accessToken: string;
    try {
      accessToken = await getAccessToken();
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'authentication_failed',
          message: 'Microsoft Graph APIの認証に失敗しました',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, 
        { status: 401 }
      );
    }

    // Teams設定の検証
    const teamId = process.env.TEAMS_TEAM_ID;
    if (!teamId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'configuration_error',
          message: 'TEAMS_TEAM_ID環境変数が設定されていません' 
        }, 
        { status: 500 }
      );
    }

 // 相談先に応じたチャンネル・ユーザーの決定（本番では相談先マッピングテーブルを使用）
    const targetChannelId = channelId || process.env.TEAMS_CHANNEL_ID || '19:example-channel-id@thread.tacv2';
    const targetUserId = mentionUserId || process.env.TEAMS_MENTION_USER_ID || 'user@example.com';

    // メンション付きメッセージの作成
    const messageBody = {
      body: {
        contentType: 'html',
        content: `<at id="0">omusubikororin</at><br/><br/>${message.replace(/\n/g, '<br/>')}`
      },
      mentions: [
        {
          id: 0,
          mentionText: 'omusubikororin',
          mentioned: {
            user: {
              displayName: 'omusubikororin',
              id: targetUserId,
              userIdentityType: 'aadUser'
            }
          }
        }
      ]
    };

    // Microsoft Graph APIでメッセージを送信
    const graphResponse = await fetch(
      `https://graph.microsoft.com/v1.0/teams/${teamId}/channels/${targetChannelId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageBody),
      }
    );

    const graphData = await graphResponse.json();

    if (!graphResponse.ok) {
      console.error('Microsoft Graph API error:', {
        status: graphResponse.status,
        statusText: graphResponse.statusText,
        data: graphData
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'teams_send_failed', 
          message: 'Teamsへのメッセージ送信に失敗しました',
          details: {
            status: graphResponse.status,
            error: graphData.error?.code || 'Unknown error',
            message: graphData.error?.message || graphData.message || 'No error message'
          }
        }, 
        { status: graphResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        messageId: graphData.id,
        channelId: targetChannelId,
        teamId: teamId,
        consultantName: consultantName,
        consultantDepartment: consultantDepartment,
        sentAt: new Date().toISOString(),
        webUrl: graphData.webUrl
      }
    });

  } catch (error) {
    console.error('Teams Send API error:', error);
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
