import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    // Teams関連の環境変数
    TEAMS_TEAM_ID: process.env.TEAMS_TEAM_ID,
    TEAMS_TEAM_ID_length: process.env.TEAMS_TEAM_ID?.length || 0,
    TEAMS_TEAM_ID_type: typeof process.env.TEAMS_TEAM_ID,
    
    TEAMS_CHANNEL_ID: process.env.TEAMS_CHANNEL_ID,
    TEAMS_MENTION_USER_ID: process.env.TEAMS_MENTION_USER_ID,
    
    // Azure認証関連の環境変数（セキュリティのため値は表示せず、存在の有無のみ）
    AZURE_CLIENT_ID_exists: !!process.env.AZURE_CLIENT_ID,
    AZURE_CLIENT_SECRET_exists: !!process.env.AZURE_CLIENT_SECRET,
    AZURE_TENANT_ID_exists: !!process.env.AZURE_TENANT_ID,
    GRAPH_REFRESH_TOKEN_exists: !!process.env.GRAPH_REFRESH_TOKEN,
    
    // 環境情報
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    
    // 全環境変数の数（デバッグ用）
    total_env_vars: Object.keys(process.env).length,
    
    // チェック時刻
    checked_at: new Date().toISOString()
  });
}
