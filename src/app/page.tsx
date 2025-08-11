'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import BeerLoadingAnimation from '@/components/BeerLoadingAnimation';

export default function Home() {
  const { isAuthenticated, isLoading, isInitialized } = useAuth();
  const router = useRouter();

  // フックは常に同じ順序で呼ぶ
  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace('/consult/new');
    }
  }, [isInitialized, isAuthenticated, router]);

  // 初期化中は何も表示しない（Hydrationエラー回避）
  if (!isInitialized) {
    return null;
  }

  // ローディング中の表示
  if (isLoading) {
    return <BeerLoadingAnimation message="認証確認中..." subMessage="アカウント情報を確認しています" />;
  }

  // 未認証の場合はログインフォームを表示
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <BeerLoadingAnimation message="画面遷移中..." subMessage="相談入力画面へ移動します" />
  );
}
