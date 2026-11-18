import { and, asc, desc, eq } from 'drizzle-orm';
import {
  SEED_DEFICIENCIES,
  SEED_FOODS,
  SEED_NUTRIENTS,
  SEED_VITAMINS,
} from '../server/seedData.ts';
import type {
  ContactMessageInput,
  DeficiencyDiseaseItem,
  FoodCategory,
  HealthyFoodItem,
  NutrientItem,
  SearchResults,
  UserPublic,
  VitaminItem,
} from '../types/nutrition.ts';
import { db } from './index.ts';
import {
  contactMessages,
  deficiencyDiseases,
  healthyFoods,
  nutrients,
  quizAttempts,
  userBookmarks,
  users,
  vitamins,
} from './schema.ts';

let catalogSeeded = false;
let seedingPromise: Promise<void> | null = null;

async function ensureCatalogSeeded(): Promise<void> {
  if (catalogSeeded) return;
  if (!seedingPromise) {
    seedingPromise = (async () => {
      try {
        const existingNutrients = await db.select({ id: nutrients.id }).from(nutrients).limit(1);
        if (existingNutrients.length === 0) {
          await db
            .insert(nutrients)
            .values(
              SEED_NUTRIENTS.map((n) => ({
                nutrientName: n.nutrient_name,
                category: n.category,
                dailyTarget: n.daily_target,
                description: n.description,
                functions: n.functions,
                foodSources: n.food_sources,
                importance: n.importance,
              }))
            )
            .onConflictDoNothing();
        }

        const existingVitamins = await db.select({ id: vitamins.id }).from(vitamins).limit(1);
        if (existingVitamins.length === 0) {
          await db
            .insert(vitamins)
            .values(
              SEED_VITAMINS.map((v) => ({
                vitaminName: v.vitamin_name,
                chemicalName: v.chemical_name,
                solubility: v.solubility,
                dailyRda: v.daily_rda,
                functions: v.functions,
                foodSources: v.food_sources,
                deficiencyInformation: v.deficiency_information,
              }))
            )
            .onConflictDoNothing();
        }

        const existingDef = await db
          .select({ id: deficiencyDiseases.id })
          .from(deficiencyDiseases)
          .limit(1);
        if (existingDef.length === 0) {
          await db
            .insert(deficiencyDiseases)
            .values(
              SEED_DEFICIENCIES.map((d) => ({
                diseaseName: d.disease_name,
                nutrientDeficiency: d.nutrient_deficiency,
                severity: d.severity,
                summary: d.summary,
                symptoms: d.symptoms,
                causes: d.causes,
                prevention: d.prevention,
                recommendedFoods: d.recommended_foods,
              }))
            )
            .onConflictDoNothing();
        }

        const existingFoods = await db.select({ id: healthyFoods.id }).from(healthyFoods).limit(1);
        if (existingFoods.length === 0) {
          await db
            .insert(healthyFoods)
            .values(
              SEED_FOODS.map((f) => ({
                foodName: f.food_name,
                foodCategory: f.food_category,
                origin: f.origin,
                servingSize: f.serving_size,
                calories: f.calories,
                keyNutrients: f.key_nutrients,
                benefits: f.benefits,
                imageUrl: f.image_url,
              }))
            )
            .onConflictDoNothing();
        }

        catalogSeeded = true;
      } catch (error) {
        seedingPromise = null;
        console.error('Catalog seeding failed:', error);
        throw new Error('Database initialization failed. Please try again later.', { cause: error });
      }
    })();
  }
  await seedingPromise;
}

export async function getNutrientsSql(query?: string): Promise<NutrientItem[]> {
  try {
    await ensureCatalogSeeded();
    const rows = await db.select().from(nutrients).orderBy(asc(nutrients.id));
    const mapped: NutrientItem[] = rows.map((r) => ({
      nutrient_id: r.id,
      nutrient_name: r.nutrientName,
      category: r.category as NutrientItem['category'],
      daily_target: r.dailyTarget,
      description: r.description,
      functions: r.functions,
      food_sources: r.foodSources,
      importance: r.importance,
    }));

    const q = (query ?? '').trim().toLowerCase();
    if (!q) return mapped;
    return mapped.filter(
      (item) =>
        item.nutrient_name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.functions.some((f) => f.toLowerCase().includes(q)) ||
        item.food_sources.some((s) => s.toLowerCase().includes(q))
    );
  } catch (error) {
    console.error('Database query failed (nutrients):', error);
    throw new Error('Unable to load nutrients from the database.', { cause: error });
  }
}

export async function getVitaminsSql(query?: string, solubility?: string): Promise<VitaminItem[]> {
  try {
    await ensureCatalogSeeded();
    const rows = await db.select().from(vitamins).orderBy(asc(vitamins.id));
    const mapped: VitaminItem[] = rows.map((r) => ({
      vitamin_id: r.id,
      vitamin_name: r.vitaminName,
      chemical_name: r.chemicalName,
      solubility: r.solubility as VitaminItem['solubility'],
      daily_rda: r.dailyRda,
      functions: r.functions,
      food_sources: r.foodSources,
      deficiency_information: r.deficiencyInformation,
    }));

    const q = (query ?? '').trim().toLowerCase();
    const sol = (solubility ?? '').trim().toLowerCase();
    return mapped.filter((item) => {
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
  } catch (error) {
    console.error('Database query failed (vitamins):', error);
    throw new Error('Unable to load vitamins from the database.', { cause: error });
  }
}

export async function getDeficienciesSql(query?: string): Promise<DeficiencyDiseaseItem[]> {
  try {
    await ensureCatalogSeeded();
    const rows = await db.select().from(deficiencyDiseases).orderBy(asc(deficiencyDiseases.id));
    const mapped: DeficiencyDiseaseItem[] = rows.map((r) => ({
      disease_id: r.id,
      disease_name: r.diseaseName,
      nutrient_deficiency: r.nutrientDeficiency,
      severity: r.severity as DeficiencyDiseaseItem['severity'],
      summary: r.summary,
      symptoms: r.symptoms,
      causes: r.causes,
      prevention: r.prevention,
      recommended_foods: r.recommendedFoods,
    }));

    const q = (query ?? '').trim().toLowerCase();
    if (!q) return mapped;
    return mapped.filter(
      (item) =>
        item.disease_name.toLowerCase().includes(q) ||
        item.nutrient_deficiency.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.symptoms.some((s) => s.toLowerCase().includes(q)) ||
        item.prevention.some((p) => p.toLowerCase().includes(q))
    );
  } catch (error) {
    console.error('Database query failed (deficiencies):', error);
    throw new Error('Unable to load deficiency guides from the database.', { cause: error });
  }
}

export async function getHealthyFoodsSql(
  category?: string,
  query?: string,
  origin?: string
): Promise<HealthyFoodItem[]> {
  try {
    await ensureCatalogSeeded();
    const rows = await db.select().from(healthyFoods).orderBy(asc(healthyFoods.id));
    const mapped: HealthyFoodItem[] = rows.map((r) => ({
      food_id: r.id,
      food_name: r.foodName,
      food_category: r.foodCategory as FoodCategory,
      origin: r.origin as 'Indian' | 'Global',
      serving_size: r.servingSize,
      calories: r.calories,
      key_nutrients: r.keyNutrients,
      benefits: r.benefits,
      image_url: r.imageUrl,
    }));

    const cat = (category ?? '').trim().toLowerCase();
    const q = (query ?? '').trim().toLowerCase();
    const orig = (origin ?? '').trim().toLowerCase();
    return mapped.filter((item) => {
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
  } catch (error) {
    console.error('Database query failed (foods):', error);
    throw new Error('Unable to load healthy foods from the database.', { cause: error });
  }
}

export async function searchAllSql(query: string): Promise<SearchResults> {
  const q = query.trim();
  if (!q) {
    return { nutrients: [], vitamins: [], deficiencies: [], foods: [] };
  }
  const [n, v, d, f] = await Promise.all([
    getNutrientsSql(q),
    getVitaminsSql(q),
    getDeficienciesSql(q),
    getHealthyFoodsSql('All', q),
  ]);
  return { nutrients: n, vitamins: v, deficiencies: d, foods: f };
}

export async function getOrCreateSqlUser(
  uid: string,
  email: string,
  displayName: string
): Promise<UserPublic> {
  try {
    const upserted = await db
      .insert(users)
      .values({
        uid,
        email,
        displayName,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          displayName,
        },
      })
      .returning();

    const userRow = upserted[0];
    const [bookmarkRows, attemptRows] = await Promise.all([
      db
        .select()
        .from(userBookmarks)
        .where(eq(userBookmarks.userId, userRow.id))
        .orderBy(desc(userBookmarks.createdAt)),
      db
        .select()
        .from(quizAttempts)
        .where(eq(quizAttempts.userId, userRow.id))
        .orderBy(desc(quizAttempts.createdAt))
        .limit(15),
    ]);

    return {
      user_id: userRow.id,
      name: userRow.displayName,
      email: userRow.email,
      created_at: userRow.createdAt.toISOString(),
      bookmarks: bookmarkRows.map((b) => b.itemKey),
      quiz_history: attemptRows.map((a) => ({
        attempt_id: `sql-${a.id}`,
        score: a.score,
        total: a.total,
        percentage: a.percentage,
        created_at: a.createdAt.toISOString(),
      })),
    };
  } catch (error) {
    console.error('Database user upsert failed:', error);
    throw new Error('Unable to synchronize user profile.', { cause: error });
  }
}

export async function toggleBookmarkSql(
  uid: string,
  email: string,
  displayName: string,
  itemKey: string
): Promise<string[]> {
  try {
    const user = await getOrCreateSqlUser(uid, email, displayName);
    const existing = await db
      .select()
      .from(userBookmarks)
      .where(and(eq(userBookmarks.userId, user.user_id), eq(userBookmarks.itemKey, itemKey)));

    if (existing.length > 0) {
      await db
        .delete(userBookmarks)
        .where(and(eq(userBookmarks.userId, user.user_id), eq(userBookmarks.itemKey, itemKey)));
    } else {
      await db
        .insert(userBookmarks)
        .values({
          userId: user.user_id,
          itemKey,
        })
        .onConflictDoNothing();
    }

    const updated = await db
      .select()
      .from(userBookmarks)
      .where(eq(userBookmarks.userId, user.user_id))
      .orderBy(desc(userBookmarks.createdAt));

    return updated.map((b) => b.itemKey);
  } catch (error) {
    console.error('Database bookmark toggle failed:', error);
    throw new Error('Unable to update bookmark.', { cause: error });
  }
}

export async function recordQuizAttemptSql(
  uid: string,
  email: string,
  displayName: string,
  score: number,
  total: number,
  percentage: number
): Promise<void> {
  try {
    const user = await getOrCreateSqlUser(uid, email, displayName);
    await db.insert(quizAttempts).values({
      userId: user.user_id,
      score,
      total,
      percentage,
    });
  } catch (error) {
    console.error('Database quiz attempt insert failed:', error);
    throw new Error('Unable to save quiz attempt.', { cause: error });
  }
}

export async function saveContactMessageSql(input: ContactMessageInput): Promise<{
  message_id: number;
  user_name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}> {
  try {
    const inserted = await db
      .insert(contactMessages)
      .values({
        userName: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        subject: input.subject.trim(),
        message: input.message.trim(),
      })
      .returning();

    const row = inserted[0];
    return {
      message_id: row.id,
      user_name: row.userName,
      email: row.email,
      subject: row.subject,
      message: row.message,
      created_at: row.createdAt.toISOString(),
    };
  } catch (error) {
    console.error('Database contact insert failed:', error);
    throw new Error('Unable to save contact message right now.', { cause: error });
  }
}
