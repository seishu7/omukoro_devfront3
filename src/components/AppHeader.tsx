'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AppHeader() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isConsult = pathname?.startsWith('/consult');

  return (
    <header className="w-full py-4 px-10 relative">
      {/* Centered Navi */}
      <nav className="flex items-center justify-center gap-10">
        <Link
          href="/consult/new"
          className={`text-lg font-bold tracking-wider ${
            isConsult ? 'text-white' : 'text-white/80 hover:text-white'
          }`}
        >
          質問
        </Link>
        <span className="text-lg font-bold tracking-wider text-white/50 cursor-not-allowed select-none">
          検索
        </span>
      </nav>

      {/* Right user pill */}
      <div className="absolute right-10 top-1/2 -translate-y-1/2">
        <div className="flex items-center gap-2 rounded-full bg-[#E1E1E1] px-2 py-1">
          <div className="w-6 h-6 rounded-full bg-neutral-300" aria-hidden />
          <span className="text-xs font-semibold text-neutral-900">
            {user?.email ?? 'Guest'}
          </span>
        </div>
      </div>
    </header>
  );
}


