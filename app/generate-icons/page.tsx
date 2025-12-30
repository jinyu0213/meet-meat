'use client';

import { useEffect, useRef } from 'react';

export default function GenerateIconsPage() {
  const canvas192Ref = useRef<HTMLCanvasElement>(null);
  const canvas512Ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const drawIcon = (canvas: HTMLCanvasElement | null, size: number) => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 그라데이션 배경
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, '#2a1f66');
      gradient.addColorStop(1, '#020617');

      // 둥근 사각형
      const radius = size * 0.2;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(size - radius, 0);
      ctx.quadraticCurveTo(size, 0, size, radius);
      ctx.lineTo(size, size - radius);
      ctx.quadraticCurveTo(size, size, size - radius, size);
      ctx.lineTo(radius, size);
      ctx.quadraticCurveTo(0, size, 0, size - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.fill();

      // 텍스트 "약"
      ctx.fillStyle = 'white';
      ctx.font = `bold ${size * 0.35}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('약', size / 2, size / 2);
    };

    drawIcon(canvas192Ref.current, 192);
    drawIcon(canvas512Ref.current, 512);
  }, []);

  const downloadIcon = (size: 192 | 512) => {
    const canvas = size === 192 ? canvas192Ref.current : canvas512Ref.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `icon-${size}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h1 className="mb-2 text-2xl font-bold text-white">약속온 PWA 아이콘 생성기</h1>
        <p className="text-sm text-white/70">
          아래 버튼을 클릭하여 아이콘을 생성하고 다운로드하세요. 다운로드한 파일을{' '}
          <code className="rounded bg-white/10 px-1 py-0.5 text-xs">public/</code> 폴더에 저장하세요.
        </p>
      </div>

      <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col items-center gap-4">
          <canvas ref={canvas192Ref} width={192} height={192} className="border-2 border-white/20" />
          <button
            onClick={() => downloadIcon(192)}
            className="btn-primary rounded-full px-6 py-2"
            type="button"
          >
            192x192 다운로드
          </button>
        </div>

        <div className="flex flex-col items-center gap-4">
          <canvas ref={canvas512Ref} width={512} height={512} className="border-2 border-white/20" />
          <button
            onClick={() => downloadIcon(512)}
            className="btn-primary rounded-full px-6 py-2"
            type="button"
          >
            512x512 다운로드
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-3 text-lg font-semibold text-white">사용 방법</h2>
        <ol className="list-inside list-decimal space-y-2 text-sm text-white/70">
          <li>위 버튼을 클릭하여 두 아이콘을 다운로드하세요.</li>
          <li>
            다운로드한 <code className="rounded bg-white/10 px-1 py-0.5 text-xs">icon-192.png</code>와{' '}
            <code className="rounded bg-white/10 px-1 py-0.5 text-xs">icon-512.png</code>를 프로젝트의{' '}
            <code className="rounded bg-white/10 px-1 py-0.5 text-xs">public/</code> 폴더에 저장하세요.
          </li>
          <li>개발 서버를 재시작하면 모바일에서 PWA 설치가 가능합니다.</li>
        </ol>
      </div>
    </div>
  );
}

