import React, { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import { AppHeader } from '@/components/Ui';
import { clearDemoSession } from '@/lib/auth';

const activity = [
  { section: 'activity', key: 'donations', icon: 'hand-heart-outline', title: 'My Donations', copy: 'View your donation history', color: '#DDF3E6' },
  { section: 'activity', key: 'history', icon: 'history', title: 'Donation History', copy: 'All past contributions', color: '#DFEFFC' },
  { section: 'activity', key: 'saved', icon: 'bookmark-outline', title: 'Saved Masjids', copy: 'Masjids you’ve bookmarked', color: '#FFF1C6' },
  { section: 'activity', key: 'notifications', icon: 'bell-outline', title: 'Notifications', copy: 'Project updates & alerts', color: '#FFF0D9' },
  { section: 'more', key: 'auto', icon: 'autorenew', title: 'Auto Sadqa', copy: 'Manage recurring donations', color: '#E9E0F9' },
];
const about = [
  { key: 'about', icon: 'mosque', title: 'About Our Masjid', copy: 'Our mission & story', color: '#DDF3E6' },
  { key: 'contact', icon: 'card-account-phone-outline', title: 'Contact Us', copy: 'Get in touch with us', color: '#DDF3E6' },
];

function ProfileRow({ item }: { item: { key: string; icon: string; title: string; copy: string; color: string } }) {
  return (
    <Pressable onPress={() => router.push({ pathname: '/profile-section', params: { section: item.key } })} style={({ pressed }) => [styles.row, pressed && { backgroundColor: '#F4F8F5' }]}>
      <View style={[styles.rowIcon, { backgroundColor: item.color }]}><MaterialCommunityIcons name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap} size={19} color={colors.light.primary} /></View>
      <View style={{ flex: 1 }}><Text style={styles.rowTitle}>{item.title}</Text><Text style={styles.rowCopy}>{item.copy}</Text></View>
      <Feather name="chevron-right" size={17} color={colors.light.mutedForeground} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<{ name?: string; phone?: string; email?: string }>({});
  useFocusEffect(useCallback(() => {
    let mounted = true;
    AsyncStorage.getItem('profile').then((value) => {
      if (mounted && value) setProfile(JSON.parse(value) as { name?: string; phone?: string; email?: string });
    });
    return () => { mounted = false; };
  }, []));

  const logout = () => {
    Alert.alert('Log out?', 'You can sign back in with the demo flow anytime.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await clearDemoSession();
          router.replace('/splash');
        },
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <AppHeader title="Profile" />
        <Pressable onPress={() => router.push('/profile-edit')} style={({ pressed }) => [styles.profileCard, pressed && { opacity: 0.9 }]}>
          <View style={styles.avatar}><Feather name="user" size={24} color={colors.light.primary} /></View>
          <View><Text style={styles.profileName}>{profile.name || 'Guest User'}</Text><Text style={styles.profileCopy}>{profile.email || profile.phone || 'Supporting masjids & communities'}</Text></View>
          <Feather name="chevron-right" size={18} color={colors.light.mutedForeground} style={{ marginLeft: 'auto' }} />
        </Pressable>
        <Text style={styles.groupLabel}>My Activity</Text>
        <View style={styles.groupCard}>{activity.slice(0, 4).map((item) => <ProfileRow key={item.key} item={item} />)}</View>
        <Text style={styles.groupLabel}>More</Text>
        <View style={styles.groupCard}><ProfileRow item={activity[4]} /></View>
        <Text style={styles.groupLabel}>About</Text>
        <View style={styles.groupCard}>{about.map((item) => <ProfileRow key={item.key} item={item} />)}</View>
        <Pressable onPress={logout} style={({ pressed }) => [styles.logoutButton, pressed && { opacity: 0.75 }]}>
          <Feather name="log-out" size={16} color={colors.light.destructive} />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.light.background },
  content: { paddingBottom: 105 },
  profileCard: { marginHorizontal: 16, padding: 17, backgroundColor: '#FFFFFF', borderRadius: 18, flexDirection: 'row', alignItems: 'center', gap: 13, shadowColor: '#1F4D3B', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#DDF3E6', alignItems: 'center', justifyContent: 'center' },
  profileName: { color: colors.light.foreground, fontSize: 15, fontWeight: '500' },
  profileCopy: { color: colors.light.mutedForeground, fontSize: 11, marginTop: 4 },
  groupLabel: { color: colors.light.mutedForeground, fontSize: 12, fontWeight: '500', marginHorizontal: 16, marginTop: 22, marginBottom: 8 },
  groupCard: { marginHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 17, overflow: 'hidden' },
  row: { minHeight: 64, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 11 },
  rowIcon: { width: 36, height: 36, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { color: colors.light.foreground, fontSize: 13 },
  rowCopy: { color: colors.light.mutedForeground, fontSize: 10, marginTop: 3 },
  logoutButton: { minHeight: 50, marginHorizontal: 16, marginTop: 22, marginBottom: 8, borderRadius: 15, backgroundColor: '#FFF4F4', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  logoutText: { color: colors.light.destructive, fontSize: 12, fontWeight: '600' },
});
