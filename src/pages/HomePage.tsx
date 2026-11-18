import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Search, ShieldAlert, Sparkles, Utensils } from 'lucide-react';
import { searchNutrition } from '../lib/api.ts';
import type { SearchResults } from '../types/nutrition.ts';
import type { PageRoute } from '../components/Navbar.tsx';
import { ResilientImage } from '../components/ResilientImage.tsx';

interface HomePageProps {
  onNavigate: (page: PageRoute) => void;
}

const HERO_IMAGE = '/src/assets/images/hero_nutrition_spread_1794995822237.jpg';
const BALANCED_IMAGE = '/src/assets/images/about_balanced_plate_1794995822234.jpg';
const FRUITS_IMAGE = '/src/assets/images/food_fruits_vegetables_1794995821699.jpg';
const GRAINS_IMAGE = '/src/assets/images/food_nuts_grains_dairy_1794995820392.jpg';

const BENEFITS = [
  {
    number: '01',
    title: 'Steady Cognitive & Physical Energy',
    body: 'Complex carbohydrates, B vitamins, and adequate hydration sustain focus and prevent midday glucose crashes.',
  },
  {
    number: '02',
    title: 'Stronger Immune Defense',
    body: 'Vitamins A, C, D, zinc, and antioxidant phytonutrients maintain mucosal barriers and support white blood cell response.',
  },
  {
    number: '03',
    title: 'Lifelong Bone & Muscle Integrity',
    body: 'Bioavailable proteins, calcium, Vitamin D, and Vitamin K preserve skeletal density and lean tissue repair.',
  },
  {
    number: '04',
    title: 'Deficiency & Disease Prevention',
    body: 'Consistent dietary diversity prevents anaemia, goiter, scurvy, rickets, and chronic metabolic conditions.',
  },
];

export function HomePage({ onNavigate }: HomePageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const q = searchTerm.trim();
    if (!q) {
      setResults(null);
      return;
    }
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchNutrition(q);
        setResults(res);
      } catch {
        setResults(null);
      } finally {
        setIsSearching(false);
      }
    }, 200);
    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  const totalMatches = results
    ? results.nutrients.length +
      results.vitamins.length +
      results.deficiencies.length +
      results.foods.length
    : 0;

  return (
    <div className="space-y-20 pb-12">
      {/* Hero Split Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            <p className="text-sm font-medium text-[#15803D]">
              Nutrition Awareness &amp; Everyday Health Literacy
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#142419] leading-[1.12] text-balance">
              Understand the nutrients that power every cell in your body.
            </h1>
            <p className="text-base sm:text-lg text-[#475B4B] max-w-xl leading-relaxed">
              Explore clear, science-backed guides on macronutrients, essential vitamins, deficiency
              prevention, and wholesome everyday foods designed for lasting wellbeing.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onNavigate('nutrients')}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#15803D]"
              >
                <span>Explore Nutrition</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('meal3d')}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#142419] bg-[#FEF9C3] hover:bg-[#FEF08A] border border-[#EAB308]/35 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Explore 3D Meal Lab</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('quiz')}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#142419] bg-white hover:bg-[#F4F7F4] border border-[#E2E8E2] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Take Nutrition Quiz</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="h-full min-h-[280px] sm:min-h-[360px] rounded-2xl overflow-hidden border border-[#E2E8E2] bg-[#F4F7F4]">
              <ResilientImage
                src={HERO_IMAGE}
                alt="Fresh leafy greens, sliced avocado, golden lemons, berries, oats, and almonds arranged on a bright white marble table"
                className="w-full h-full object-cover"
                fallbackTitle="Whole Food Nutrition Spread"
              />
            </div>
          </div>
        </div>

        {/* Full-Width Key Figures + Live Search Row */}
        <div className="mt-10 bg-white border border-[#E2E8E2] rounded-2xl p-5 sm:p-6 space-y-6">
          <div className="relative">
            <label htmlFor="home-nutrition-search" className="sr-only">
              Search nutrients, vitamins, deficiency diseases, or healthy foods
            </label>
            <Search
              className="w-5 h-5 text-[#475B4B] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="home-nutrition-search"
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search nutrition topics: e.g., Vitamin C, Iron, Anaemia, Salmon, Quinoa..."
              className="w-full pl-12 pr-4 py-3 text-sm sm:text-base bg-[#FCFCFA] border border-[#E2E8E2] rounded-xl text-[#142419] placeholder:text-[#6B7D6E] focus:outline-none focus:ring-2 focus:ring-[#15803D] focus:border-[#15803D]"
            />

            {/* Live Search Results Panel */}
            {searchTerm.trim().length > 0 && (
              <div className="mt-3 border border-[#E2E8E2] rounded-xl bg-[#FCFCFA] p-4 space-y-4">
                <div className="flex items-center justify-between text-xs text-[#475B4B]">
                  <span>
                    {isSearching
                      ? 'Searching nutrition library...'
                      : `${totalMatches} matching result${totalMatches === 1 ? '' : 's'} for "${searchTerm.trim()}"`}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="text-[#15803D] font-medium hover:underline cursor-pointer"
                  >
                    Clear search
                  </button>
                </div>

                {!isSearching && totalMatches === 0 && (
                  <p className="text-sm text-[#475B4B] py-2">
                    No exact matches found. Try searching for &ldquo;Protein&rdquo;, &ldquo;Vitamin D&rdquo;, &ldquo;Anaemia&rdquo;, or &ldquo;Spinach&rdquo;.
                  </p>
                )}

                {results && totalMatches > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {results.nutrients.map((n) => (
                      <button
                        key={`n-${n.nutrient_id}`}
                        type="button"
                        onClick={() => onNavigate('nutrients')}
                        className="text-left p-3 rounded-lg bg-white border border-[#E2E8E2] hover:border-[#15803D] transition-colors cursor-pointer"
                      >
                        <div className="text-xs text-[#15803D] font-medium">
                          Nutrient · {n.category}
                        </div>
                        <div className="text-sm font-semibold text-[#142419] mt-0.5">
                          {n.nutrient_name}
                        </div>
                        <div className="text-xs text-[#475B4B] line-clamp-1 mt-0.5">
                          {n.description}
                        </div>
                      </button>
                    ))}
                    {results.vitamins.map((v) => (
                      <button
                        key={`v-${v.vitamin_id}`}
                        type="button"
                        onClick={() => onNavigate('vitamins')}
                        className="text-left p-3 rounded-lg bg-white border border-[#E2E8E2] hover:border-[#15803D] transition-colors cursor-pointer"
                      >
                        <div className="text-xs text-[#CA8A04] font-medium">
                          Vitamin · {v.solubility}
                        </div>
                        <div className="text-sm font-semibold text-[#142419] mt-0.5">
                          {v.vitamin_name}
                        </div>
                        <div className="text-xs text-[#475B4B] line-clamp-1 mt-0.5">
                          {v.chemical_name} · RDA {v.daily_rda}
                        </div>
                      </button>
                    ))}
                    {results.deficiencies.map((d) => (
                      <button
                        key={`d-${d.disease_id}`}
                        type="button"
                        onClick={() => onNavigate('deficiencies')}
                        className="text-left p-3 rounded-lg bg-white border border-[#E2E8E2] hover:border-[#15803D] transition-colors cursor-pointer"
                      >
                        <div className="text-xs text-[#B45309] font-medium">
                          Deficiency Condition · {d.nutrient_deficiency}
                        </div>
                        <div className="text-sm font-semibold text-[#142419] mt-0.5">
                          {d.disease_name}
                        </div>
                        <div className="text-xs text-[#475B4B] line-clamp-1 mt-0.5">
                          {d.summary}
                        </div>
                      </button>
                    ))}
                    {results.foods.map((f) => (
                      <button
                        key={`f-${f.food_id}`}
                        type="button"
                        onClick={() => onNavigate('foods')}
                        className="text-left p-3 rounded-lg bg-white border border-[#E2E8E2] hover:border-[#15803D] transition-colors cursor-pointer"
                      >
                        <div className="text-xs text-[#15803D] font-medium">
                          Healthy Food · {f.food_category}
                        </div>
                        <div className="text-sm font-semibold text-[#142419] mt-0.5">
                          {f.food_name}
                        </div>
                        <div className="text-xs text-[#475B4B] line-clamp-1 mt-0.5">
                          {f.serving_size} · {f.calories} kcal
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-[#E2E8E2]">
            <button
              type="button"
              onClick={() => onNavigate('nutrients')}
              className="text-left p-3 rounded-xl hover:bg-[#F4F7F4] transition-colors cursor-pointer"
            >
              <div className="font-mono-nums text-2xl font-semibold text-[#15803D]">06</div>
              <div className="text-sm font-semibold text-[#142419] mt-0.5">Core Nutrients</div>
              <div className="text-xs text-[#475B4B]">Macros, micros &amp; hydration</div>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('vitamins')}
              className="text-left p-3 rounded-xl hover:bg-[#F4F7F4] transition-colors cursor-pointer"
            >
              <div className="font-mono-nums text-2xl font-semibold text-[#15803D]">06</div>
              <div className="text-sm font-semibold text-[#142419] mt-0.5">Vitamin Profiles</div>
              <div className="text-xs text-[#475B4B]">Vitamins A, B, C, D, E &amp; K</div>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('deficiencies')}
              className="text-left p-3 rounded-xl hover:bg-[#F4F7F4] transition-colors cursor-pointer"
            >
              <div className="font-mono-nums text-2xl font-semibold text-[#CA8A04]">05</div>
              <div className="text-sm font-semibold text-[#142419] mt-0.5">Deficiency Guides</div>
              <div className="text-xs text-[#475B4B]">Symptoms, causes &amp; prevention</div>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('foods')}
              className="text-left p-3 rounded-xl hover:bg-[#F4F7F4] transition-colors cursor-pointer"
            >
              <div className="font-mono-nums text-2xl font-semibold text-[#15803D]">42</div>
              <div className="text-sm font-semibold text-[#142419] mt-0.5">Whole Food Cards</div>
              <div className="text-xs text-[#475B4B]">Indian &amp; global food groups</div>
            </button>
          </div>
        </div>
      </section>

      {/* Introduction & Benefits of Proper Nutrition */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-[#E2E8E2] bg-[#FEFCE8]">
              <ResilientImage
                src={BALANCED_IMAGE}
                alt="Balanced nutritious plate with broccoli, spinach, quinoa, roasted sweet potato, chickpeas, and avocado"
                className="w-full h-full object-cover"
                fallbackTitle="Balanced Daily Meal Plate"
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-[#15803D]">Why Daily Nutrition Matters</p>
              <h2 className="font-display text-3xl font-bold tracking-tight text-[#142419] text-balance">
                Food is the biochemical blueprint for energy, immunity, and longevity.
              </h2>
              <p className="text-base text-[#475B4B] leading-relaxed">
                Nutrition is more than calorie counting. It is the process by which your body ingests,
                absorbs, and transforms whole foods into cellular fuel, structural tissue, and protective enzymes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {BENEFITS.map((item) => (
                <div key={item.number} className="space-y-1.5 border-t border-[#E2E8E2] pt-4">
                  <div className="font-mono-nums text-xs font-semibold text-[#15803D]">
                    {item.number}
                  </div>
                  <h3 className="font-display text-base font-semibold text-[#142419]">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#475B4B] leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>

            <div>
              <button
                type="button"
                onClick={() => onNavigate('about')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#15803D] hover:text-[#166534] cursor-pointer"
              >
                <span>Read the complete About Nutrition guide</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Healthy Food Categories Visual Preview + Quick Pathways */}
      <section className="bg-[#FEFCE8] border-y border-[#EDE9C6] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <p className="text-sm font-medium text-[#854D0E]">Curriculum &amp; Food Explorer</p>
              <h2 className="font-display text-3xl font-bold tracking-tight text-[#142419] text-balance">
                Learn by nutrient, vitamin, or everyday food group.
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('foods')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#142419] bg-white border border-[#E2E8E2] hover:border-[#15803D] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Browse All Healthy Foods</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              type="button"
              onClick={() => onNavigate('foods')}
              className="group text-left bg-white border border-[#E2E8E2] rounded-2xl overflow-hidden hover:border-[#15803D] transition-colors cursor-pointer"
            >
              <div className="aspect-[4/3] overflow-hidden bg-[#F4F7F4]">
                <ResilientImage
                  src={FRUITS_IMAGE}
                  alt="Fresh fruits and leafy green vegetables on a white tray"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                  fallbackTitle="Fruits & Vegetables"
                />
              </div>
              <div className="p-5 space-y-2">
                <div className="text-xs text-[#15803D] font-medium">
                  Produce · Vitamins &amp; Fiber
                </div>
                <h3 className="font-display text-lg font-semibold text-[#142419] flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-[#15803D]" aria-hidden="true" />
                  <span>Fruits, Greens &amp; Whole Foods</span>
                </h3>
                <p className="text-sm text-[#475B4B]">
                  Filter nutrient-dense fruits, vegetables, dairy, nuts, whole grains, and proteins by category.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('vitamins')}
              className="group text-left bg-white border border-[#E2E8E2] rounded-2xl overflow-hidden hover:border-[#15803D] transition-colors cursor-pointer"
            >
              <div className="aspect-[4/3] overflow-hidden bg-[#F4F7F4]">
                <ResilientImage
                  src={GRAINS_IMAGE}
                  alt="Fresh milk, yogurt bowl, raw almonds, walnuts, oats, and quinoa"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                  fallbackTitle="Vitamins & Whole Staples"
                />
              </div>
              <div className="p-5 space-y-2">
                <div className="text-xs text-[#CA8A04] font-medium">
                  Micronutrients · Vitamins A–K
                </div>
                <h3 className="font-display text-lg font-semibold text-[#142419] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#15803D]" aria-hidden="true" />
                  <span>Essential Vitamins Reference</span>
                </h3>
                <p className="text-sm text-[#475B4B]">
                  Compare fat-soluble and water-soluble vitamins, daily RDAs, and natural culinary sources.
                </p>
              </div>
            </button>

            <div className="flex flex-col justify-between bg-white border border-[#E2E8E2] rounded-2xl p-6 space-y-6">
              <div className="space-y-4">
                <div className="text-xs text-[#B45309] font-medium">
                  Prevention &amp; Self-Check
                </div>
                <h3 className="font-display text-xl font-semibold text-[#142419] flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-[#CA8A04]" aria-hidden="true" />
                  <span>Recognize Deficiencies Early</span>
                </h3>
                <p className="text-sm text-[#475B4B] leading-relaxed">
                  Study the warning symptoms, root causes, and dietary prevention steps for Iron
                  Anaemia, Vitamin A, Vitamin D, Vitamin C, and Iodine deficiencies.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#E2E8E2]">
                <button
                  type="button"
                  onClick={() => onNavigate('deficiencies')}
                  className="w-full py-2.5 px-4 text-sm font-semibold text-[#142419] bg-[#F4F7F4] hover:bg-[#DCFCE7] rounded-xl transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>View Deficiency Guides</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('quiz')}
                  className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-xl transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span className="inline-flex items-center gap-2">
                    <Sparkles className="w-4 h-4" aria-hidden="true" />
                    <span>Start 10-Question Quiz</span>
                  </span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
