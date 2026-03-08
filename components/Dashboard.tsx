import React, { useState } from 'react';
import { HealthProfile, Goal, CalculatedMetrics, FastingSession, DailyMetrics, WeeklyPlan, FoodLogEntry, NutritionAnalysis } from '../types';
import { SnapAndAnalyze } from './SnapAndAnalyze';
import { FastingTracker } from './FastingTracker';
import { WorkoutPlanner } from './WorkoutPlanner';
import { DietPlanner } from './DietPlanner';
import { DailyTracker } from './DailyTracker';
import { NotificationButton } from './common/NotificationButton';
import { ProfileModal } from './ProfileModal';
import { GoalSetter } from './GoalSetter';
import { AIAssistant } from './AIAssistant';
import { HistoryModal } from './HistoryModal';

interface DashboardProps {
  profile: HealthProfile;
  goal: Goal;
  metrics: CalculatedMetrics;
  fastingSession: FastingSession | null;
  setFastingSession: (session: FastingSession | null) => void;
  dailyMetrics: DailyMetrics;
  setDailyMetrics: (metrics: DailyMetrics) => void;
  onUpdateGoal: (newGoal: Goal) => void;
  onUpdateProfile: (newProfile: HealthProfile) => void;
  weeklyPlan: WeeklyPlan | null;
  setWeeklyPlan: (plan: WeeklyPlan | null) => void;
  foodLog: FoodLogEntry[];
  onAddFoodLog: (analysis: NutritionAnalysis, imageBase64: string) => void;
  onLogout: () => void;
}

const MetricCard: React.FC<{ title: string; value: string | number; unit?: string; className?: string }> = ({ title, value, unit, className }) => (
    <div className={`bg-slate-800 p-4 rounded-xl shadow-lg ${className}`}>
        <p className="text-sm text-slate-400">{title}</p>
        <p className="font-bold text-2xl text-slate-100">
            {value} <span className="text-base text-slate-400">{unit}</span>
        </p>
    </div>
);

const dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const Dashboard: React.FC<DashboardProps> = ({ profile, goal, metrics, fastingSession, setFastingSession, dailyMetrics, setDailyMetrics, onUpdateGoal, onUpdateProfile, weeklyPlan, setWeeklyPlan, foodLog, onAddFoodLog, onLogout }) => {
  const [isAnalyzerOpen, setIsAnalyzerOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isWorkoutPlannerOpen, setIsWorkoutPlannerOpen] = useState(false);
  const [isDietPlannerOpen, setIsDietPlannerOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isGoalSetterOpen, setIsGoalSetterOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  
  const handleLogMeal = (analysis: NutritionAnalysis, imageBase64: string) => {
    onAddFoodLog(analysis, imageBase64);
  };

  const handleUpdateMetrics = (newMetrics: Partial<DailyMetrics>) => {
    setDailyMetrics({ ...dailyMetrics, ...newMetrics });
  };
  
  const todayName = dayMap[new Date().getDay()];
  const todaysWorkout = weeklyPlan?.find(p => p.day === todayName);

  const getWorkoutIcon = (activity?: 'gym' | 'yoga' | 'rest') => {
    switch(activity) {
      case 'gym': return '🏋️';
      case 'yoga': return '🧘‍♀️';
      case 'rest': return '🛌';
      default: return '💪';
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-8 animate-fadeIn">
      {isAnalyzerOpen && <SnapAndAnalyze onClose={() => setIsAnalyzerOpen(false)} onLogMeal={handleLogMeal} />}
      {isHistoryOpen && <HistoryModal onClose={() => setIsHistoryOpen(false)} log={foodLog} />}
      {isWorkoutPlannerOpen && <WorkoutPlanner onClose={() => setIsWorkoutPlannerOpen(false)} profile={profile} goal={goal} weeklyPlan={weeklyPlan} setWeeklyPlan={setWeeklyPlan} dailyMetrics={dailyMetrics} setDailyMetrics={setDailyMetrics} />}
      {isDietPlannerOpen && <DietPlanner onClose={() => setIsDietPlannerOpen(false)} profile={profile} goal={goal} metrics={metrics} />}
      {isProfileModalOpen && <ProfileModal onClose={() => setIsProfileModalOpen(false)} profile={profile} goal={goal} metrics={metrics} onUpdateProfile={onUpdateProfile} />}
      {isGoalSetterOpen && <GoalSetter onClose={() => setIsGoalSetterOpen(false)} currentGoal={goal} currentWeight={profile.weight} onSave={onUpdateGoal} />}
      {isAssistantOpen && <AIAssistant profile={profile} onClose={() => setIsAssistantOpen(false)} />}

      <header className="flex justify-between items-center animate-slideInUp" style={{ animationDelay: '100ms' }}>
        <div>
          <h1 className="text-3xl font-bold">Welcome back, <span className="text-primary">{profile.name}</span>!</h1>
          <p className="text-slate-400">Here's your plan for today.</p>
        </div>
        <div className="flex items-center space-x-2">
            <button onClick={() => setIsProfileModalOpen(true)} title="View My Profile" className="text-3xl p-2 rounded-full hover:bg-slate-800 transition-colors">
              👤
            </button>
            <NotificationButton />
             <button onClick={onLogout} title="Log Out" className="p-2 rounded-full hover:bg-slate-800 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
        </div>
      </header>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slideInUp" style={{ animationDelay: '200ms' }}>
        <MetricCard title="Calorie Budget" value={Math.round(metrics.calorieBudget)} unit="kcal" className="col-span-2 md:col-span-1" />
        <MetricCard title="Current BMI" value={metrics.bmi} />
        <MetricCard title="Weight" value={profile.weight} unit="kg" />
        <div className="bg-slate-800 p-4 rounded-xl shadow-lg col-span-2 md:col-span-1">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-400">Your Goal</p>
              <p className="font-bold text-2xl text-slate-100">{goal.targetWeight} <span className="text-base text-slate-400">kg</span></p>
               {metrics.etaWeeks && isFinite(metrics.etaWeeks) ? (
                <p className="text-xs text-primary">{metrics.etaWeeks} weeks ETA</p>
              ) : (
                <p className="text-xs text-primary">{goal.type}</p>
              )}
            </div>
            <button onClick={() => setIsGoalSetterOpen(true)} className="text-sm bg-slate-700 hover:bg-slate-600 rounded-md px-3 py-1 font-semibold">Edit Goal</button>
          </div>
        </div>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slideInUp" style={{ animationDelay: '300ms' }}>
         <div className="bg-slate-800 p-6 rounded-xl shadow-lg text-center space-y-4 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold">Log a Meal</h2>
              <p className="text-slate-400">Snap a photo to log your meal, or view your past entries.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button 
                onClick={() => setIsAnalyzerOpen(true)}
                className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-slate-900 font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:-translate-y-1"
              >
                <span role="img" aria-label="camera" className="mr-2">📸</span>
                Snap & Analyze
              </button>
              <button 
                onClick={() => setIsHistoryOpen(true)}
                className="w-full sm:w-auto bg-slate-700 hover:bg-slate-600 text-slate-100 font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:-translate-y-1"
              >
                <span role="img" aria-label="scroll" className="mr-2">📜</span>
                View Log
              </button>
            </div>
          </div>
         <div className="bg-slate-800 p-6 rounded-xl shadow-lg text-center space-y-4 flex flex-col justify-between">
            <div>
              <h2 className="text-2xl font-bold">AI Diet Plan</h2>
              <p className="text-slate-400">Get a personalized diet master plan generated just for you.</p>
            </div>
            <button 
              onClick={() => setIsDietPlannerOpen(true)}
              className="w-full md:w-auto bg-primary hover:bg-primary-dark text-slate-900 font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:-translate-y-1"
            >
              <span role="img" aria-label="brain" className="mr-2">🧠</span>
              Create My Plan
            </button>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slideInUp" style={{ animationDelay: '400ms' }}>
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg flex flex-col justify-between text-center space-y-3">
          <h3 className="font-semibold text-xl">Today's Workout</h3>
          {todaysWorkout ? (
            <div className='flex flex-col items-center'>
              <span className='text-4xl mb-1'>{getWorkoutIcon(todaysWorkout.activity)}</span>
              <p className="font-bold text-primary">{todaysWorkout.focus}</p>
              <p className="text-slate-400 text-xs capitalize">({todaysWorkout.activity})</p>
            </div>
          ) : (
            <p className="text-slate-400 text-sm">No plan set for today.</p>
          )}
          <button onClick={() => setIsWorkoutPlannerOpen(true)} className="w-full bg-slate-700 hover:bg-slate-600 text-slate-100 font-bold py-2 px-4 rounded-lg">
            {weeklyPlan ? 'View Weekly Plan' : 'Create AI Plan'}
          </button>
        </div>
        <FastingTracker session={fastingSession} setSession={setFastingSession} />
      </div>
      
      <div className="animate-slideInUp" style={{ animationDelay: '500ms' }}>
        <DailyTracker 
          metrics={dailyMetrics} 
          onUpdate={handleUpdateMetrics}
          calorieGoal={metrics.calorieBudget}
          proteinGoal={metrics.macros.protein}
        />
      </div>

      <button
        onClick={() => setIsAssistantOpen(true)}
        className="fixed bottom-6 right-6 bg-primary text-slate-900 rounded-full h-16 w-16 flex items-center justify-center shadow-lg text-3xl transform transition-transform hover:scale-110"
        title="Chat with MON"
      >
        💬
      </button>

    </div>
  );
};