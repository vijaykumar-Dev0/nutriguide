import { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { Footer } from './components/Footer.tsx';
import { Navbar, type PageRoute } from './components/Navbar.tsx';
import {
  fetchCurrentUser,
  setIdTokenProvider,
  toggleUserBookmark,
} from './lib/api.ts';
import {
  auth,
  saveQuizAttemptToFirestore,
  syncBookmarkInFirestore,
  syncUserProfileToFirestore,
} from './lib/firebase.ts';
import { AboutPage } from './pages/AboutPage.tsx';
import { AuthPage } from './pages/AuthPage.tsx';
import { ContactPage } from './pages/ContactPage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { DeficienciesPage } from './pages/DeficienciesPage.tsx';
import { FoodsPage } from './pages/FoodsPage.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { NutrientsPage } from './pages/NutrientsPage.tsx';
import { Nutrition3DPage } from './pages/Nutrition3DPage.tsx';
import { QuizPage } from './pages/QuizPage.tsx';
import { VitaminsPage } from './pages/VitaminsPage.tsx';
import type { QuizAttemptResult, UserPublic } from './types/nutrition.ts';

function inferBookmarkMeta(itemKey: string): { title: string; category: string } {
  const [kind, idStr] = itemKey.split(':');
  switch (kind) {
    case 'nutrient':
      return { title: `Nutrient Guide #${idStr}`, category: 'Core Nutrient' };
    case 'vitamin':
      return { title: `Vitamin Guide #${idStr}`, category: 'Vitamin' };
    case 'deficiency':
      return { title: `Deficiency Guide #${idStr}`, category: 'Deficiency Disease' };
    case 'food':
      return { title: `Healthy Food #${idStr}`, category: 'Healthy Food' };
    default:
      return { title: 'Nutrition Reference', category: 'Nutrition' };
  }
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState<PageRoute>('home');
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<UserPublic | null>(null);
  const [notice, setNotice] = useState<string>('');

  const refreshUser = useCallback(async () => {
    if (!auth.currentUser) {
      setUser(null);
      return;
    }
    const profile = await fetchCurrentUser();
    setUser(profile);
  }, []);

  useEffect(() => {
    setIdTokenProvider(async () => {
      if (!auth.currentUser) return null;
      return auth.currentUser.getIdToken();
    });

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          await syncUserProfileToFirestore(fbUser);
        } catch {
          // Firestore profile sync failure is logged cleanly; continue loading API profile
        }
        const profile = await fetchCurrentUser();
        setUser(profile);
      } else {
        setUser(null);
      }
    });

    return () => {
      unsubscribe();
      setIdTokenProvider(null);
    };
  }, []);

  function navigate(page: PageRoute) {
    setCurrentPage(page);
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleToggleBookmark(itemKey: string) {
    if (!firebaseUser || !user) {
      setNotice('Please sign in with Google to save items to your study dashboard.');
      setCurrentPage('auth');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const isAdding = !user.bookmarks.includes(itemKey);
    try {
      const updated = await toggleUserBookmark(itemKey);
      setUser((prev) => (prev ? { ...prev, bookmarks: updated } : prev));
      const meta = inferBookmarkMeta(itemKey);
      await syncBookmarkInFirestore(
        firebaseUser.uid,
        itemKey,
        meta.title,
        meta.category,
        isAdding
      ).catch(() => undefined);
    } catch {
      setNotice('Could not update bookmark. Please try again.');
    }
  }

  async function handleQuizSubmitted(result: QuizAttemptResult) {
    if (firebaseUser) {
      await saveQuizAttemptToFirestore(
        firebaseUser.uid,
        result.score,
        result.total,
        result.percentage
      ).catch(() => undefined);
    }
    await refreshUser();
  }

  async function handleLogout() {
    await signOut(auth);
    setFirebaseUser(null);
    setUser(null);
    setCurrentPage('home');
    setNotice('You have signed out.');
  }

  const bookmarks = user?.bookmarks ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFCFA] text-[#142419]">
      <Navbar currentPage={currentPage} onNavigate={navigate} user={user} />

      {notice && (
        <div className="bg-[#FEFCE8] border-b border-[#EDE9C6] px-4 py-2.5 text-center text-sm text-[#713F12]">
          <span>{notice}</span>
        </div>
      )}

      <main className="flex-1">
        {currentPage === 'home' && <HomePage onNavigate={navigate} />}
        {currentPage === 'about' && <AboutPage onNavigate={navigate} />}
        {currentPage === 'nutrients' && (
          <NutrientsPage
            onNavigate={navigate}
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
          />
        )}
        {currentPage === 'vitamins' && (
          <VitaminsPage
            onNavigate={navigate}
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
          />
        )}
        {currentPage === 'deficiencies' && (
          <DeficienciesPage
            onNavigate={navigate}
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
          />
        )}
        {currentPage === 'foods' && (
          <FoodsPage bookmarks={bookmarks} onToggleBookmark={handleToggleBookmark} />
        )}
        {currentPage === 'meal3d' && <Nutrition3DPage onNavigate={navigate} />}
        {currentPage === 'quiz' && (
          <QuizPage user={user} onQuizSubmitted={handleQuizSubmitted} onNavigate={navigate} />
        )}
        {currentPage === 'contact' && <ContactPage />}
        {currentPage === 'auth' && (
          <AuthPage
            onSignedIn={() => {
              setNotice('');
              setCurrentPage('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
        {currentPage === 'dashboard' &&
          (user ? (
            <DashboardPage
              user={user}
              firebaseUser={firebaseUser}
              onNavigate={navigate}
              onToggleBookmark={handleToggleBookmark}
              onLogout={handleLogout}
            />
          ) : (
            <AuthPage
              onSignedIn={() => {
                setNotice('');
                setCurrentPage('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ))}
      </main>

      {currentPage !== 'meal3d' && <Footer onNavigate={navigate} />}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}
