import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import colors from '@/constants/colors';
import { completeDemoLogin, getPendingPhone } from '@/lib/auth';

export default function NameScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getPendingPhone().then(setPhone);
  }, []);

  const continueToHome = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Enter your name before continuing.');
      return;
    }

    await completeDemoLogin({ phone, name: trimmedName });
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="dark" />
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 28 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
          <Feather name="arrow-left" size={19} color={colors.light.foreground} />
        </Pressable>
        <View style={styles.stepRow}>
          <Text style={styles.step}>03</Text>
          <View style={styles.stepLine} />
          <Text style={styles.stepMuted}>DONE</Text>
        </View>
        <Text style={styles.heading}>What’s your name?</Text>
        <Text style={styles.copy}>Enter your name to personalise your Our Masjid profile.</Text>

        <Text style={styles.label}>Your name</Text>
        <TextInput
          value={name}
          onChangeText={(value) => {
            setName(value);
            if (error) setError('');
          }}
          placeholder="Your Name"
          placeholderTextColor="#9AA8A0"
          autoCapitalize="words"
          style={[styles.input, error && styles.inputError]}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={continueToHome}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.privacyNote}>
          <Feather name="lock" size={15} color={colors.light.primary} />
          <Text style={styles.privacyText}>Your details are saved locally on this device.</Text>
        </View>

        <Pressable
          onPress={continueToHome}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>CONTINUE</Text>
          <Feather name="arrow-right" size={17} color="#FFFFFF" />
        </Pressable>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 22,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 42,
  },
  step: {
    color: colors.light.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  stepMuted: {
    color: '#A0AEA6',
    fontSize: 12,
    fontWeight: '600',
  },
  stepLine: {
    width: 42,
    height: 1,
    backgroundColor: '#C7D8CE',
    marginHorizontal: 10,
  },
  heading: {
    color: colors.light.foreground,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    marginTop: 19,
  },
  copy: {
    color: colors.light.mutedForeground,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    maxWidth: 315,
  },
  label: {
    color: colors.light.foreground,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 42,
    marginBottom: 9,
  },
  input: {
    minHeight: 54,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.light.input,
    backgroundColor: '#FFFFFF',
    color: colors.light.foreground,
    fontSize: 14,
    paddingHorizontal: 14,
  },
  inputError: {
    borderColor: colors.light.destructive,
  },
  errorText: {
    color: colors.light.destructive,
    fontSize: 11,
    marginTop: 9,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 21,
  },
  privacyText: {
    color: colors.light.mutedForeground,
    fontSize: 11,
  },
  button: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 'auto',
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});