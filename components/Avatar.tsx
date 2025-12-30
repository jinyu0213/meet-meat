/* eslint-disable @next/next/no-img-element */
import clsx from 'clsx';

type Props = {
  size?: 'sm' | 'md' | 'lg';
  src?: string | null;
  alt: string;
  fallback: string;
};

const sizeClass = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
};

export function Avatar({ size = 'md', src, alt, fallback }: Props) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={clsx(sizeClass[size], 'rounded-full object-cover ring-2 ring-white/10')}
      />
    );
  }

  return (
    <div
      className={clsx(
        sizeClass[size],
        'flex items-center justify-center rounded-full bg-white/10 text-sm font-semibold uppercase text-white/70',
      )}
    >
      {fallback.slice(0, 2)}
    </div>
  );
}

