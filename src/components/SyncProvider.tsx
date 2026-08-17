"use client";

import React, { useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { processSyncQueue, pullFromSupabase } from '@/lib/sync';
import { supabase } from '@/lib/supabase';

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { user, status } = useAuth();

  useEffect(() => {
    // Only attempt sync if the user is logged in and their account is active
    if (!user || status !== 'active') return;

    // 1. Initial Pull on mount (only overwrites if local queue is empty)
    pullFromSupabase();

    // 2. Initial Push on mount
    processSyncQueue();

    // 3. Listen for online events to push immediately when connection is restored
    const handleOnline = () => {
      processSyncQueue();
    };
    window.addEventListener('online', handleOnline);

    // 4. Pull and Push when user switches back to the app
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        processSyncQueue();
        pullFromSupabase();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 5. Periodic sync every 30 seconds just in case
    const intervalId = setInterval(() => {
      processSyncQueue();
    }, 30000);

    // 6. Supabase Realtime for instant cross-device updates
    const channel = supabase.channel('shop_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers', filter: `shop_id=eq.${user.id}` }, () => {
        pullFromSupabase();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `shop_id=eq.${user.id}` }, () => {
        pullFromSupabase();
      })
      .subscribe();

    return () => {
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
      supabase.removeChannel(channel);
    };
  }, [user, status]);

  return <>{children}</>;
}
