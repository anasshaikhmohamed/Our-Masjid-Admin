import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import colors from '@/constants/colors';
import { formatINR } from '@/lib/data';
import { usePublishedProjects } from '@/lib/content';
import { AppHeader, HeroCarousel, ProjectCard, SectionTitle, StatCard } from '@/components/Ui';
import { getUnreadNotificationCount } from '@/lib/notifications';

export default function HomeScreen() {
  const { data } = usePublishedProjects();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  useFocusEffect(useCallback(() => {
    let active = true;
    void getUnreadNotificationCount().then((count) => { if (active) setUnreadNotifications(count); });
    return () => { active = false; };
  }, []));
  const projects = data?.projects ?? [];
  const urgentProjects = projects.filter((project) => project.status === 'Urgent');
  const activeProjects = projects.filter((project) => project.status === 'Active');
  const completedCount = projects.filter((project) => project.status === 'Completed').length;
  const masjidCount = new Set(projects.map((project) => project.name)).size;
  const totalRaised = projects.reduce((total, project) => total + project.raised, 0);

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        <AppHeader
          title="Every Masjid is verified"
          subtitle="See where every contribution goes."
          right={<Pressable onPress={() => router.push('/notifications')} style={styles.headerIcon}><Feather name="bell" size={17} color={colors.light.primary} />{unreadNotifications > 0 ? <View style={styles.notificationDot} /> : null}</Pressable>}
        />
        <HeroCarousel />
        <View style={styles.section}>
          <SectionTitle title="Our Impact" />
          <View style={styles.statGrid}>
            <StatCard icon="currency-inr" label="Total Raised" value={formatINR(totalRaised)} tone="green" onPress={() => router.push('/raised')} />
            <StatCard icon="tools" label="Active Projects" value={String(activeProjects.length)} tone="yellow" />
            <StatCard icon="check-circle-outline" label="Completed" value={String(completedCount)} tone="green" />
            <StatCard icon="mosque" label="Masjids" value={String(masjidCount)} tone="blue" />
          </View>
        </View>
        <View style={styles.section}>
          <SectionTitle title="Urgent Support Needed" action="View All" onAction={() => router.push('/(tabs)/masjids')} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {urgentProjects.map((project) => (
              <ProjectCard key={project.id} project={project} compact onPress={() => router.push({ pathname: '/masjid/[id]', params: { id: project.id } })} />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.light.background },
  section: { paddingHorizontal: 16, marginTop: 19 },
  headerIcon: { width: 37, height: 37, borderRadius: 13, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#1F4D3B', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  notificationDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#C51F2A', position: 'absolute', right: 8, top: 7 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 11 },
});
