'use client';

import React from 'react';
import CompletenessIcon from './icons/CompletenessIcon';

export type CompletenessLevel = 1 | 2 | 3 | 4 | 5;

interface RealtimeProgressBarProps {
  level: CompletenessLevel;
  className?: string;
  withLabel?: boolean;
  labels?: Partial<Record<CompletenessLevel, string>>;
}

const _colorByLevel: Record<CompletenessLevel, string> = {
  1: '#959595', // 不足・グレー
  2: '#959595', // 不足・グレー
  3: '#C6AA0E', // 中程度・イエロー
  4: '#FF753E', // 高程度・オレンジ
  5: '#16C47F', // 充足・グリーン
};

// 既定ラベル
const defaultLabelByLevel: Record<CompletenessLevel, string> = {
  1: '足りない…',
  2: '足りない…',
  3: 'もう少し！',
  4: 'まぁよさそう',
  5: '問題なし！',
};

export function RealtimeProgressBar({ level, className = '', withLabel = true, labels,}: RealtimeProgressBarProps) {
  const segments = [1, 2, 3, 4, 5] as const;
  const labelText = (labels?.[level] ?? defaultLabelByLevel[level]) || '';
  return (
    <div className={`flex items-center gap-2 ${className}`} aria-label="情報の充足度">
      <div className="flex items-center gap-2">
      {segments.map((seg) => {
        const isActive = seg <= level;
        return (
          <CompletenessIcon
            key={seg}
            size={22}
            color="#FFFFFF"
            state={isActive ? 'active' : 'inactive'}
          />
        );
      })}
      </div>
      {withLabel && (
        <span className="text-white text-sm font-bold" aria-live="polite">
          {labelText}
        </span>
      )}
    </div>
  );
}

export default RealtimeProgressBar;


