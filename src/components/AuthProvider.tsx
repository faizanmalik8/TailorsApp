"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useRouter, usePathname } from 'next/navigation';
import { PaymentWall } from './PaymentWall';

type ProfileStatus = 'pending_payment' | 'active' | 'expired';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  status: ProfileStatus | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, session: null, status: null, isLoading: true });

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<ProfileStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 1. Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      if (session?.user) {
        checkProfile(session.user);
      } else {
        finishLoading();
      }
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      if (session?.user) {
        checkProfile(session.user);
      } else {
        localStorage.removeItem('shop_profile_cache');
        setStatus(null);
        finishLoading();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkProfile = async (user: User) => {
    // Check local cache first for instant load
    const cached = localStorage.getItem('shop_profile_cache');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Check if local cache says it's expired based on valid_until
        if (parsed.valid_until && new Date(parsed.valid_until) < new Date()) {
          setStatus('expired');
        } else {
          setStatus(parsed.status as ProfileStatus);
        }
        setIsLoading(false); // Can show UI immediately
      } catch (e) {
        // ignore parsing error
      }
    }

    // Always try to fetch latest from server if online
    if (navigator.onLine) {
      const { data, error } = await supabase
        .from('profiles')
        .select('status, valid_until')
        .eq('id', user.id)
        .single();

      if (data) {
        let currentStatus = data.status as ProfileStatus;
        if (data.valid_until && new Date(data.valid_until) < new Date()) {
          currentStatus = 'expired';
          // Optionally update DB here, but admin handles true status
        }
        
        setStatus(currentStatus);
        localStorage.setItem('shop_profile_cache', JSON.stringify({
          status: currentStatus,
          valid_until: data.valid_until
        }));
      } else if (error && error.code === 'PGRST116') {
        // Profile doesn't exist yet, create it now since user is fully authenticated
        await supabase.from('profiles').insert([
          { 
            id: user.id, 
            shop_name: 'My Tailor Shop', 
            owner_name: 'Shop Owner', 
            status: 'pending_payment' 
          }
        ]);
        setStatus('pending_payment');
      }
      setIsLoading(false);
    }
  };

  const finishLoading = () => {
    setIsLoading(false);
  };

  // Routing Logic
  useEffect(() => {
    if (isLoading) return;

    if (!user && pathname !== '/login') {
      router.push('/login');
    } else if (user && pathname === '/login') {
      router.push('/');
    }
  }, [user, isLoading, pathname, router]);

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#152A4A] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white mt-4 font-bold tracking-widest uppercase">Loading...</p>
      </div>
    );
  }

  // Payment Wall (Block all UI if locked)
  if (user && status && status !== 'active' && pathname !== '/login') {
    return <PaymentWall email={user.email || 'your account'} status={status} />;
  }

  return (
    <AuthContext.Provider value={{ user, session, status, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
