import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import type { UserPublic } from '../types/nutrition.ts';

export type PageRoute =
  | 'home'
  | 'about'
  | 'nutrients'
  | 'vitamins'
  | 'deficiencies'
  | 'foods'
  | 'meal3d'
  | 'quiz'
  | 'contact'
  | 'auth'
  | 'dashboard';

interface NavbarProps {
  currentPage: PageRoute;
  onNavigate: (page: PageRoute) => void;
  user: UserPublic | null;
}

const LEARN_ROUTES: Array<{ page: PageRoute; label: string; summary: string }> = [
  { page: 'about', label: 'About Nutrition', summary: 'Balanced diet principles & daily eating habits' },
  { page: 'nutrients', label: 'Core Nutrients', summary: 'Carbs, proteins, fats, vitamins, minerals & water' },
  { page: 'vitamins', label: 'Vitamins A–K', summary: 'Functions, food sources & daily targets' },
  { page: 'deficiencies', label: 'Deficiency Diseases', summary: 'Symptoms, causes & dietary prevention' },
];

export function Navbar({ currentPage, onNavigate, user }: NavbarProps) {
  const [learnOpen, setLearnOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isLearnActive = ['about', 'nutrients', 'vitamins', 'deficiencies'].includes(currentPage);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLearnOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  function navigateTo(page: PageRoute) {
    setLearnOpen(false);
    setMobileOpen(false);
    onNavigate(page);
  }

  return (
    <header className="sticky top-0 z-40 bg-[#FCFCFA]/95 backdrop-blur-sm border-b border-[#E2E8E2]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand logo mark & wordmark */}
        <button
          type="button"
          onClick={() => navigateTo('home')}
          className="inline-flex items-center gap-2.5 font-display text-xl font-bold tracking-tight text-[#142419] hover:text-[#15803D] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] rounded-md px-1 cursor-pointer"
        >
          <img
            src="/assets/aistudio/vijay_3ec11b06.jpg"
            alt="Nutrition Knowledge logo"
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover border border-[#E2E8E2] bg-white shrink-0"
          />
          <span>NutriGuide</span>
        </button>

        {/* Zone 2: 5 concise single-line navigation links (Brand wordmark navigates Home) */}
        <nav aria-label="Primary" className="hidden md:flex items-center gap-7 text-sm font-medium text-[#475B4B]">

          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setLearnOpen((prev) => !prev)}
              aria-expanded={learnOpen}
              className={`inline-flex items-center gap-1 whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                isLearnActive
                  ? 'text-[#142419] border-[#15803D]'
                  : 'border-transparent hover:text-[#142419] hover:border-[#BBF7D0]'
              }`}
            >
              <span>Nutrition Guide</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-150 ${learnOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </button>

            {learnOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-white border border-[#E2E8E2] rounded-xl shadow-lg p-2 z-50">
                {LEARN_ROUTES.map((item) => (
                  <button
                    key={item.page}
                    type="button"
                    onClick={() => navigateTo(item.page)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                      currentPage === item.page
                        ? 'bg-[#F0FDF4] text-[#14532D]'
                        : 'hover:bg-[#FEFCE8] text-[#142419]'
                    }`}
                  >
                    <div className="text-sm font-semibold">{item.label}</div>
                    <div className="text-xs text-[#475B4B] mt-0.5">{item.summary}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigateTo('foods')}
            className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
              currentPage === 'foods'
                ? 'text-[#142419] border-[#15803D]'
                : 'border-transparent hover:text-[#142419] hover:border-[#BBF7D0]'
            }`}
          >
            Healthy Foods
          </button>

          <button
            type="button"
            onClick={() => navigateTo('meal3d')}
            className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
              currentPage === 'meal3d'
                ? 'text-[#142419] border-[#15803D]'
                : 'border-transparent hover:text-[#142419] hover:border-[#BBF7D0]'
            }`}
          >
            3D Meal Lab
          </button>

          <button
            type="button"
            onClick={() => navigateTo('quiz')}
            className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
              currentPage === 'quiz'
                ? 'text-[#142419] border-[#15803D]'
                : 'border-transparent hover:text-[#142419] hover:border-[#BBF7D0]'
            }`}
          >
            Quiz
          </button>

          <button
            type="button"
            onClick={() => navigateTo('contact')}
            className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
              currentPage === 'contact'
                ? 'text-[#142419] border-[#15803D]'
                : 'border-transparent hover:text-[#142419] hover:border-[#BBF7D0]'
            }`}
          >
            Contact
          </button>
        </nav>

        {/* Zone 3: 1 primary action + mobile menu button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigateTo(user ? 'dashboard' : 'auth')}
            className="hidden md:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#15803D]"
          >
            {user ? 'My Dashboard' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-[#E2E8E2] bg-white text-[#142419] hover:bg-[#F2F7F3] cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E2E8E2] bg-[#FCFCFA] px-4 py-3 space-y-1">
          {[
            { page: 'home' as PageRoute, label: 'Home' },
            { page: 'about' as PageRoute, label: 'About Nutrition' },
            { page: 'nutrients' as PageRoute, label: 'Core Nutrients' },
            { page: 'vitamins' as PageRoute, label: 'Vitamins A–K' },
            { page: 'deficiencies' as PageRoute, label: 'Deficiency Diseases' },
            { page: 'foods' as PageRoute, label: 'Healthy Foods' },
            { page: 'meal3d' as PageRoute, label: '3D Meal Lab' },
            { page: 'quiz' as PageRoute, label: 'Nutrition Quiz' },
            { page: 'contact' as PageRoute, label: 'Contact Us' },
          ].map((item) => (
            <button
              key={item.page}
              type="button"
              onClick={() => navigateTo(item.page)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                currentPage === item.page
                  ? 'bg-[#DCFCE7] text-[#14532D]'
                  : 'text-[#142419] hover:bg-[#F2F7F3]'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-[#E2E8E2]">
            <button
              type="button"
              onClick={() => navigateTo(user ? 'dashboard' : 'auth')}
              className="w-full py-2.5 px-4 text-sm font-medium text-white bg-[#15803D] hover:bg-[#166534] rounded-lg cursor-pointer"
            >
              {user ? 'My Dashboard' : 'Sign In with Google'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
