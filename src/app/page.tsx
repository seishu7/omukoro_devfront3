'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function FigmaLoginForm() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!login) {
      console.error('Auth 未初期化');
      return;
    }

    try {
      await login(email, password);
      router.push('/consult/new');
    } catch (err) {
      console.error('ログイン失敗:', err);
    }
  }

  return (
    <div className="relative min-h-screen flex justify-center items-start
                pt-[8vh] sm:pt-[10vh] md:pt-[12vh] lg:pt-[14vh] overflow-hidden">
      {/* 背景レイヤー */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[#414141]
               [background-image:radial-gradient(rgba(255,255,255,.12)_1.2px,transparent_1.2px)]
               [background-size:22px_22px]"
      />
      <div className="w-full max-w-md sm:max-w-lg px-6">
        {/* タイトル */}
        <h1
          className="text-white text-center tracking-wide text-[28px] sm:text-[32px] mb-10
                     [font-family:var(--font-dela)]"
        >
          Sherpath
        </h1>

        <form onSubmit={onSubmit} className="space-y-6">
          <div>
            <label className="block text-[11px] text-white/85 mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full h-9 rounded-lg bg-white text-gray-900 px-3 shadow-sm
                         outline-none focus:ring-2 focus:ring-white/70"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-[11px] text-white/85 mb-1">
              パスワード
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full h-9 rounded-lg bg-white text-gray-900 px-3 shadow-sm
                         outline-none focus:ring-2 focus:ring-white/70"
              placeholder="••••••••"
            />
          </div>

          {/* ピル型ボタン */}
          {/* SVGそのものをボタンにする */}
          <button
            type="submit"
            disabled={isLoading}
            aria-label={isLoading ? 'ログイン中…' : 'ログイン'}
            className="mx-auto block p-0 bg-transparent border-0
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70
                      active:opacity-95 disabled:opacity-60"
          >
            <img
              src="/LoginButton.svg"
              alt=""            // 役割は aria-label で伝えるので空に
              className="h-[40px] w-auto select-none pointer-events-none"
            />
          </button>

        </form>
      </div>
    </div>
  );
}
