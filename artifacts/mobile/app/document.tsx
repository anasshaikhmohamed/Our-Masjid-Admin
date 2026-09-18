import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import colors from '@/constants/colors';

export default function DocumentScreen() {
  const { title = 'Public document' } = useLocalSearchParams<{ title?: string }>();
  return (
    <View style={styles.screen}>
      <View style={styles.topBar}><Pressable onPress={() => router.back()} style={styles.backButton}><Feather name="arrow-left" size={19} color={colors.light.foreground} /></Pressable><Text style={styles.topTitle}>Document viewer</Text><Feather name="download" size={18} color={colors.light.mutedForeground} /></View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.docHeader}><Feather name="file-text" size={22} color={colors.light.primary} /><View style={{ flex: 1 }}><Text style={styles.docTitle}>{title}</Text><Text style={styles.docMeta}>Public verification document · PDF preview</Text></View></View>
        <View style={styles.paper}><View style={styles.paperHeader}><View style={styles.fakeSeal}><Feather name="check" size={18} color={colors.light.primary} /></View><Text style={styles.paperHeading}>PUBLIC VERIFICATION RECORD</Text><Text style={styles.paperSubheading}>Our Masjid · Verified project documentation</Text></View>{[1, 2, 3, 4, 5, 6, 7].map((line) => <View key={line} style={[styles.paperLine, line === 3 && { width: '74%' }, line === 6 && { width: '55%' }]} />)}<View style={styles.signature}><View style={styles.signatureLine} /><Text style={styles.signatureText}>Authorized verification</Text></View></View>
        <View style={styles.viewerNote}><Feather name="info" size={16} color={colors.light.primary} /><Text style={styles.noteText}>This public document is shown for project verification. Private Masjid documents are never previewed or downloadable.</Text></View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.light.background },
  topBar: { paddingTop: 52, paddingHorizontal: 16, paddingBottom: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  topTitle: { color: colors.light.foreground, fontSize: 16, fontWeight: '600' },
  content: { padding: 16, paddingBottom: 40 },
  docHeader: { backgroundColor: '#DDF3E6', borderRadius: 15, padding: 13, flexDirection: 'row', gap: 11, alignItems: 'center' },
  docTitle: { color: colors.light.primary, fontSize: 13, fontWeight: '600' },
  docMeta: { color: '#6E8A7A', fontSize: 10, marginTop: 4 },
  paper: { backgroundColor: '#FFFFFF', marginTop: 18, minHeight: 440, padding: 24, borderRadius: 4, shadowColor: '#1F4D3B', shadowOpacity: 0.09, shadowRadius: 9, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  paperHeader: { alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#DDE8E0', paddingBottom: 19, marginBottom: 23 },
  fakeSeal: { width: 43, height: 43, borderRadius: 22, backgroundColor: '#DDF3E6', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  paperHeading: { color: colors.light.primary, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  paperSubheading: { color: colors.light.mutedForeground, fontSize: 9, marginTop: 5 },
  paperLine: { height: 8, width: '100%', backgroundColor: '#E8EEE9', borderRadius: 3, marginBottom: 15 },
  signature: { marginTop: 31, alignItems: 'flex-end' },
  signatureLine: { width: 105, borderTopWidth: 1, borderTopColor: '#82948A' },
  signatureText: { color: colors.light.mutedForeground, fontSize: 9, marginTop: 5 },
  viewerNote: { marginTop: 16, padding: 13, borderRadius: 13, backgroundColor: '#E8F4EC', flexDirection: 'row', gap: 9 },
  noteText: { color: '#5E786A', flex: 1, fontSize: 10, lineHeight: 15 },
});
