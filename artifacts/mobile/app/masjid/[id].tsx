import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import { formatINR, progressFor } from '@/lib/data';
import { usePublishedProject } from '@/lib/content';
import { InfoRow, Pill } from '@/components/Ui';
import { FramedImage } from '@/components/FramedImage';
import { ThemedModal } from '@/components/ThemedModal';

export default function MasjidDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { project, isLoading } = usePublishedProject(id);
  const [privateNoticeOpen, setPrivateNoticeOpen] = React.useState(false);
  if (isLoading || !project) {
    return <View style={styles.loading}><Text style={styles.loadingText}>Loading masjid…</Text></View>;
  }
  const progress = progressFor(project);
  const isUrgent = project.status === 'Urgent';
  const showPrivateNotice = () => setPrivateNoticeOpen(true);
  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.imageWrap}><FramedImage source={project.image} style={styles.heroImage} /><Pressable onPress={() => router.back()} style={[styles.backButton, { top: insets.top + 10 }]}><Feather name="arrow-left" size={20} color={colors.light.foreground} /></Pressable><View style={styles.imageBottom}><Pill tone={project.status === 'Urgent' ? 'red' : 'green'}>{project.status}</Pill><View style={styles.verified}><Feather name="check-circle" size={12} color={colors.light.primary} /><Text style={styles.verifiedText}>Verified</Text></View></View></View>
        <View style={styles.body}>
          <Text style={styles.title}>{project.name}</Text>
          {project.workTitle ? <Text style={styles.workTitle}>{project.workTitle}</Text> : null}
          <Text style={styles.location}><Feather name="map-pin" size={13} color={colors.light.mutedForeground} /> {project.location}</Text>
          <Text style={styles.description} numberOfLines={3}>{project.description}</Text>
          <View style={styles.section}><Text style={styles.sectionTitle}>Donation progress</Text><View style={styles.moneyGrid}><View><Text style={styles.moneyLabel}>Target</Text><Text style={[styles.moneyValue, { color: colors.light.primary }]}>{formatINR(project.target)}</Text></View><View><Text style={styles.moneyLabel}>Collected</Text><Text style={[styles.moneyValue, { color: colors.light.primary }]}>{formatINR(project.raised)}</Text></View><View><Text style={styles.moneyLabel}>Remaining</Text><Text style={[styles.moneyValue, { color: '#B4232D' }]}>{formatINR(project.target - project.raised)}</Text></View></View><View style={[styles.progressTrack, isUrgent && styles.progressTrackUrgent]}><View style={[styles.progressFill, isUrgent && styles.progressFillUrgent, { width: `${progress}%` }]} /></View><Text style={[styles.progressText, isUrgent && styles.progressTextUrgent]}>{progress}% completed</Text></View>
          <Pressable onPress={() => router.push({ pathname: '/donation', params: { id: project.id } })} style={({ pressed }) => [styles.donateButton, isUrgent && styles.urgentButton, pressed && { opacity: 0.85 }]}><MaterialCommunityIcons name="hand-heart-outline" size={19} color="#FFFFFF" /><Text style={styles.donateText}>Donate Now</Text></Pressable>
          {!isUrgent ? <Pressable onPress={() => router.push({ pathname: '/auto-pay', params: { id: project.id } })} style={({ pressed }) => [styles.autoPayButton, pressed && { opacity: 0.85 }]}><Feather name="repeat" size={17} color={colors.light.primary} /><Text style={styles.autoPayText}>Set up Auto Pay</Text></Pressable> : null}
          <View style={styles.infoGrid}><InfoRow icon="shape-outline" label="Category" value={project.category} /><InfoRow icon="shield-check-outline" label="Verification" value={project.verification} /><InfoRow icon="flag-outline" label="Status" value={project.status} /></View>
          <View style={styles.section}><Text style={styles.sectionTitle}>Why does this Masjid need help?</Text><Text style={styles.paragraph}>{project.problem}</Text></View>
          <View style={styles.section}><Text style={styles.sectionTitle}>Documents & verification</Text>{project.masjidDocuments?.length ? project.masjidDocuments.map((doc) => <Pressable key={doc.id} onPress={() => void Linking.openURL(doc.url)} style={styles.documentCard}><View style={[styles.documentIcon, { backgroundColor: '#DDF3E6' }]}><Feather name="file-text" size={19} color={colors.light.primary} /></View><View style={{ flex: 1 }}><Text style={styles.documentTitle}>{doc.title}</Text><Text style={styles.documentCopy}>Public verification document</Text></View><Feather name="external-link" size={16} color={colors.light.mutedForeground} /></Pressable>) : <View style={styles.documentCard}><View style={[styles.documentIcon, { backgroundColor: '#EEF3EF' }]}><Feather name="file-text" size={19} color={colors.light.mutedForeground} /></View><View style={{ flex: 1 }}><Text style={styles.documentTitle}>Masjid Documents</Text><Text style={styles.documentCopy}>No public document uploaded yet</Text></View></View>}<Pressable onPress={showPrivateNotice} style={styles.documentCard}><View style={[styles.documentIcon, { backgroundColor: '#FFF1D9' }]}><Feather name="lock" size={18} color="#AD7D2C" /></View><View style={{ flex: 1 }}><Text style={styles.documentTitle}>Masjid Real Documents</Text><Text style={styles.documentCopy}>Private and protected</Text></View><Feather name="chevron-right" size={17} color={colors.light.mutedForeground} /></Pressable></View>
        </View>
      </ScrollView>
      <ThemedModal
        visible={privateNoticeOpen}
        title="Masjid Real Documents"
        message="For privacy and security reasons, the original Masjid documents are not publicly accessible. Please contact us for further information or verification."
        icon="lock"
        primaryLabel="Contact Us"
        onClose={() => setPrivateNoticeOpen(false)}
        onPrimary={() => {
          setPrivateNoticeOpen(false);
          router.push({ pathname: '/profile-section', params: { section: 'contact' } });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.light.background },
  loading: { flex: 1, backgroundColor: colors.light.background, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: colors.light.mutedForeground, fontSize: 12 },
  content: { paddingBottom: 45 },
  imageWrap: { height: 205, position: 'relative', backgroundColor: '#EDF4EF' },
  heroImage: { width: '100%', height: '100%' },
  backButton: { position: 'absolute', left: 16, backgroundColor: 'rgba(255,255,255,0.96)', width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center', shadowColor: '#173F31', shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  imageBottom: { position: 'absolute', bottom: 14, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  verified: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.9)', flexDirection: 'row', gap: 4, alignItems: 'center' },
  verifiedText: { color: colors.light.primary, fontSize: 10, fontWeight: '600' },
  body: { padding: 16 },
  title: { color: colors.light.foreground, fontSize: 23, fontWeight: '700', letterSpacing: -0.5 },
  workTitle: { color: colors.light.mutedForeground, fontSize: 12, fontWeight: '600', marginTop: 3 },
  location: { color: colors.light.mutedForeground, fontSize: 12, marginTop: 7 },
  description: { color: '#64736B', fontSize: 13, lineHeight: 19, marginTop: 11 },
  infoGrid: { marginTop: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.light.border, paddingVertical: 4 },
  section: { marginTop: 23 },
  sectionTitle: { color: colors.light.foreground, fontSize: 16, fontWeight: '600', marginBottom: 9 },
  paragraph: { color: '#64736B', fontSize: 13, lineHeight: 20 },
  moneyGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  moneyLabel: { color: colors.light.mutedForeground, fontSize: 10, marginBottom: 4 },
  moneyValue: { color: colors.light.foreground, fontSize: 14, fontWeight: '600' },
  progressTrack: { height: 7, backgroundColor: '#E0EAE4', borderRadius: 5, overflow: 'hidden', marginTop: 15 },
  progressTrackUrgent: { backgroundColor: '#F4D5D8' },
  progressFill: { height: '100%', backgroundColor: colors.light.primary, borderRadius: 5 },
  progressFillUrgent: { backgroundColor: '#C51F2A' },
  progressText: { color: colors.light.primary, textAlign: 'right', fontSize: 11, fontWeight: '600', marginTop: 6 },
  progressTextUrgent: { color: '#B4232D' },
  donateButton: { height: 48, backgroundColor: colors.light.primary, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 22 },
  urgentButton: { backgroundColor: '#C51F2A' },
  donateText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  autoPayButton: { height: 46, borderRadius: 14, borderWidth: 1, borderColor: '#9FCDAF', backgroundColor: '#DDF3E6', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 10 },
  autoPayText: { color: colors.light.primary, fontSize: 13, fontWeight: '600' },
  documentCard: { backgroundColor: '#FFFFFF', borderRadius: 15, minHeight: 67, marginTop: 9, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 11, shadowColor: '#1F4D3B', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  documentIcon: { width: 37, height: 37, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  documentTitle: { color: colors.light.foreground, fontSize: 12, fontWeight: '600' },
  documentCopy: { color: colors.light.mutedForeground, fontSize: 10, marginTop: 4 },
});
