import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import { ThemedModal } from '@/components/ThemedModal';
import { supabase } from '@/lib/supabase';

export default function TeacherBookingScreen() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [busy, setBusy] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const submit = async () => {
    if (!name.trim() || !address.trim()) {
      Alert.alert('Details required', 'Please enter your name and address.');
      return;
    }
    setBusy(true);
    if (!supabase) {
      Alert.alert('Temporarily unavailable', 'Booking is not connected right now. Please try again later.');
      return;
    }
    try {
      const { error } = await supabase.from('teacher_bookings').insert({
        name: name.trim(),
        address: address.trim(),
        teacher_name: 'Qari Shaikh Anas',
        qualification: 'Hafiz & Qari',
        status: 'new',
      });
      if (error) throw error;
      setShowSuccessModal(true);
      setName('' );
      setAddress('' );
    } catch {
      Alert.alert('Could not submit', 'Your request could not be saved. Please check your internet connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  const connectWhatsApp = async () => {
    const url = 'https://wa.me/919702647554';
    try { await Linking.openURL(url); }
    catch { Alert.alert('Unable to open WhatsApp', 'Please make sure WhatsApp is installed.'); }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable accessibilityLabel="Go back" onPress={() => router.back()} style={styles.back}><Feather name="arrow-left" size={19} color={colors.light.foreground} /></Pressable>
          <Text style={styles.topTitle}>Book an Islamic Teacher</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.teacherCard}>
          <View style={styles.teacherIcon}><MaterialCommunityIcons name="book-open-page-variant" size={28} color="#FFFFFF" /></View>
          <Text style={styles.teacherName}>Qari Shaikh Anas</Text>
          <Text style={styles.qualification}>Hafiz &amp; Qari</Text>
          <Text style={styles.cardCopy}>Islamic learning for you and your children</Text>
        </View>
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Your Details</Text>
          <Text style={styles.label}>Name</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Enter your full name" placeholderTextColor={colors.light.mutedForeground} style={styles.input} autoCapitalize="words" returnKeyType="next" />
          <Text style={styles.label}>Address</Text>
          <TextInput value={address} onChangeText={setAddress} placeholder="Enter your area and full address" placeholderTextColor={colors.light.mutedForeground} style={[styles.input, styles.addressInput]} multiline textAlignVertical="top" />
          <Pressable disabled={busy} onPress={() => void submit()} style={({ pressed }) => [styles.submit, (pressed || busy) && { opacity: 0.75 }]}><Text style={styles.submitText}>{busy ? 'Submitting…' : 'Submit Booking Request'}</Text><Feather name="arrow-right" size={17} color="#FFFFFF" /></Pressable>
        </View>
        <Pressable onPress={() => void connectWhatsApp()} style={({ pressed }) => [styles.whatsappRow, pressed && { opacity: 0.8 }]}>
          <View style={styles.whatsappIcon}><MaterialCommunityIcons name="whatsapp" size={21} color="#FFFFFF" /></View>
          <View style={{ flex: 1 }}><Text style={styles.whatsappTitle}>Have a question?</Text><Text style={styles.whatsappCopy}>Connect Now on WhatsApp</Text></View>
          <Feather name="chevron-right" size={18} color={colors.light.mutedForeground} />
        </Pressable>
      </ScrollView>
      <ThemedModal visible={showSuccessModal} title="Request Submitted" message="JazakAllah khair. Your booking request has been received." icon="check-circle" primaryLabel="OK" onClose={() => setShowSuccessModal(false)} onPrimary={() => { setShowSuccessModal(false); router.back(); }} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.light.background },
  content: { paddingBottom: 36 },
  topBar: { minHeight: 64, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF' },
  back: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#EEF6F1', alignItems: 'center', justifyContent: 'center' },
  topTitle: { color: colors.light.foreground, fontSize: 15, fontWeight: '500' },
  teacherCard: { marginHorizontal: 16, marginTop: 18, padding: 24, alignItems: 'center', borderRadius: 22, backgroundColor: '#124B36', borderWidth: 1, borderColor: '#C7A45B' },
  teacherIcon: { width: 58, height: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#C7A45B' },
  teacherName: { color: '#FFFFFF', fontSize: 21, fontWeight: '500', marginTop: 14 },
  qualification: { color: '#F0D99C', fontSize: 13, marginTop: 5 },
  cardCopy: { color: '#E0EEE6', fontSize: 11, marginTop: 10, textAlign: 'center' },
  formCard: { marginHorizontal: 16, marginTop: 16, padding: 17, backgroundColor: '#FFFFFF', borderRadius: 18 },
  formTitle: { color: colors.light.foreground, fontSize: 16, fontWeight: '500', marginBottom: 15 },
  label: { color: colors.light.foreground, fontSize: 12, marginBottom: 7, marginTop: 10 },
  input: { minHeight: 46, borderWidth: 1, borderColor: colors.light.border, borderRadius: 12, paddingHorizontal: 13, color: colors.light.foreground, fontSize: 13, backgroundColor: '#FFFFFF' },
  addressInput: { minHeight: 90, paddingTop: 12 },
  submit: { marginTop: 18, minHeight: 48, borderRadius: 13, backgroundColor: colors.light.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  submitText: { color: '#FFFFFF', fontSize: 13, fontWeight: '500' },
  whatsappRow: { marginHorizontal: 16, marginTop: 14, minHeight: 68, paddingHorizontal: 14, borderRadius: 16, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', gap: 12 },
  whatsappIcon: { width: 39, height: 39, borderRadius: 13, backgroundColor: '#20A45A', alignItems: 'center', justifyContent: 'center' },
  whatsappTitle: { color: colors.light.foreground, fontSize: 12, fontWeight: '500' },
  whatsappCopy: { color: colors.light.primary, fontSize: 11, marginTop: 4 },
});
