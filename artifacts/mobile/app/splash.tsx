import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import colors from '@/constants/colors';
import { getDemoSession } from '@/lib/auth';

export default function SplashRoute() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    getDemoSession()
      .catch(() => null)
      .then((session) => {
        if (!mounted) return;
        timer = setTimeout(() => {
          router.replace(session ? '/(tabs)' : '/welcome');
        }, 1100);
        setReady(true);
      });

    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.logoFrame}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.title}>Our Masjid</Text>
      <Text style={styles.subtitle}>Serving communities, building trust</Text>
      <View style={[styles.loader, !ready && styles.loaderHidden]} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.light.primary,
    paddingHorizontal: 28,
  },
  logoFrame: {
    width: 128,
    height: 128,
    borderRadius: 38,
    padding: 5,
    backgroundColor: '#F7EEDC',
    shadowColor: '#092F20',
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  logo: {
    width: '100%',
    height: '100%',
    borderRadius: 33,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '700',
    letterSpacing: -0.7,
    marginTop: 24,
  },
  subtitle: {
    color: '#D8EFE2',
    fontSize: 13,
    marginTop: 7,
  },
  loader: {
    width: 34,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#F2C644',
    marginTop: 42,
  },
  loaderHidden: {
    opacity: 0,
  },
});