// src/app/api/search/route.ts
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  
  try {
    // パラメータ取得
    const query = searchParams.get('query');
    const industryCategories = searchParams.get('industry_categories');
    const alcoholTypes = searchParams.get('alcohol_types');
    const sortOrder = searchParams.get('sort_order') || 'newest';
    const limit = searchParams.get('limit') || '50';
    const offset = searchParams.get('offset') || '0';
    
    // バックエンドAPIのURL構築
    const backendApiUrl = process.env.NEXT_PUBLIC_API_ENDPOINT;
    console.log('🔍 Environment check:');
    console.log('  - NEXT_PUBLIC_API_ENDPOINT:', backendApiUrl);
    console.log('  - All env vars:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC')));
    
    if (!backendApiUrl) {
      throw new Error('NEXT_PUBLIC_API_ENDPOINT環境変数が設定されていません');
    }
    
    // バックエンドのAPIパス（/apiプレフィックスは不要）
    const backendUrl = new URL(`${backendApiUrl}/api/consultations/search`);
    
    if (query) backendUrl.searchParams.append('query', query);
    if (industryCategories) backendUrl.searchParams.append('industry_categories', industryCategories);
    if (alcoholTypes) backendUrl.searchParams.append('alcohol_types', alcoholTypes);
    if (sortOrder) backendUrl.searchParams.append('sort_order', sortOrder);
    backendUrl.searchParams.append('limit', limit);
    backendUrl.searchParams.append('offset', offset);
    
    // デバッグ: 実際の呼び出しURLを確認
    console.log('🌐 API Call Details:');
    console.log('  - Target URL:', backendUrl.toString());
    console.log('  - Query params:', {
      query,
      industryCategories,
      alcoholTypes,
      sortOrder,
      limit,
      offset
    });
    
    // バックエンドAPI呼び出し
    console.log('🚀 バックエンドAPIを呼び出します');
    
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📡 Response Details:');
    console.log('  - Status:', response.status);
    console.log('  - Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      // エラー時のレスポンス内容も確認
      const errorText = await response.text();
      console.error('❌ Error Response:');
      console.error('  - Status:', response.status);
      console.error('  - Body:', errorText);
      throw new Error(`バックエンドAPIエラー: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ バックエンドからのレスポンス:', data);
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('検索APIエラー:', error);
    return NextResponse.json(
      { error: '検索中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
