import { useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, Info, Search } from 'lucide-react';
import { fetchDeficiencies } from '../lib/api.ts';
import type { DeficiencyDiseaseItem } from '../types/nutrition.ts';
import { BookmarkButton } from '../components/BookmarkButton.tsx';
import { LearnSubnav } from '../components/LearnSubnav.tsx';
import type { PageRoute } from '../components/Navbar.tsx';

interface DeficienciesPageProps {
  onNavigate: (page: PageRoute) => void;
  bookmarks: string[];
  onToggleBookmark: (itemKey: string) => void;
}

function SeverityIndicator({ severity }: { severity: DeficiencyDiseaseItem['severity'] }) {
  if (severity === 'Critical') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B91C1C]">
        <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
        <span>Critical Public Health Risk</span>
      </span>
    );
  }
  if (severity === 'High') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B45309]">
        <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" />
        <span>High Prevalence Risk</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#15803D]">
      <Info className="w-3.5 h-3.5" aria-hidden="true" />
      <span>Preventable Dietary Risk</span>
    </span>
  );
}

export function DeficienciesPage({
  onNavigate,
  bookmarks,
  onToggleBookmark,
}: DeficienciesPageProps) {
  const [deficiencies, setDeficiencies] = useState<DeficiencyDiseaseItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchDeficiencies(search)
      .then((data) => {
        if (active) {
          setDeficiencies(data);
          setError('');
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Unable to load deficiency guides.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [search]);

  return (
    <div>
      <LearnSubnav activePage="deficiencies" onNavigate={onNavigate} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="text-sm font-medium text-[#15803D]">Preventive Nutrition Education</p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#142419] text-balance">
              Nutritional Deficiency Diseases
            </h1>
            <p className="text-base text-[#475B4B]">
              Learn to identify early symptoms, underlying dietary causes, and everyday food-based
              prevention strategies for common global deficiencies.
            </p>
          </div>

          <div className="w-full md:w-80 relative">
            <label htmlFor="deficiency-search" className="sr-only">
              Search deficiency diseases
            </label>
            <Search
              className="w-4 h-4 text-[#475B4B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="deficiency-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search symptoms, nutrient, or disease..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E2E8E2] rounded-xl text-[#142419] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
            />
          </div>
        </div>

        {loading && (
          <div className="space-y-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="h-56 rounded-2xl bg-[#F4F7F4] border border-[#E2E8E2] animate-pulse" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="p-5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
            {error}
          </div>
        )}

        {!loading && !error && deficiencies.length === 0 && (
          <div className="p-8 text-center bg-white border border-[#E2E8E2] rounded-2xl">
            <p className="text-sm text-[#475B4B]">No deficiency guides matched your search.</p>
          </div>
        )}

        {!loading && !error && deficiencies.length > 0 && (
          <div className="space-y-6">
            {deficiencies.map((item) => {
              const key = `deficiency:${item.disease_id}`;
              return (
                <article
                  key={item.disease_id}
                  className="bg-white border border-[#E2E8E2] rounded-2xl p-6 sm:p-8 space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#E2E8E2] pb-5">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="font-medium text-[#475B4B]">
                          Deficient Nutrient: <strong className="text-[#142419]">{item.nutrient_deficiency}</strong>
                        </span>
                        <span aria-hidden="true" className="text-[#CBD5E1]">
                          ·
                        </span>
                        <SeverityIndicator severity={item.severity} />
                      </div>
                      <h2 className="font-display text-2xl font-bold text-[#142419]">
                        {item.disease_name}
                      </h2>
                      <p className="text-sm text-[#475B4B] max-w-3xl leading-relaxed">{item.summary}</p>
                    </div>
                    <BookmarkButton
                      itemKey={key}
                      isSaved={bookmarks.includes(key)}
                      onToggle={onToggleBookmark}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-[#142419]">Common Symptoms</h3>
                      <ul className="space-y-1.5 text-sm text-[#475B4B]">
                        {item.symptoms.map((s) => (
                          <li key={s} className="flex items-start gap-2">
                            <span className="text-[#CA8A04] font-bold" aria-hidden="true">
                              ·
                            </span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-[#142419]">Primary Causes</h3>
                      <ul className="space-y-1.5 text-sm text-[#475B4B]">
                        {item.causes.map((c) => (
                          <li key={c} className="flex items-start gap-2">
                            <span className="text-[#475B4B] font-bold" aria-hidden="true">
                              ·
                            </span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2 bg-[#F4F7F4] rounded-xl p-4">
                      <h3 className="text-xs font-semibold text-[#14532D]">Prevention &amp; Dietary Steps</h3>
                      <ul className="space-y-1.5 text-sm text-[#142419]">
                        {item.prevention.map((p) => (
                          <li key={p} className="flex items-start gap-2">
                            <span className="text-[#15803D] font-bold" aria-hidden="true">
                              ·
                            </span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#E2E8E2] flex flex-wrap items-center justify-between gap-3 text-xs text-[#475B4B]">
                    <div>
                      <span className="font-semibold text-[#142419]">Protective Foods: </span>
                      <span>{item.recommended_foods.join(' · ')}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate('foods')}
                      className="text-[#15803D] font-semibold hover:underline cursor-pointer"
                    >
                      Explore these foods in catalog →
                    </button>
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
