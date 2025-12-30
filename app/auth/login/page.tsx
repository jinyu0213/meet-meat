"use client";

import Link from "next/link";
import { useFormState } from "react-dom";

import { loginAction, type ActionState } from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { FormMessage } from "@/components/FormMessage";

const initialState: ActionState = {};

export default function LoginPage() {
  const [state, formAction] = useFormState(loginAction, initialState);

  return (
    <section className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
      <h1 className="text-3xl font-bold text-white">로그인</h1>
      <p className="mt-2 text-sm text-white/70">
        친구들과 약속을 빠르게 잡아보세요.
      </p>

      <form action={formAction} className="mt-8 space-y-4">
        <div>
          <label className="text-sm text-white/70">아이디</label>
          <input
            name="username"
            type="text"
            autoComplete="username"
            required
            className="input mt-1"
            placeholder="friend123"
          />
        </div>
        <div>
          <label className="text-sm text-white/70">비밀번호</label>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="input mt-1"
            placeholder="••••••••"
          />
        </div>

        <FormMessage message={state.error} />
        <SubmitButton pendingLabel="로그인 중...">로그인</SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-white/70">
        아직 계정이 없나요?{" "}
        <Link href="/auth/signup" className="text-violet-300 underline-offset-2 hover:underline">
          회원가입
        </Link>
      </p>
    </section>
  );
}






