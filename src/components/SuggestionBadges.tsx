'use client';

import React from 'react';

interface SuggestionBadgesProps {
  categories: string[];
  className?: string;
}

export function SuggestionBadges({ categories, className = '' }: SuggestionBadgesProps) {
  if (!categories || categories.length === 0) return null;
  return (
    <div className={`flex flex-wrap gap-2 ${className}`} aria-label="不足カテゴリ">
      {categories.map((cat) => (
        <span
          key={cat}
          className="inline-flex items-center rounded-full bg-transparent text-white border border-white/30 px-3 py-1 text-sm"
        >
          {cat}
        </span>
      ))}
    </div>
  );
}

export default SuggestionBadges;


