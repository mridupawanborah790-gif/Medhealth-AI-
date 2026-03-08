import React from 'react';
import { DailyMetrics } from '../types';
import { CircularProgressBar } from './common/CircularProgressBar';

interface DailyTrackerProps {
    metrics: DailyMetrics;
    onUpdate: (newMetrics: Partial<DailyMetrics>) => void;
    calorieGoal: number;
    proteinGoal: number;
}

const GOALS = {
    steps: 10000,
    waterIntake: 8, // glasses
    sleepHours: 8,
};

const TrackerItem: React.FC<{ title: string; icon: string; children: React.ReactNode; delay: number; }> = ({ title, icon, children, delay }) => (
    <div className="bg-slate-800 p-4 rounded-xl shadow-lg flex flex-col items-center justify-center text-center space-y-2 animate-fadeIn" style={{ animationDelay: `${delay}ms`}}>
        <div className="flex items-center space-x-2">
            <span className="text-xl">{icon}</span>
            <h4 className="font-semibold text-md text-slate-400">{title}</h4>
        </div>
        {children}
    </div>
);


export const DailyTracker: React.FC<DailyTrackerProps> = ({ metrics, onUpdate, calorieGoal, proteinGoal }) => {
    
    const handleSyncSteps = () => {
        alert(
`**Native Feature Simulation**

In the MedHealth mobile app, this button would securely connect to your phone's health service (Apple Health or Google Fit) to automatically sync your steps.

Web applications cannot directly access this data for security reasons. We'll add some simulated steps for now!`
        );

        const syncedSteps = Math.floor(Math.random() * (GOALS.steps - metrics.steps + 1)) + metrics.steps;
        onUpdate({ steps: Math.min(syncedSteps, GOALS.steps + 2000) });
    };
    
    return (
        <div className="bg-transparent p-0 rounded-xl">
             <h3 className="text-2xl font-bold mb-4 text-center md:text-left">Today's Progress</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <TrackerItem title="Calories" icon="🔥" delay={0}>
                    <CircularProgressBar size={100} strokeWidth={8} progress={(metrics.caloriesLogged / calorieGoal) * 100} color="text-accent-red">
                        <div className="text-center">
                            <p className="text-xl font-bold">{Math.round(metrics.caloriesLogged)}</p>
                            <p className="text-xs text-slate-400">/ {Math.round(calorieGoal)}</p>
                        </div>
                    </CircularProgressBar>
                </TrackerItem>

                 <TrackerItem title="Protein" icon="💪" delay={50}>
                    <CircularProgressBar size={100} strokeWidth={8} progress={(metrics.proteinLogged / proteinGoal) * 100} color="text-accent-sky">
                         <div className="text-center">
                            <p className="text-xl font-bold">{Math.round(metrics.proteinLogged)}</p>
                            <p className="text-xs text-slate-400">/ {proteinGoal}g</p>
                        </div>
                    </CircularProgressBar>
                </TrackerItem>

                <TrackerItem title="Water" icon="💧" delay={100}>
                    <CircularProgressBar size={100} strokeWidth={8} progress={(metrics.waterIntake / GOALS.waterIntake) * 100} color="text-accent-blue">
                         <div className="text-center">
                            <p className="text-xl font-bold">{metrics.waterIntake}</p>
                            <p className="text-xs text-slate-400">/ {GOALS.waterIntake} glasses</p>
                        </div>
                    </CircularProgressBar>
                    <div className="flex items-center space-x-4 pt-2">
                        <button onClick={() => onUpdate({ waterIntake: Math.max(0, metrics.waterIntake - 1) })} className="bg-slate-700 rounded-full h-6 w-6 text-lg font-bold flex items-center justify-center">-</button>
                        <button onClick={() => onUpdate({ waterIntake: metrics.waterIntake + 1 })} className="bg-slate-700 rounded-full h-6 w-6 text-lg font-bold flex items-center justify-center">+</button>
                    </div>
                </TrackerItem>

                <TrackerItem title="Steps" icon="👟" delay={150}>
                    <CircularProgressBar size={100} strokeWidth={8} progress={(metrics.steps / GOALS.steps) * 100} color="text-primary">
                         <div className="text-center">
                            <p className="text-xl font-bold">{metrics.steps}</p>
                            <p className="text-xs text-slate-400">/ {GOALS.steps}</p>
                        </div>
                    </CircularProgressBar>
                     <button onClick={handleSyncSteps} className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-100 font-bold py-1 px-3 rounded-full mt-2">
                        Sync with Device
                    </button>
                </TrackerItem>

                <TrackerItem title="Sleep" icon="😴" delay={200}>
                    <CircularProgressBar size={100} strokeWidth={8} progress={(metrics.sleepHours / GOALS.sleepHours) * 100} color="text-accent-purple">
                         <div className="text-center">
                             <div className="flex items-baseline justify-center">
                                <input
                                    type="number"
                                    step="0.5"
                                    value={metrics.sleepHours}
                                    onChange={(e) => onUpdate({ sleepHours: parseFloat(e.target.value) || 0 })}
                                    className="w-12 bg-transparent text-xl font-bold text-center outline-none"
                                    placeholder="0"
                                />
                                <span className="text-xs text-slate-400">hrs</span>
                            </div>
                            <p className="text-xs text-slate-400">Goal: {GOALS.sleepHours} hrs</p>
                        </div>
                    </CircularProgressBar>
                </TrackerItem>

                <TrackerItem title="Workout" icon="🏋️" delay={250}>
                    <div className="flex flex-col items-center justify-center h-[100px] w-[100px]">
                         <label className="flex flex-col items-center justify-center space-y-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={metrics.workoutCompleted}
                                onChange={(e) => onUpdate({ workoutCompleted: e.target.checked })}
                                className="h-8 w-8 rounded text-primary bg-slate-700 border-slate-600 focus:ring-primary-dark appearance-none checked:bg-primary"
                                style={{
                                    backgroundImage: metrics.workoutCompleted ? `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='black' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e")` : 'none',
                                    backgroundPosition: 'center',
                                    backgroundRepeat: 'no-repeat',
                                }}
                            />
                            <span className={`text-lg font-medium ${metrics.workoutCompleted ? 'text-primary' : ''}`}>{metrics.workoutCompleted ? 'Complete!' : 'Mark as Done'}</span>
                        </label>
                    </div>
                </TrackerItem>
            </div>
        </div>
    );
};