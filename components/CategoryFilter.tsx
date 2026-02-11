import React from 'react';
import { Category } from '../types';

interface CategoryFilterProps {
  categories: Category[];
  selected: string;
  onSelect: (categorySlug: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, selected, onSelect }) => {
  return (
    <div className="w-full overflow-x-auto hide-scrollbar mb-8 sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md py-4">
      <div className="flex gap-2 px-4 md:justify-center">
        <button
          onClick={() => onSelect('all')}
          className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 border ${
            selected === 'all'
              ? 'bg-zinc-100 text-zinc-950 border-zinc-100'
              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'
          }`}
        >
          Все
        </button>

        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => onSelect(cat.slug)}
            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 border ${
              selected === cat.slug
                ? 'bg-zinc-100 text-zinc-950 border-zinc-100'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;