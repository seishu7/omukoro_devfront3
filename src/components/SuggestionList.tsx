'use client';

import React from 'react';

interface SuggestionListProps {
  suggestions: string[];
  className?: string;
}

export function SuggestionList({ suggestions, className = '' }: SuggestionListProps) {
  if (!suggestions || suggestions.length === 0) return null;
  return (
    <ul className={`list-disc pl-5 space-y-1 text-white ${className}`} aria-label="追加推奨項目">
      {suggestions.map((s, idx) => (
        <li key={`${idx}-${s}`} className="text-base font-bold">
          {s}
        </li>
      ))}
    </ul>
  );
}

export default SuggestionList;


