'use client';

import { FOOD_CATEGORIES, FoodCategoryCode } from '@/constants/food-categories';

interface CategorySelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (category: FoodCategoryCode) => void;
  onApply: () => void;
  selectedCategory: FoodCategoryCode | null;
}

export function CategorySelectModal({ 
  isOpen, 
  onClose, 
  onSelect,
  onApply,
  selectedCategory 
}: CategorySelectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[90%] max-w-[500px] max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">업종 선택</h2>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(FOOD_CATEGORIES).map(([code, name]) => (
              <button
                key={code}
                onClick={() => onSelect(code as FoodCategoryCode)}
                className={`px-3 py-2 text-sm rounded-lg transition-colors text-left
                  ${selectedCategory === code
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            취소
          </button>
          <button
            onClick={onApply}
            disabled={!selectedCategory}
            className={`px-4 py-2 text-sm rounded-lg
              ${selectedCategory
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            적용하기
          </button>
        </div>
      </div>
    </div>
  );
}