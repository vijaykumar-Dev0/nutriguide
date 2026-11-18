export type FoodCategory =
  | 'Fruits'
  | 'Vegetables'
  | 'Milk Products'
  | 'Nuts'
  | 'Whole Grains'
  | 'Protein-Rich Foods';

export interface NutrientItem {
  nutrient_id: number;
  nutrient_name: string;
  category: 'Macronutrient' | 'Micronutrient' | 'Hydration';
  daily_target: string;
  description: string;
  functions: string[];
  food_sources: string[];
  importance: string;
}

export interface VitaminItem {
  vitamin_id: number;
  vitamin_name: string;
  chemical_name: string;
  solubility: 'Fat-Soluble' | 'Water-Soluble';
  daily_rda: string;
  functions: string[];
  food_sources: string[];
  deficiency_information: string;
}

export interface DeficiencyDiseaseItem {
  disease_id: number;
  disease_name: string;
  nutrient_deficiency: string;
  severity: 'Moderate' | 'High' | 'Critical';
  summary: string;
  symptoms: string[];
  causes: string[];
  prevention: string[];
  recommended_foods: string[];
}

export interface HealthyFoodItem {
  food_id: number;
  food_name: string;
  food_category: FoodCategory;
  origin: 'Indian' | 'Global';
  serving_size: string;
  calories: number;
  key_nutrients: string[];
  benefits: string;
  image_url: string;
}

export interface QuizQuestionPublic {
  question_id: number;
  topic: string;
  question: string;
  options: string[];
}

export interface QuizQuestionRecord extends QuizQuestionPublic {
  correct_index: number;
  explanation: string;
}

export interface QuizAttemptResult {
  attempt_id: string;
  score: number;
  total: number;
  percentage: number;
  created_at: string;
  breakdown: Array<{
    question_id: number;
    question: string;
    selected_index: number;
    correct_index: number;
    is_correct: boolean;
    explanation: string;
  }>;
}

export interface UserPublic {
  user_id: number;
  name: string;
  email: string;
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

export interface ContactMessageInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface SearchResults {
  nutrients: NutrientItem[];
  vitamins: VitaminItem[];
  deficiencies: DeficiencyDiseaseItem[];
  foods: HealthyFoodItem[];
}
