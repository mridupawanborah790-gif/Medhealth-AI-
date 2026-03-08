
export enum Gender {
  Male = 'Male',
  Female = 'Female',
}

export enum ActivityLevel {
  Sedentary = 'Mostly Seated',
  LightlyActive = 'Often Standing',
  ModeratelyActive = 'Regular Walking',
  VeryActive = 'Physically Intense Work',
}

export enum GoalType {
  WeightLoss = 'Weight Loss',
  WeightGain = 'Weight Gain',
  BuildMuscle = 'Build Muscle',
  Maintain = 'Maintain Weight',
}

export interface HealthProfile {
  name: string;
  age: number;
  gender: Gender;
  height: number; // cm
  weight: number; // kg
  activityLevel: ActivityLevel;
}

export interface Goal {
  type: GoalType;
  targetWeight: number;
  weeklyRate: number; // kg/week
}

export interface CalculatedMetrics {
  bmi: number;
  bmiCategory: string;
  idealWeightRange: { min: number; max: number };
  bmr: number;
  tdee: number;
  calorieBudget: number;
  macros: {
    protein: number;
    fat: number;
    carbs: number;
  };
  etaWeeks?: number;
}

export interface FoodItem {
  label: string;
  confidence: number;
  portion_estimate: { unit: string; value: number };
  macros: { kcal: number; protein_g: number; fat_g: number; carb_g: number };
  micros?: { [key: string]: number };
}

export interface NutritionAnalysis {
  items: FoodItem[];
  total: { kcal: number; protein_g: number; fat_g: number; carb_g: number };
  flags: string[];
}

export interface FoodLogEntry {
  id: number; // e.g., Date.now()
  date: string; // YYYY-MM-DD
  analysis: NutritionAnalysis;
  imageBase64: string;
}

export interface CoachSummary {
  bmiText: string;
  idealWeightText: string;
  weeklyLossText: string;
  etaText: string;
  budgetText: string;
}

// New Types for Workout and Fasting
export interface Move {
  name: string;
  duration: number; // seconds
  reps?: string;
  alternative?: {
    condition: string;
    move: string;
  };
}

export interface Workout {
  id: string;
  title: string;
  duration: number; // minutes
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  equipment: string[];
  moves: Move[];
}

export enum FastingPlan {
  '16:8' = '16:8',
  '14:10' = '14:10',
  '12:12' = '12:12',
}

export interface FastingSession {
  plan: FastingPlan;
  startTime: number; // Date.now() timestamp
  endTime: number; // Date.now() timestamp
  isFasting: boolean;
}

export interface DailyMetrics {
  date: string; // YYYY-MM-DD
  steps: number;
  waterIntake: number; // glasses
  sleepHours: number;
  caloriesLogged: number;
  proteinLogged: number;
  workoutCompleted: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// FIX: Add missing StandReminder interface
export interface StandReminder {
  isEnabled: boolean;
  interval: number; // minutes
  nextReminderTimestamp: number | null;
}

// New types for Weekly Workout Plan
export enum WorkoutType {
  Gym = 'gym',
  Yoga = 'yoga',
}

export interface Exercise {
  name: string;
  sets: string; // e.g., "3" or "3-4"
  reps: string; // e.g., "8-12" or "AMRAP"
}

export interface Pose {
    name: string;
    duration: string; // e.g., "30 seconds" or "5 breaths"
}

export interface DailyWorkoutPlan {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  activity: 'gym' | 'yoga' | 'rest';
  focus: string; // e.g., "Upper Body Strength", "Vinyasa Flow", "Active Recovery"
  trainerNotes: string;
  exercises?: Exercise[]; // For gym workouts
  poses?: Pose[]; // For yoga workouts
}

export type WeeklyPlan = DailyWorkoutPlan[];