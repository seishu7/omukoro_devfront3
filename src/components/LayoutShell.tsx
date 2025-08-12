'use client';

import { usePathname } from 'next/navigation';
import AppHeader from '@/components/AppHeader';

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // ログインページ（例: トップ’/’や’/login’）ではヘッダーを隠す
  const hideHeader = pathname === '/' || pathname.startsWith('/login');

  return (
    <>
      {!hideHeader && <AppHeader />}
      {children}
    </>
  );
}
