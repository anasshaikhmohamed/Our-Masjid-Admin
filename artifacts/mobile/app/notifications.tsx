import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import colors from '@/constants/colors';
import { AppNotification, fetchNotifications, markNotificationsRead } from '@/lib/notifications';

export default function NotificationsScreen() {
  const [rows, setRows] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true); else setLoading(true);
    try { setRows(await fetchNotifications()); await markNotificationsRead(); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.topSide}>
          <Feather name="arrow-left" size={19} color={colors.light.primary} />
        </Pressable>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.topSide} />
      </View>
      {loading ? <View style={styles.loading}><ActivityIndicator color={colors.light.primary} /></View> : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.light.primary} />}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {rows.length ? rows.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.icon}><Feather name="megaphone" size={17} color={colors.light.primary} /></View>
              <View style={styles.copy}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                <Text style={styles.body}>{item.body}</Text>
              </View>
            </View>
          )) : (
            <View style={styles.empty}><View style={styles.emptyIcon}><Feather name="bell-off" size={22} color={colors.light.primary} /></View><Text style={styles.emptyTitle}>You’re all caught up</Text><Text style={styles.emptyCopy}>Announcements and important updates from Our Masjid will appear here.</Text></View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.light.background },
  topBar: { paddingTop: 58, paddingHorizontal: 16, paddingBottom: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  topSide: { width: 38, height: 38, borderRadius: 13, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.light.foreground, fontSize: 17, fontWeight: '700' },
  content: { paddingHorizontal: 16, paddingBottom: 40, gap: 10 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, flexDirection: 'row', gap: 12 },
  icon: { width: 38, height: 38, borderRadius: 12, backgroundColor: '#DDF3E6', alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1 },
  cardTitle: { color: colors.light.foreground, fontSize: 13, fontWeight: '700' },
  date: { color: colors.light.mutedForeground, fontSize: 10, marginTop: 3 },
  body: { color: '#5D7168', fontSize: 12, lineHeight: 18, marginTop: 8 },
  empty: { marginTop: 60, alignItems: 'center', paddingHorizontal: 30 },
  emptyIcon: { width: 58, height: 58, borderRadius: 20, backgroundColor: '#DDF3E6', alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: colors.light.foreground, fontSize: 16, fontWeight: '700', marginTop: 14 },
  emptyCopy: { color: colors.light.mutedForeground, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 6 },
});
