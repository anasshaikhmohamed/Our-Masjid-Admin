import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import colors from '@/constants/colors';
import { getPendingPhone } from '@/lib/auth';

export default function OtpScreen() {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [otp, setOtp] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    getPendingPhone().then(setPhone);
    const focusTimer = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(focusTimer);
  }, []);

  const verify = () => {
    if (otp.length !== 6) {
      setError('Enter the 6-digit OTP to continue.');
      return;
    }
    setError('');
    router.push('/name');
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
          <Text style={styles.step}>02</Text>
          <View style={styles.stepLine} />
          <Text style={styles.stepMuted}>03</Text>
        </View>
        <Text style={styles.heading}>Verify your number</Text>
        <Text style={styles.copy}>
          Enter the 6-digit OTP sent to{' '}
          <Text style={styles.phone}>{phone || 'your mobile number'}</Text>.
        </Text>
        <Text style={styles.demoNote}>Demo mode accepts any 6-digit OTP.</Text>

        <Pressable onPress={() => inputRef.current?.focus()} style={styles.otpBoxes}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <View key={index} style={[styles.otpBox, error && styles.otpBoxError, otp[index] && styles.otpBoxFilled]}>
              <Text style={styles.otpText}>{otp[index] ?? ''}</Text>
            </View>
          ))}
        </Pressable>
        <TextInput
          ref={inputRef}
          value={otp}
          onChangeText={(value) => {
            setOtp(value.replace(/\D/g, '').slice(0, 6));
            if (error) setError('');
          }}
          keyboardType="number-pad"
          maxLength={6}
          style={styles.hiddenInput}
          caretHidden
          autoFocus
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          onPress={verify}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>VERIFY &amp; CONTINUE</Text>
          <Feather name="arrow-right" size={17} color="#FFFFFF" />
        </Pressable>
        <Pressable onPress={() => router.back()} style={styles.changeNumber}>
          <Text style={styles.changeNumberText}>Change mobile number</Text>
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
  phone: {
    color: colors.light.foreground,
    fontWeight: '600',
  },
  demoNote: {
    color: colors.light.primary,
    backgroundColor: '#DDF3E6',
    alignSelf: 'flex-start',
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 18,
  },
  otpBoxes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 35,
  },
  otpBox: {
    width: 46,
    height: 54,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.light.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBoxFilled: {
    borderColor: colors.light.primary,
    backgroundColor: '#F8FCF9',
  },
  otpBoxError: {
    borderColor: colors.light.destructive,
  },
  otpText: {
    color: colors.light.foreground,
    fontSize: 21,
    fontWeight: '600',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  errorText: {
    color: colors.light.destructive,
    fontSize: 11,
    marginTop: 10,
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
  changeNumber: {
    alignSelf: 'center',
    padding: 14,
  },
  changeNumberText: {
    color: colors.light.primary,
    fontSize: 12,
    fontWeight: '600',
  },
});