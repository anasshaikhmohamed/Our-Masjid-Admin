import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import colors from '@/constants/colors';
import { formatINR, raisedBreakdown, totalRaised } from '@/lib/data';

export default function RaisedDetailsScreen() {
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}><Pressable onPress={() => router.back()} style={styles.backButton}><Feather name="arrow-left" size={19} color={colors.light.foreground} /></Pressable><Text style={styles.topTitle}>Total Raised</Text><View style={{ width: 38 }} /></View>
        <View style={styles.summary}><View style={styles.summaryIcon}><Feather name="trending-up" size={19} color={colors.light.primary} /></View><View><Text style={styles.summaryLabel}>Raised across verified projects</Text><Text style={styles.summaryValue}>{formatINR(totalRaised)}</Text></View></View>
        <Text style={styles.intro}>A clear view of the support collected for each Masjid project.</Text>
        {raisedBreakdown.map((item) => (
          <View key={item.name} style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.location}><Feather name="map-pin" size={12} color={colors.light.mutedForeground} /> {item.location}</Text>
            <View style={styles.cardFooter}><Text style={styles.raisedLabel}>Raised / Collected</Text><Text style={styles.amount}>{formatINR(item.raised)}</Text></View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.light.background },
  content: { padding: 16, paddingBottom: 45 },
  topBar: { paddingTop: 36, paddingBottom: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  topTitle: { color: colors.light.foreground, fontSize: 16, fontWeight: '600' },
  summary: { backgroundColor: '#DDF3E6', borderRadius: 17, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 11 },
  summaryIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  summaryLabel: { color: '#648072', fontSize: 11 },
  summaryValue: { color: colors.light.primary, fontSize: 22, fontWeight: '700', marginTop: 3 },
  intro: { color: colors.light.mutedForeground, fontSize: 12, lineHeight: 18, marginVertical: 17 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 15, padding: 14, marginBottom: 10, shadowColor: '#1F4D3B', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  name: { color: colors.light.foreground, fontSize: 14, fontWeight: '600' },
  location: { color: colors.light.mutedForeground, fontSize: 11, marginTop: 6 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 13, paddingTop: 11, borderTopWidth: 1, borderTopColor: colors.light.border },
  raisedLabel: { color: colors.light.mutedForeground, fontSize: 11 },
  amount: { color: colors.light.primary, fontSize: 15, fontWeight: '700' },
});