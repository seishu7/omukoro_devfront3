import React from 'react';
import { ConsultationSearchResult } from '@/types/search';

interface ConsultationCardProps {
  consultation: ConsultationSearchResult;
  onClick?: (consultationId: string) => void;
}

export const ConsultationCard: React.FC<ConsultationCardProps> = ({
  consultation,
  onClick
}) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).replace(/\//g, '.');
    } catch {
      return dateString;
    }
  };

  return (
    <article 
      className="rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick?.(consultation.consultation_id)}
    >
      <h3 className="font-semibold text-neutral-900">
        {consultation.title}
      </h3>
      <div className="mt-2 text-sm text-neutral-600">
        {consultation.industry_category_name && (
          <span className="text-orange-600">
            #{consultation.industry_category_name}
          </span>
        )}
        {consultation.alcohol_type_name && (
          <span className="text-blue-600 ml-2">
            #{consultation.alcohol_type_name}
          </span>
        )}
        {consultation.user_name && (
          <span className="ml-3">{consultation.user_name}</span>
        )}
        <span className="ml-3">
          {formatDate(consultation.created_at)}
        </span>
      </div>
    </article>
  );
};
