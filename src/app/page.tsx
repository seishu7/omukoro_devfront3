'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import OnigiriIcon from "@/components/LoginButton";

export default function FigmaLoginForm() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await login?.(email, password);
  }

  return (
    <div className="relative min-h-screen flex justify-center items-start
                pt-[8vh] sm:pt-[10vh] md:pt-[12vh] lg:pt-[14vh] overflow-hidden">
         {/* 背景レイヤー（ドット＋#414141） */}
    <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[#414141]
               [background-image:radial-gradient(rgba(255,255,255,.12)_1.2px,transparent_1.2px)]
               [background-size:22px_22px]"/>
      <div className="w-full max-w-md sm:max-w-lg px-6">
        {/* タイトル：Dela Gothic One */}
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

          {/* ピル型ボタン（中央寄せ） */}
          <button
  type="submit"
  disabled={isLoading}
  className="mx-auto flex items-center justify-center gap-3 rounded-lg
             bg-white px-5 py-2 shadow-sm hover:shadow active:opacity-95
             disabled:opacity-60 border border-black/10
             w-full sm:w-auto"
>
  <OnigiriIcon className="inline-flex h-[22px] w-[28px] items-center justify-center" />
  <span className="text-[15px] font-bold text-[rgba(39,39,39,0.9)]">
    {isLoading ? 'ログイン中…' : 'ログイン'}
  </span>
</button>
        </form>
      </div>
    </div>
  );
}
  
