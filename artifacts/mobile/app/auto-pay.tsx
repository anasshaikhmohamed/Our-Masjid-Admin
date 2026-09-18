import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import colors from '@/constants/colors';
import { projects } from '@/lib/data';

export default function AutoPayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const project = projects.find((item) => item.id === id) ?? projects[0];
  const [amount, setAmount] = useState('500');
  const [frequency, setFrequency] = useState('Monthly');
  const confirm = async () => {
    await AsyncStorage.setItem('autoPayConfig', JSON.stringify({ projectId: project.id, projectName: project.name, amount: Number(amount) || 0, frequency, status: 'active' }));
    Alert.alert('Auto Pay saved', 'No recurring payment was processed. This schedule is saved locally until a secure payment gateway is connected.', [{ text: 'Done', onPress: () => router.back() }]);
  };
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}><Pressable onPress={() => router.back()} style={styles.backButton}><Feather name="arrow-left" size={19} color={colors.light.foreground} /></Pressable><Text style={styles.topTitle}>Auto Pay</Text><View style={{ width: 38 }} /></View>
        <View style={styles.hero}><View style={styles.icon}><Feather name="repeat" size={20} color={colors.light.primary} /></View><Text style={styles.heroTitle}>Keep supporting regularly</Text><Text style={styles.heroCopy}>Choose a simple schedule for {project.name}.</Text></View>
        <Text style={styles.label}>Masjid</Text><View style={styles.projectCard}><Text style={styles.projectName}>{project.name}</Text><Text style={styles.projectLocation}>{project.location}</Text></View>
        <Text style={styles.label}>Donation amount</Text><View style={styles.amountInput}><Text style={styles.rupee}>₹</Text><TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" style={styles.amountText} /></View>
        <Text style={styles.label}>Frequency</Text><View style={styles.frequencyRow}>{['Daily', 'Weekly', 'Monthly'].map((item) => <Pressable key={item} onPress={() => setFrequency(item)} style={[styles.frequency, frequency === item && styles.frequencyActive]}><Text style={[styles.frequencyText, frequency === item && styles.frequencyTextActive]}>{item}</Text></Pressable>)}</View>
        <View style={styles.notice}><Feather name="shield" size={16} color={colors.light.primary} /><Text style={styles.noticeText}>This creates a recurring donation plan. No payment will be charged until a secure recurring payment integration is connected.</Text></View>
        <Pressable onPress={confirm} style={styles.button}><Text style={styles.buttonText}>Confirm Auto Pay</Text><Feather name="check" size={17} color="#FFFFFF" /></Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.light.background },
  content: { padding: 16, paddingBottom: 40 },
  topBar: { paddingTop: 36, paddingBottom: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  topTitle: { color: colors.light.foreground, fontSize: 16, fontWeight: '600' },
  hero: { backgroundColor: '#DDF3E6', borderRadius: 17, padding: 18, alignItems: 'center' },
  icon: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  heroTitle: { color: colors.light.primary, fontSize: 17, fontWeight: '700', marginTop: 11 },
  heroCopy: { color: '#607A6C', fontSize: 11, marginTop: 5, textAlign: 'center' },
  label: { color: colors.light.foreground, fontSize: 12, fontWeight: '600', marginTop: 20, marginBottom: 8 },
  projectCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 13 },
  projectName: { color: colors.light.foreground, fontSize: 13, fontWeight: '600' },
  projectLocation: { color: colors.light.mutedForeground, fontSize: 11, marginTop: 4 },
  amountInput: { minHeight: 53, backgroundColor: '#FFFFFF', borderRadius: 14, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 },
  rupee: { color: colors.light.primary, fontSize: 21, fontWeight: '600' },
  amountText: { flex: 1, color: colors.light.foreground, fontSize: 22, paddingLeft: 8, fontWeight: '600' },
  frequencyRow: { flexDirection: 'row', gap: 8 },
  frequency: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 11, paddingVertical: 12, alignItems: 'center' },
  frequencyActive: { backgroundColor: '#DDF3E6', borderWidth: 1, borderColor: '#8CB9A1' },
  frequencyText: { color: colors.light.mutedForeground, fontSize: 11 },
  frequencyTextActive: { color: colors.light.primary, fontWeight: '600' },
  notice: { backgroundColor: '#FFF7E5', borderRadius: 13, padding: 12, flexDirection: 'row', gap: 9, marginTop: 21 },
  noticeText: { color: '#8B6C2A', fontSize: 10, lineHeight: 15, flex: 1 },
  button: { minHeight: 48, borderRadius: 14, backgroundColor: colors.light.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 },
  buttonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
});