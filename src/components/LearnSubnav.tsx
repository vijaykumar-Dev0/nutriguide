import type { PageRoute } from './Navbar.tsx';

interface LearnSubnavProps {
  activePage: PageRoute;
  onNavigate: (page: PageRoute) => void;
}

const TABS: Array<{ page: PageRoute; label: string }> = [
  { page: 'about', label: 'About Nutrition' },
  { page: 'nutrients', label: 'Core Nutrients' },
  { page: 'vitamins', label: 'Vitamins A–K' },
  { page: 'deficiencies', label: 'Deficiency Diseases' },
];

export function LearnSubnav({ activePage, onNavigate }: LearnSubnavProps) {
  return (
    <div className="border-b border-[#E2E8E2] bg-[#F4F7F4]/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-2 overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = activePage === tab.page;
          return (
            <button
              key={tab.page}
              type="button"
              onClick={() => onNavigate(tab.page)}
              className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#15803D] text-white'
                  : 'text-[#475B4B] hover:text-[#142419] hover:bg-white'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
