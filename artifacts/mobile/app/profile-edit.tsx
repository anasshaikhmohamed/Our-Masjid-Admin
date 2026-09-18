import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import colors from '@/constants/colors';

export default function ProfileEditScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  useEffect(() => {
    AsyncStorage.getItem('profile').then((value) => {
      if (value) {
        const saved = JSON.parse(value) as { name?: string; phone?: string; email?: string };
        setName(saved.name ?? '');
        setPhone(saved.phone ?? '');
        setEmail(saved.email ?? '');
      }
    });
  }, []);
  const save = async () => {
    if (!name.trim()) {
      Alert.alert('Add your name', 'Please enter a name before saving.');
      return;
    }
    await AsyncStorage.setItem('profile', JSON.stringify({ name: name.trim(), phone: phone.trim(), email: email.trim() }));
    Alert.alert('Profile updated', 'Your profile details were saved on this device.', [{ text: 'Done', onPress: () => router.back() }]);
  };
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}><Pressable onPress={() => router.back()} style={styles.backButton}><Feather name="arrow-left" size={19} color={colors.light.foreground} /></Pressable><Text style={styles.topTitle}>Edit Profile</Text><View style={{ width: 38 }} /></View>
        <View style={styles.avatar}><Feather name="user" size={26} color={colors.light.primary} /></View>
        <Text style={styles.heading}>Your profile</Text><Text style={styles.subheading}>Keep your contact details up to date for donation receipts and project support.</Text>
        <Field label="Name" value={name} onChangeText={setName} placeholder="Your name" />
        <Field label="Phone number" value={phone} onChangeText={setPhone} placeholder="Your phone number" keyboardType="phone-pad" />
        <Field label="Email address" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />
        <Pressable onPress={save} style={styles.button}><Text style={styles.buttonText}>Save / Update</Text><Feather name="check" size={17} color="#FFFFFF" /></Pressable>
      </ScrollView>
    </View>
  );
}

function Field({ label, value, onChangeText, placeholder, keyboardType }: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; keyboardType?: 'default' | 'phone-pad' | 'email-address' }) {
  return <View><Text style={styles.label}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#9AA8A0" keyboardType={keyboardType} style={styles.input} autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'} /></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.light.background },
  content: { padding: 16, paddingBottom: 45 },
  topBar: { paddingTop: 36, paddingBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  topTitle: { color: colors.light.foreground, fontSize: 16, fontWeight: '600' },
  avatar: { width: 68, height: 68, borderRadius: 24, backgroundColor: '#DDF3E6', alignItems: 'center', justifyContent: 'center' },
  heading: { color: colors.light.foreground, fontSize: 23, fontWeight: '700', marginTop: 16 },
  subheading: { color: colors.light.mutedForeground, fontSize: 12, lineHeight: 18, marginTop: 6 },
  label: { color: colors.light.foreground, fontSize: 12, fontWeight: '600', marginTop: 20, marginBottom: 8 },
  input: { minHeight: 48, backgroundColor: '#FFFFFF', borderRadius: 13, paddingHorizontal: 13, color: colors.light.foreground, fontSize: 13 },
  button: { minHeight: 48, borderRadius: 14, backgroundColor: colors.light.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 26 },
  buttonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
});