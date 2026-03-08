
import React, { useState, useEffect } from 'react';
// FIX: Rename imported type to avoid name collision with the component.
import { StandReminder as StandReminderType } from '../types';
import { Button } from './common/Button';
import { sendAppNotification, requestNotificationPermission } from '../utils/notifications';

interface StandReminderProps {
  reminder: StandReminderType;
  setReminder: (reminder: StandReminderType) => void;
}

const formatTime = (ms: number): string => {
    if (ms <= 0) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const StandReminder: React.FC<StandReminderProps> = ({ reminder, setReminder }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (reminder.isEnabled && reminder.nextReminderTimestamp) {
        const updateTimer = () => {
            const remaining = reminder.nextReminderTimestamp! - Date.now();
            setTimeLeft(remaining > 0 ? remaining : 0);
        };
        
        updateTimer();
        const intervalId = setInterval(updateTimer, 1000);
        return () => clearInterval(intervalId);
    } else {
        setTimeLeft(0);
    }
  }, [reminder]);
  
  const handleToggle = async () => {
    const isNowEnabled = !reminder.isEnabled;
    if (isNowEnabled) {
        // Request permission if not already granted
        if (Notification.permission !== 'granted') {
            const permission = await requestNotificationPermission();
            if (permission !== 'granted') {
                alert("Please grant notification permission to use this feature.");
                return;
            }
        }
        
        setReminder({
            ...reminder,
            isEnabled: true,
            nextReminderTimestamp: Date.now() + reminder.interval * 60 * 1000,
        });
        sendAppNotification("Stand Reminders Enabled!", `We'll remind you to stand every ${reminder.interval} minutes.`);
    } else {
        setReminder({
            ...reminder,
            isEnabled: false,
            nextReminderTimestamp: null,
        });
    }
  };

  const handleIntervalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newInterval = parseInt(e.target.value, 10);
    const updatedReminder = { ...reminder, interval: newInterval };
    
    // If it's already running, reset the timer with the new interval
    if (reminder.isEnabled) {
        updatedReminder.nextReminderTimestamp = Date.now() + newInterval * 60 * 1000;
    }
    
    setReminder(updatedReminder);
  };
  
  if (reminder.isEnabled) {
    return (
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg text-center space-y-3">
            <h3 className="text-xl font-semibold">Stand Reminder</h3>
            <p className="text-slate-400 text-sm">Next reminder in:</p>
            <p className="text-4xl font-mono font-bold text-primary animate-pulse">{formatTime(timeLeft)}</p>
            <p className="text-slate-400 text-xs">
                Interval: {reminder.interval} minutes
            </p>
            <Button variant="secondary" onClick={handleToggle} className="w-full">Stop Reminders</Button>
        </div>
    )
  }

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg space-y-4">
      <h3 className="text-xl font-semibold text-center">Stand Reminder</h3>
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Remind me every:</label>
        <select 
            value={reminder.interval} 
            onChange={handleIntervalChange}
            className="w-full bg-slate-700 rounded p-2 border border-slate-600 focus:ring-primary focus:border-primary"
        >
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes (1 hour)</option>
            <option value={90}>90 minutes (1.5 hours)</option>
        </select>
      </div>
      <Button onClick={handleToggle} className="w-full">Start Reminders</Button>
    </div>
  );
};
