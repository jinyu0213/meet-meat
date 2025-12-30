"use client";

import clsx from "clsx";
import { useFormStatus } from "react-dom";

type Props = {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "secondary";
  className?: string;
  disabled?: boolean;
};

export function SubmitButton({
  children,
  pendingLabel = "처리 중...",
  variant = "primary",
  className,
  disabled = false,
}: Props) {
  const { pending } = useFormStatus();

  const base =
    variant === "primary"
      ? "btn-primary w-full"
      : "btn-secondary w-full border";

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={clsx(
        base,
        "disabled:cursor-not-allowed disabled:opacity-70",
        className
      )}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

