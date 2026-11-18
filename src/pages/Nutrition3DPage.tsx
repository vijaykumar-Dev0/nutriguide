import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, ChevronUp, Layers, Pause, Play, RotateCcw } from 'lucide-react';
import type { PageRoute } from '../components/Navbar.tsx';
import {
  FOOD_GROUP_METADATA,
  MealSceneManager,
  type CameraPresetId,
  type FoodGroupId,
} from '../three/MealSceneManager.ts';

interface Nutrition3DPageProps {
  onNavigate: (page: PageRoute) => void;
}

const PRESETS: Array<{ id: CameraPresetId; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'topDown', label: 'Plate Ratio' },
  { id: 'produce', label: 'Greens' },
  { id: 'proteins', label: 'Dal & Paneer' },
  { id: 'hydration', label: 'Water' },
];

const SELECTABLE_GROUPS: Array<{ id: FoodGroupId; label: string }> = [
  { id: 'thaliBase', label: 'Balanced Thali' },
  { id: 'vegetables', label: 'Greens & Broccoli' },
  { id: 'grains', label: 'Whole Grains & Millets' },
  { id: 'proteins', label: 'Dal, Paneer & Lemon' },
  { id: 'fruitsNuts', label: 'Fruits & Nuts' },
  { id: 'hydration', label: 'Water & Mint' },
];

export function Nutrition3DPage({ onNavigate }: Nutrition3DPageProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<MealSceneManager | null>(null);

  const [selectedGroup, setSelectedGroup] = useState<FoodGroupId>('thaliBase');
  const [activePreset, setActivePreset] = useState<CameraPresetId>('overview');
  const [explodePercent, setExplodePercent] = useState(0);
  const [autoOrbit, setAutoOrbit] = useState(true);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const [webGlError, setWebGlError] = useState('');

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let manager: MealSceneManager | null = null;
    try {
      manager = new MealSceneManager(container, {
        onSelectGroup: (groupId) => setSelectedGroup(groupId),
        onContextStatusChange: (lost) => setContextLost(lost),
      });
      managerRef.current = manager;
    } catch (err) {
      setWebGlError(
        err instanceof Error
          ? err.message
          : 'Unable to initialize 3D WebGL view on this browser.'
      );
    }

    return () => {
      manager?.dispose();
      managerRef.current = null;
    };
  }, []);

  function handlePresetClick(preset: CameraPresetId) {
    setActivePreset(preset);
    managerRef.current?.setCameraPreset(preset);
  }

  function handleGroupSelect(groupId: FoodGroupId) {
    setSelectedGroup(groupId);
    managerRef.current?.selectFoodGroup(groupId);
  }

  function handleExplodeChange(value: number) {
    setExplodePercent(value);
    managerRef.current?.setExplodeFactor(value / 100);
  }

  function handleToggleOrbit() {
    const next = !autoOrbit;
    setAutoOrbit(next);
    managerRef.current?.setAutoOrbit(next);
  }

  function handleResetView() {
    setActivePreset('overview');
    setExplodePercent(0);
    setSelectedGroup('thaliBase');
    managerRef.current?.setExplodeFactor(0);
    managerRef.current?.selectFoodGroup('thaliBase');
    managerRef.current?.setCameraPreset('overview');
  }

  const info = FOOD_GROUP_METADATA[selectedGroup];

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden bg-[#F6F8F3] select-none">
      {/* Stable Dedicated WebGL Canvas Container */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        aria-label="Interactive 3D Balanced Indian Thali and Nutrient Explorer"
      />

      {/* WebGL Error or Context-Lost Recovery Banner */}
      {(webGlError || contextLost) && (
        <div className="absolute inset-0 flex items-center justify-center p-6 bg-[#F6F8F3]">
          <div className="max-w-md bg-white border border-[#E2E8E2] rounded-2xl p-6 text-center space-y-3">
            <h2 className="font-display text-lg font-bold text-[#142419]">
              {contextLost ? '3D Display Paused' : '3D Canvas Unavailable'}
            </h2>
            <p className="text-sm text-[#475B4B]">
              {contextLost
                ? 'Your graphics context was temporarily suspended. It will resume automatically.'
                : webGlError}
            </p>
            <button
              type="button"
              onClick={() => onNavigate('foods')}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#15803D] rounded-xl cursor-pointer"
            >
              Browse Healthy Foods Catalog
            </button>
          </div>
        </div>
      )}

      {/* Compact Top-Left Orientation Caption (No backdrop-filter) */}
      <div className="pointer-events-none absolute top-4 left-4 sm:left-6 max-w-xs sm:max-w-sm bg-[#FCFCFA]/95 border border-[#E2E8E2] rounded-xl px-4 py-3 shadow-sm">
        <div className="text-xs font-semibold text-[#15803D]">3D Balanced Meal Lab</div>
        <h1 className="font-display text-base sm:text-lg font-bold text-[#142419] leading-snug">
          Interactive Nutrient Thali
        </h1>
        <p className="text-xs text-[#475B4B] mt-0.5">
          Drag to orbit, scroll to zoom, or click any food bowl to inspect its vitamins &amp; pairing science.
        </p>
      </div>

      {/* Collapsible Bottom Control & Nutrient Inspector Dock (Solid/translucent, no backdrop-filter) */}
      <div className="absolute bottom-3 inset-x-3 sm:inset-x-6 flex justify-center pointer-events-none">
        <div className="pointer-events-auto w-full max-w-5xl bg-[#FCFCFA]/97 border border-[#E2E8E2] rounded-2xl shadow-lg overflow-hidden">
          {/* Dock Header Bar */}
          <div className="px-4 py-2.5 border-b border-[#E2E8E2] bg-[#F4F7F4] flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-semibold text-[#15803D] whitespace-nowrap">
                {info.portionShare}
              </span>
              <span className="text-[#CBD5CE]" aria-hidden="true">
                ·
              </span>
              <span className="font-display text-sm font-bold text-[#142419] truncate">
                {info.title}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleOrbit}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-[#142419] bg-white border border-[#E2E8E2] hover:border-[#15803D] rounded-lg cursor-pointer"
              >
                {autoOrbit ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-[#15803D]" aria-hidden="true" />
                    <span>Pause Orbit</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-[#15803D]" aria-hidden="true" />
                    <span>Auto-Orbit</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleResetView}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#142419] bg-white border border-[#E2E8E2] hover:border-[#15803D] rounded-lg cursor-pointer"
                title="Reset 3D camera and layers"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Reset</span>
              </button>

              <button
                type="button"
                onClick={() => setDockCollapsed((prev) => !prev)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#14532D] bg-[#DCFCE7] hover:bg-[#BBF7D0] rounded-lg cursor-pointer"
              >
                <span>{dockCollapsed ? 'Show Controls' : 'Hide Controls'}</span>
                {dockCollapsed ? (
                  <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {!dockCollapsed && (
            <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              {/* Left: Inspector Details */}
              <div className="lg:col-span-6 space-y-2">
                <p className="text-xs text-[#475B4B] leading-relaxed">
                  <span className="font-semibold text-[#142419]">{info.subtitle}:</span>{' '}
                  {info.absorptionTip}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                  <span className="font-semibold text-[#15803D]">
                    Key Nutrients: {info.keyNutrients.join(', ')}
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate(info.targetRoute)}
                    className="inline-flex items-center gap-1 font-semibold text-[#142419] hover:text-[#15803D] underline cursor-pointer"
                  >
                    <span>Study Guide</span>
                    <ArrowRight className="w-3 h-3" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Right: Camera Presets, Group Selector & Explode Layer Slider */}
              <div className="lg:col-span-6 space-y-2.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlePresetClick(preset.id)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                        activePreset === preset.id
                          ? 'bg-[#15803D] text-white border-[#15803D]'
                          : 'bg-white text-[#475B4B] border-[#E2E8E2] hover:border-[#15803D]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <label
                      htmlFor="explode-slider"
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#142419] whitespace-nowrap"
                    >
                      <Layers className="w-3.5 h-3.5 text-[#15803D]" aria-hidden="true" />
                      <span>Explode Layers</span>
                    </label>
                    <input
                      id="explode-slider"
                      type="range"
                      min={0}
                      max={100}
                      value={explodePercent}
                      onChange={(e) => handleExplodeChange(Number(e.target.value))}
                      className="flex-1 accent-[#15803D] cursor-pointer"
                    />
                    <span className="font-mono-nums text-xs text-[#475B4B] w-9 text-right">
                      {explodePercent}%
                    </span>
                  </div>

                  <select
                    aria-label="Inspect food group"
                    value={selectedGroup}
                    onChange={(e) => handleGroupSelect(e.target.value as FoodGroupId)}
                    className="px-2.5 py-1.5 text-xs font-medium bg-white border border-[#E2E8E2] rounded-lg text-[#142419] focus:outline-none focus:ring-2 focus:ring-[#15803D] cursor-pointer"
                  >
                    {SELECTABLE_GROUPS.map((g) => (
                      <option key={g.id} value={g.id}>
                        Inspect: {g.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
