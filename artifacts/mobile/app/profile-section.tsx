import React, { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import { EmptyState, InfoRow, Pill, ProjectCard } from '@/components/Ui';
import { usePublishedProjects } from '@/lib/content';
import { AppNotification, fetchNotifications, markNotificationsRead } from '@/lib/notifications';
import { loadSavedMasjidIds, toggleSavedMasjid } from '@/lib/saved';

const titles: Record<string, string> = { donations: 'My Donations', history: 'Donation History', saved: 'Saved Masjids', notifications: 'Notifications', auto: 'Auto Sadqa', about: 'About Our Masjid', contact: 'Contact Us' };

export default function ProfileSectionScreen() {
  const { section = 'about' } = useLocalSearchParams<{ section?: string }>();
  const title = titles[section] ?? 'Profile';
  const [enabled, setEnabled] = useState(false);
  const [frequency, setFrequency] = useState('Monthly');
  const [autoConfig, setAutoConfig] = useState<{ projectName?: string; amount?: number; frequency?: string; status?: string } | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const { data } = usePublishedProjects();
  const liveProjects = data?.projects ?? [];
  useEffect(() => {
    if (section !== 'auto') return;
    AsyncStorage.getItem('autoPayConfig').then((value) => {
      if (value) {
        const config = JSON.parse(value) as { projectName?: string; amount?: number; frequency?: string; status?: string };
        setAutoConfig(config);
        setEnabled(config.status === 'active');
        setFrequency(config.frequency ?? 'Monthly');
      }
    });
  }, [section]);
  useFocusEffect(React.useCallback(() => {
    if (section !== 'saved') return undefined;
    let active = true;
    void loadSavedMasjidIds().then((ids) => { if (active) setSavedIds(ids); });
    return () => { active = false; };
  }, [section]));
  const cancelAutoPay = async () => {
    await AsyncStorage.removeItem('autoPayConfig');
    setAutoConfig(null);
    setEnabled(false);
  };
  const toggleSaved = async (id: string) => {
    const next = await toggleSavedMasjid(id);
    setSavedIds(next);
  };
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}><Pressable onPress={() => router.back()} style={styles.backButton}><Feather name="arrow-left" size={19} color={colors.light.foreground} /></Pressable><Text style={styles.topTitle}>{title}</Text><View style={{ width: 38 }} /></View>
        {section === 'about' ? <About /> : null}
        {section === 'contact' ? <Contact /> : null}
        {section === 'auto' ? <AutoSadqa enabled={enabled} setEnabled={setEnabled} frequency={frequency} setFrequency={setFrequency} existing={autoConfig} onCancel={cancelAutoPay} /> : null}
        {section === 'saved' ? <SavedMasjids savedIds={savedIds} projects={liveProjects} onToggleSave={toggleSaved} /> : null}
        {section === 'notifications' ? <NotificationsSummary /> : null}
        {['donations', 'history'].includes(section) ? <EmptyState title="You haven't made any donations yet" body="Your activity will appear here once you get started." /> : null}
      </ScrollView>
    </View>
  );
}

function NotificationsSummary() {
  const [rows, setRows] = useState<AppNotification[]>([]);
  useEffect(() => {
    let active = true;
    void fetchNotifications().then((items) => { if (active) setRows(items.slice(0, 5)); });
    void markNotificationsRead();
    return () => { active = false; };
  }, []);
  if (!rows.length) return <EmptyState title="You’re all caught up" body="Announcements and important updates from Our Masjid will appear here." />;
  return <View>{rows.map((item) => <View key={item.id} style={styles.notificationCard}><View style={styles.notificationIcon}><Feather name="bell" size={16} color={colors.light.primary} /></View><View style={{ flex: 1 }}><Text style={styles.notificationTitle}>{item.title}</Text><Text style={styles.notificationDate}>{new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text><Text style={styles.notificationBody}>{item.body}</Text></View></View>)}</View>;
}

function About() {
  return <><View style={styles.aboutHero}><View style={styles.aboutIcon}><MaterialCommunityIcons name="mosque" size={26} color={colors.light.primary} /></View><Text style={styles.aboutTitle}>Transparency with purpose</Text><Text style={styles.aboutCopy}>Our Masjid helps communities support verified Masjid projects with clarity, dignity, and care.</Text></View><View style={styles.card}><InfoRow icon="target" label="Our mission" value="Make it simple to discover and support genuine community needs." /><InfoRow icon="shield-check-outline" label="How projects are verified" value="Each project is reviewed with documentation and local context before it is listed." /><InfoRow icon="eye-outline" label="Our transparency promise" value="See the work, understand the need, and follow how support is used." /></View></>;
}

function Contact() {
  return <><Text style={styles.contactIntro}>We’re here to help with project questions, verification, and donation support.</Text><ContactAction icon="phone" title="Phone" value="9702647554" onPress={() => Linking.openURL('tel:9702647554')} /><ContactAction icon="message-circle" title="WhatsApp" value="9702647554" onPress={() => Linking.openURL('https://wa.me/919702647554')} /><ContactAction icon="mail" title="Email" value="anasshaikhmohamed@gmail.com" onPress={() => Linking.openURL('mailto:anasshaikhmohamed@gmail.com')} /><View style={[styles.card, { marginTop: 10 }]}><InfoRow icon="map-marker-outline" label="Location" value="Kurla, Mumbai, Maharashtra" /></View></>;
}

function ContactAction({ icon, title, value, onPress }: { icon: keyof typeof Feather.glyphMap; title: string; value: string; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.contactAction, pressed && { opacity: 0.84 }]}><View style={styles.contactActionIcon}><Feather name={icon} size={17} color={colors.light.primary} /></View><View style={{ flex: 1 }}><Text style={styles.contactActionTitle}>{title}</Text><Text style={styles.contactActionValue}>{value}</Text></View><Feather name="arrow-up-right" size={16} color={colors.light.primary} /></Pressable>;
}

function SavedMasjids({ savedIds, projects, onToggleSave }: { savedIds: string[]; projects: import('@/lib/data').Project[]; onToggleSave: (id: string) => void }) {
  const savedProjects = projects.filter((project) => savedIds.includes(project.id));
  if (!savedProjects.length) return <EmptyState title="No saved Masjids yet" body="Save a project to follow its progress here." />;
  return <View>{savedProjects.map((project) => <ProjectCard key={project.id} project={project} isSaved onToggleSave={() => onToggleSave(project.id)} onPress={() => router.push({ pathname: '/masjid/[id]', params: { id: project.id } })} />)}</View>;
}

function AutoSadqa({ enabled, setEnabled, frequency, setFrequency, existing, onCancel }: { enabled: boolean; setEnabled: (value: boolean) => void; frequency: string; setFrequency: (value: string) => void; existing: { projectName?: string; amount?: number; frequency?: string; status?: string } | null; onCancel: () => void }) {
  return <><View style={styles.autoCard}><View style={styles.autoTop}><View style={styles.autoIcon}><Feather name="repeat" size={20} color={colors.light.primary} /></View><View style={{ flex: 1 }}><Text style={styles.autoTitle}>Auto Sadqa</Text><Text style={styles.autoCopy}>{existing?.projectName ? `${existing.projectName} · ₹${existing.amount?.toLocaleString('en-IN')} · ${existing.frequency}` : 'Plan a recurring donation for a Masjid you care about.'}</Text></View><Switch value={enabled} onValueChange={setEnabled} trackColor={{ false: '#D4DFD7', true: '#9FCDAF' }} thumbColor={enabled ? colors.light.primary : '#FFFFFF'} /></View>{enabled ? <><Text style={styles.label}>Frequency</Text><View style={styles.frequencyRow}>{['Daily', 'Weekly', 'Monthly'].map((item) => <Pressable key={item} onPress={() => setFrequency(item)} style={[styles.frequency, frequency === item && styles.frequencyActive]}><Text style={[styles.frequencyText, frequency === item && styles.frequencyTextActive]}>{item}</Text></Pressable>)}</View><Text style={styles.autoNotice}>Recurring payment processing will be enabled when a secure payment gateway is connected.</Text>{existing ? <Pressable onPress={onCancel} style={styles.cancelButton}><Text style={styles.cancelText}>Pause / Cancel Auto Pay</Text></Pressable> : null}</> : <View style={styles.autoEmpty}><Pill tone="yellow">Not active</Pill><Text style={styles.autoEmptyText}>Turn on Auto Sadqa from an active Masjid page to choose a schedule.</Text></View>}</View></>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.light.background },
  content: { padding: 16, paddingBottom: 45 },
  topBar: { paddingTop: 36, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  topTitle: { color: colors.light.foreground, fontSize: 16, fontWeight: '600' },
  aboutHero: { backgroundColor: '#DDF3E6', borderRadius: 17, padding: 18, alignItems: 'center' },
  aboutIcon: { width: 57, height: 57, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  aboutTitle: { color: colors.light.primary, fontSize: 17, fontWeight: '700', marginTop: 12 },
  aboutCopy: { color: '#5D796B', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 6 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 17, padding: 13, marginTop: 15 },
  contactIntro: { color: colors.light.mutedForeground, fontSize: 13, lineHeight: 19, marginBottom: 2 },
  contactAction: { minHeight: 60, marginTop: 10, backgroundColor: '#FFFFFF', borderRadius: 15, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 11 },
  contactActionIcon: { width: 37, height: 37, borderRadius: 11, backgroundColor: '#DDF3E6', alignItems: 'center', justifyContent: 'center' },
  contactActionTitle: { color: colors.light.foreground, fontSize: 12, fontWeight: '600' },
  contactActionValue: { color: colors.light.mutedForeground, fontSize: 10, marginTop: 3 },
  autoCard: { backgroundColor: '#FFFFFF', borderRadius: 17, padding: 15 },
  autoTop: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  autoIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#DDF3E6', alignItems: 'center', justifyContent: 'center' },
  autoTitle: { color: colors.light.foreground, fontSize: 14, fontWeight: '600' },
  autoCopy: { color: colors.light.mutedForeground, fontSize: 11, lineHeight: 16, marginTop: 3 },
  autoEmpty: { backgroundColor: '#F5F8F5', borderRadius: 12, padding: 12, marginTop: 18, flexDirection: 'row', alignItems: 'center', gap: 9 },
  autoEmptyText: { color: colors.light.mutedForeground, fontSize: 11, flex: 1, lineHeight: 16 },
  label: { color: colors.light.foreground, fontSize: 12, fontWeight: '600', marginTop: 22, marginBottom: 9 },
  frequencyRow: { flexDirection: 'row', gap: 8 },
  frequency: { flex: 1, backgroundColor: '#F4F8F5', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  frequencyActive: { backgroundColor: '#DDF3E6', borderWidth: 1, borderColor: '#8CB9A1' },
  frequencyText: { color: colors.light.mutedForeground, fontSize: 11 },
  frequencyTextActive: { color: colors.light.primary, fontWeight: '600' },
  autoNotice: { color: '#8B6C2A', backgroundColor: '#FFF7E5', borderRadius: 10, padding: 10, fontSize: 10, lineHeight: 15, marginTop: 17 },
  cancelButton: { minHeight: 40, borderRadius: 11, backgroundColor: '#FFF0F1', alignItems: 'center', justifyContent: 'center', marginTop: 14 },
  notificationCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 12, marginBottom: 10, borderRadius: 12, backgroundColor: colors.light.card, },
  notificationIcon: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: colors.light.background, },
  notificationTitle: { fontSize: 14, fontWeight: "700", color: colors.light.text, },
  notificationDate: { fontSize: 11, color: colors.light.muted, marginTop: 2, },
  notificationBody: { fontSize: 13, color: colors.light.secondary, marginTop: 5, lineHeight: 18, },
  cancelText: { color: '#9E2630', fontSize: 11, fontWeight: '600' },
});
