import { relations } from 'drizzle-orm';
import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const nutrients = pgTable('nutrients', {
  id: serial('id').primaryKey(),
  nutrientName: text('nutrient_name').notNull().unique(),
  category: text('category').notNull(),
  dailyTarget: text('daily_target').notNull(),
  description: text('description').notNull(),
  functions: jsonb('functions').$type<string[]>().notNull(),
  foodSources: jsonb('food_sources').$type<string[]>().notNull(),
  importance: text('importance').notNull(),
});

export const vitamins = pgTable('vitamins', {
  id: serial('id').primaryKey(),
  vitaminName: text('vitamin_name').notNull().unique(),
  chemicalName: text('chemical_name').notNull(),
  solubility: text('solubility').notNull(),
  dailyRda: text('daily_rda').notNull(),
  functions: jsonb('functions').$type<string[]>().notNull(),
  foodSources: jsonb('food_sources').$type<string[]>().notNull(),
  deficiencyInformation: text('deficiency_information').notNull(),
});

export const deficiencyDiseases = pgTable('deficiency_diseases', {
  id: serial('id').primaryKey(),
  diseaseName: text('disease_name').notNull().unique(),
  nutrientDeficiency: text('nutrient_deficiency').notNull(),
  severity: text('severity').notNull(),
  summary: text('summary').notNull(),
  symptoms: jsonb('symptoms').$type<string[]>().notNull(),
  causes: jsonb('causes').$type<string[]>().notNull(),
  prevention: jsonb('prevention').$type<string[]>().notNull(),
  recommendedFoods: jsonb('recommended_foods').$type<string[]>().notNull(),
});

export const healthyFoods = pgTable('healthy_foods', {
  id: serial('id').primaryKey(),
  foodName: text('food_name').notNull().unique(),
  foodCategory: text('food_category').notNull(),
  origin: text('origin').notNull(),
  servingSize: text('serving_size').notNull(),
  calories: integer('calories').notNull(),
  keyNutrients: jsonb('key_nutrients').$type<string[]>().notNull(),
  benefits: text('benefits').notNull(),
  imageUrl: text('image_url').notNull(),
});

export const contactMessages = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  userName: text('user_name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const quizAttempts = pgTable('quiz_attempts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  score: integer('score').notNull(),
  total: integer('total').notNull(),
  percentage: integer('percentage').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userBookmarks = pgTable(
  'user_bookmarks',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    itemKey: text('item_key').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('user_bookmarks_user_item_idx').on(table.userId, table.itemKey)]
);

export const usersRelations = relations(users, ({ many }) => ({
  quizAttempts: many(quizAttempts),
  bookmarks: many(userBookmarks),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one }) => ({
  user: one(users, {
    fields: [quizAttempts.userId],
    references: [users.id],
  }),
}));

export const userBookmarksRelations = relations(userBookmarks, ({ one }) => ({
  user: one(users, {
    fields: [userBookmarks.userId],
    references: [users.id],
  }),
}));
