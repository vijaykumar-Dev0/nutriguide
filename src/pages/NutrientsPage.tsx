import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { fetchNutrients } from '../lib/api.ts';
import type { NutrientItem } from '../types/nutrition.ts';
import { BookmarkButton } from '../components/BookmarkButton.tsx';
import { LearnSubnav } from '../components/LearnSubnav.tsx';
import type { PageRoute } from '../components/Navbar.tsx';

interface NutrientsPageProps {
  onNavigate: (page: PageRoute) => void;
  bookmarks: string[];
  onToggleBookmark: (itemKey: string) => void;
}

const CATEGORIES = ['All', 'Macronutrient', 'Micronutrient', 'Hydration'] as const;

export function NutrientsPage({ onNavigate, bookmarks, onToggleBookmark }: NutrientsPageProps) {
  const [nutrients, setNutrients] = useState<NutrientItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<(typeof CATEGORIES)[number]>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchNutrients(search)
      .then((data) => {
        if (active) {
          setNutrients(data);
          setError('');
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load nutrients.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [search]);

  const filtered = nutrients.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  return (
    <div>
      <LearnSubnav activePage="nutrients" onNavigate={onNavigate} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-sm font-medium text-[#15803D]">Essential Classes of Nutrition</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#142419] text-balance">
              The Six Core Nutrients
            </h1>
            <p className="text-base text-[#475B4B]">
              Carbohydrates, proteins, fats, vitamins, minerals, and water work together to supply
              energy, build structure, and regulate every physiological process.
            </p>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white border border-[#E2E8E2] rounded-2xl p-4">
          <div className="relative flex-1 max-w-md">
            <label htmlFor="nutrient-search" className="sr-only">
              Search nutrients
            </label>
            <Search
              className="w-4 h-4 text-[#475B4B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="nutrient-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search nutrients, functions, or foods..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-[#FCFCFA] border border-[#E2E8E2] rounded-lg text-[#142419] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#F4F7F4] rounded-lg overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white text-[#142419] shadow-sm'
                    : 'text-[#475B4B] hover:text-[#142419]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((skeleton) => (
              <div
                key={skeleton}
                className="h-64 rounded-2xl bg-[#F4F7F4] border border-[#E2E8E2] animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="p-5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="p-8 text-center bg-white border border-[#E2E8E2] rounded-2xl">
            <p className="text-sm text-[#475B4B]">No nutrients matched your current filter.</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filtered.map((nutrient) => {
                const key = `nutrient:${nutrient.nutrient_id}`;
                return (
                  <article
                    key={nutrient.nutrient_id}
                    className="bg-white border border-[#E2E8E2] rounded-2xl p-6 flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs text-[#15803D] font-medium">
                            <span>{nutrient.category}</span>
                            <span aria-hidden="true"> · </span>
                            <span className="font-mono-nums">{nutrient.daily_target}</span>
                          </div>
                          <h2 className="font-display text-2xl font-bold text-[#142419] mt-1">
                            {nutrient.nutrient_name}
                          </h2>
                        </div>
                        <BookmarkButton
                          itemKey={key}
                          isSaved={bookmarks.includes(key)}
                          onToggle={onToggleBookmark}
                        />
                      </div>

                      <p className="text-sm text-[#475B4B] leading-relaxed">{nutrient.description}</p>

                      <div className="space-y-2">
                        <h3 className="text-xs font-semibold text-[#142419]">Primary Functions</h3>
                        <ul className="space-y-1.5 text-sm text-[#475B4B]">
                          {nutrient.functions.map((fn) => (
                            <li key={fn} className="flex items-start gap-2">
                              <span className="text-[#15803D] font-semibold" aria-hidden="true">
                                ·
                              </span>
                              <span>{fn}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#E2E8E2] space-y-3">
                      <div>
                        <div className="text-xs font-semibold text-[#142419]">Top Food Sources</div>
                        <p className="text-sm text-[#475B4B] mt-0.5">
                          {nutrient.food_sources.join(' · ')}
                        </p>
                      </div>
                      <div className="bg-[#FEFCE8] rounded-xl p-3.5 text-xs text-[#713F12] leading-relaxed">
                        <span className="font-semibold">Why it matters: </span>
                        {nutrient.importance}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Quick Reference Table */}
            <section className="bg-white border border-[#E2E8E2] rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E2E8E2] bg-[#F4F7F4]">
                <h2 className="font-display text-lg font-semibold text-[#142419]">
                  Daily Nutrient Reference Summary
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-[#E2E8E2] text-xs text-[#475B4B]">
                    <tr>
                      <th className="py-3 px-6 font-semibold">Nutrient</th>
                      <th className="py-3 px-6 font-semibold">Classification</th>
                      <th className="py-3 px-6 font-semibold">Typical Daily Target</th>
                      <th className="py-3 px-6 font-semibold">Key Dietary Examples</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8E2]">
                    {filtered.map((n) => (
                      <tr key={n.nutrient_id} className="hover:bg-[#FCFCFA]">
                        <td className="py-3.5 px-6 font-semibold text-[#142419]">{n.nutrient_name}</td>
                        <td className="py-3.5 px-6 text-[#475B4B]">{n.category}</td>
                        <td className="py-3.5 px-6 font-mono-nums text-[#15803D] font-medium">
                          {n.daily_target}
                        </td>
                        <td className="py-3.5 px-6 text-[#475B4B]">
                          {n.food_sources.slice(0, 3).join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
