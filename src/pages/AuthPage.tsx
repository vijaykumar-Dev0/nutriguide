import { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { Bookmark, CheckCircle2, ClipboardCheck, Utensils } from 'lucide-react';
import { auth, googleAuthProvider } from '../lib/firebase.ts';

interface AuthPageProps {
  onSignedIn?: () => void;
}

export function AuthPage({ onSignedIn }: AuthPageProps) {
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleGoogleSignIn() {
    setError('');
    setSubmitting(true);
    try {
      await signInWithPopup(auth, googleAuthProvider);
      onSignedIn?.();
    } catch (err: unknown) {
      const code =
        typeof err === 'object' && err !== null && 'code' in err
          ? String((err as { code?: unknown }).code)
          : '';
      if (code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled before completing. Please try again.');
      } else if (code === 'auth/popup-blocked') {
        setError('Your browser blocked the sign-in window. Please allow popups for this site and retry.');
      } else {
        setError(err instanceof Error ? err.message : 'Unable to sign in right now. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <div className="bg-white border border-[#E2E8E2] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <img
            src="/assets/aistudio/vijay_3ec11b06.jpg"
            alt="Nutrition Knowledge logo"
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-full object-cover border border-[#E2E8E2] bg-white shrink-0"
          />
          <div className="space-y-1">
            <p className="text-sm font-medium text-[#15803D]">Learner Account</p>
            <h1 className="font-display text-2xl font-bold text-[#142419]">
              Sign in to NutriGuide
            </h1>
          </div>
        </div>
        <p className="text-sm text-[#475B4B] leading-relaxed">
          Use your Google account to save study bookmarks, log daily meals and calories, and track
          your nutrition quiz history.
        </p>

        <ul className="space-y-2.5 text-sm text-[#475B4B] bg-[#F4F7F4] border border-[#E2E8E2] rounded-xl p-4">
          <li className="flex items-start gap-2.5">
            <Bookmark className="w-4 h-4 text-[#15803D] mt-0.5 shrink-0" aria-hidden="true" />
            <span>Bookmark nutrients, vitamins A–K, deficiency guides, and whole foods.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <Utensils className="w-4 h-4 text-[#15803D] mt-0.5 shrink-0" aria-hidden="true" />
            <span>Log your daily meals across Breakfast, Lunch, Snack, and Dinner.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <ClipboardCheck className="w-4 h-4 text-[#15803D] mt-0.5 shrink-0" aria-hidden="true" />
            <span>Record 10-question assessment scores and monitor progress over time.</span>
          </li>
        </ul>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
            {error}
          </div>
        )}

        <button
          type="button"
          disabled={submitting}
          onClick={handleGoogleSignIn}
          className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#15803D] hover:bg-[#166534] disabled:opacity-60 rounded-xl transition-colors flex items-center justify-center gap-3 cursor-pointer"
        >
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-white text-[#142419] text-xs font-bold">
            G
          </span>
          <span>{submitting ? 'Connecting to Google...' : 'Continue with Google'}</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-[#475B4B] pt-2 border-t border-[#E2E8E2]">
          <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" aria-hidden="true" />
          <span>Verified single sign-on keeps your learning records private to your account.</span>
        </div>
      </div>
    </div>
  );
}
