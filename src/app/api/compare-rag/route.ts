// src/app/api/compare-rag/route.ts
import { NextResponse } from 'next/server';
import { RAGComparisonRequest, RAGComparisonResponse } from '@/types/rag-comparison';

export async function POST(req: Request) {
  try {
    const body: RAGComparisonRequest = await req.json();
    const { query } = body;
    
    if (!query || !query.trim()) {
      return NextResponse.json(
        { error: 'クエリが指定されていません' },
        { status: 400 }
      );
    }
    
    // バックエンドAPIのURL構築
    const backendApiUrl = process.env.NEXT_PUBLIC_API_ENDPOINT;
    console.log('🔍 RAG比較API呼び出し:');
    console.log('  - NEXT_PUBLIC_API_ENDPOINT:', backendApiUrl);
    
    if (!backendApiUrl) {
      throw new Error('NEXT_PUBLIC_API_ENDPOINT環境変数が設定されていません');
    }
    
    // バックエンドのRAG比較APIパス
    const backendUrl = new URL(`${backendApiUrl}/api/compare-rag`);
    
    console.log('🌐 RAG比較API呼び出し詳細:');
    console.log('  - Target URL:', backendUrl.toString());
    console.log('  - Query:', query);
    
    // バックエンドAPI呼び出し
    const response = await fetch(backendUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    
    console.log('📡 RAG比較API レスポンス:');
    console.log('  - Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ RAG比較API エラー:');
      console.error('  - Status:', response.status);
      console.error('  - Body:', errorText);
      throw new Error(`RAG比較APIエラー: ${response.status}`);
    }
    
    const data: RAGComparisonResponse = await response.json();
    console.log('✅ RAG比較結果取得成功');
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('RAG比較APIエラー:', error);
    return NextResponse.json(
      { error: 'RAG比較中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
