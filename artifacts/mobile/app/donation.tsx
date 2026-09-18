import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import colors from '@/constants/colors';
import { projects, formatINR } from '@/lib/data';

export default function DonationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const project = projects.find((item) => item.id === id) ?? projects[0];
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const confirmDonation = async () => {
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount < 1 || !name.trim()) {
      Alert.alert('Add your details', 'Please enter a donation amount and donor name to continue.');
      return;
    }
    setSaving(true);
    await AsyncStorage.setItem('lastDonationIntent', JSON.stringify({ project: project.id, amount: numericAmount, name, message, createdAt: new Date().toISOString() }));
    setSaving(false);
    Alert.alert('Donation intent saved', 'No payment was processed. A secure payment gateway will be connected before live donations are enabled.', [{ text: 'Done', onPress: () => router.back() }]);
  };
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.topBar}><Pressable onPress={() => router.back()} style={styles.backButton}><Feather name="arrow-left" size={19} color={colors.light.foreground} /></Pressable><Text style={styles.topTitle}>Donate Now</Text><View style={{ width: 38 }} /></View>
        <View style={styles.projectPreview}><View style={styles.projectIcon}><Feather name="heart" size={19} color={colors.light.primary} /></View><View style={{ flex: 1 }}><Text style={styles.previewLabel}>Supporting</Text><Text style={styles.projectName}>{project.name}</Text><Text style={styles.projectLocation}>{project.location}</Text></View></View>
        <Text style={styles.heading}>Make a meaningful contribution</Text>
        <Text style={styles.subheading}>Your support helps this verified project move forward.</Text>
        <Text style={styles.label}>Donation amount</Text>
        <View style={styles.amountInput}><Text style={styles.rupee}>₹</Text><TextInput value={amount} onChangeText={setAmount} placeholder="0" placeholderTextColor="#9AA8A0" keyboardType="numeric" style={styles.amountText} /></View>
        <View style={styles.suggestions}>{['500', '1,000', '2,500'].map((value) => <Pressable key={value} onPress={() => setAmount(value.replace(',', ''))} style={styles.suggestion}><Text style={styles.suggestionText}>₹{value}</Text></Pressable>)}</View>
        <Text style={styles.label}>Your name</Text><TextInput value={name} onChangeText={setName} placeholder="Enter your name" placeholderTextColor="#9AA8A0" style={styles.textInput} />
        <Text style={styles.label}>Message <Text style={{ color: colors.light.mutedForeground, fontWeight: '400' }}>(optional)</Text></Text><TextInput value={message} onChangeText={setMessage} placeholder="Leave an encouraging note" placeholderTextColor="#9AA8A0" style={[styles.textInput, styles.messageInput]} multiline />
        <View style={styles.notice}><Feather name="shield" size={16} color={colors.light.primary} /><Text style={styles.noticeText}>Payments are not live yet. This preview saves your donation intent securely on this device and never claims a successful payment.</Text></View>
        <Pressable disabled={saving} onPress={confirmDonation} style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }, saving && { opacity: 0.6 }]}><Text style={styles.buttonText}>{saving ? 'Saving…' : 'Review donation'}</Text><Feather name="arrow-right" size={17} color="#FFFFFF" /></Pressable>
        <Text style={styles.amountHint}>{formatINR(project.target - project.raised)} still needed for this project</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.light.background },
  content: { paddingBottom: 40 },
  topBar: { paddingTop: 52, paddingHorizontal: 16, paddingBottom: 21, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  topTitle: { color: colors.light.foreground, fontSize: 16, fontWeight: '600' },
  projectPreview: { marginHorizontal: 16, padding: 13, backgroundColor: '#DDF3E6', borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 11 },
  projectIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  previewLabel: { color: '#6E8A7A', fontSize: 10 },
  projectName: { color: colors.light.primary, fontSize: 13, fontWeight: '600', marginTop: 3 },
  projectLocation: { color: '#6E8A7A', fontSize: 10, marginTop: 3 },
  heading: { color: colors.light.foreground, fontSize: 22, fontWeight: '700', marginHorizontal: 16, marginTop: 26 },
  subheading: { color: colors.light.mutedForeground, fontSize: 12, marginHorizontal: 16, marginTop: 7, lineHeight: 18 },
  label: { color: colors.light.foreground, fontSize: 12, fontWeight: '600', marginHorizontal: 16, marginTop: 21, marginBottom: 8 },
  amountInput: { marginHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 14, minHeight: 57, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, borderWidth: 1, borderColor: '#C6DCCE' },
  rupee: { color: colors.light.primary, fontSize: 23, fontWeight: '600' },
  amountText: { flex: 1, color: colors.light.foreground, fontSize: 25, fontWeight: '600', paddingLeft: 8 },
  suggestions: { flexDirection: 'row', gap: 8, marginHorizontal: 16, marginTop: 9 },
  suggestion: { borderRadius: 9, backgroundColor: '#E6F2EA', paddingHorizontal: 14, paddingVertical: 8 },
  suggestionText: { color: colors.light.primary, fontSize: 11, fontWeight: '600' },
  textInput: { marginHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 14, minHeight: 48, color: colors.light.foreground, paddingHorizontal: 14, fontSize: 13 },
  messageInput: { minHeight: 83, paddingTop: 13, textAlignVertical: 'top' },
  notice: { marginHorizontal: 16, marginTop: 20, backgroundColor: '#FFF7E5', borderRadius: 13, padding: 12, flexDirection: 'row', gap: 9 },
  noticeText: { color: '#8B6C2A', flex: 1, fontSize: 10, lineHeight: 15 },
  button: { marginHorizontal: 16, marginTop: 20, minHeight: 49, borderRadius: 14, backgroundColor: colors.light.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  buttonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  amountHint: { color: colors.light.mutedForeground, fontSize: 10, textAlign: 'center', marginTop: 9 },
});
