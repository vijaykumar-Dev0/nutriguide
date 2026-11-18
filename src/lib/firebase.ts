import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type User } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface MealLogEntry {
  id: string;
  foodName: string;
  foodCategory: string;
  calories: number;
  mealSlot: 'Breakfast' | 'Lunch' | 'Snack' | 'Dinner';
  loggedDate: string;
}

export interface FirestoreBookmarkEntry {
  id: string;
  itemKey: string;
  title: string;
  category: string;
}

function clampString(value: string, maxLen: number, fallback: string): string {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, maxLen);
}

export async function syncUserProfileToFirestore(user: User): Promise<void> {
  const profilePath = `users/${user.uid}`;
  const docRef = doc(db, 'users', user.uid);
  const displayName = clampString(
    user.displayName || user.email?.split('@')[0] || 'Learner',
    120,
    'Learner'
  );
  const photoURL = user.photoURL ? user.photoURL.slice(0, 512) : undefined;

  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      const createPayload: Record<string, unknown> = {
        uid: user.uid,
        displayName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (photoURL) createPayload.photoURL = photoURL;
      await setDoc(docRef, createPayload);
    } else {
      const updatePayload: Record<string, unknown> = {
        displayName,
        updatedAt: serverTimestamp(),
      };
      if (photoURL) updatePayload.photoURL = photoURL;
      await setDoc(docRef, updatePayload, { merge: true });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, profilePath);
  }
}

export async function syncBookmarkInFirestore(
  uid: string,
  itemKey: string,
  title: string,
  category: string,
  isAdding: boolean
): Promise<void> {
  const safeId = itemKey.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 128);
  const docPath = `users/${uid}/bookmarks/${safeId}`;
  const docRef = doc(db, 'users', uid, 'bookmarks', safeId);

  try {
    if (isAdding) {
      await setDoc(docRef, {
        userId: uid,
        itemKey: itemKey.slice(0, 64),
        title: clampString(title, 160, 'Nutrition Item'),
        category: clampString(category, 80, 'Nutrition'),
        createdAt: serverTimestamp(),
      });
    } else {
      await deleteDoc(docRef);
    }
  } catch (error) {
    handleFirestoreError(
      error,
      isAdding ? OperationType.CREATE : OperationType.DELETE,
      docPath
    );
  }
}

export async function saveQuizAttemptToFirestore(
  uid: string,
  score: number,
  total: number,
  percentage: number
): Promise<void> {
  const collectionPath = `users/${uid}/quizAttempts`;
  try {
    await addDoc(collection(db, 'users', uid, 'quizAttempts'), {
      userId: uid,
      score: Math.max(0, Math.min(50, Math.round(score))),
      total: Math.max(1, Math.min(50, Math.round(total))),
      percentage: Math.max(0, Math.min(100, Math.round(percentage))),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionPath);
  }
}

export async function addMealLogToFirestore(
  uid: string,
  entry: Omit<MealLogEntry, 'id'>
): Promise<void> {
  const collectionPath = `users/${uid}/mealLogs`;
  const validDate = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(entry.loggedDate)
    ? entry.loggedDate
    : new Date().toISOString().slice(0, 10);

  try {
    await addDoc(collection(db, 'users', uid, 'mealLogs'), {
      userId: uid,
      foodName: clampString(entry.foodName, 120, 'Healthy Food'),
      foodCategory: clampString(entry.foodCategory, 80, 'Whole Foods'),
      calories: Math.max(0, Math.min(5000, Math.round(entry.calories))),
      mealSlot: entry.mealSlot,
      loggedDate: validDate,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, collectionPath);
  }
}

export async function deleteMealLogFromFirestore(uid: string, logId: string): Promise<void> {
  const docPath = `users/${uid}/mealLogs/${logId}`;
  try {
    await deleteDoc(doc(db, 'users', uid, 'mealLogs', logId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, docPath);
  }
}

export function subscribeUserMealLogs(
  uid: string,
  onLogs: (logs: MealLogEntry[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const collectionPath = `users/${uid}/mealLogs`;
  const q = query(collection(db, 'users', uid, 'mealLogs'), where('userId', '==', uid));

  return onSnapshot(
    q,
    (snapshot) => {
      const itemsWithTime = snapshot.docs.map((d) => {
        const data = d.data();
        const createdAtMs =
          data.createdAt && typeof data.createdAt.toMillis === 'function'
            ? data.createdAt.toMillis()
            : 0;
        return {
          createdAtMs,
          entry: {
            id: d.id,
            foodName: String(data.foodName ?? ''),
            foodCategory: String(data.foodCategory ?? ''),
            calories: Number(data.calories ?? 0),
            mealSlot: (data.mealSlot as MealLogEntry['mealSlot']) ?? 'Lunch',
            loggedDate: String(data.loggedDate ?? ''),
          } satisfies MealLogEntry,
        };
      });
      itemsWithTime.sort((a, b) => {
        if (b.entry.loggedDate !== a.entry.loggedDate) {
          return b.entry.loggedDate.localeCompare(a.entry.loggedDate);
        }
        return b.createdAtMs - a.createdAtMs;
      });
      onLogs(itemsWithTime.map((item) => item.entry));
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, collectionPath);
      } catch (wrapped) {
        onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}
