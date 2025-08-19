import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = process.env.GRAPH_REFRESH_TOKEN;
    const clientId = process.env.NEXT_PUBLIC_AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;
    const tenantId = process.env.NEXT_PUBLIC_AZURE_TENANT_ID;

    const params = new URLSearchParams();
    params.set('client_id', clientId!);
    params.set('scope', 'openid offline_access https://graph.microsoft.com/ChannelMessage.Send');
    params.set('refresh_token', refreshToken!);
    params.set('grant_type', 'refresh_token');
    params.set('client_secret', clientSecret!);

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
      return NextResponse.json({
        access_token: data.access_token,
        expires_in: data.expires_in,
      });
    } else {
      throw new Error(data.error_description);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Token refresh failed' }, { status: 500 });
  }
}