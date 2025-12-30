"use client";

import Link from "next/link";
import { useFormState } from "react-dom";

import { signupAction, type ActionState } from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { FormMessage } from "@/components/FormMessage";

const initialState: ActionState = {};

export default function SignUpPage() {
  const [state, formAction] = useFormState(signupAction, initialState);

  return (
    <section className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl">
      <h1 className="text-3xl font-bold text-white">회원가입</h1>
      <p className="mt-2 text-sm text-white/70">
        친구들과 약속 가능한 날짜를 공유해보세요.
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
            autoComplete="new-password"
            required
            className="input mt-1"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="text-sm text-white/70">휴대폰 번호</label>
          <input
            name="phoneNumber"
            type="tel"
            required
            className="input mt-1"
            placeholder="01012345678"
          />
        </div>

        <FormMessage message={state.error} variant="error" />
        <SubmitButton pendingLabel="가입 중...">계정 만들기</SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-white/70">
        이미 계정이 있으신가요?{" "}
        <Link href="/auth/login" className="text-violet-300 underline-offset-2 hover:underline">
          로그인하기
        </Link>
      </p>
    </section>
  );
}






