
import React, { useState, useMemo, useEffect } from 'react';
import { HealthProfile, Goal, CalculatedMetrics, Gender, ActivityLevel, GoalType, CoachSummary } from '../types';
import * as Calcs from '../utils/calculations';
import { generateOnboardingSummary } from '../services/geminiService';
import { Button } from './common/Button';
import { Spinner } from './common/Spinner';

interface OnboardingProps {
  onComplete: (profile: HealthProfile, goal: Goal, metrics: CalculatedMetrics) => void;
}

const steps = [
  'Welcome', 'Personal', 'Vitals', 'Activity', 'Goal', 'Summary'
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<HealthProfile>({
    name: '', age: 30, gender: Gender.Female, height: 165, weight: 70,
    activityLevel: ActivityLevel.Sedentary,
  });
  const [goal, setGoal] = useState<Goal>({
    type: GoalType.WeightLoss, targetWeight: 65, weeklyRate: 0.5,
  });
  const [coachSummary, setCoachSummary] = useState<CoachSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculatedMetrics = useMemo((): CalculatedMetrics | null => {
    if (profile.height > 0 && profile.weight > 0 && profile.age > 0) {
      const bmr = Calcs.calculateBMR(profile);
      const tdee = Calcs.calculateTDEE(bmr, profile.activityLevel);
      const { bmi, category } = Calcs.calculateBMI(profile.weight, profile.height);
      const idealWeightRange = Calcs.calculateIdealWeightRange(profile.height);
      const calorieBudget = Calcs.calculateCalorieBudget(tdee, goal.type);
      const macros = Calcs.calculateMacros(calorieBudget, profile.weight, goal.type);
      const isGainGoal = goal.type === GoalType.WeightGain || goal.type === GoalType.BuildMuscle;
      const etaWeeks = (goal.type === GoalType.WeightLoss || isGainGoal) ? Calcs.calculateETA(profile.weight, goal.targetWeight, goal.weeklyRate) : undefined;
      
      return { bmr, tdee, bmi, bmiCategory: category, idealWeightRange, calorieBudget, macros, etaWeeks };
    }
    return null;
  }, [profile, goal]);

  const handleNext = () => {
    if (step === steps.length - 2 && !calculatedMetrics) return;
    setStep(s => s + 1);
  };

  useEffect(() => {
    if (step === steps.length - 1 && !coachSummary && !isLoading && calculatedMetrics) {
      let isMounted = true;
      const fetchSummary = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const summary = await generateOnboardingSummary(profile, goal, calculatedMetrics);
          if (isMounted) setCoachSummary(summary);
        } catch (err) {
          if (isMounted) setError("Couldn't generate summary. Please try again.");
          console.error(err);
        } finally {
          if (isMounted) setIsLoading(false);
        }
      };
      fetchSummary();
      return () => { isMounted = false; };
    }
  }, [step, coachSummary, isLoading, calculatedMetrics, profile, goal]);

  const handleBack = () => setStep(s => s - 1);

  const renderStep = () => {
    switch (steps[step]) {
      case 'Welcome': return (
        <div>
          <h1 className="text-4xl font-extrabold text-primary">Welcome to MedHealth AI</h1>
          <p className="text-slate-400 mt-2 text-lg">Your journey to a healthier you starts now. Let's set a goal together.</p>
        </div>
      );
      case 'Personal': return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Tell us about yourself</h2>
          <div>
            <label className="block text-sm font-medium text-slate-400">Name</label>
            <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full bg-slate-700 rounded p-3 mt-1 border border-slate-600 focus:ring-primary focus:border-primary"/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400">Age</label>
              <input type="number" value={profile.age} onChange={e => setProfile({...profile, age: +e.target.value})} className="w-full bg-slate-700 rounded p-3 mt-1 border border-slate-600 focus:ring-primary focus:border-primary"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400">Sex at birth</label>
              <select value={profile.gender} onChange={e => setProfile({...profile, gender: e.target.value as Gender})} className="w-full bg-slate-700 rounded p-3 mt-1 border border-slate-600 focus:ring-primary focus:border-primary">
                {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>
        </div>
      );
      case 'Vitals': return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Your Vitals</h2>
           <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400">Height (cm)</label>
              <input type="number" value={profile.height} onChange={e => setProfile({...profile, height: +e.target.value})} className="w-full bg-slate-700 rounded p-3 mt-1 border border-slate-600 focus:ring-primary focus:border-primary"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400">Weight (kg)</label>
              <input type="number" value={profile.weight} onChange={e => setProfile({...profile, weight: +e.target.value})} className="w-full bg-slate-700 rounded p-3 mt-1 border border-slate-600 focus:ring-primary focus:border-primary"/>
            </div>
           </div>
        </div>
      );
      case 'Activity': return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Daily Activity</h2>
          <label className="block text-sm font-medium text-slate-400">Which best describes your daily pattern?</label>
          <select value={profile.activityLevel} onChange={e => setProfile({...profile, activityLevel: e.target.value as ActivityLevel})} className="w-full bg-slate-700 rounded p-3 mt-1 border border-slate-600 focus:ring-primary focus:border-primary">
            {Object.values(ActivityLevel).map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      );
      case 'Goal':
        const isGainGoal = goal.type === GoalType.WeightGain || goal.type === GoalType.BuildMuscle;
        const showTargetFields = goal.type === GoalType.WeightLoss || isGainGoal;
        return (
         <div className="space-y-4">
          <h2 className="text-2xl font-bold">Your Goal</h2>
           <div>
              <label className="block text-sm font-medium text-slate-400">Primary Goal</label>
              <select value={goal.type} onChange={e => setGoal({...goal, type: e.target.value as GoalType})} className="w-full bg-slate-700 rounded p-3 mt-1 border border-slate-600 focus:ring-primary focus:border-primary">
                {Object.values(GoalType).map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          {showTargetFields && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-400">Target Weight (kg)</label>
                <input type="number" value={goal.targetWeight} onChange={e => setGoal({...goal, targetWeight: +e.target.value})} className="w-full bg-slate-700 rounded p-3 mt-1 border border-slate-600 focus:ring-primary focus:border-primary"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400">Weekly Rate (kg)</label>
                <select value={goal.weeklyRate} onChange={e => setGoal({...goal, weeklyRate: +e.target.value})} className="w-full bg-slate-700 rounded p-3 mt-1 border border-slate-600 focus:ring-primary focus:border-primary">
                  {isGainGoal ? (
                    <>
                      <option value={0.25}>Steady Gain (0.25 kg/week)</option>
                      <option value={0.5}>Standard Gain (0.5 kg/week)</option>
                    </>
                  ) : (
                    <>
                      <option value={0.25}>Gentle Loss (0.25 kg/week)</option>
                      <option value={0.5}>Standard Loss (0.5 kg/week)</option>
                      <option value={0.75}>Aggressive Loss (0.75 kg/week)</option>
                    </>
                  )}
                </select>
              </div>
            </>
          )}
        </div>
      );
      case 'Summary': return (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Your Personal Plan</h2>
          
          {calculatedMetrics && (
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-700 p-3 rounded-lg">
                <p className="text-sm text-slate-400">BMI</p>
                <p className="text-xl font-bold">{calculatedMetrics.bmi} <span className="text-sm font-normal text-slate-300">({calculatedMetrics.bmiCategory})</span></p>
              </div>
              <div className="bg-slate-700 p-3 rounded-lg">
                <p className="text-sm text-slate-400">Daily Calories</p>
                <p className="text-xl font-bold">{Math.round(calculatedMetrics.calorieBudget)} kcal</p>
              </div>
              <div className="bg-slate-700 p-3 rounded-lg col-span-2">
                <p className="text-sm text-slate-400">Macros</p>
                <div className="flex justify-between mt-1">
                  <span className="text-sm">Protein: <strong className="text-primary">{calculatedMetrics.macros.protein}g</strong></span>
                  <span className="text-sm">Carbs: <strong className="text-accent-sky">{calculatedMetrics.macros.carbs}g</strong></span>
                  <span className="text-sm">Fat: <strong className="text-accent-purple">{calculatedMetrics.macros.fat}g</strong></span>
                </div>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center p-4 space-x-2 text-slate-400">
              <Spinner />
              <span>Generating AI insights...</span>
            </div>
          )}
          {error && <p className="text-accent-red text-sm">{error}</p>}
          {coachSummary && calculatedMetrics && (
            <div className="space-y-3 p-4 bg-slate-800 rounded-lg border border-slate-700">
                <p>💬 {coachSummary.bmiText}</p>
                <p>💬 {coachSummary.idealWeightText}</p>
                <p>💬 {coachSummary.weeklyLossText}</p>
                <p>💬 {coachSummary.etaText}</p>
                <p>💬 {coachSummary.budgetText}</p>
                <p className="text-xs text-slate-400 pt-2">This information is for education, not a substitute for professional advice. Consult a doctor for medical conditions.</p>
            </div>
          )}
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto bg-slate-800 rounded-xl shadow-2xl p-6 space-y-6 animate-fadeIn">
        <div className="h-2 w-full bg-slate-700 rounded-full">
          <div className="h-2 bg-primary rounded-full transition-all duration-500" style={{width: `${(step + 1) / steps.length * 100}%`}}></div>
        </div>
        
        <div key={step} className="min-h-[250px] flex flex-col justify-center animate-slideInUp">
            {renderStep()}
        </div>

        <div className="flex justify-between items-center pt-4">
          <Button variant="secondary" onClick={handleBack} disabled={step === 0}>Back</Button>
          {step < steps.length - 2 && <Button onClick={handleNext}>Next</Button>}
          {step === steps.length - 2 && <Button onClick={handleNext}>View Summary</Button>}
          {step === steps.length - 1 && <Button onClick={() => onComplete(profile, goal, calculatedMetrics!)}>Get Started!</Button>}
        </div>
      </div>
    </div>
  );
};