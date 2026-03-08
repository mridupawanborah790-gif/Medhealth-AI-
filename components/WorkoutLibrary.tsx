import React, { useState } from 'react';
import { Workout } from '../types';

const workouts: Workout[] = [
  {
    id: 'full_body_beginner_15m',
    title: 'Full Body Quick Start',
    duration: 15,
    level: 'Beginner',
    equipment: ['None'],
    moves: [
      { name: 'Jumping Jacks', duration: 60 },
      { name: 'Rest', duration: 15 },
      { name: 'Bodyweight Squats', duration: 45, reps: '12-15' },
      { name: 'Rest', duration: 15 },
      { name: 'Push-ups (on knees if needed)', duration: 45, reps: '8-12' },
      { name: 'Rest', duration: 15 },
      { name: 'Plank', duration: 45 },
      { name: 'Rest', duration: 15 },
      { name: 'Glute Bridges', duration: 45, reps: '15-20' },
      { name: '--- Repeat Circuit 2x ---', duration: 0 },
    ],
  },
  {
    id: 'core_crusher_10m',
    title: '10-Min Core Crusher',
    duration: 10,
    level: 'Intermediate',
    equipment: ['None'],
    moves: [
      { name: 'Crunches', duration: 45, reps: "15-20" },
      { name: 'Rest', duration: 15 },
      { name: 'Leg Raises', duration: 45, reps: "15-20" },
      { name: 'Rest', duration: 15 },
      { name: 'Bicycle Crunches', duration: 45, reps: "20-30" },
      { name: 'Rest', duration: 15 },
      { name: 'Plank', duration: 60 },
    ],
  },
  {
    id: 'yoga_flow_20m',
    title: 'Morning Yoga Flow',
    duration: 20,
    level: 'Beginner',
    equipment: ['Yoga Mat'],
    moves: [
      { name: 'Mountain Pose', duration: 60 },
      { name: 'Forward Fold', duration: 60 },
      { name: 'Plank to Downward Dog (Flow)', duration: 120 },
      { name: 'Warrior II (Right)', duration: 60 },
      { name: 'Warrior II (Left)', duration: 60 },
      { name: "Child's Pose", duration: 120 },
    ],
  },
];

const WorkoutCard: React.FC<{ workout: Workout, onSelect: () => void }> = ({ workout, onSelect }) => (
    <div onClick={onSelect} className="bg-slate-800 p-4 rounded-lg shadow-md cursor-pointer hover:bg-slate-700 transition-colors">
        <h4 className="font-bold text-primary-light">{workout.title}</h4>
        <p className="text-sm text-slate-400">{workout.duration} min | {workout.level}</p>
        <p className="text-xs mt-1">Equipment: {workout.equipment.join(', ')}</p>
    </div>
);

const WorkoutDetails: React.FC<{ workout: Workout, onBack: () => void }> = ({ workout, onBack }) => (
    <div>
        <button onClick={onBack} className="text-primary mb-4 font-semibold">&larr; Back to library</button>
        <h3 className="text-2xl font-bold">{workout.title}</h3>
        <div className="flex space-x-4 text-sm text-slate-400 my-2">
            <span>{workout.duration} min</span>
            <span>&bull;</span>
            <span>{workout.level}</span>
            <span>&bull;</span>
            <span>{workout.equipment.join(', ')}</span>
        </div>
        <ul className="space-y-3 mt-4 max-h-60 overflow-y-auto pr-2">
            {workout.moves.map((move, index) => (
                <li key={index} className="flex justify-between p-3 bg-slate-900 rounded-md">
                    <div>
                        <p className="font-medium">{move.name}</p>
                        {move.reps && <p className="text-xs text-slate-400">Reps: {move.reps}</p>}
                    </div>
                    <p className="text-slate-400">{move.duration > 0 ? `${move.duration}s` : ''}</p>
                </li>
            ))}
        </ul>
    </div>
);


interface WorkoutLibraryProps {
  onClose: () => void;
}

export const WorkoutLibrary: React.FC<WorkoutLibraryProps> = ({ onClose }) => {
    const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

    return (
     <div className="fixed inset-0 bg-slate-900 bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">Workout Library</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100 text-3xl font-bold">&times;</button>
        </div>

        {!selectedWorkout ? (
             <div className="space-y-4">
                {workouts.map(w => <WorkoutCard key={w.id} workout={w} onSelect={() => setSelectedWorkout(w)} />)}
            </div>
        ) : (
            <WorkoutDetails workout={selectedWorkout} onBack={() => setSelectedWorkout(null)} />
        )}
       
      </div>
    </div>
    )
}