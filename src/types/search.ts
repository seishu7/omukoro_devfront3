// バックエンドのSearchResponseに対応する型定義

export interface ConsultationSearchResult {
  consultation_id: string;
  title: string;
  summary_title?: string;
  initial_content: string;
  information_sufficiency_level: number;
  key_issues?: string[];
  suggested_questions?: string[];
  relevant_regulations?: Array<{[key: string]: string | number | boolean}>;
  action_items?: string[];
  detected_terms?: Array<{[key: string]: string | number | boolean}>;
  created_at: string;
  updated_at: string;
  user_name?: string;
  user_email?: string;
  industry_category_name?: string;
  alcohol_type_name?: string;
}

export interface IndustryCategoryOption {
  category_id: string;
  category_code: string;
  category_name: string;
  description?: string;
  is_default: boolean;
  sort_order: number;
}

export interface AlcoholTypeOption {
  type_id: string;
  type_code: string;
  type_name: string;
  description?: string;
  is_default: boolean;
  sort_order: number;
}

export interface SearchResponse {
  total_count: number;
  results: ConsultationSearchResult[];
  industry_categories: IndustryCategoryOption[];
  alcohol_types: AlcoholTypeOption[];
}

export interface SearchFilters {
  industry_categories: string[];
  alcohol_types: string[];
}

export type SortOrder = 'newest' | 'oldest';

export interface SortOption {
  value: SortOrder;
  label: string;
}

export interface SearchParams {
  query?: string;
  industry_categories?: string[];
  alcohol_types?: string[];
  sort_order?: SortOrder;
  limit?: number;
  offset?: number;
}
