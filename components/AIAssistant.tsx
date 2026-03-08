
import React, { useState, useEffect, useRef } from 'react';
import { HealthProfile } from '../types';
import { ChatMessage } from '../types';
import { startChatStream } from '../services/geminiService';
import { Button } from './common/Button';

interface AIAssistantProps {
  profile: HealthProfile;
  onClose: () => void;
}

const TypingIndicator = () => (
    <div className="flex items-center space-x-1 p-4">
        <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></span>
        <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
        <span className="w-2 h-2 bg-slate-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
    </div>
);

export const AIAssistant: React.FC<AIAssistantProps> = ({ profile, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
        role: 'model',
        text: `Hello ${profile.name}! I'm MON, your personal health assistant. How are you feeling today? Feel free to ask me anything or share your progress.`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const stream = startChatStream(profile, newMessages);
      let modelResponse = '';
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of stream) {
        modelResponse += chunk;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'model', text: modelResponse };
          return updated;
        });
      }
    } catch (error) {
      console.error('Error streaming response:', error);
      setMessages(prev => [
        ...prev,
        { role: 'model', text: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-80 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-slate-800 rounded-2xl w-full max-w-2xl h-[90vh] flex flex-col shadow-2xl animate-scaleIn">
        <header className="flex-shrink-0 flex justify-between items-center p-4 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="bg-primary rounded-full h-10 w-10 flex items-center justify-center font-bold text-slate-900 text-xl">M</div>
              <div>
                <h2 className="text-xl font-bold text-primary">MON</h2>
                <p className="text-xs text-slate-400">Your AI Health Assistant</p>
              </div>
            </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100 text-3xl font-bold">&times;</button>
        </header>

        <main className="flex-grow p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start space-x-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
               {msg.role === 'model' && (
                 <div className="bg-slate-700 rounded-full h-8 w-8 flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">M</div>
               )}
              <div className={`max-w-prose p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary text-slate-900' : 'bg-slate-700'}`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && 
            <div className="flex items-start space-x-3 justify-start">
               <div className="bg-slate-700 rounded-full h-8 w-8 flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">M</div>
               <TypingIndicator />
            </div>
          }
          <div ref={chatEndRef} />
        </main>

        <footer className="flex-shrink-0 p-4 border-t border-slate-700">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Chat with MON..."
              className="w-full bg-slate-700 rounded-lg p-3 border border-slate-600 focus:ring-primary focus:border-primary disabled:opacity-50"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              Send
            </Button>
          </form>
        </footer>
      </div>
    </div>
  );
};