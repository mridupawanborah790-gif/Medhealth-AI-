
import React, { useState } from 'react';
import { generateDietPlanStream, translateText } from '../services/geminiService';
import { HealthProfile, Goal, CalculatedMetrics } from '../types';
import { Button } from './common/Button';

interface DietPlannerProps {
  onClose: () => void;
  profile: HealthProfile;
  goal: Goal;
  metrics: CalculatedMetrics;
}

const TypingIndicator = () => (
    <div className="flex items-center space-x-1 p-4">
        <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></span>
        <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
        <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
    </div>
);


export const DietPlanner: React.FC<DietPlannerProps> = ({ onClose, profile, goal, metrics }) => {
  const [query, setQuery] = useState(`I want to lose 5kg in 1 month.`);
  const [plan, setPlan] = useState<string>('');
  const [translatedPlan, setTranslatedPlan] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setPlan('');
    setTranslatedPlan(''); // Reset translation on new plan generation

    try {
      const stream = generateDietPlanStream(profile, goal, metrics, query);
      for await (const chunk of stream) {
        setPlan(prev => prev + chunk);
      }
    } catch (err) {
      setError('Failed to generate diet plan. Please check your connection and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!plan || isTranslating) return;
    setIsTranslating(true);
    setError(null);
    try {
        const translation = await translateText(plan, 'Assamese');
        setTranslatedPlan(translation);
    } catch (err) {
        setError("Failed to translate the plan. Please try again.");
        console.error(err);
    } finally {
        setIsTranslating(false);
    }
  };

  const formattedPlan = (text: string) => {
      let formatted = text
        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary-light">$1</strong>')
        .replace(/### (.*)/g, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>')
        .replace(/## (.*)/g, '<h2 class="text-2xl font-bold mt-6 mb-3 border-b border-slate-700 pb-2">$1</h2>')
        .replace(/^\s*[\*-]\s(.*)/gm, '<li>&bull; $1</li>');

      // Wrap consecutive list items in a single <ul> tag for proper rendering
      formatted = formatted.replace(/(?:<li>.*<\/li>\s*)+/g, (match) => `<ul class="space-y-2 pl-4">${match}</ul>`);

      return formatted;
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-70 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-scaleIn">
        <div className="flex-shrink-0 flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">AI Diet Master Plan</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100 text-3xl font-bold">&times;</button>
        </div>

        <div className="flex-grow overflow-y-auto pr-2 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-2">
            <label className="text-sm font-medium text-slate-400">
              Describe your diet goal (e.g., "lose 5kg in 1 month", "gain muscle without dairy"):
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-slate-700 rounded p-2 mt-1 h-20 border border-slate-600 focus:ring-primary focus:border-primary"
              placeholder="e.g., I want to lose 5kg in 1 month"
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Generating...' : 'Generate My Plan'}
            </Button>
          </form>

          {isLoading && !plan && <TypingIndicator />}

          {error && <p className="text-accent-red text-center">{error}</p>}
          
          {plan && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 rounded-lg animate-fadeIn">
                  <div 
                    className="text-slate-100 whitespace-pre-wrap text-sm leading-relaxed" 
                    dangerouslySetInnerHTML={{ __html: formattedPlan(plan) }} 
                  />
              </div>

              {!translatedPlan && (
                <div className="text-center">
                    <Button variant="secondary" onClick={handleTranslate} disabled={isTranslating}>
                        {isTranslating ? 'Translating...' : 'Translate to Assamese'}
                    </Button>
                </div>
              )}

              {isTranslating && !translatedPlan && <TypingIndicator />}

              {translatedPlan && (
                  <div className="p-4 bg-slate-900 rounded-lg animate-fadeIn">
                    <h3 className="text-xl font-bold text-primary mb-2">Assamese Translation (অসমীয়া অনুবাদ)</h3>
                    <div 
                      className="text-slate-100 whitespace-pre-wrap text-sm leading-relaxed" 
                      dangerouslySetInnerHTML={{ __html: formattedPlan(translatedPlan) }} 
                    />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
