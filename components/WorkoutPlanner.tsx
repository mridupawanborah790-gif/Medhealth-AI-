
import React, { useState } from 'react';
import { HealthProfile, Goal, WeeklyPlan, WorkoutType, DailyMetrics } from '../types';
import { generateWeeklyWorkoutPlan, getExerciseTips } from '../services/geminiService';
import { Button } from './common/Button';
import { Spinner } from './common/Spinner';

interface WorkoutPlannerProps {
  onClose: () => void;
  profile: HealthProfile;
  goal: Goal;
  weeklyPlan: WeeklyPlan | null;
  setWeeklyPlan: (plan: WeeklyPlan | null) => void;
  dailyMetrics: DailyMetrics;
  setDailyMetrics: (metrics: DailyMetrics) => void;
}

const dayMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const todayName = dayMap[new Date().getDay()];


const getWorkoutIcon = (activity?: 'gym' | 'yoga' | 'rest') => {
    switch(activity) {
      case 'gym': return '🏋️';
      case 'yoga': return '🧘‍♀️';
      case 'rest': return '🛌';
      default: return '💪';
    }
}

export const WorkoutPlanner: React.FC<WorkoutPlannerProps> = ({ onClose, profile, goal, weeklyPlan, setWeeklyPlan, dailyMetrics, setDailyMetrics }) => {
    const [preference, setPreference] = useState<WorkoutType>(WorkoutType.Gym);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [tips, setTips] = useState<{ [exerciseName: string]: string }>({});
    const [loadingTips, setLoadingTips] = useState<string | null>(null);
    
    const handleGeneratePlan = async () => {
        setIsLoading(true);
        setError(null);
        setTips({}); // Clear old tips
        try {
            const plan = await generateWeeklyWorkoutPlan(profile, goal, preference);
            setWeeklyPlan(plan);
        } catch (err) {
            console.error(err);
            setError("Failed to generate workout plan. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleToggleCompletion = (isToday: boolean, isChecked: boolean) => {
        if (isToday) {
            setDailyMetrics({ ...dailyMetrics, workoutCompleted: isChecked });
        }
    };

    const handleGetTips = async (exerciseName: string) => {
        if (tips[exerciseName]) { // Toggle visibility
            const newTips = {...tips};
            delete newTips[exerciseName];
            setTips(newTips);
            return;
        }
        setLoadingTips(exerciseName);
        try {
            const result = await getExerciseTips(profile, exerciseName);
            setTips(prev => ({...prev, [exerciseName]: result}));
        } catch (err) {
            console.error("Failed to get tips:", err);
            setTips(prev => ({...prev, [exerciseName]: "Sorry, couldn't fetch tips right now."}));
        } finally {
            setLoadingTips(null);
        }
    }

    return (
     <div className="fixed inset-0 bg-slate-900 bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-scaleIn">
        <div className="flex-shrink-0 flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">My Weekly Workout Plan</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100 text-3xl font-bold">&times;</button>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2 space-y-4">
            <div className="bg-slate-900 p-4 rounded-lg space-y-3">
                <p className="text-sm font-medium text-slate-400">Select your primary focus and let our AI generate a balanced weekly plan for you.</p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <select
                        value={preference}
                        onChange={e => setPreference(e.target.value as WorkoutType)}
                        className="w-full bg-slate-700 rounded p-3 border border-slate-600 focus:ring-primary focus:border-primary"
                    >
                        <option value={WorkoutType.Gym}>Gym-focused Plan</option>
                        <option value={WorkoutType.Yoga}>Yoga-focused Plan</option>
                    </select>
                    <Button onClick={handleGeneratePlan} disabled={isLoading} className="w-full sm:w-auto flex-shrink-0">
                        {isLoading ? 'Generating...' : (weeklyPlan ? 'Regenerate Plan' : 'Generate AI Plan')}
                    </Button>
                </div>
                {error && <p className="text-accent-red text-center text-sm mt-2">{error}</p>}
            </div>

            {isLoading && !weeklyPlan && (
                <div className="flex justify-center py-8">
                    <Spinner />
                </div>
            )}
            
            {weeklyPlan && (
                <div className="space-y-3 animate-fadeIn">
                    {weeklyPlan.map((plan, index) => {
                       const isToday = plan.day === todayName;
                       const isCompleted = isToday && dailyMetrics.workoutCompleted;

                       return (
                        <div key={index} className={`p-4 rounded-lg flex flex-col gap-3 transition-all ${isToday ? 'bg-slate-700 border-2 border-primary' : 'bg-slate-900'}`}>
                           <div className="flex items-start gap-4">
                                <div className="text-3xl pt-1">{getWorkoutIcon(plan.activity)}</div>
                                <div className="flex-grow">
                                    <p className="font-bold">{plan.day} - <span className="text-primary-light">{plan.focus}</span></p>
                                    <p className="text-sm text-slate-400">💡 {plan.trainerNotes}</p>
                                </div>
                                <div className="flex-shrink-0">
                                    <label className="flex items-center space-x-2 cursor-pointer" title={isToday ? 'Mark as completed' : 'Can only complete today\'s workout'}>
                                        <input
                                            type="checkbox"
                                            checked={isCompleted}
                                            disabled={!isToday}
                                            onChange={(e) => handleToggleCompletion(isToday, e.target.checked)}
                                            className="h-6 w-6 rounded text-primary bg-slate-600 border-slate-500 focus:ring-primary-dark appearance-none checked:bg-primary disabled:cursor-not-allowed"
                                            style={{
                                                backgroundImage: isCompleted ? `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='black' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e")` : 'none',
                                                backgroundPosition: 'center',
                                                backgroundRepeat: 'no-repeat',
                                            }}
                                        />
                                    </label>
                                </div>
                           </div>
                           
                            {plan.activity === 'gym' && plan.exercises && plan.exercises.length > 0 && (
                                <div className="pl-12 space-y-2">
                                    <ul className="space-y-2">
                                        {plan.exercises.map((ex, i) => (
                                            <li key={i} className="bg-slate-800 p-2 rounded-md flex flex-col text-sm transition-all duration-300">
                                                <div className="flex justify-between items-center">
                                                    <span className="font-medium">{ex.name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-slate-400 text-xs">{ex.sets} x {ex.reps}</span>
                                                        <button 
                                                            onClick={() => handleGetTips(ex.name)} 
                                                            disabled={loadingTips === ex.name}
                                                            className="text-xs bg-slate-700 hover:bg-slate-600 rounded-full px-2 py-1 font-semibold transition-colors"
                                                            title={`Get AI tips for ${ex.name}`}
                                                        >
                                                            {loadingTips === ex.name ? '...' : (tips[ex.name] ? 'Hide' : '💡 Get Tips')}
                                                        </button>
                                                    </div>
                                                </div>
                                                {tips[ex.name] && (
                                                    <div className="mt-2 text-xs text-slate-300 border-l-2 border-primary-dark pl-3 whitespace-pre-wrap animate-fadeIn">
                                                        {tips[ex.name]}
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                             {plan.activity === 'yoga' && plan.poses && plan.poses.length > 0 && (
                                <div className="pl-12 space-y-2">
                                    <ul className="space-y-1">
                                        {plan.poses.map((pose, i) => (
                                            <li key={i} className="flex justify-between items-center bg-slate-800 p-2 rounded-md text-sm">
                                                <span className="font-medium">{pose.name}</span>
                                                <span className="font-mono text-slate-400 text-xs">{pose.duration}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                       );
                    })}
                </div>
            )}
        </div>
      </div>
    </div>
    )
}