import React, { useState, useEffect } from 'react';
import { FastingPlan, FastingSession } from '../types';
import { Button } from './common/Button';
import { getRandomQuote } from '../utils/quotes';
import { sendAppNotification } from '../utils/notifications';

interface FastingTrackerProps {
  session: FastingSession | null;
  setSession: (session: FastingSession | null) => void;
}

const getHoursFromPlan = (plan: FastingPlan): number => {
    return parseInt(plan.split(':')[0], 10);
};

const formatTime = (ms: number): string => {
    if (ms <= 0) return '00:00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const FastingTracker: React.FC<FastingTrackerProps> = ({ session, setSession }) => {
  const [selectedPlan, setSelectedPlan] = useState<FastingPlan>(FastingPlan['16:8']);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (session) {
      const updateTimer = () => {
        const now = Date.now();
        const remaining = session.endTime - now;
        setTimeLeft(remaining > 0 ? remaining : 0);
        
        if (remaining <= 1000 && remaining > 0) { // Check if timer is about to hit zero
          setTimeout(() => {
            const isNowFasting = !session.isFasting;
            
            if (isNowFasting) {
              sendAppNotification("Fasting window started! ⏱️", getRandomQuote());
            } else {
              sendAppNotification("Eating window has begun! 🍽️", "Time to refuel your body. Enjoy your meal!");
            }
            
            const newEndTime = Date.now() + (isNowFasting ? getHoursFromPlan(session.plan) : (24 - getHoursFromPlan(session.plan))) * 60 * 60 * 1000;
            setSession({
              ...session,
              isFasting: isNowFasting,
              startTime: Date.now(),
              endTime: newEndTime
            });
          }, 1000); // Delay state update slightly to ensure notification fires at the right time
        }
      };
      
      updateTimer(); 
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [session, setSession]);


  const handleStartFasting = () => {
    const now = Date.now();
    const fastingHours = getHoursFromPlan(selectedPlan);
    const endTime = now + fastingHours * 60 * 60 * 1000;
    setSession({
      plan: selectedPlan,
      startTime: now,
      endTime: endTime,
      isFasting: true,
    });
    sendAppNotification("Your fast has begun! ⏱️", `You're on your way. ${getRandomQuote()}`);
  };

  const handleEndFasting = () => {
    sendAppNotification("Fasting session ended.", "Great job! Remember to stay hydrated.");
    setSession(null);
    setTimeLeft(0);
  };
  
  if (session) {
    return (
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg text-center space-y-3">
            <p className="text-sm text-slate-400">Current Plan: {session.plan}</p>
            <h3 className="text-2xl font-bold">{session.isFasting ? 'Fasting Window' : 'Eating Window'}</h3>
            <p className={`text-4xl font-mono font-bold text-primary ${session.isFasting ? 'animate-pulse' : ''}`}>{formatTime(timeLeft)}</p>
            <p className="text-slate-400 text-xs">
                Ends at {new Date(session.endTime).toLocaleTimeString()}
            </p>
            <Button variant="secondary" onClick={handleEndFasting} className="w-full">End Session</Button>
        </div>
    )
  }

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg space-y-4">
      <h3 className="text-xl font-semibold text-center">Intermittent Fasting</h3>
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Choose your plan:</label>
        <select 
            value={selectedPlan} 
            onChange={e => setSelectedPlan(e.target.value as FastingPlan)}
            className="w-full bg-slate-700 rounded p-2 border border-slate-600 focus:ring-primary focus:border-primary"
        >
            {Object.values(FastingPlan).map(plan => <option key={plan} value={plan}>{plan} Fast</option>)}
        </select>
      </div>
      <Button onClick={handleStartFasting} className="w-full">Start Fasting</Button>
    </div>
  );
};
