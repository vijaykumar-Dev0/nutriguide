import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { fetchHealthyFoods } from '../lib/api.ts';
import type { FoodCategory, HealthyFoodItem } from '../types/nutrition.ts';
import { BookmarkButton } from '../components/BookmarkButton.tsx';
import { ResilientImage } from '../components/ResilientImage.tsx';

interface FoodsPageProps {
  bookmarks: string[];
  onToggleBookmark: (itemKey: string) => void;
}

const FOOD_CATEGORIES: Array<'All' | FoodCategory> = [
  'All',
  'Fruits',
  'Vegetables',
  'Milk Products',
  'Nuts',
  'Whole Grains',
  'Protein-Rich Foods',
];

const ORIGIN_FILTERS = [
  { value: 'All', label: 'All Foods' },
  { value: 'Indian', label: 'Indian Foods' },
  { value: 'Global', label: 'Global Staples' },
] as const;

export function FoodsPage({ bookmarks, onToggleBookmark }: FoodsPageProps) {
  const [foods, setFoods] = useState<HealthyFoodItem[]>([]);
  const [category, setCategory] = useState<'All' | FoodCategory>('All');
  const [origin, setOrigin] = useState<'All' | 'Indian' | 'Global'>('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchHealthyFoods(category, search, origin)
      .then((data) => {
        if (active) {
          setFoods(data);
          setError('');
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load healthy foods.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [category, search, origin]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <p className="text-sm font-medium text-[#15803D]">Whole Food Reference</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#142419] text-balance">
            Healthy Food Categories &amp; Indian Staples
          </h1>
          <p className="text-base text-[#475B4B]">
            Explore Indian superfoods, millets, dals, dairy, fruits, vegetables, nuts, and global
            whole foods with serving benchmarks and health benefits.
          </p>
        </div>

        <div className="w-full md:w-72 relative">
          <label htmlFor="food-search" className="sr-only">
            Search healthy foods
          </label>
          <Search
            className="w-4 h-4 text-[#475B4B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="food-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search e.g. Ragi, Amla, Dal, Salmon..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E2E8E2] rounded-xl text-[#142419] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
          />
        </div>
      </div>

      {/* Category & Origin Filter Controls */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#F4F7F4] border border-[#E2E8E2] rounded-xl">
            {FOOD_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  category === cat
                    ? 'bg-[#15803D] text-white shadow-sm'
                    : 'text-[#475B4B] hover:text-[#142419] hover:bg-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#FEFCE8] border border-[#EDE9C6] rounded-xl">
            {ORIGIN_FILTERS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setOrigin(opt.value)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  origin === opt.value
                    ? 'bg-white text-[#142419] shadow-sm border border-[#E2E8E2]'
                    : 'text-[#713F12] hover:text-[#142419]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {!loading && !error && (
          <div className="text-xs text-[#475B4B]">
            Showing <span className="font-mono-nums font-semibold text-[#142419]">{foods.length}</span>{' '}
            whole food{foods.length === 1 ? '' : 's'}
            {category !== 'All' ? ` in ${category}` : ''}
            {origin !== 'All' ? ` · ${origin} selection` : ''}
          </div>
        )}
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div key={s} className="h-80 rounded-2xl bg-[#F4F7F4] border border-[#E2E8E2] animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="p-5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
          {error}
        </div>
      )}

      {!loading && !error && foods.length === 0 && (
        <div className="p-10 text-center bg-white border border-[#E2E8E2] rounded-2xl space-y-2">
          <p className="text-base font-semibold text-[#142419]">No foods matched your filter</p>
          <p className="text-sm text-[#475B4B]">
            Try selecting &ldquo;All&rdquo; or clearing your search query.
          </p>
        </div>
      )}

      {!loading && !error && foods.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {foods.map((food) => {
            const key = `food:${food.food_id}`;
            return (
              <article
                key={food.food_id}
                className="bg-white border border-[#E2E8E2] rounded-2xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[4/3] bg-[#F4F7F4] overflow-hidden border-b border-[#E2E8E2]">
                    <ResilientImage
                      src={food.image_url}
                      alt={`${food.food_name} — ${food.food_category}`}
                      className="w-full h-full object-cover"
                      fallbackTitle={food.food_name}
                    />
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs text-[#475B4B]">
                          <span className="font-medium text-[#15803D]">{food.food_category}</span>
                          <span aria-hidden="true"> · </span>
                          <span>{food.origin}</span>
                          <span aria-hidden="true"> · </span>
                          <span>{food.serving_size}</span>
                        </div>
                        <h2 className="font-display text-lg font-bold text-[#142419] mt-0.5">
                          {food.food_name}
                        </h2>
                      </div>
                      <BookmarkButton
                        itemKey={key}
                        isSaved={bookmarks.includes(key)}
                        onToggle={onToggleBookmark}
                      />
                    </div>

                    <p className="text-sm text-[#475B4B] leading-relaxed">{food.benefits}</p>
                  </div>
                </div>

                <div className="px-5 py-3.5 border-t border-[#E2E8E2] bg-[#FCFCFA] flex items-center justify-between gap-2 text-xs">
                  <span className="text-[#475B4B] truncate">
                    {food.key_nutrients.join(' · ')}
                  </span>
                  <span className="font-mono-nums font-semibold text-[#142419] whitespace-nowrap shrink-0">
                    {food.calories} kcal
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
