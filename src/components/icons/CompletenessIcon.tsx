'use client';
import React from 'react';

type Props = {
  active?: boolean;
  color?: string;        // アクティブ時の色（充足度カラー）
  background?: string;   // 背景（デフォルト透明）
  width?: number;        // デフォルト 24
  height?: number;       // デフォルト 22
  className?: string;
  ariaLabel?: string;
  cornerRadius?: number;
};

export default function CompletenessIcon({
  active = true,
  color = '#16C47F',
  background = 'transparent',
  width = 24,
  height = 22,
  className = '',
  ariaLabel,
  cornerRadius = 8,
}: Props) {
  const fill = active ? color : '#D9D9D9';

  // 基本座標（Figma寸法に準拠）
  const A = { x: 0,  y: 22 };
  const B = { x: 12, y: 0  };
  const C = { x: 24, y: 22 };
  const r = Math.max(0, Math.min(cornerRadius, 4)); // 過度な丸み防止

  type Point = { x: number; y: number };
  const sub = (p: Point, q: Point): Point => ({ x: p.x - q.x, y: p.y - q.y });
  const len = (v: Point): number => Math.hypot(v.x, v.y);
  const unit = (v: Point): Point => { const l = len(v); return { x: v.x / l, y: v.y / l }; };
  const off = (p: Point, dir: Point, d: number): Point => { const u = unit(dir); return { x: p.x + u.x * d, y: p.y + u.y * d }; };

  // エッジ単位ベクトル
  const uAB = unit(sub(B, A)); const uBA = unit(sub(A, B));
  const uBC = unit(sub(C, B)); const uCB = unit(sub(B, C));
  const uCA = unit(sub(A, C)); const uAC = unit(sub(C, A));

  // 角丸用のエッジ上ポイント
  const A1 = off(A, uAB, r), A2 = off(A, uAC, r);
  const B1 = off(B, uBA, r), B2 = off(B, uBC, r);
  const C1 = off(C, uCB, r), C2 = off(C, uCA, r);
 
  // 角丸三角形パス（必要に応じて使用）
  // const roundedPath =
  //   `M ${A1.x},${A1.y} L ${B1.x},${B1.y} Q ${B.x},${B.y} ${B2.x},${B2.y} ` +
  //   `L ${C1.x},${C1.y} Q ${C.x},${C.y} ${C2.x},${C2.y} ` +
  //   `L ${A2.x},${A2.y} Q ${A.x},${A.y} ${A1.x},${A1.y} Z`;
 
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 22"
      className={className}
      aria-label={ariaLabel}
      role={ariaLabel ? 'img' : 'presentation'}
      focusable="false"
    >
      {/* 背景（Subtractの白を使いたい場合は background='#FFFFFF' を渡す） */}
      <rect x="0" y="0" width="24" height="22" fill={background} />
      {/* Polygon 11（24x22の三角） */}
      <path d="M0,22 L12,0 L24,22 Z" fill={fill} />
      {/* Rectangle 3464020（6.86 x 6.72 の丸）left:8.63, top:8.79 */}
      <ellipse
        cx={8.63 + 6.86 / 2}
        cy={8.79 + 6.72 / 2}
        rx={6.86 / 2}
        ry={6.72 / 2}
        fill={fill}
      />
    </svg>
  );
}