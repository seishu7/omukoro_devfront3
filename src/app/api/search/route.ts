// src/app/api/search/route.ts
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  // const { searchParams } = new URL(req.url);
  // q / sort / cat を読み取り、DBへ渡す実装に差し替え予定
  return NextResponse.json({
    items: [
      { id: 'ex-1', title: 'ビールのモニター会をしたい', tag: '一般小売販売', author: '山下一紀さん', date: '2025.01.07' },
      { id: 'ex-2', title: '店舗イベントの集客アイデア', tag: 'マーケティング', author: '田中太郎さん', date: '2025.02.11' },
    ],
  });
}
