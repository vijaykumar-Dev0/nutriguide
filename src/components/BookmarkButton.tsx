import { Bookmark } from 'lucide-react';

interface BookmarkButtonProps {
  itemKey: string;
  isSaved: boolean;
  onToggle: (itemKey: string) => void;
}

export function BookmarkButton({ itemKey, isSaved, onToggle }: BookmarkButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(itemKey)}
      aria-label={isSaved ? 'Remove from saved study list' : 'Save to study list'}
      aria-pressed={isSaved}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] ${
        isSaved
          ? 'bg-[#FEF9C3] border-[#EAB308]/50 text-[#713F12]'
          : 'bg-white border-[#E2E8E2] text-[#475B4B] hover:border-[#15803D] hover:text-[#142419]'
      }`}
    >
      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#CA8A04] text-[#CA8A04]' : ''}`} aria-hidden="true" />
      <span>{isSaved ? 'Saved' : 'Save'}</span>
    </button>
  );
}
