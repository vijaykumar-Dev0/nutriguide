import { useEffect, useState } from 'react';
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { fetchQuizQuestions, submitQuiz } from '../lib/api.ts';
import type { QuizAttemptResult, QuizQuestionPublic, UserPublic } from '../types/nutrition.ts';
import type { PageRoute } from '../components/Navbar.tsx';

interface QuizPageProps {
  user: UserPublic | null;
  onQuizSubmitted: (result: QuizAttemptResult) => Promise<void> | void;
  onNavigate: (page: PageRoute) => void;
}

export function QuizPage({ user, onQuizSubmitted, onNavigate }: QuizPageProps) {
  const [questions, setQuestions] = useState<QuizQuestionPublic[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetchQuizQuestions()
      .then((data) => {
        if (active) {
          setQuestions(data);
          setError('');
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Could not load quiz questions.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;

  async function handleSubmit() {
    if (!allAnswered) {
      setError(`Please answer all ${questions.length} questions before submitting.`);
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const graded = await submitQuiz(answers);
      setResult(graded);
      await onQuizSubmitted(graded);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to grade quiz right now.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setAnswers({});
    setResult(null);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
      <div className="space-y-2">
        <p className="text-sm font-medium text-[#15803D]">Knowledge Self-Assessment</p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#142419]">
          Nutrition Awareness Quiz
        </h1>
        <p className="text-base text-[#475B4B]">
          Test your understanding of macronutrients, vitamins, mineral absorption, and deficiency
          prevention.
          {!user && (
            <span>
              {' '}
              <button
                type="button"
                onClick={() => onNavigate('auth')}
                className="text-[#15803D] font-semibold hover:underline cursor-pointer"
              >
                Sign in
              </button>{' '}
              to save quiz scores to your learner dashboard.
            </span>
          )}
        </p>
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="h-44 rounded-2xl bg-[#F4F7F4] border border-[#E2E8E2] animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Results Summary */}
      {result && (
        <section className="space-y-6">
          <div className="bg-[#FEFCE8] border border-[#EDE9C6] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-[#854D0E]">Assessment Complete</div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#142419]">
                You scored{' '}
                <span className="font-mono-nums text-[#15803D]">
                  {result.score} / {result.total}
                </span>{' '}
                (<span className="font-mono-nums">{result.percentage}%</span>)
              </h2>
              <p className="text-sm text-[#475B4B]">
                {result.percentage >= 80
                  ? 'Strong nutrition literacy! Review any missed explanations below.'
                  : 'Good progress! Read the explanations below and revisit the Vitamins and Deficiencies guides.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-3 shrink-0">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-xl cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                <span>Retake Quiz</span>
              </button>
              {user && (
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="px-4 py-2.5 text-sm font-semibold text-[#142419] bg-white border border-[#E2E8E2] hover:border-[#15803D] rounded-xl cursor-pointer"
                >
                  View Dashboard
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {result.breakdown.map((item, idx) => {
              const q = questions.find((qq) => qq.question_id === item.question_id);
              return (
                <div
                  key={item.question_id}
                  className="bg-white border border-[#E2E8E2] rounded-2xl p-5 sm:p-6 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-xs text-[#475B4B] font-mono-nums">
                        Question {String(idx + 1).padStart(2, '0')}
                      </div>
                      <h3 className="font-display text-base sm:text-lg font-semibold text-[#142419]">
                        {item.question}
                      </h3>
                    </div>
                    {item.is_correct ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#15803D] shrink-0">
                        <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                        <span>Correct</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#B91C1C] shrink-0">
                        <XCircle className="w-4 h-4" aria-hidden="true" />
                        <span>Incorrect</span>
                      </span>
                    )}
                  </div>

                  {q && (
                    <div className="text-sm text-[#475B4B] space-y-1">
                      <div>
                        Your answer:{' '}
                        <span className="font-medium text-[#142419]">
                          {q.options[item.selected_index] ?? 'None'}
                        </span>
                      </div>
                      {!item.is_correct && (
                        <div>
                          Correct answer:{' '}
                          <span className="font-semibold text-[#15803D]">
                            {q.options[item.correct_index]}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-xs sm:text-sm text-[#475B4B] bg-[#F4F7F4] rounded-xl p-3.5">
                    {item.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Active Questions Form */}
      {!loading && !result && questions.length > 0 && (
        <div className="space-y-6">
          {/* Progress Header */}
          <div className="bg-white border border-[#E2E8E2] rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="text-sm text-[#475B4B]">
              Progress:{' '}
              <span className="font-mono-nums font-semibold text-[#142419]">
                {answeredCount} / {questions.length}
              </span>{' '}
              answered
            </div>
            <div className="w-44 h-2 bg-[#F4F7F4] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#15803D] transition-all duration-200"
                style={{ width: `${Math.round((answeredCount / questions.length) * 100)}%` }}
              />
            </div>
          </div>

          <div className="space-y-5">
            {questions.map((q, idx) => (
              <fieldset
                key={q.question_id}
                className="bg-white border border-[#E2E8E2] rounded-2xl p-5 sm:p-6 space-y-4"
              >
                <legend className="sr-only">{q.question}</legend>
                <div className="space-y-1">
                  <div className="text-xs text-[#475B4B]">
                    <span className="font-mono-nums text-[#15803D] font-semibold">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span aria-hidden="true"> · </span>
                    <span>{q.topic}</span>
                  </div>
                  <h2 className="font-display text-lg font-semibold text-[#142419]">
                    {q.question}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = answers[q.question_id] === optIdx;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() =>
                          setAnswers((prev) => ({ ...prev, [q.question_id]: optIdx }))
                        }
                        aria-pressed={isSelected}
                        className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#F0FDF4] border-[#15803D] text-[#14532D]'
                            : 'bg-[#FCFCFA] border-[#E2E8E2] text-[#142419] hover:border-[#15803D]/60'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>

          <div className="flex items-center justify-end gap-4 pt-2">
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              className="px-6 py-3 text-sm font-semibold text-white bg-[#15803D] hover:bg-[#166534] disabled:opacity-60 rounded-xl transition-colors cursor-pointer"
            >
              {submitting ? 'Grading Answers...' : 'Submit Quiz Answers'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
