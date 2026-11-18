import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import {
  getDeficienciesSql,
  getHealthyFoodsSql,
  getNutrientsSql,
  getOrCreateSqlUser,
  getVitaminsSql,
  recordQuizAttemptSql,
  saveContactMessageSql,
  searchAllSql,
  toggleBookmarkSql,
} from './src/db/nutritionRepository.ts';
import { optionalAuth, requireAuth, type AuthRequest } from './src/middleware/auth.ts';
import { SEED_QUIZ } from './src/server/seedData.ts';

const PORT = 3000;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'nutrition-awareness-api' });
  });

  // Authenticated User Profile (synced with Cloud SQL via Firebase UID)
  app.get('/api/me', requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const decoded = req.user!;
      const email = decoded.email ?? 'learner@nutriguide.org';
      const displayName =
        typeof decoded.name === 'string' && decoded.name.trim().length > 0
          ? decoded.name.trim()
          : email.split('@')[0];

      const user = await getOrCreateSqlUser(decoded.uid, email, displayName);
      return res.json({ user });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to fetch user profile.';
      return res.status(500).json({ error: message });
    }
  });

  // Protected Bookmark Toggle (Cloud SQL)
  app.post('/api/user/bookmark', requireAuth, async (req: AuthRequest, res: Response) => {
    const { itemKey } = req.body ?? {};
    if (typeof itemKey !== 'string' || !/^(nutrient|vitamin|deficiency|food):[0-9]+$/.test(itemKey)) {
      return res.status(400).json({ error: 'Invalid bookmark identifier.' });
    }

    try {
      const decoded = req.user!;
      const email = decoded.email ?? 'learner@nutriguide.org';
      const displayName =
        typeof decoded.name === 'string' && decoded.name.trim().length > 0
          ? decoded.name.trim()
          : email.split('@')[0];

      const bookmarks = await toggleBookmarkSql(decoded.uid, email, displayName, itemKey);
      return res.json({ bookmarks });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not update bookmark.';
      return res.status(500).json({ error: message });
    }
  });

  // Nutrition Data Endpoints (Cloud SQL PostgreSQL via Drizzle)
  app.get('/api/nutrients', async (req: Request, res: Response) => {
    try {
      const q = typeof req.query.q === 'string' ? req.query.q : undefined;
      const list = await getNutrientsSql(q);
      return res.json({ nutrients: list });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to fetch nutrients.';
      return res.status(500).json({ error: message });
    }
  });

  app.get('/api/vitamins', async (req: Request, res: Response) => {
    try {
      const q = typeof req.query.q === 'string' ? req.query.q : undefined;
      const soluble = typeof req.query.soluble === 'string' ? req.query.soluble : undefined;
      const list = await getVitaminsSql(q, soluble);
      return res.json({ vitamins: list });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to fetch vitamins.';
      return res.status(500).json({ error: message });
    }
  });

  app.get('/api/deficiencies', async (req: Request, res: Response) => {
    try {
      const q = typeof req.query.q === 'string' ? req.query.q : undefined;
      const list = await getDeficienciesSql(q);
      return res.json({ deficiencies: list });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to fetch deficiencies.';
      return res.status(500).json({ error: message });
    }
  });

  app.get('/api/foods', async (req: Request, res: Response) => {
    try {
      const category = typeof req.query.category === 'string' ? req.query.category : undefined;
      const q = typeof req.query.q === 'string' ? req.query.q : undefined;
      const origin = typeof req.query.origin === 'string' ? req.query.origin : undefined;
      const list = await getHealthyFoodsSql(category, q, origin);
      return res.json({ foods: list });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to fetch healthy foods.';
      return res.status(500).json({ error: message });
    }
  });

  app.get('/api/search', async (req: Request, res: Response) => {
    try {
      const q = typeof req.query.q === 'string' ? req.query.q : '';
      const results = await searchAllSql(q);
      return res.json({ query: q, results });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Search failed.';
      return res.status(500).json({ error: message });
    }
  });

  // Contact Messages Endpoint (Cloud SQL PostgreSQL)
  app.post('/api/contact', async (req: Request, res: Response) => {
    const { name, email, subject, message } = req.body ?? {};
    if (typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter your name (at least 2 characters).' });
    }
    if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (typeof subject !== 'string' || subject.trim().length < 3) {
      return res.status(400).json({ error: 'Please enter a subject (at least 3 characters).' });
    }
    if (typeof message !== 'string' || message.trim().length < 10) {
      return res.status(400).json({ error: 'Please write a message of at least 10 characters.' });
    }

    try {
      const saved = await saveContactMessageSql({ name, email, subject, message });
      return res.status(201).json({
        message: 'Thank you! Your inquiry has been received and saved.',
        record: saved,
      });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unable to save contact message.';
      return res.status(500).json({ error: errMsg });
    }
  });

  // Quiz Endpoints
  app.get('/api/quiz', (_req: Request, res: Response) => {
    const publicQuestions = SEED_QUIZ.map(({ question_id, topic, question, options }) => ({
      question_id,
      topic,
      question,
      options,
    }));
    return res.json({ questions: publicQuestions });
  });

  app.post('/api/quiz/submit', optionalAuth, async (req: AuthRequest, res: Response) => {
    const { answers } = req.body ?? {};
    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'Quiz answers payload is required.' });
    }

    let score = 0;
    const breakdown = SEED_QUIZ.map((q) => {
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

    const total = SEED_QUIZ.length;
    const percentage = Math.round((score / total) * 100);
    const attempt_id = `quiz-${Date.now()}`;
    const created_at = new Date().toISOString();

    if (req.user) {
      try {
        const email = req.user.email ?? 'learner@nutriguide.org';
        const displayName =
          typeof req.user.name === 'string' && req.user.name.trim().length > 0
            ? req.user.name.trim()
            : email.split('@')[0];
        await recordQuizAttemptSql(req.user.uid, email, displayName, score, total, percentage);
      } catch (err) {
        console.error('Failed to persist SQL quiz attempt:', err);
      }
    }

    return res.json({
      result: {
        attempt_id,
        score,
        total,
        percentage,
        created_at,
        breakdown,
      },
    });
  });

  // Global API error guard
  app.use('/api', (_req: Request, res: Response) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  // Frontend serving (Vite dev middleware in dev, dist/ in production)
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error.' });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NutriGuide server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
