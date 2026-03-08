
import { HealthProfile, Goal, Gender, ActivityLevel, GoalType } from '../types';

const ACTIVITY_MULTIPLIERS: { [key in ActivityLevel]: number } = {
  [ActivityLevel.Sedentary]: 1.2,
  [ActivityLevel.LightlyActive]: 1.375,
  [ActivityLevel.ModeratelyActive]: 1.55,
  [ActivityLevel.VeryActive]: 1.725,
};

export const calculateBMR = (profile: HealthProfile): number => {
  const { weight, height, age, gender } = profile;
  if (gender === Gender.Male) {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
};

export const calculateTDEE = (bmr: number, activityLevel: ActivityLevel): number => {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
};

export const calculateBMI = (weight: number, height: number): { bmi: number; category: string } => {
  const heightInMeters = height / 100;
  const bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
  let category = '';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal weight';
  else if (bmi < 30) category = 'Overweight';
  else category = 'Obesity';
  return { bmi, category };
};

export const calculateIdealWeightRange = (height: number): { min: number; max: number } => {
  const heightInMeters = height / 100;
  const min = 18.5 * (heightInMeters * heightInMeters);
  const max = 24.9 * (heightInMeters * heightInMeters);
  return { min: parseFloat(min.toFixed(1)), max: parseFloat(max.toFixed(1)) };
};

export const calculateCalorieBudget = (tdee: number, goalType: GoalType): number => {
  switch (goalType) {
    case GoalType.WeightLoss:
      return tdee - 500; // Target ~0.5 kg/week loss
    case GoalType.WeightGain:
      return tdee + 500; // Target ~0.5 kg/week gain
    case GoalType.BuildMuscle:
      return tdee + 350; // Smaller surplus for lean mass
    case GoalType.Maintain:
    default:
      return tdee;
  }
};

export const calculateMacros = (calories: number, weight: number, goalType: GoalType): { protein: number; fat: number; carbs: number } => {
  let proteinGrams: number;
  if (goalType === GoalType.BuildMuscle) {
    proteinGrams = 1.8 * weight;
  } else if (goalType === GoalType.WeightGain) {
    proteinGrams = 1.4 * weight;
  } else {
    proteinGrams = 1.5 * weight;
  }
  const fatGrams = 0.8 * weight;

  const proteinCals = proteinGrams * 4;
  const fatCals = fatGrams * 9;
  const carbCals = calories - proteinCals - fatCals;
  const carbGrams = carbCals / 4;

  return {
    protein: Math.round(proteinGrams),
    fat: Math.round(fatGrams),
    carbs: Math.round(carbGrams),
  };
};

export const calculateETA = (currentWeight: number, targetWeight: number, weeklyRate: number): number => {
    if (weeklyRate <= 0) return Infinity;
    const deltaKg = Math.abs(currentWeight - targetWeight);
    return Math.ceil(deltaKg / weeklyRate);
}