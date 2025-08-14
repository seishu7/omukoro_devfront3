'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

export default function AppHeader() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isConsult = pathname?.startsWith('/consult');
  const isSearch = pathname?.startsWith('/search');

  return (
    <header className="w-full py-4 px-10 relative">
      {/* Centered Navi */}
      <nav className="flex items-center justify-center gap-10">
        {/* 相談ボタン */}
        <Link
          href="/consult/new"
          className="flex flex-col items-center justify-center hover:opacity-80 active:opacity-60"
        >
          <Image
            src={isConsult ? '/SoudanOn.svg' : '/SoudanOff.svg'}
            alt="相談"
            width={32}
            height={32}
            priority
          />
          <span
            className={`mt-1 text-sm font-semibold ${
              isConsult ? 'text-white' : 'text-white/70'
            }`}
          >
            相談
          </span>
        </Link>

        {/* 検索ボタン */}
        <Link
          href="/search"
          className="flex flex-col items-center justify-center hover:opacity-80 active:opacity-60"
        >
          <Image
            src={isSearch ? '/KensakuOn.svg' : '/KensakuOff.svg'}
            alt="検索"
            width={32}
            height={32}
            priority
          />
          <span
            className={`mt-1 text-sm font-semibold ${
              isSearch ? 'text-white' : 'text-white/70'
            }`}
          >
            検索
          </span>
        </Link>
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
