import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { ToastMessage } from '../types';

interface AuthProps {
  addToast: (message: string, type: ToastMessage['type']) => void;
}

export function Auth({ addToast }: AuthProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      addToast(error.message, 'error');
    } else {
      addToast('Check your email for the magic login link!', 'info');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-800 tracking-tight">Dental Invoice</h1>
            <p className="text-slate-500 mt-2">Sign in via Magic Link</p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <form onSubmit={handleLogin} className="space-y-6">
            <p className="text-center text-sm text-gray-600">
              Enter your email below to receive a secure, one-time login link. No password required.
            </p>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 sr-only">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                {loading ? 'Sending Link...' : 'Send Magic Link'}
              </button>
            </div>
          </form>
        </div>
         <p className="text-center text-xs text-gray-400 mt-6">
            Powered by Supabase Passwordless Authentication
         </p>
      </div>
    </div>
  );
}
