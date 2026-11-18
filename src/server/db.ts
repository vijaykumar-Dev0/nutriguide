import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type {
  ContactMessageInput,
  DeficiencyDiseaseItem,
  HealthyFoodItem,
  NutrientItem,
  QuizAttemptResult,
  QuizQuestionPublic,
  QuizQuestionRecord,
  SearchResults,
  UserPublic,
  VitaminItem,
} from '../types/nutrition.ts';
import {
  SEED_DEFICIENCIES,
  SEED_FOODS,
  SEED_NUTRIENTS,
  SEED_QUIZ,
  SEED_VITAMINS,
} from './seedData.ts';

interface StoredUser {
  user_id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
  bookmarks: string[];
  quiz_history: Array<{
    attempt_id: string;
    score: number;
    total: number;
    percentage: number;
    created_at: string;
  }>;
}

interface StoredContactMessage {
  message_id: number;
  user_name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

interface StoredSession {
  token: string;
  user_id: number;
  expires_at: number;
}

interface NutritionDatabase {
  users: StoredUser[];
  nutrients: NutrientItem[];
  vitamins: VitaminItem[];
  deficiency_diseases: DeficiencyDiseaseItem[];
  healthy_foods: HealthyFoodItem[];
  contact_messages: StoredContactMessage[];
  quiz_questions: QuizQuestionRecord[];
  sessions: StoredSession[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'nutrition_db.json');

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, keyHex] = parts;
  const keyBuf = Buffer.from(keyHex, 'hex');
  const derivedBuf = crypto.scryptSync(password, salt, 64);
  if (keyBuf.length !== derivedBuf.length) return false;
  return crypto.timingSafeEqual(keyBuf, derivedBuf);
}

function createInitialDb(): NutritionDatabase {
  return {
    users: [
      {
        user_id: 1,
        name: 'Aarav Patel',
        email: 'learner@nutriguide.org',
        password_hash: hashPassword('Healthy2026!'),
        created_at: '2026-11-01T08:00:00.000Z',
        bookmarks: ['nutrient:1', 'vitamin:3', 'deficiency:1', 'food:11'],
        quiz_history: [
          {
            attempt_id: 'seed-attempt-1',
            score: 8,
            total: 10,
            percentage: 80,
            created_at: '2026-11-10T10:15:00.000Z',
          },
        ],
      },
    ],
    nutrients: SEED_NUTRIENTS,
    vitamins: SEED_VITAMINS,
    deficiency_diseases: SEED_DEFICIENCIES,
    healthy_foods: SEED_FOODS,
    contact_messages: [],
    quiz_questions: SEED_QUIZ,
    sessions: [],
  };
}

function loadDb(): NutritionDatabase {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const initial = createInitialDb();
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<NutritionDatabase>;
    const initial = createInitialDb();
    const merged: NutritionDatabase = {
      users: Array.isArray(parsed.users) ? parsed.users : initial.users,
      nutrients: SEED_NUTRIENTS,
      vitamins: SEED_VITAMINS,
      deficiency_diseases: SEED_DEFICIENCIES,
      healthy_foods: SEED_FOODS,
      contact_messages: Array.isArray(parsed.contact_messages) ? parsed.contact_messages : [],
      quiz_questions: SEED_QUIZ,
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
    };
    return merged;
  } catch {
    const fallback = createInitialDb();
    fs.writeFileSync(DB_PATH, JSON.stringify(fallback, null, 2), 'utf8');
    return fallback;
  }
}

function saveDb(db: NutritionDatabase): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tmpPath = `${DB_PATH}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmpPath, DB_PATH);
}

function toPublicUser(user: StoredUser): UserPublic {
  return {
    user_id: user.user_id,
    name: user.name,
    email: user.email,
    created_at: user.created_at,
    bookmarks: user.bookmarks,
    quiz_history: user.quiz_history,
  };
}

export function getNutrients(query?: string): NutrientItem[] {
  const db = loadDb();
  const q = (query ?? '').trim().toLowerCase();
  if (!q) return db.nutrients;
  return db.nutrients.filter(
    (item) =>
      item.nutrient_name.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.functions.some((f) => f.toLowerCase().includes(q)) ||
      item.food_sources.some((s) => s.toLowerCase().includes(q))
  );
}

export function getVitamins(query?: string, solubility?: string): VitaminItem[] {
  const db = loadDb();
  const q = (query ?? '').trim().toLowerCase();
  const sol = (solubility ?? '').trim().toLowerCase();
  return db.vitamins.filter((item) => {
    const matchesSol = !sol || sol === 'all' || item.solubility.toLowerCase() === sol;
    if (!matchesSol) return false;
    if (!q) return true;
    return (
      item.vitamin_name.toLowerCase().includes(q) ||
      item.chemical_name.toLowerCase().includes(q) ||
      item.deficiency_information.toLowerCase().includes(q) ||
      item.functions.some((f) => f.toLowerCase().includes(q)) ||
      item.food_sources.some((s) => s.toLowerCase().includes(q))
    );
  });
}

export function getDeficiencies(query?: string): DeficiencyDiseaseItem[] {
  const db = loadDb();
  const q = (query ?? '').trim().toLowerCase();
  if (!q) return db.deficiency_diseases;
  return db.deficiency_diseases.filter(
    (item) =>
      item.disease_name.toLowerCase().includes(q) ||
      item.nutrient_deficiency.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.symptoms.some((s) => s.toLowerCase().includes(q)) ||
      item.prevention.some((p) => p.toLowerCase().includes(q))
  );
}

export function getHealthyFoods(category?: string, query?: string, origin?: string): HealthyFoodItem[] {
  const db = loadDb();
  const cat = (category ?? '').trim().toLowerCase();
  const q = (query ?? '').trim().toLowerCase();
  const orig = (origin ?? '').trim().toLowerCase();
  return db.healthy_foods.filter((item) => {
    const matchesCat = !cat || cat === 'all' || item.food_category.toLowerCase() === cat;
    if (!matchesCat) return false;
    const matchesOrig = !orig || orig === 'all' || item.origin.toLowerCase() === orig;
    if (!matchesOrig) return false;
    if (!q) return true;
    return (
      item.food_name.toLowerCase().includes(q) ||
      item.food_category.toLowerCase().includes(q) ||
      item.origin.toLowerCase().includes(q) ||
      item.benefits.toLowerCase().includes(q) ||
      item.key_nutrients.some((n) => n.toLowerCase().includes(q))
    );
  });
}

export function searchAll(query: string): SearchResults {
  const q = query.trim();
  if (!q) {
    return { nutrients: [], vitamins: [], deficiencies: [], foods: [] };
  }
  return {
    nutrients: getNutrients(q),
    vitamins: getVitamins(q),
    deficiencies: getDeficiencies(q),
    foods: getHealthyFoods('All', q),
  };
}

export function registerUser(name: string, email: string, password: string): { user: UserPublic; token: string } {
  const db = loadDb();
  const normalizedEmail = email.trim().toLowerCase();
  const existing = db.users.find((u) => u.email === normalizedEmail);
  if (existing) {
    throw new Error('EMAIL_EXISTS');
  }
  const nextId = db.users.reduce((max, u) => Math.max(max, u.user_id), 0) + 1;
  const newUser: StoredUser = {
    user_id: nextId,
    name: name.trim(),
    email: normalizedEmail,
    password_hash: hashPassword(password),
    created_at: new Date().toISOString(),
    bookmarks: [],
    quiz_history: [],
  };
  db.users.push(newUser);
  const token = crypto.randomBytes(32).toString('hex');
  db.sessions = db.sessions.filter((s) => s.expires_at > Date.now());
  db.sessions.push({
    token,
    user_id: newUser.user_id,
    expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });
  saveDb(db);
  return { user: toPublicUser(newUser), token };
}

export function loginUser(email: string, password: string): { user: UserPublic; token: string } {
  const db = loadDb();
  const normalizedEmail = email.trim().toLowerCase();
  const user = db.users.find((u) => u.email === normalizedEmail);
  if (!user || !verifyPassword(password, user.password_hash)) {
    throw new Error('INVALID_CREDENTIALS');
  }
  const token = crypto.randomBytes(32).toString('hex');
  db.sessions = db.sessions.filter((s) => s.expires_at > Date.now());
  db.sessions.push({
    token,
    user_id: user.user_id,
    expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });
  saveDb(db);
  return { user: toPublicUser(user), token };
}

export function getUserByToken(token: string | undefined): UserPublic | null {
  if (!token) return null;
  const db = loadDb();
  const session = db.sessions.find((s) => s.token === token && s.expires_at > Date.now());
  if (!session) return null;
  const user = db.users.find((u) => u.user_id === session.user_id);
  return user ? toPublicUser(user) : null;
}

export function logoutSession(token: string | undefined): void {
  if (!token) return;
  const db = loadDb();
  db.sessions = db.sessions.filter((s) => s.token !== token);
  saveDb(db);
}

export function toggleBookmark(userId: number, itemKey: string): string[] {
  const db = loadDb();
  const user = db.users.find((u) => u.user_id === userId);
  if (!user) throw new Error('USER_NOT_FOUND');
  const idx = user.bookmarks.indexOf(itemKey);
  if (idx >= 0) {
    user.bookmarks.splice(idx, 1);
  } else {
    user.bookmarks.push(itemKey);
  }
  saveDb(db);
  return [...user.bookmarks];
}

export function saveContactMessage(input: ContactMessageInput): StoredContactMessage {
  const db = loadDb();
  const nextId = db.contact_messages.reduce((max, m) => Math.max(max, m.message_id), 0) + 1;
  const record: StoredContactMessage = {
    message_id: nextId,
    user_name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    subject: input.subject.trim(),
    message: input.message.trim(),
    created_at: new Date().toISOString(),
  };
  db.contact_messages.push(record);
  saveDb(db);
  return record;
}

export function getQuizQuestions(): QuizQuestionPublic[] {
  const db = loadDb();
  return db.quiz_questions.map(({ question_id, topic, question, options }) => ({
    question_id,
    topic,
    question,
    options,
  }));
}

export function submitQuizAnswers(
  answers: Record<number, number>,
  userId?: number
): QuizAttemptResult {
  const db = loadDb();
  let score = 0;
  const breakdown = db.quiz_questions.map((q) => {
    const selected = typeof answers[q.question_id] === 'number' ? answers[q.question_id] : -1;
    const isCorrect = selected === q.correct_index;
    if (isCorrect) score += 1;
    return {
      question_id: q.question_id,
      question: q.question,
      selected_index: selected,
      correct_index: q.correct_index,
      is_correct: isCorrect,
      explanation: q.explanation,
    };
  });
  const total = db.quiz_questions.length;
  const percentage = Math.round((score / total) * 100);
  const attempt_id = `quiz-${Date.now()}`;
  const created_at = new Date().toISOString();

  if (typeof userId === 'number') {
    const user = db.users.find((u) => u.user_id === userId);
    if (user) {
      user.quiz_history.unshift({
        attempt_id,
        score,
        total,
        percentage,
        created_at,
      });
      user.quiz_history = user.quiz_history.slice(0, 15);
      saveDb(db);
    }
  }

  return {
    attempt_id,
    score,
    total,
    percentage,
    created_at,
    breakdown,
  };
}
