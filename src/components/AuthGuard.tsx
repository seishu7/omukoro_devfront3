// components/AuthGuard.tsx
'use client';
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext"; 

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 認証状態が初期化済みで、未ログインならログインページに移動
    if (isInitialized && !isAuthenticated) {
      router.replace("/");
    }
  }, [isInitialized, isAuthenticated, router]);

  // 認証チェック中は表示しない（チラつき防止）
  if (!isInitialized || isLoading) {
    return null;
  }

  return <>{children}</>;
}
