'use client';
import React from 'react';

// 変更: CompletenessIcon のAPIと描画を拡張
type IconState = 'active' | 'inactive' | 'current';
type IconVariant = 'solid' | 'outline' | 'duotone';


type Props = {
  size?: number | string;
	color?: string;
	className?: string;
	title?: string;
	state?: IconState;          // 追加: active/inactive/current
	inactiveOpacity?: number;   // 追加: 非活性時の不透明度
	variant?: IconVariant;      // 追加: 見た目バリアント（将来用）
	strokeWidth?: number;       // 追加: 枠線太さ（outline等）
	withRing?: boolean;         // 追加: 現在値リング表示
	ringOpacity?: number;       // 追加: リングの不透明度
};

export default function CompletenessIcon({
  size = 24,
	color = 'currentColor',
	className,
	title,
	state = 'active',
	inactiveOpacity = 0.35,
	variant = 'solid',
	strokeWidth = 1.5,
	withRing = false,
	ringOpacity = 0.5,
}: Props) {
  const fillOpacity = state === 'inactive' ? inactiveOpacity : 1;
	const strokeOpacity = state === 'inactive' ? Math.min(1, inactiveOpacity + 0.15) : 1;

  return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 25 22"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden={title ? undefined : true}
			role={title ? 'img' : undefined}
			className={className}
		>
			{title ? <title>{title}</title> : null}

			{/* リング（現在値のみ） */}
			{withRing && state !== 'inactive' && (
				<path
					d="M7.45267 2.4524C9.98828 -0.817473 15.0118 -0.817458 17.5474 2.4524C17.7884 2.76323 18.0742 3.24844 18.646 4.21802L22.9878 11.5803C23.5595 12.5496 23.846 13.0341 24.0005 13.3938C25.6257 17.1783 23.1142 21.4366 18.9536 21.9514C18.5582 22.0003 17.9859 22.0002 16.8423 22.0002H8.15775C7.01462 22.0002 6.44285 22.0003 6.04739 21.9514C1.88658 21.4369 -0.625654 17.1784 0.999543 13.3938C1.15404 13.0341 1.44055 12.5496 2.01224 11.5803L6.35403 4.21802C6.92589 3.24843 7.21165 2.76323 7.45267 2.4524ZM12.4956 8.78931C10.6402 8.78931 9.13554 10.2933 9.13529 12.1487C9.13529 14.0043 10.6401 15.509 12.4956 15.509H12.6402C14.4957 15.509 15.9995 14.0042 15.9995 12.1487C15.9993 10.2934 14.4956 8.78935 12.6402 8.78931H12.4956Z"
					fill="none"
					stroke={color}
					strokeOpacity={ringOpacity}
					strokeWidth={strokeWidth * 2.5}
				/>
			)}

			{/* 本体 */}
			<path
				d="M7.45267 2.4524C9.98828 -0.817473 15.0118 -0.817458 17.5474 2.4524C17.7884 2.76323 18.0742 3.24844 18.646 4.21802L22.9878 11.5803C23.5595 12.5496 23.846 13.0341 24.0005 13.3938C25.6257 17.1783 23.1142 21.4366 18.9536 21.9514C18.5582 22.0003 17.9859 22.0002 16.8423 22.0002H8.15775C7.01462 22.0002 6.44285 22.0003 6.04739 21.9514C1.88658 21.4369 -0.625654 17.1784 0.999543 13.3938C1.15404 13.0341 1.44055 12.5496 2.01224 11.5803L6.35403 4.21802C6.92589 3.24843 7.21165 2.76323 7.45267 2.4524ZM12.4956 8.78931C10.6402 8.78931 9.13554 10.2933 9.13529 12.1487C9.13529 14.0043 10.6401 15.509 12.4956 15.509H12.6402C14.4957 15.509 15.9995 14.0042 15.9995 12.1487C15.9993 10.2934 14.4956 8.78935 12.6402 8.78931H12.4956Z"
				fill={variant === 'outline' ? 'none' : color}
				fillOpacity={variant === 'outline' ? 0 : fillOpacity}
				stroke={variant === 'outline' ? color : undefined}
				strokeOpacity={variant === 'outline' ? strokeOpacity : undefined}
				strokeWidth={variant === 'outline' ? strokeWidth : undefined}
			/>
		</svg>
	);
}