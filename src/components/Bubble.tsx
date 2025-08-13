'use client';

import React from 'react';

interface BubbleProps {
  color: string;
  className?: string;
  children: React.ReactNode;
  withTail?: boolean;
  tailOffsetClass?: string; // e.g., 'left-8', 'right-8'
  tailSide?: 'top' | 'bottom';
}

export default function Bubble({
  color,
  className = '',
  children,
  withTail = true,
  tailOffsetClass = 'left-8',
  tailSide = 'bottom',
}: BubbleProps) {
  return (
    <div className={className}>
      <div
        className="relative rounded-[40px_40px_0_40px] px-4 py-2 shadow-md ring-1 ring-black/10" // 角丸の大きさを調整
        style={{ backgroundColor: color }}
      >
        {children}
        {withTail && (
          <div
            className={`absolute ${tailSide === 'top' ? '-top-2' : '-bottom-2'} ${tailOffsetClass}`}
            style={{
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              ...(tailSide === 'top'
                ? { borderBottom: `8px solid ${color}` }
                : { borderTop: `8px solid ${color}` }),
            }}
            aria-hidden
          />
        )}
      </div>
    </div>
  );
}


