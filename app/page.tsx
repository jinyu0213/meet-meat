import Link from 'next/link';

import { getCurrentUser } from '@/lib/auth';

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold text-white">약속이 기다리고 있어요!</h1>
        <p className="mt-4 text-white/70">이미 로그인되어 있습니다. 바로 이동해보세요.</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/feed" className="btn-primary">
            피드로 가기
          </Link>
          <Link href={`/profile/${user.username}`} className="btn-secondary">
            내 캘린더 보기
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <span className="rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.25em] text-white/70">
        Meeting Date Reservation SNS
      </span>
      <h1 className="mt-6 text-5xl font-bold leading-tight text-white">
        이제 약속은 여기에서 정해!
        <br />
        친구의 캘린더를 보고 바로 제안하세요.
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-white/70">
        공유되는 일정, 간단한 코멘트, 1:1 메신저만으로 약속을 제안하고 확정까지 빠르게 진행할 수 있습니다.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link href="/auth/signup" className="btn-primary">
          지금 시작하기
        </Link>
        <Link href="/auth/login" className="btn-secondary">
          로그인
        </Link>
      </div>
    </section>
  );
}



