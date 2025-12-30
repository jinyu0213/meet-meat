"use client";

import { useFormState } from "react-dom";

import { verifyPhoneAction, type ActionState } from "@/lib/actions";
import { SubmitButton } from "@/components/SubmitButton";
import { FormMessage } from "@/components/FormMessage";
import { PHONE_VERIFICATION_CODE } from "@/lib/constants";

const initialState: ActionState = {};

export default function VerifyPhonePage() {
  const [state, formAction] = useFormState(verifyPhoneAction, initialState);

  return (
    <section className="mx-auto max-w-md rounded-3xl border border-violet-400/20 bg-violet-500/10 p-8 text-center text-white">
      <h1 className="text-3xl font-bold">휴대폰 인증</h1>
      <p className="mt-2 text-sm text-white/80">
        가입을 완료하려면 6자리 인증 코드를 입력해주세요.
      </p>
      <p className="mt-6 text-sm text-white/60">
        데모 버전에서는 <span className="font-mono">{PHONE_VERIFICATION_CODE}</span> 코드를
        입력하면 인증이 완료됩니다.
      </p>

      <form action={formAction} className="mt-8 space-y-4">
        <input
          name="code"
          type="text"
          inputMode="numeric"
          maxLength={6}
          pattern="[0-9]*"
          className="input text-center text-2xl tracking-[0.6em]"
          placeholder="000000"
          required
        />
        <FormMessage message={state.error} />
        <SubmitButton pendingLabel="인증 중...">인증 완료</SubmitButton>
      </form>
    </section>
  );
}






