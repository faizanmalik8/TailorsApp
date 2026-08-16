"use client";

import React, { useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { processSyncQueue, pullFromSupabase } from '@/lib/sync';

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

    // 4. Periodic sync every 30 seconds just in case
    const intervalId = setInterval(() => {
      processSyncQueue();
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(intervalId);
    };
  }, [user, status]);

  return <>{children}</>;
}
