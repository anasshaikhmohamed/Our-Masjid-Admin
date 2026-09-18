import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import colors from '@/constants/colors';
import { formatINR } from '@/lib/data';
import { usePublishedProjects } from '@/lib/content';
import { AppHeader, HeroCarousel, ProjectCard, SectionTitle, StatCard } from '@/components/Ui';

export default function HomeScreen() {
  const { data } = usePublishedProjects();
  const projects = data?.projects ?? [];
  const urgentProjects = projects.filter((project) => project.status === 'Urgent');
  const activeProjects = projects.filter((project) => project.status === 'Active');
  const totalRaised = projects.reduce((total, project) => total + project.raised, 0);

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 105 }}>
        <AppHeader
          title="Our Masjid"
          subtitle="Serving communities, building trust"
          right={<View style={styles.headerIcon}><Feather name="bell" size={17} color={colors.light.primary} /><View style={styles.notificationDot} /></View>}
        />
        <HeroCarousel />
        <View style={styles.section}>
          <SectionTitle title="Our Impact" />
          <View style={styles.statGrid}>
            <StatCard icon="currency-inr" label="Total Raised" value={formatINR(totalRaised)} tone="green" onPress={() => router.push('/raised')} />
            <StatCard icon="tools" label="Active Projects" value={String(activeProjects.length)} tone="yellow" />
            <StatCard icon="check-circle-outline" label="Completed" value={String(14)} tone="green" />
            <StatCard icon="mosque" label="Masjids" value={String(new Set(projects.map((project) => project.location)).size)} tone="blue" />
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
        <View style={styles.trustBanner}>
          <View style={styles.trustIcon}><Feather name="shield" size={17} color={colors.light.primary} /></View>
          <View style={{ flex: 1 }}><Text style={styles.trustTitle}>Every project is verified</Text><Text style={styles.trustCopy}>Follow the work. See where every contribution goes.</Text></View>
          <Feather name="arrow-up-right" size={17} color={colors.light.primary} />
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
  trustBanner: { marginHorizontal: 16, marginTop: 20, padding: 13, borderRadius: 15, backgroundColor: '#DDF3E6', flexDirection: 'row', alignItems: 'center', gap: 10 },
  trustIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  trustTitle: { color: colors.light.primary, fontSize: 12, fontWeight: '600' },
  trustCopy: { color: '#557066', fontSize: 10, marginTop: 3 },
});
