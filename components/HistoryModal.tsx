import React from 'react';
import { FoodLogEntry } from '../types';

interface HistoryModalProps {
  onClose: () => void;
  log: FoodLogEntry[];
}

// Helper to group logs by date
const groupLogsByDate = (log: FoodLogEntry[]) => {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  return log.reduce((acc, entry) => {
    let dayLabel = 'Older';
    if (entry.date === todayStr) {
      dayLabel = 'Today';
    } else if (entry.date === yesterdayStr) {
      dayLabel = 'Yesterday';
    }
    
    if (!acc[dayLabel]) {
      acc[dayLabel] = [];
    }
    acc[dayLabel].push(entry);
    return acc;
  }, {} as Record<string, FoodLogEntry[]>);
};

export const HistoryModal: React.FC<HistoryModalProps> = ({ onClose, log }) => {
  // Sort log descending by id (timestamp) before grouping
  const sortedLog = [...log].sort((a, b) => b.id - a.id);
  const groupedLogs = groupLogsByDate(sortedLog);
  const dateGroups = ['Today', 'Yesterday', 'Older'].filter(group => groupedLogs[group]);

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-scaleIn">
        <div className="flex-shrink-0 flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">My Food Log</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100 text-3xl font-bold">&times;</button>
        </div>

        <div className="flex-grow overflow-y-auto pr-2 space-y-6">
          {log.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">Your food log is empty.</p>
              <p className="text-sm text-slate-500">Use "Snap & Analyze" to start tracking your meals!</p>
            </div>
          ) : (
            dateGroups.map(groupName => (
              <div key={groupName}>
                <h3 className="text-lg font-bold text-slate-300 border-b border-slate-700 pb-2 mb-3">{groupName}</h3>
                <div className="space-y-4">
                  {groupedLogs[groupName].map(entry => (
                    <div key={entry.id} className="bg-slate-900 p-4 rounded-lg flex gap-4 items-start">
                      <div className="flex-shrink-0">
                        <img
                          src={`data:image/jpeg;base64,${entry.imageBase64}`}
                          alt="Logged meal"
                          className="w-24 h-24 object-cover rounded-md shadow-md"
                        />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-sm font-semibold text-primary-light">
                            Logged at {new Date(entry.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <div className="text-right">
                            <p className="text-xl font-bold">{Math.round(entry.analysis.total.kcal)} kcal</p>
                            <p className="text-xs text-slate-400">
                              P:{Math.round(entry.analysis.total.protein_g)}g | F:{Math.round(entry.analysis.total.fat_g)}g | C:{Math.round(entry.analysis.total.carb_g)}g
                            </p>
                          </div>
                        </div>
                        
                        <ul className="space-y-1">
                          {entry.analysis.items.map((item, index) => (
                            <li key={index} className="flex justify-between text-sm text-slate-300 border-t border-slate-800 pt-1">
                              <span className="capitalize">{item.label}</span>
                              <span className="text-slate-400">{Math.round(item.macros.kcal)} kcal</span>
                            </li>
                          ))}
                        </ul>
                        {entry.analysis.flags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {entry.analysis.flags.map(flag => (
                                  <span key={flag} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded-full">
                                      {flag.replace(/_/g, ' ')}
                                  </span>
                              ))}
                            </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};