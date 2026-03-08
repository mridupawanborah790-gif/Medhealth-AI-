
import React, { useState, useMemo } from 'react';
import { Goal, GoalType } from '../types';
import * as Calcs from '../utils/calculations';
import { Button } from './common/Button';

interface GoalSetterProps {
  onClose: () => void;
  currentGoal: Goal;
  currentWeight: number;
  onSave: (newGoal: Goal) => void;
}

export const GoalSetter: React.FC<GoalSetterProps> = ({ onClose, currentGoal, currentWeight, onSave }) => {
  const [goal, setGoal] = useState<Goal>(currentGoal);

  const isGainGoal = useMemo(() => goal.type === GoalType.WeightGain || goal.type === GoalType.BuildMuscle, [goal.type]);
  const showTargetFields = useMemo(() => goal.type === GoalType.WeightLoss || isGainGoal, [goal.type, isGainGoal]);

  const etaWeeks = useMemo(() => {
    if (showTargetFields && goal.targetWeight !== currentWeight) {
      return Calcs.calculateETA(currentWeight, goal.targetWeight, goal.weeklyRate);
    }
    return null;
  }, [goal, currentWeight, showTargetFields]);

  const handleSave = () => {
    onSave(goal);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">Update Your Goal</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100 text-3xl font-bold">&times;</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400">Primary Goal</label>
            <select
              value={goal.type}
              onChange={(e) => setGoal({ ...goal, type: e.target.value as GoalType })}
              className="w-full bg-slate-700 rounded p-3 mt-1 border border-slate-600 focus:ring-primary focus:border-primary"
            >
              {Object.values(GoalType).map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {showTargetFields && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-400">Target Weight (kg)</label>
                <input
                  type="number"
                  value={goal.targetWeight}
                  onChange={(e) => setGoal({ ...goal, targetWeight: +e.target.value })}
                  className="w-full bg-slate-700 rounded p-3 mt-1 border border-slate-600 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400">Weekly Rate (kg)</label>
                <select
                  value={goal.weeklyRate}
                  onChange={(e) => setGoal({ ...goal, weeklyRate: +e.target.value })}
                  className="w-full bg-slate-700 rounded p-3 mt-1 border border-slate-600 focus:ring-primary focus:border-primary"
                >
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

          {etaWeeks !== null && isFinite(etaWeeks) && (
            <div className="p-4 bg-slate-900 rounded-lg text-center">
              <p className="text-slate-400">Estimated Time to Goal</p>
              <p className="text-2xl font-bold text-primary">{etaWeeks} weeks</p>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  );
};