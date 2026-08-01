'use client';

import { useEffect, useRef } from 'react';

interface SignaturePadProps {
  value: string; // data URL PNG, "" kalau kosong
  onChange: (dataUrl: string) => void;
  width?: number;
  height?: number;
}

interface Point {
  x: number;
  y: number;
}

/**
 * Tanda tangan digital sederhana: digambar langsung di canvas pakai mouse atau jari
 * (touch), disimpan sebagai data URL PNG. Dipakai di ARO Logbook & CTAF Traffic
 * untuk serah-terima shift.
 */
export function SignaturePad({ value, onChange, width = 220, height = 90 }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<Point | null>(null);

  // Render ulang tanda tangan tersimpan setiap kali value berubah dari luar
  // (misal saat pindah tanggal / data baru masuk dari sync cloud).
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (value) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = value;
    }
  }, [value]);

  function getPoint(e: React.MouseEvent | React.TouchEvent): Point {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function handleStart(e: React.MouseEvent | React.TouchEvent) {
    isDrawing.current = true;
    lastPoint.current = getPoint(e);
  }

  function handleMove(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !lastPoint.current) return;
    const point = getPoint(e);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPoint.current = point;
  }

  function handleEnd() {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const canvas = canvasRef.current;
    if (canvas) onChange(canvas.toDataURL('image/png'));
  }

  function handleClear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange('');
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="touch-none rounded-sm border border-border bg-surface"
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      />
      <button
        type="button"
        onClick={handleClear}
        className="text-[10px] text-text-muted hover:text-status-alert hover:underline"
      >
        Hapus tanda tangan
      </button>
    </div>
  );
}
