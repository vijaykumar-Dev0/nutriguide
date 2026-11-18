import type { PageRoute } from './Navbar.tsx';

interface FooterProps {
  onNavigate: (page: PageRoute) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="border-t border-[#E2E8E2] bg-[#F4F7F4] text-[#142419] mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/assets/aistudio/vijay_3ec11b06.jpg"
                alt="Nutrition Knowledge — Know Good Food, Know Good Health"
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-full object-cover border border-[#E2E8E2] bg-white shrink-0"
              />
              <div>
                <div className="font-display text-lg font-bold tracking-tight text-[#142419]">
                  NutriGuide
                </div>
                <div className="text-xs text-[#475B4B]">
                  Know Good Food · Know Good Health
                </div>
              </div>
            </div>
            <p className="text-sm text-[#475B4B] max-w-md leading-relaxed">
              An open educational resource dedicated to practical nutrition literacy—covering essential
              macronutrients, vitamins, deficiency prevention, and everyday whole-food habits.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#142419] mb-3">Nutrition Library</h3>
            <ul className="space-y-2 text-sm text-[#475B4B]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#15803D] transition-colors cursor-pointer"
                >
                  About Nutrition
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('nutrients')}
                  className="hover:text-[#15803D] transition-colors cursor-pointer"
                >
                  Core Nutrients
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('vitamins')}
                  className="hover:text-[#15803D] transition-colors cursor-pointer"
                >
                  Vitamins A–K
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('deficiencies')}
                  className="hover:text-[#15803D] transition-colors cursor-pointer"
                >
                  Deficiency Diseases
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[#142419] mb-3">Explore & Tools</h3>
            <ul className="space-y-2 text-sm text-[#475B4B]">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('foods')}
                  className="hover:text-[#15803D] transition-colors cursor-pointer"
                >
                  Healthy Food Catalog
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('meal3d')}
                  className="hover:text-[#15803D] transition-colors cursor-pointer"
                >
                  3D Balanced Meal Lab
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('quiz')}
                  className="hover:text-[#15803D] transition-colors cursor-pointer"
                >
                  Nutrition Awareness Quiz
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="hover:text-[#15803D] transition-colors cursor-pointer"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('auth')}
                  className="hover:text-[#15803D] transition-colors cursor-pointer"
                >
                  Learner Account
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#E2E8E2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#475B4B]">
          <span>NutriGuide · Nutrition Awareness Website · Educational Reference Only</span>
          <span>Always consult a qualified healthcare professional for personal medical advice.</span>
        </div>
      </div>
    </footer>
  );
}
