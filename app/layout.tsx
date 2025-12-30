import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import './globals.css';

import { getCurrentUser } from '@/lib/auth';
import { logoutAction } from '@/lib/actions';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: '약속온 - Meeting Date SNS',
  description: '친구들과 약속 가능한 날짜를 공유하고 바로 잡아보세요.',
  manifest: '/manifest.json',
  themeColor: '#2a1f66',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '약속온',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <html lang="ko">
      <head>
        <link rel="icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className={`${inter.className} bg-slate-950 text-white`}>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#2a1f66,_#020617_70%)]">
          <header className="border-b border-white/10">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
              <Link href="/" className="text-xl font-bold tracking-tight text-white">
                약속온
              </Link>
              {user ? (
                <nav className="flex items-center gap-4 text-sm text-white/80">
                  <Link href="/feed" className="hover:text-white">
                    피드
                  </Link>
                  <Link href={`/profile/${user.username}`} className="hover:text-white">
                    내 프로필
                  </Link>
                  <Link href="/friends" className="hover:text-white">
                    친구
                  </Link>
                  <Link href="/messages" className="hover:text-white">
                    메시지
                  </Link>
                  <Link href="/settings/profile" className="hover:text-white">
                    설정
                  </Link>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="rounded-full border border-white/20 px-4 py-1 text-sm font-semibold text-white hover:bg-white/10"
                    >
                      로그아웃
                    </button>
                  </form>
                </nav>
              ) : (
                <nav className="flex items-center gap-3 text-sm text-white/80">
                  <Link href="/auth/login" className="hover:text-white">
                    로그인
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="rounded-full bg-white px-4 py-1 font-semibold text-slate-900 hover:bg-slate-100"
                  >
                    회원가입
                  </Link>
                </nav>
              )}
            </div>
          </header>
          <main className="mx-auto min-h-[calc(100vh-64px)] max-w-6xl px-4 py-10">{children}</main>
        </div>
      </body>
    </html>
  );
}



