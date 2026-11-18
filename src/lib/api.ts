import type {
  ContactMessageInput,
  DeficiencyDiseaseItem,
  HealthyFoodItem,
  NutrientItem,
  QuizAttemptResult,
  QuizQuestionPublic,
  SearchResults,
  UserPublic,
  VitaminItem,
} from '../types/nutrition.ts';

type TokenProvider = () => Promise<string | null>;

let tokenProvider: TokenProvider | null = null;

export function setIdTokenProvider(provider: TokenProvider | null): void {
  tokenProvider = provider;
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = tokenProvider ? await tokenProvider().catch(() => null) : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof data?.error === 'string' ? data.error : 'Request failed. Please try again.';
    throw new Error(message);
  }
  return data as T;
}

export async function fetchNutrients(q?: string): Promise<NutrientItem[]> {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  const qs = params.toString();
  const data = await apiFetch<{ nutrients: NutrientItem[] }>(`/api/nutrients${qs ? `?${qs}` : ''}`);
  return data.nutrients;
}

export async function fetchVitamins(q?: string, solubility?: string): Promise<VitaminItem[]> {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (solubility && solubility !== 'All') params.set('soluble', solubility);
  const qs = params.toString();
  const data = await apiFetch<{ vitamins: VitaminItem[] }>(`/api/vitamins${qs ? `?${qs}` : ''}`);
  return data.vitamins;
}

export async function fetchDeficiencies(q?: string): Promise<DeficiencyDiseaseItem[]> {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  const qs = params.toString();
  const data = await apiFetch<{ deficiencies: DeficiencyDiseaseItem[] }>(
    `/api/deficiencies${qs ? `?${qs}` : ''}`
  );
  return data.deficiencies;
}

export async function fetchHealthyFoods(
  category?: string,
  q?: string,
  origin?: string
): Promise<HealthyFoodItem[]> {
  const params = new URLSearchParams();
  if (category && category !== 'All') params.set('category', category);
  if (q) params.set('q', q);
  if (origin && origin !== 'All') params.set('origin', origin);
  const qs = params.toString();
  const data = await apiFetch<{ foods: HealthyFoodItem[] }>(`/api/foods${qs ? `?${qs}` : ''}`);
  return data.foods;
}

export async function searchNutrition(q: string): Promise<SearchResults> {
  const params = new URLSearchParams({ q });
  const data = await apiFetch<{ results: SearchResults }>(`/api/search?${params.toString()}`);
  return data.results;
}

export async function submitContact(input: ContactMessageInput): Promise<{
  message: string;
  record: { message_id: number; created_at: string };
}> {
  return apiFetch('/api/contact', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function fetchQuizQuestions(): Promise<QuizQuestionPublic[]> {
  const data = await apiFetch<{ questions: QuizQuestionPublic[] }>('/api/quiz');
  return data.questions;
}

export async function submitQuiz(answers: Record<number, number>): Promise<QuizAttemptResult> {
  const data = await apiFetch<{ result: QuizAttemptResult }>('/api/quiz/submit', {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
  return data.result;
}

export async function fetchCurrentUser(): Promise<UserPublic | null> {
  try {
    const data = await apiFetch<{ user: UserPublic }>('/api/me');
    return data.user;
  } catch {
    return null;
  }
}

export async function toggleUserBookmark(itemKey: string): Promise<string[]> {
  const data = await apiFetch<{ bookmarks: string[] }>('/api/user/bookmark', {
    method: 'POST',
    body: JSON.stringify({ itemKey }),
  });
  return data.bookmarks;
}
