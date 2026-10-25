import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import { ThemedModal } from '@/components/ThemedModal';
import { supabase } from '@/lib/supabase';

export default function TeacherBookingScreen() {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [busy, setBusy] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const submit = async () => {
    if (!name.trim() || !mobile.trim() || !address.trim()) {
      Alert.alert('Details required', 'Please enter your name, mobile number and address.');
      return;
    }
    if (!/^\d{10}$/.test(mobile)) {
      Alert.alert('Invalid mobile number', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!supabase) {
      Alert.alert('Temporarily unavailable', 'Booking is not connected right now. Please try again later.');
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.from('teacher_bookings').insert({
        name: name.trim(),
        mobile_number: mobile,
        address: address.trim(),
        teacher_name: 'Qari Shaikh Anas',
        qualification: 'Hafiz & Qari',
        status: 'new',
      });
      if (error) throw error;
      setShowSuccessModal(true);
      setName('');
      setMobile('');
      setAddress('');
    } catch (error) {
      if (__DEV__) console.error('[Teacher Booking] Submission failed:', error);
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
          <Text style={styles.label}>Mobile Number</Text>
          <TextInput
            value={mobile}
            onChangeText={(value) => setMobile(value.replace(/\D/g, '').slice(0, 10))}
            placeholder="Enter your 10-digit mobile number"
            placeholderTextColor={colors.light.mutedForeground}
            style={styles.input}
            keyboardType="phone-pad"
            maxLength={10}
            returnKeyType="next"
          />
          <Text style={styles.label}>Address</Text>
          <TextInput value={address} onChangeText={setAddress} placeholder="Enter your area and full address" placeholderTextColor={colors.light.mutedForeground} style={[styles.input, styles.addressInput]} multiline textAlignVertical="top" />
          <View style={styles.actionRow}>
            <Pressable disabled={busy} onPress={() => void submit()} style={({ pressed }) => [styles.submit, (pressed || busy) && { opacity: 0.75 }]}>
              <Text style={styles.submitText}>Submit</Text>
            </Pressable>
            <Text style={styles.contactCopy}>Have questions? Connect with Qari Shaikh Anas directly on WhatsApp.</Text>
            <Pressable onPress={() => void connectWhatsApp()} style={({ pressed }) => [styles.whatsappButton, pressed && { opacity: 0.8 }]}>
              <MaterialCommunityIcons name="whatsapp" size={20} color="#FFFFFF" />
              <Text style={styles.whatsappButtonText}>Contact Now</Text>
            </Pressable>
          </View>
        </View>
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
  submit: { marginTop: 18, minHeight: 48, borderRadius: 13, backgroundColor: '#C62828', alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  actionRow: { marginTop: 18, flexDirection: 'column', alignItems: 'stretch', gap: 14 },
  contactCopy: { color: colors.light.mutedForeground, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 2 },
  whatsappButton: { minHeight: 48, paddingHorizontal: 13, borderRadius: 13, backgroundColor: '#20A45A', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  whatsappButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
});
