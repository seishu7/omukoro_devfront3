import React, { useState, useRef, useEffect } from 'react';
import { SearchFilters, IndustryCategoryOption, AlcoholTypeOption } from '@/types/search';

interface CategoryDropdownProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  industryCategories: IndustryCategoryOption[];
  alcoholTypes: AlcoholTypeOption[];
}

export const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  filters,
  onFiltersChange,
  industryCategories,
  alcoholTypes
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // デフォルトカテゴリ（バックエンドからデータが取得できない場合用）
  const defaultCategories: IndustryCategoryOption[] = [
    { category_id: 'cat0001', category_code: 'MARKETING', category_name: 'マーケティング・商品企画', description: undefined, is_default: false, sort_order: 1 },
    { category_id: 'cat0002', category_code: 'MANUFACTURING', category_name: '製造', description: undefined, is_default: false, sort_order: 2 },
    { category_id: 'cat0003', category_code: 'RD', category_name: '研究開発（R&D）', description: undefined, is_default: false, sort_order: 3 },
    { category_id: 'cat0004', category_code: 'DEVELOPMENT', category_name: '中身開発', description: undefined, is_default: false, sort_order: 4 },
    { category_id: 'cat0005', category_code: 'LOGISTICS', category_name: '物流', description: undefined, is_default: false, sort_order: 5 },
    { category_id: 'cat0006', category_code: 'OTHER', category_name: 'その他', description: undefined, is_default: false, sort_order: 6 }
  ];
  
  const defaultAlcoholTypes: AlcoholTypeOption[] = [
    { type_id: 'alc0001', type_code: 'BEER', type_name: 'ビールテイスト', description: undefined, is_default: false, sort_order: 1 },
    { type_id: 'alc0002', type_code: 'RTD', type_name: 'RTD/RTS', description: undefined, is_default: false, sort_order: 2 },
    { type_id: 'alc0003', type_code: 'WINE', type_name: 'ワイン', description: undefined, is_default: false, sort_order: 3 },
    { type_id: 'alc0004', type_code: 'SAKE', type_name: '和酒', description: undefined, is_default: false, sort_order: 4 },
    { type_id: 'alc0005', type_code: 'NONALC', type_name: 'ノンアルコール', description: undefined, is_default: false, sort_order: 5 }
  ];

  const displayIndustryCategories = industryCategories.length > 0 ? industryCategories : defaultCategories;
  const displayAlcoholTypes = alcoholTypes.length > 0 ? alcoholTypes : defaultAlcoholTypes;

  // クリック外で閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleIndustryCategoryToggle = (categoryId: string) => {
    const newCategories = filters.industry_categories.includes(categoryId)
      ? filters.industry_categories.filter(id => id !== categoryId)
      : [...filters.industry_categories, categoryId];
    
    onFiltersChange({
      ...filters,
      industry_categories: newCategories
    });
  };

  const handleAlcoholTypeToggle = (typeId: string) => {
    const newTypes = filters.alcohol_types.includes(typeId)
      ? filters.alcohol_types.filter(id => id !== typeId)
      : [...filters.alcohol_types, typeId];
    
    onFiltersChange({
      ...filters,
      alcohol_types: newTypes
    });
  };

  const totalSelected = filters.industry_categories.length + filters.alcohol_types.length;
  const displayValue = totalSelected === 0 ? 'すべて' : `${totalSelected}件選択中`;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-full px-6 py-3 shadow-sm transition-colors ${
          totalSelected > 0 ? 'bg-[#FF5A23] text-white' : 'bg-white/90 hover:bg-white'
        }`}
      >
        <span className={`text-sm font-normal ${totalSelected > 0 ? 'text-white/70' : 'text-gray-500'}`}>
          カテゴリー:
        </span>
        <span className="text-sm font-medium">{displayValue}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-10 max-h-80 overflow-y-auto">
          {/* 業界カテゴリ */}
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-3">業界カテゴリ</h3>
            <div className="space-y-2">
              {displayIndustryCategories.map((category) => (
                <label
                  key={category.category_id}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.industry_categories.includes(category.category_id)}
                    onChange={() => handleIndustryCategoryToggle(category.category_id)}
                    className="w-4 h-4 text-[#FF5A23] border-gray-300 rounded focus:ring-[#FF5A23] focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">{category.category_name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 酒類タイプ */}
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">酒類タイプ</h3>
            <div className="space-y-2">
              {displayAlcoholTypes.map((type) => (
                <label
                  key={type.type_id}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.alcohol_types.includes(type.type_id)}
                    onChange={() => handleAlcoholTypeToggle(type.type_id)}
                    className="w-4 h-4 text-[#FF5A23] border-gray-300 rounded focus:ring-[#FF5A23] focus:ring-2"
                  />
                  <span className="text-sm text-gray-700">{type.type_name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
