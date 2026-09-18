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
      <View style={styles.topRow}>
        <View style={styles.brandMark}>
          <Image source={require('@/assets/images/icon.png')} style={styles.brandLogo} />
        </View>
        <Text style={styles.brandName}>Our Masjid</Text>
      </View>

      <View style={styles.hero}>
        <View style={styles.illustrationOuter}>
          <View style={styles.illustrationInner}>
            <Image source={require('@/assets/images/icon.png')} style={styles.heroLogo} />
          </View>
          <View style={styles.goldDot} />
          <View style={styles.greenDot} />
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
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F7EEDC',
  },
  brandLogo: {
    width: '100%',
    height: '100%',
  },
  brandName: {
    color: colors.light.primary,
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 10,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 26,
  },
  illustrationOuter: {
    width: 214,
    height: 214,
    borderRadius: 107,
    backgroundColor: '#DDF3E6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  illustrationInner: {
    width: 164,
    height: 164,
    borderRadius: 48,
    padding: 8,
    backgroundColor: '#F7EEDC',
    transform: [{ rotate: '-4deg' }],
  },
  heroLogo: {
    width: '100%',
    height: '100%',
    borderRadius: 41,
  },
  goldDot: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#F2C644',
    right: 10,
    top: 33,
  },
  greenDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.light.primary,
    left: 19,
    bottom: 38,
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