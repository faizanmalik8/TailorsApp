"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { IconScissors, IconMail } from '@tabler/icons-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVerificationMode, setIsVerificationMode] = useState(false);
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        setError(error.message);
      } else if (data.user) {
        // Automatically create a pending profile
        const { error: profileError } = await supabase.from('profiles').insert([
          { 
            id: data.user.id, 
            shop_name: 'My Tailor Shop', 
            owner_name: 'Shop Owner', 
            status: 'pending_payment' 
          }
        ]);
        // If error code is duplicate, it's fine
        setIsVerificationMode(true);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
      else router.push('/');
    }
    setLoading(false);
  };

  if (isVerificationMode) {
    return (
      <div className="fixed inset-0 bg-[#152A4A] flex flex-col items-center justify-center p-6 z-[200] overflow-y-auto">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconMail size={32} />
          </div>
          <h2 className="text-2xl font-bold text-[#152A4A]">Verify your email</h2>
          <p className="text-gray-500 text-sm">We've sent a verification link to <strong>{email}</strong>. Please click the link to verify your account.</p>
          <a href="https://mail.google.com" target="_blank" rel="noreferrer" className="w-full bg-[#152A4A] text-white font-bold py-4 rounded-xl shadow-md flex items-center justify-center hover:bg-[#0c1a2e] transition-colors">
            Open Gmail
          </a>
          <button 
            onClick={() => { setIsVerificationMode(false); setIsSignUp(false); }} 
            className="text-gray-400 hover:text-gray-600 font-bold text-sm underline pt-2"
          >
            I have verified my email -> Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#152A4A] flex flex-col items-center justify-center p-6 z-[200] overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 space-y-6 my-auto">
        <div className="text-center space-y-2">
          <div className="bg-[#152A4A] w-16 h-16 rounded-full flex items-center justify-center mx-auto text-white shadow-lg mb-4">
            <IconScissors size={32} />
          </div>
          <h1 className="text-2xl font-bold text-[#152A4A]">Tailor's Assistant</h1>
          <p className="text-gray-500 text-sm">
            {isSignUp ? 'Create your shop account' : 'Log in to manage your shop'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium border border-red-100">
              {error}
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#152A4A] focus:ring-2 focus:ring-[#152A4A]/20 outline-none transition-all bg-gray-50"
              placeholder="shop@example.com"
              required
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#152A4A] focus:ring-2 focus:ring-[#152A4A]/20 outline-none transition-all bg-gray-50"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#152A4A] text-white font-bold py-4 rounded-xl hover:bg-[#0c1a2e] transition-colors shadow-md disabled:opacity-70 flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : null}
            {isSignUp ? 'Create Account' : 'Log In'}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-gray-500 text-sm">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="ml-2 font-bold text-[#152A4A] hover:underline"
            >
              {isSignUp ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
