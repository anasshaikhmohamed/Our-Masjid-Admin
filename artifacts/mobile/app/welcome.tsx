import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/constants/colors';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 18, paddingBottom: insets.bottom + 20 }]}>
      <StatusBar style="dark" />
      <View style={styles.hero}>
        <View style={styles.illustrationOuter}>
          <View style={styles.illustrationInner}>
            <Image source={require('@/assets/images/icon.png')} style={styles.heroLogo} />
          </View>
        </View>
        <Text style={styles.heading}>Welcome to Our Masjid</Text>
        <Text style={styles.copy}>
          Discover verified masjid projects and help build stronger communities together.
        </Text>
      </View>

      <View style={styles.bottom}>
        <Pressable
          onPress={() => router.push('/mobile-number')}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>GET STARTED</Text>
        </Pressable>
        <Text style={styles.footnote}>Simple giving. Meaningful impact.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.light.background,
    paddingHorizontal: 22,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 18,
  },
  illustrationOuter: {
    width: 205,
    height: 205,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationInner: {
    width: 205,
    height: 205,
    borderRadius: 48,
    overflow: 'hidden',
    backgroundColor: '#F7EEDC',
    borderWidth: 1,
    borderColor: '#D9B45A',
  },
  heroLogo: {
    width: '100%',
    height: '100%',
    borderRadius: 47,
  },
  heading: {
    color: colors.light.foreground,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 31,
  },
  copy: {
    color: colors.light.mutedForeground,
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    maxWidth: 310,
    marginTop: 11,
  },
  bottom: {
    width: '100%',
  },
  button: {
    minHeight: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.light.primary,
    shadowColor: '#14533B',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.7,
  },
  footnote: {
    color: colors.light.mutedForeground,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 13,
  },
});