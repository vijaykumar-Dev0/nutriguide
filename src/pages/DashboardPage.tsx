import { useEffect, useState, type FormEvent } from 'react';
import type { User } from 'firebase/auth';
import { ArrowRight, Bookmark, LogOut, Plus, Trash2, Utensils } from 'lucide-react';
import {
  fetchDeficiencies,
  fetchHealthyFoods,
  fetchNutrients,
  fetchVitamins,
} from '../lib/api.ts';
import {
  addMealLogToFirestore,
  deleteMealLogFromFirestore,
  subscribeUserMealLogs,
  type MealLogEntry,
} from '../lib/firebase.ts';
import type {
  DeficiencyDiseaseItem,
  HealthyFoodItem,
  NutrientItem,
  UserPublic,
  VitaminItem,
} from '../types/nutrition.ts';
import type { PageRoute } from '../components/Navbar.tsx';

interface DashboardPageProps {
  user: UserPublic;
  firebaseUser: User | null;
  onNavigate: (page: PageRoute) => void;
  onToggleBookmark: (itemKey: string) => void;
  onLogout: () => void;
}

interface ResolvedBookmark {
  key: string;
  typeLabel: string;
  title: string;
  detail: string;
  targetPage: PageRoute;
}

const MEAL_SLOTS: MealLogEntry['mealSlot'][] = ['Breakfast', 'Lunch', 'Snack', 'Dinner'];
const FOOD_CATEGORIES = [
  'Fruits',
  'Vegetables',
  'Milk Products',
  'Nuts',
  'Whole Grains',
  'Protein-Rich Foods',
  'Balanced Meal',
];

export function DashboardPage({
  user,
  firebaseUser,
  onNavigate,
  onToggleBookmark,
  onLogout,
}: DashboardPageProps) {
  const [nutrients, setNutrients] = useState<NutrientItem[]>([]);
  const [vitamins, setVitamins] = useState<VitaminItem[]>([]);
  const [deficiencies, setDeficiencies] = useState<DeficiencyDiseaseItem[]>([]);
  const [foods, setFoods] = useState<HealthyFoodItem[]>([]);

  // Firestore Daily Meal Logs
  const [mealLogs, setMealLogs] = useState<MealLogEntry[]>([]);
  const [mealError, setMealError] = useState('');
  const [selectedFoodId, setSelectedFoodId] = useState<string>('');
  const [foodName, setFoodName] = useState('');
  const [foodCategory, setFoodCategory] = useState('Whole Grains');
  const [calories, setCalories] = useState('180');
  const [mealSlot, setMealSlot] = useState<MealLogEntry['mealSlot']>('Lunch');
  const [loggedDate, setLoggedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [savingMeal, setSavingMeal] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchNutrients(),
      fetchVitamins(),
      fetchDeficiencies(),
      fetchHealthyFoods(),
    ])
      .then(([n, v, d, f]) => {
        setNutrients(n);
        setVitamins(v);
        setDeficiencies(d);
        setFoods(f);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!firebaseUser) {
      setMealLogs([]);
      return;
    }
    const unsubscribe = subscribeUserMealLogs(
      firebaseUser.uid,
      (logs) => {
        setMealLogs(logs);
        setMealError('');
      },
      (err) => {
        setMealError(err.message);
      }
    );
    return () => unsubscribe();
  }, [firebaseUser]);

  function handleQuickFoodPick(foodIdStr: string) {
    setSelectedFoodId(foodIdStr);
    const chosen = foods.find((f) => String(f.food_id) === foodIdStr);
    if (chosen) {
      setFoodName(chosen.food_name);
      setFoodCategory(chosen.food_category);
      setCalories(String(chosen.calories));
    }
  }

  async function handleAddMealLog(e: FormEvent) {
    e.preventDefault();
    if (!firebaseUser) return;
    const trimmedName = foodName.trim();
    if (trimmedName.length < 2) {
      setMealError('Please enter a food or meal name (at least 2 characters).');
      return;
    }
    const kcal = Number(calories);
    if (!Number.isFinite(kcal) || kcal < 0 || kcal > 5000) {
      setMealError('Calories must be between 0 and 5000 kcal.');
      return;
    }

    setSavingMeal(true);
    setMealError('');
    try {
      await addMealLogToFirestore(firebaseUser.uid, {
        foodName: trimmedName,
        foodCategory,
        calories: Math.round(kcal),
        mealSlot,
        loggedDate,
      });
      setFoodName('');
      setSelectedFoodId('');
    } catch (err) {
      setMealError(err instanceof Error ? err.message : 'Could not save meal entry.');
    } finally {
      setSavingMeal(false);
    }
  }

  async function handleDeleteMealLog(logId: string) {
    if (!firebaseUser) return;
    try {
      await deleteMealLogFromFirestore(firebaseUser.uid, logId);
    } catch (err) {
      setMealError(err instanceof Error ? err.message : 'Could not remove meal entry.');
    }
  }

  const resolvedBookmarks: ResolvedBookmark[] = user.bookmarks
    .map((key): ResolvedBookmark | null => {
      const [kind, idStr] = key.split(':');
      const id = Number(idStr);
      if (kind === 'nutrient') {
        const item = nutrients.find((n) => n.nutrient_id === id);
        if (!item) return null;
        return {
          key,
          typeLabel: 'Core Nutrient',
          title: item.nutrient_name,
          detail: `${item.category} · ${item.daily_target}`,
          targetPage: 'nutrients',
        };
      }
      if (kind === 'vitamin') {
        const item = vitamins.find((v) => v.vitamin_id === id);
        if (!item) return null;
        return {
          key,
          typeLabel: 'Vitamin',
          title: item.vitamin_name,
          detail: `${item.solubility} · RDA ${item.daily_rda}`,
          targetPage: 'vitamins',
        };
      }
      if (kind === 'deficiency') {
        const item = deficiencies.find((d) => d.disease_id === id);
        if (!item) return null;
        return {
          key,
          typeLabel: 'Deficiency Guide',
          title: item.disease_name,
          detail: `Nutrient: ${item.nutrient_deficiency}`,
          targetPage: 'deficiencies',
        };
      }
      if (kind === 'food') {
        const item = foods.find((f) => f.food_id === id);
        if (!item) return null;
        return {
          key,
          typeLabel: item.food_category,
          title: item.food_name,
          detail: `${item.serving_size} · ${item.calories} kcal`,
          targetPage: 'foods',
        };
      }
      return null;
    })
    .filter((item): item is ResolvedBookmark => item !== null);

  const bestScore =
    user.quiz_history.length > 0
      ? Math.max(...user.quiz_history.map((a) => a.percentage))
      : null;

  const todayIso = new Date().toISOString().slice(0, 10);
  const todayCalories = mealLogs
    .filter((m) => m.loggedDate === todayIso)
    .reduce((sum, m) => sum + m.calories, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8E2] pb-6">
        <div className="flex items-center gap-4">
          {firebaseUser?.photoURL ? (
            <img
              src={firebaseUser.photoURL}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full border border-[#E2E8E2] object-cover shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#DCFCE7] border border-[#BBF7D0] flex items-center justify-center font-display font-bold text-lg text-[#15803D] shrink-0">
              {user.name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-[#15803D]">Learner Dashboard</p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#142419]">
              Welcome back, {user.name}
            </h1>
            <p className="text-sm text-[#475B4B]">{user.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#142419] bg-white border border-[#E2E8E2] hover:border-[#B91C1C] hover:text-[#B91C1C] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-[#E2E8E2] rounded-2xl p-5 space-y-1">
          <div className="text-xs text-[#475B4B]">Saved Study Bookmarks</div>
          <div className="font-mono-nums text-3xl font-bold text-[#15803D]">
            {user.bookmarks.length}
          </div>
          <div className="text-xs text-[#475B4B]">Nutrients, vitamins &amp; foods</div>
        </div>
        <div className="bg-white border border-[#E2E8E2] rounded-2xl p-5 space-y-1">
          <div className="text-xs text-[#475B4B]">Today&apos;s Logged Intake</div>
          <div className="font-mono-nums text-3xl font-bold text-[#142419]">
            {todayCalories} <span className="text-base font-normal text-[#475B4B]">kcal</span>
          </div>
          <div className="text-xs text-[#475B4B]">
            {mealLogs.filter((m) => m.loggedDate === todayIso).length} entries logged today
          </div>
        </div>
        <div className="bg-[#FEFCE8] border border-[#EDE9C6] rounded-2xl p-5 space-y-1">
          <div className="text-xs text-[#854D0E]">Best Quiz Score</div>
          <div className="font-mono-nums text-3xl font-bold text-[#142419]">
            {bestScore !== null ? `${bestScore}%` : '—'}
          </div>
          <div className="text-xs text-[#713F12]">
            {bestScore !== null
              ? `${user.quiz_history.length} assessment${user.quiz_history.length === 1 ? '' : 's'} completed`
              : 'Take a quiz to record your score'}
          </div>
        </div>
      </div>

      {/* Daily Healthy Meal Log Section */}
      <section className="bg-white border border-[#E2E8E2] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8E2] bg-[#F4F7F4] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="font-display text-lg font-semibold text-[#142419] flex items-center gap-2">
            <Utensils className="w-5 h-5 text-[#15803D]" aria-hidden="true" />
            <span>Daily Healthy Meal Log</span>
          </h2>
          <span className="text-xs text-[#475B4B]">
            Track whole foods and daily energy intake across meals
          </span>
        </div>

        <div className="p-6 space-y-6">
          <form onSubmit={handleAddMealLog} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
            <div className="lg:col-span-2">
              <label htmlFor="quick-food-pick" className="block text-xs font-medium text-[#475B4B] mb-1">
                Quick-Fill from Food Catalog
              </label>
              <select
                id="quick-food-pick"
                value={selectedFoodId}
                onChange={(e) => handleQuickFoodPick(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#FCFCFA] border border-[#E2E8E2] rounded-xl text-[#142419] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
              >
                <option value="">Choose a food item (optional)...</option>
                {foods.map((f) => (
                  <option key={f.food_id} value={String(f.food_id)}>
                    {f.food_name} ({f.calories} kcal)
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="meal-food-name" className="block text-xs font-medium text-[#475B4B] mb-1">
                Food / Meal Name
              </label>
              <input
                id="meal-food-name"
                type="text"
                required
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="e.g., Yellow Moong Dal & Chapati"
                className="w-full px-3 py-2 text-sm bg-[#FCFCFA] border border-[#E2E8E2] rounded-xl text-[#142419] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
              />
            </div>

            <div>
              <label htmlFor="meal-slot" className="block text-xs font-medium text-[#475B4B] mb-1">
                Meal Slot
              </label>
              <select
                id="meal-slot"
                value={mealSlot}
                onChange={(e) => setMealSlot(e.target.value as MealLogEntry['mealSlot'])}
                className="w-full px-3 py-2 text-sm bg-[#FCFCFA] border border-[#E2E8E2] rounded-xl text-[#142419] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
              >
                {MEAL_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="meal-calories" className="block text-xs font-medium text-[#475B4B] mb-1">
                Calories (kcal)
              </label>
              <input
                id="meal-calories"
                type="number"
                min={0}
                max={5000}
                required
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono-nums bg-[#FCFCFA] border border-[#E2E8E2] rounded-xl text-[#142419] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
              />
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="meal-category" className="block text-xs font-medium text-[#475B4B] mb-1">
                Food Group
              </label>
              <select
                id="meal-category"
                value={foodCategory}
                onChange={(e) => setFoodCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-[#FCFCFA] border border-[#E2E8E2] rounded-xl text-[#142419] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
              >
                {FOOD_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <label htmlFor="meal-date" className="block text-xs font-medium text-[#475B4B] mb-1">
                Date
              </label>
              <input
                id="meal-date"
                type="date"
                value={loggedDate}
                onChange={(e) => setLoggedDate(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono-nums bg-[#FCFCFA] border border-[#E2E8E2] rounded-xl text-[#142419] focus:outline-none focus:ring-2 focus:ring-[#15803D]"
              />
            </div>

            <div className="lg:col-span-2">
              <button
                type="submit"
                disabled={savingMeal}
                className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#15803D] hover:bg-[#166534] disabled:opacity-60 rounded-xl transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span>{savingMeal ? 'Logging Meal...' : 'Log Meal Entry'}</span>
              </button>
            </div>
          </form>

          {mealError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
              {mealError}
            </div>
          )}

          {mealLogs.length === 0 ? (
            <p className="text-sm text-[#475B4B]">
              No meals logged yet. Pick an Indian or global staple above to record your daily nutrition intake.
            </p>
          ) : (
            <div className="overflow-x-auto border border-[#E2E8E2] rounded-xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FCFCFA] border-b border-[#E2E8E2] text-xs text-[#475B4B]">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Date</th>
                    <th className="py-2.5 px-4 font-semibold">Slot</th>
                    <th className="py-2.5 px-4 font-semibold">Food Item</th>
                    <th className="py-2.5 px-4 font-semibold">Category</th>
                    <th className="py-2.5 px-4 font-semibold">Calories</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8E2]">
                  {mealLogs.map((entry) => (
                    <tr key={entry.id}>
                      <td className="py-2.5 px-4 font-mono-nums text-xs text-[#475B4B]">
                        {entry.loggedDate}
                      </td>
                      <td className="py-2.5 px-4 text-xs font-semibold text-[#15803D]">
                        {entry.mealSlot}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-[#142419]">{entry.foodName}</td>
                      <td className="py-2.5 px-4 text-xs text-[#475B4B]">{entry.foodCategory}</td>
                      <td className="py-2.5 px-4 font-mono-nums text-[#142419]">
                        {entry.calories} kcal
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteMealLog(entry.id)}
                          aria-label={`Delete ${entry.foodName}`}
                          className="p-1.5 rounded-lg text-[#475B4B] hover:text-[#B91C1C] hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Saved Bookmarks Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-xl font-bold text-[#142419] flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#CA8A04]" aria-hidden="true" />
            <span>Saved Nutrition Topics</span>
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('foods')}
            className="text-sm font-medium text-[#15803D] hover:underline cursor-pointer"
          >
            Browse more items →
          </button>
        </div>

        {user.bookmarks.length === 0 ? (
          <div className="bg-white border border-[#E2E8E2] rounded-2xl p-8 text-center space-y-3">
            <p className="text-sm text-[#475B4B]">
              You have not bookmarked any nutrients, vitamins, deficiency guides, or foods yet.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('nutrients')}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-xl cursor-pointer"
            >
              Explore Core Nutrients
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resolvedBookmarks.map((item) => (
              <div
                key={item.key}
                className="bg-white border border-[#E2E8E2] rounded-xl p-4 flex items-center justify-between gap-4"
              >
                <button
                  type="button"
                  onClick={() => onNavigate(item.targetPage)}
                  className="text-left flex-1 min-w-0 cursor-pointer group"
                >
                  <div className="text-xs text-[#15803D] font-medium">{item.typeLabel}</div>
                  <div className="text-base font-semibold text-[#142419] group-hover:text-[#15803D] truncate">
                    {item.title}
                  </div>
                  <div className="text-xs text-[#475B4B] truncate">{item.detail}</div>
                </button>
                <button
                  type="button"
                  onClick={() => onToggleBookmark(item.key)}
                  aria-label={`Remove ${item.title} bookmark`}
                  className="p-2 rounded-lg text-[#475B4B] hover:text-[#B91C1C] hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quiz History Table */}
      <section className="bg-white border border-[#E2E8E2] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8E2] bg-[#F4F7F4] flex items-center justify-between gap-4">
          <h2 className="font-display text-lg font-semibold text-[#142419]">Quiz Score History</h2>
          <button
            type="button"
            onClick={() => onNavigate('quiz')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#15803D] hover:underline cursor-pointer"
          >
            <span>Take Quiz</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {user.quiz_history.length === 0 ? (
          <div className="p-6 text-sm text-[#475B4B]">
            No quiz attempts recorded yet. Complete the 10-question nutrition quiz to track your progress.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#E2E8E2] text-xs text-[#475B4B]">
                <tr>
                  <th className="py-3 px-6 font-semibold">Date</th>
                  <th className="py-3 px-6 font-semibold">Correct Answers</th>
                  <th className="py-3 px-6 font-semibold">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E2]">
                {user.quiz_history.map((attempt) => (
                  <tr key={attempt.attempt_id}>
                    <td className="py-3.5 px-6 text-[#475B4B] font-mono-nums">
                      {new Date(attempt.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-6 font-mono-nums text-[#142419] font-medium">
                      {attempt.score} / {attempt.total}
                    </td>
                    <td className="py-3.5 px-6 font-mono-nums font-semibold text-[#15803D]">
                      {attempt.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
