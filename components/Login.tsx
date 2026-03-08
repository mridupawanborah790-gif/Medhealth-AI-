
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Spinner } from './common/Spinner';
import { Button } from './common/Button';

interface LoginProps {
  onLoginSuccess: (email: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
        setError("Email and password cannot be empty.");
        return;
    }
    setError(null);
    setIsLoading(true);

    try {
        // 1. Attempt to Sign In
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) {
            // 2. If Sign In fails (likely user not found or wrong password), check specific error
            if (signInError.message.includes("Invalid login credentials")) {
                // Could be wrong password or user doesn't exist. 
                // We'll try to Sign Up to handle the "Get Started" unified flow.
                
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                });

                if (signUpError) {
                    // If sign up also fails (e.g. weak password, or user actually exists but password was wrong above)
                     if (signUpError.message.includes("User already registered")) {
                         setError("Incorrect password.");
                     } else {
                         setError(signUpError.message);
                     }
                     setIsLoading(false);
                } else {
                    // Sign up successful
                    if (signUpData.session) {
                         onLoginSuccess(email);
                    } else {
                        // Session is null implies email confirmation is required
                        setError("Account created! Please check your email to confirm your account.");
                        setIsLoading(false);
                    }
                }
            } else {
                // Some other error during sign in
                setError(signInError.message);
                setIsLoading(false);
            }
        } else {
            // Sign In Successful
            if (signInData.session) {
                onLoginSuccess(email);
            }
        }
    } catch (err) {
        setError("An unexpected error occurred.");
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-fadeIn">
      <div className="w-full max-w-sm mx-auto bg-slate-800 rounded-xl shadow-2xl p-8 space-y-6 text-center border border-slate-700">
        <div className="space-y-2 mb-8">
            <h1 className="text-4xl font-extrabold text-primary tracking-tight">MedHealth</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
            <div>
                <label className="block text-sm font-bold text-slate-400 mb-1 ml-1">Email</label>
                <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-700 rounded-lg p-3 border border-slate-600 focus:ring-2 focus:ring-primary focus:border-transparent text-slate-100 placeholder-slate-500 transition-all outline-none"
                    placeholder="you@example.com"
                />
            </div>
             <div>
                <label className="block text-sm font-bold text-slate-400 mb-1 ml-1">Password</label>
                <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-700 rounded-lg p-3 border border-slate-600 focus:ring-2 focus:ring-primary focus:border-transparent text-slate-100 placeholder-slate-500 transition-all outline-none"
                    placeholder="••••••••"
                />
            </div>
             {error && <p className="text-accent-red text-sm text-center bg-red-100/10 py-2 rounded font-medium border border-accent-red/20">{error}</p>}
            <Button type="submit" disabled={isLoading} className="w-full !mt-6 text-lg shadow-xl hover:shadow-2xl">
                {isLoading ? <Spinner /> : 'Get Started'}
            </Button>
        </form>
      </div>
    </div>
  );
};
