type Props = {
  message?: string;
  variant?: 'error' | 'success';
};

export function FormMessage({ message, variant = 'error' }: Props) {
  if (!message) return null;
  const styles =
    variant === 'error'
      ? 'rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200'
      : 'rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200';
  return <p className={styles}>{message}</p>;
}






