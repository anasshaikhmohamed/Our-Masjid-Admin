import React, { useEffect } from 'react';
import { router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { getDemoSession } from '@/lib/auth';

export default function AppEntry() {
  useEffect(() => {
    let active = true;
    void getDemoSession()
      .catch(() => null)
      .then((session) => {
        if (!active) return;
        router.replace(session ? '/(tabs)' : '/welcome');
        void SplashScreen.hideAsync();
      });
    return () => { active = false; };
  }, []);

  return null;
}
