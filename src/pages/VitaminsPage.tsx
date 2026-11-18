import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { fetchVitamins } from '../lib/api.ts';
import type { VitaminItem } from '../types/nutrition.ts';
import { BookmarkButton } from '../components/BookmarkButton.tsx';
import { LearnSubnav } from '../components/LearnSubnav.tsx';
import type { PageRoute } from '../components/Navbar.tsx';

interface VitaminsPageProps {
  onNavigate: (page: PageRoute) => void;
  bookmarks: string[];
  onToggleBookmark: (itemKey: string) => void;
}

const SOLUBILITY_FILTERS = ['All', 'Fat-Soluble', 'Water-Soluble'] as const;

export function VitaminsPage({ onNavigate, bookmarks, onToggleBookmark }: VitaminsPageProps) {
  const [vitamins, setVitamins] = useState<VitaminItem[]>([]);
  const [search, setSearch] = useState('');
  const [solubility, setSolubility] = useState<(typeof SOLUBILITY_FILTERS)[number]>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchVitamins(search, solubility)
      .then((data) => {
        if (active) {
          setVitamins(data);
          setError('');
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load vitamins.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [search, solubility]);

  return (
    <div>
      <LearnSubnav activePage="vitamins" onNavigate={onNavigate} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
        <div className="space-y-2 max-w-2xl">
          <p className="text-sm font-medium text-[#15803D]">Micronutrient Directory</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#142419] text-balance">
            Essential Vitamins A through K
          </h1>
          <p className="text-base text-[#475B4B]">
            Understand how water-soluble and fat-soluble vitamins protect vision, immunity, cellular
            energy, bone density, and healthy blood clotting.
          </p>
        </div>

        {/* Search & Solubility Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white border border-[#E2E8E2] rounded-2xl p-4">
          <div className="relative flex-1 max-w-md">
            <label htmlFor="vitamin-search" className="sr-only">
              Search vitamins
            </label>
            <Search
              className="w-4 h-4 text-[#475B4B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="vitamin-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by vitamin, food source, or deficiency..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-[#FCFCFA] border border-[#E2E8E2] rounded-lg text-[#142419] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#F4F7F4] rounded-lg overflow-x-auto">
            {SOLUBILITY_FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setSolubility(filter)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  solubility === filter
                    ? 'bg-white text-[#142419] shadow-sm'
                    : 'text-[#475B4B] hover:text-[#142419]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="h-64 rounded-2xl bg-[#F4F7F4] border border-[#E2E8E2] animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="p-5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
            {error}
          </div>
        )}

        {!loading && !error && vitamins.length === 0 && (
          <div className="p-8 text-center bg-white border border-[#E2E8E2] rounded-2xl">
            <p className="text-sm text-[#475B4B]">No vitamins matched your search query.</p>
          </div>
        )}

        {!loading && !error && vitamins.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vitamins.map((vit) => {
              const key = `vitamin:${vit.vitamin_id}`;
              return (
                <article
                  key={vit.vitamin_id}
                  className="bg-white border border-[#E2E8E2] rounded-2xl p-6 flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs text-[#475B4B]">
                          <span className="font-medium text-[#15803D]">{vit.solubility}</span>
                          <span aria-hidden="true"> · </span>
                          <span>{vit.chemical_name}</span>
                          <span aria-hidden="true"> · </span>
                          <span className="font-mono-nums">RDA {vit.daily_rda}</span>
                        </div>
                        <h2 className="font-display text-2xl font-bold text-[#142419] mt-1">
                          {vit.vitamin_name}
                        </h2>
                      </div>
                      <BookmarkButton
                        itemKey={key}
                        isSaved={bookmarks.includes(key)}
                        onToggle={onToggleBookmark}
                      />
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-[#142419]">Biological Functions</h3>
                      <ul className="space-y-1.5 text-sm text-[#475B4B]">
                        {vit.functions.map((fn) => (
                          <li key={fn} className="flex items-start gap-2">
                            <span className="text-[#15803D] font-semibold" aria-hidden="true">
                              ·
                            </span>
                            <span>{fn}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xs font-semibold text-[#142419]">Natural Food Sources</h3>
                      <p className="text-sm text-[#475B4B] mt-1">{vit.food_sources.join(' · ')}</p>
                    </div>
                  </div>

                  <div className="bg-[#FEFCE8] border border-[#EDE9C6] rounded-xl p-4 text-xs text-[#713F12] leading-relaxed">
                    <span className="font-semibold">Deficiency Risk: </span>
                    {vit.deficiency_information}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
