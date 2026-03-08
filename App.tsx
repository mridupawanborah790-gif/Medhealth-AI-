
import React, { useState, useCallback, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { HealthProfile, Goal, CalculatedMetrics, FastingSession, DailyMetrics, GoalType, WeeklyPlan, FoodLogEntry, NutritionAnalysis } from './types';
import * as Calcs from './utils/calculations';
import { Spinner } from './components/common/Spinner';

interface AppState {
  onboardingComplete: boolean;
  profile: HealthProfile | null;
  goal: Goal | null;
  metrics: CalculatedMetrics | null;
}

// --- Local Storage Base Keys ---
const APP_STATE_KEY = 'medHealthAppState';
const FASTING_SESSION_KEY = 'medHealthFastingSession';
const DAILY_METRICS_KEY_PREFIX = 'medHealthDailyMetrics_';
const WEEKLY_PLAN_KEY = 'medHealthWeeklyPlan';
const FOOD_LOG_KEY = 'medHealthFoodLog';

// Static ID for local-only storage
const LOCAL_USER_ID = 'local-guest-user';

// --- Helper Functions & Defaults ---
const getTodayString = () => new Date().toISOString().split('T')[0];
const getUserKey = (base: string, userId: string) => `${base}_${userId}`;

const defaultAppState: AppState = {
  onboardingComplete: false,
  profile: null,
  goal: null,
  metrics: null,
};

const defaultDailyMetrics = (date: string): DailyMetrics => ({
  date,
  steps: 0,
  waterIntake: 0,
  sleepHours: 0,
  caloriesLogged: 0,
  proteinLogged: 0,
  workoutCompleted: false,
});

function App() {
  const [isDataLoading, setIsDataLoading] = useState(true);

  // States for user data
  const [appState, setAppState] = useState<AppState>(defaultAppState);
  const [fastingSession, setFastingSession] = useState<FastingSession | null>(null);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetrics>(defaultDailyMetrics(getTodayString()));
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [foodLog, setFoodLog] = useState<FoodLogEntry[]>([]);

  // --- Load Data on Mount ---
  useEffect(() => {
    const userId = LOCAL_USER_ID;

    try {
      const savedState = localStorage.getItem(getUserKey(APP_STATE_KEY, userId));
      if (savedState) setAppState(JSON.parse(savedState));
      
      const savedSession = localStorage.getItem(getUserKey(FASTING_SESSION_KEY, userId));
      if (savedSession) setFastingSession(JSON.parse(savedSession));
      
      const today = getTodayString();
      const savedMetrics = localStorage.getItem(getUserKey(DAILY_METRICS_KEY_PREFIX + today, userId));
      setDailyMetrics(savedMetrics ? JSON.parse(savedMetrics) : defaultDailyMetrics(today));
      
      const savedPlan = localStorage.getItem(getUserKey(WEEKLY_PLAN_KEY, userId));
      if (savedPlan) setWeeklyPlan(JSON.parse(savedPlan));
      
      const savedLog = localStorage.getItem(getUserKey(FOOD_LOG_KEY, userId));
      if (savedLog) setFoodLog(JSON.parse(savedLog));
      
    } catch (error) {
      console.error("Could not load local data:", error);
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  // --- Effects to SAVE data to localStorage ---
  useEffect(() => {
    if (isDataLoading) return;
    localStorage.setItem(getUserKey(APP_STATE_KEY, LOCAL_USER_ID), JSON.stringify(appState));
  }, [appState, isDataLoading]);

  useEffect(() => {
    if (isDataLoading) return;
    const key = getUserKey(FASTING_SESSION_KEY, LOCAL_USER_ID);
    if (fastingSession) localStorage.setItem(key, JSON.stringify(fastingSession));
    else localStorage.removeItem(key);
  }, [fastingSession, isDataLoading]);

  useEffect(() => {
    if (isDataLoading) return;
    const key = getUserKey(DAILY_METRICS_KEY_PREFIX + dailyMetrics.date, LOCAL_USER_ID);
    localStorage.setItem(key, JSON.stringify(dailyMetrics));
  }, [dailyMetrics, isDataLoading]);

  useEffect(() => {
    if (isDataLoading) return;
    const key = getUserKey(WEEKLY_PLAN_KEY, LOCAL_USER_ID);
    if (weeklyPlan) localStorage.setItem(key, JSON.stringify(weeklyPlan));
    else localStorage.removeItem(key);
  }, [weeklyPlan, isDataLoading]);
  
  useEffect(() => {
    if (isDataLoading) return;
    const key = getUserKey(FOOD_LOG_KEY, LOCAL_USER_ID);
    localStorage.setItem(key, JSON.stringify(foodLog));
  }, [foodLog, isDataLoading]);

  // Effect to handle date changes
  useEffect(() => {
    const checkDate = () => {
      const today = getTodayString();
      if (dailyMetrics.date !== today) {
        try {
          const savedMetrics = localStorage.getItem(getUserKey(DAILY_METRICS_KEY_PREFIX + today, LOCAL_USER_ID));
          setDailyMetrics(savedMetrics ? JSON.parse(savedMetrics) : defaultDailyMetrics(today));
        } catch (error) {
          console.error("Error loading metrics for new day:", error);
          setDailyMetrics(defaultDailyMetrics(today));
        }
      }
    };

    const intervalId = setInterval(checkDate, 60 * 1000);
    return () => clearInterval(intervalId);
  }, [dailyMetrics.date]);

  // --- Event Handlers ---
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to reset your local data and start over?")) {
      // Clear all local storage related to this app
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('medHealth')) {
          localStorage.removeItem(key);
        }
      });
      // Reset state
      setAppState(defaultAppState);
      setFastingSession(null);
      setDailyMetrics(defaultDailyMetrics(getTodayString()));
      setWeeklyPlan(null);
      setFoodLog([]);
    }
  };

  const handleOnboardingComplete = (
    profile: HealthProfile,
    goal: Goal,
    metrics: CalculatedMetrics
  ) => {
    setAppState({
      onboardingComplete: true,
      profile,
      goal,
      metrics,
    });
  };
  
  const handleAddFoodLog = (analysis: NutritionAnalysis, imageBase64: string) => {
    const today = getTodayString();
    
    const newLogEntry: FoodLogEntry = {
      id: Date.now(),
      date: today,
      analysis: analysis,
      imageBase64: imageBase64,
    };
    
    setFoodLog(prevLog => [...prevLog, newLogEntry]);
    
    if (dailyMetrics.date === today) {
        setDailyMetrics(prevMetrics => ({
            ...prevMetrics,
            caloriesLogged: prevMetrics.caloriesLogged + analysis.total.kcal,
            proteinLogged: prevMetrics.proteinLogged + analysis.total.protein_g,
        }));
    }
  };

  const handleUpdateGoal = useCallback((newGoal: Goal) => {
    if (!appState.profile || !appState.metrics) return;

    const { bmr, tdee, bmi, bmiCategory, idealWeightRange } = appState.metrics;
    const calorieBudget = Calcs.calculateCalorieBudget(tdee, newGoal.type);
    const macros = Calcs.calculateMacros(calorieBudget, appState.profile.weight, newGoal.type);
    
    const isGainGoal = newGoal.type === GoalType.WeightGain || newGoal.type === GoalType.BuildMuscle;
    const etaWeeks = (newGoal.type === GoalType.WeightLoss || isGainGoal) ? Calcs.calculateETA(appState.profile.weight, newGoal.targetWeight, newGoal.weeklyRate) : undefined;
    
    const newMetrics: CalculatedMetrics = {
      bmr, tdee, bmi, bmiCategory, idealWeightRange,
      calorieBudget,
      macros,
      etaWeeks,
    };
    
    setAppState(prevState => ({
      ...prevState,
      goal: newGoal,
      metrics: newMetrics,
    }));

  }, [appState.profile, appState.metrics]);

  const handleUpdateProfile = useCallback((newProfile: HealthProfile) => {
      if (!appState.goal) return;

      const bmr = Calcs.calculateBMR(newProfile);
      const tdee = Calcs.calculateTDEE(bmr, newProfile.activityLevel);
      const { bmi, category } = Calcs.calculateBMI(newProfile.weight, newProfile.height);
      const idealWeightRange = Calcs.calculateIdealWeightRange(newProfile.height);
      const calorieBudget = Calcs.calculateCalorieBudget(tdee, appState.goal.type);
      const macros = Calcs.calculateMacros(calorieBudget, newProfile.weight, appState.goal.type);
      
      const isGainGoal = appState.goal.type === GoalType.WeightGain || appState.goal.type === GoalType.BuildMuscle;
      const etaWeeks = (appState.goal.type === GoalType.WeightLoss || isGainGoal) ? Calcs.calculateETA(newProfile.weight, appState.goal.targetWeight, appState.goal.weeklyRate) : undefined;

      const newMetrics: CalculatedMetrics = {
          bmr, tdee, bmi, bmiCategory: category, idealWeightRange, calorieBudget, macros, etaWeeks
      };

      setAppState(prev => ({
          ...prev,
          profile: newProfile,
          metrics: newMetrics
      }));
  }, [appState.goal]);

  if (isDataLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900"><Spinner /></div>;
  }

  const renderContent = () => {
    if (!appState.onboardingComplete || !appState.profile || !appState.goal || !appState.metrics) {
      return <Onboarding onComplete={handleOnboardingComplete} />;
    }

    return (
       <Dashboard 
            profile={appState.profile} 
            goal={appState.goal} 
            metrics={appState.metrics}
            fastingSession={fastingSession}
            setFastingSession={setFastingSession}
            dailyMetrics={dailyMetrics}
            setDailyMetrics={setDailyMetrics}
            onUpdateGoal={handleUpdateGoal}
            onUpdateProfile={handleUpdateProfile}
            weeklyPlan={weeklyPlan}
            setWeeklyPlan={setWeeklyPlan}
            foodLog={foodLog}
            onAddFoodLog={handleAddFoodLog}
            onLogout={handleLogout}
        />
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {renderContent()}
    </div>
  );
}

export default App;
