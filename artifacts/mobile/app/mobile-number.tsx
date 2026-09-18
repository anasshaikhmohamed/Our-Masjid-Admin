import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import colors from '@/constants/colors';
import { savePendingPhone } from '@/lib/auth';

export default function MobileNumberScreen() {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const sendOtp = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }

    setError('');
    await savePendingPhone(`+91 ${digits.slice(-10)}`);
    router.push('/otp');
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
          <Text style={styles.step}>01</Text>
          <View style={styles.stepLine} />
          <Text style={styles.stepMuted}>03</Text>
        </View>
        <Text style={styles.heading}>Welcome to Our Masjid</Text>
        <Text style={styles.copy}>Enter your mobile number to get started with your demo account.</Text>

        <Text style={styles.label}>Mobile number</Text>
        <View style={[styles.inputRow, error && styles.inputError]}>
          <Text style={styles.prefix}>+91</Text>
          <View style={styles.divider} />
          <TextInput
            value={phone}
            onChangeText={(value) => {
              setPhone(value.replace(/\D/g, '').slice(0, 10));
              if (error) setError('');
            }}
            placeholder="Mobile Number"
            placeholderTextColor="#9AA8A0"
            keyboardType="phone-pad"
            style={styles.input}
            maxLength={10}
            autoFocus
          />
        </View>
        {error ? <Text style={styles.errorText}>{error}</Text> : <Text style={styles.hint}>We will not send an SMS in this demo.</Text>}

        <Pressable
          onPress={sendOtp}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>SEND OTP</Text>
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
  inputRow: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.light.input,
    paddingHorizontal: 14,
  },
  inputError: {
    borderColor: colors.light.destructive,
  },
  prefix: {
    color: colors.light.foreground,
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 23,
    backgroundColor: '#D8E3DC',
    marginHorizontal: 12,
  },
  input: {
    flex: 1,
    color: colors.light.foreground,
    fontSize: 14,
    paddingVertical: 0,
  },
  hint: {
    color: colors.light.mutedForeground,
    fontSize: 11,
    marginTop: 9,
  },
  errorText: {
    color: colors.light.destructive,
    fontSize: 11,
    marginTop: 9,
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