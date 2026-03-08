import React, { useState } from 'react';
import { HealthProfile, Goal, CalculatedMetrics, Gender, ActivityLevel } from '../types';
import { Button } from './common/Button';

interface ProfileModalProps {
  onClose: () => void;
  profile: HealthProfile;
  goal: Goal;
  metrics: CalculatedMetrics;
  onUpdateProfile: (profile: HealthProfile) => void;
}

const ProfileStat: React.FC<{ label: string; value: string | number; unit?: string }> = ({ label, value, unit }) => (
  <div className="bg-slate-900 p-3 rounded-lg">
    <p className="text-sm text-slate-400">{label}</p>
    <p className="text-lg font-bold">
      {value} <span className="text-sm text-slate-400">{unit}</span>
    </p>
  </div>
);

export const ProfileModal: React.FC<ProfileModalProps> = ({ onClose, profile, goal, metrics, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<HealthProfile>(profile);

  const handleSave = () => {
    onUpdateProfile(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">{isEditing ? 'Edit Profile' : 'My Profile'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100 text-3xl font-bold">&times;</button>
        </div>
        
        {isEditing ? (
            <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-400">Name</label>
                    <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-slate-700 rounded p-2 mt-1 border border-slate-600 focus:ring-primary focus:border-primary"/>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400">Age</label>
                        <input type="number" value={editForm.age} onChange={e => setEditForm({...editForm, age: +e.target.value})} className="w-full bg-slate-700 rounded p-2 mt-1 border border-slate-600 focus:ring-primary focus:border-primary"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400">Sex</label>
                        <select value={editForm.gender} onChange={e => setEditForm({...editForm, gender: e.target.value as Gender})} className="w-full bg-slate-700 rounded p-2 mt-1 border border-slate-600 focus:ring-primary focus:border-primary">
                            {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400">Height (cm)</label>
                        <input type="number" value={editForm.height} onChange={e => setEditForm({...editForm, height: +e.target.value})} className="w-full bg-slate-700 rounded p-2 mt-1 border border-slate-600 focus:ring-primary focus:border-primary"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400">Weight (kg)</label>
                        <input type="number" value={editForm.weight} onChange={e => setEditForm({...editForm, weight: +e.target.value})} className="w-full bg-slate-700 rounded p-2 mt-1 border border-slate-600 focus:ring-primary focus:border-primary"/>
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-400">Activity Level</label>
                    <select value={editForm.activityLevel} onChange={e => setEditForm({...editForm, activityLevel: e.target.value as ActivityLevel})} className="w-full bg-slate-700 rounded p-2 mt-1 border border-slate-600 focus:ring-primary focus:border-primary">
                        {Object.values(ActivityLevel).map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>
                <div className="flex space-x-3 pt-2">
                    <Button variant="secondary" onClick={handleCancel} className="flex-1">Cancel</Button>
                    <Button onClick={handleSave} className="flex-1">Save</Button>
                </div>
            </div>
        ) : (
            <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold mb-2 border-b border-slate-700 pb-1">Personal Details</h3>
                <div className="grid grid-cols-2 gap-3">
                <ProfileStat label="Name" value={profile.name} />
                <ProfileStat label="Age" value={profile.age} unit="years" />
                <ProfileStat label="Sex" value={profile.gender} />
                <ProfileStat label="Activity" value={profile.activityLevel} />
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2 border-b border-slate-700 pb-1">Health Vitals</h3>
                <div className="grid grid-cols-2 gap-3">
                <ProfileStat label="Height" value={profile.height} unit="cm" />
                <ProfileStat label="Weight" value={profile.weight} unit="kg" />
                <ProfileStat label="BMI" value={metrics.bmi} unit={`(${metrics.bmiCategory})`} />
                <ProfileStat label="Ideal Weight" value={`${metrics.idealWeightRange.min}-${metrics.idealWeightRange.max}`} unit="kg" />
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold mb-2 border-b border-slate-700 pb-1">My Goal & Plan</h3>
                <div className="grid grid-cols-2 gap-3">
                <ProfileStat label="Goal Type" value={goal.type} />
                <ProfileStat label="Target Weight" value={goal.targetWeight} unit="kg" />
                <ProfileStat label="Calorie Budget" value={Math.round(metrics.calorieBudget)} unit="kcal" />
                <ProfileStat label="Protein" value={metrics.macros.protein} unit="g" />
                <ProfileStat label="Fat" value={metrics.macros.fat} unit="g" />
                <ProfileStat label="Carbs" value={metrics.macros.carbs} unit="g" />
                </div>
            </div>

            <div className="pt-2 flex flex-col gap-3">
                 <Button onClick={() => setIsEditing(true)} className="w-full">
                    Edit Profile
                </Button>
                 <Button variant="secondary" onClick={onClose} className="w-full">
                    Close
                </Button>
            </div>
            </div>
        )}
      </div>
    </div>
  );
};