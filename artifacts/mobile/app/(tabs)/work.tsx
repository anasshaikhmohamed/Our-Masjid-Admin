import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import { completedProjects as localCompletedProjects, formatINR } from '@/lib/data';
import { useCompletedWork } from '@/lib/content';
import { AppHeader, Pill } from '@/components/Ui';
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider';

export default function OurWorkScreen() {
  const { projects } = useCompletedWork();

  const workProjects = projects.map((project, index) => {
    const fallback = localCompletedProjects[index % localCompletedProjects.length];
    return {
      project,
      before: fallback?.before ?? project.image,
      after: fallback?.after ?? project.image,
    };
  });

  return (
    <View style={styles.screen}>
      <FlatList
        data={workProjects}
        keyExtractor={({ project }) => project.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <AppHeader
              title="Our Work"
              right={
                <Feather
                  name="more-vertical"
                  size={21}
                  color={colors.light.foreground}
                />
              }
            />
            <View style={styles.impactStrip}>
              <View>
                <Text style={styles.impactValue}>{projects.length}</Text>
                <Text style={styles.impactLabel}>Completed</Text>
              </View>
              <View style={styles.impactDivider} />
              <View>
                <Text style={styles.impactValue}>15</Text>
                <Text style={styles.impactLabel}>Masjids</Text>
              </View>
              <View style={styles.impactDivider} />
              <View>
                <Text style={styles.impactValue}>₹17.6L</Text>
                <Text style={styles.impactLabel}>Raised</Text>
              </View>
            </View>
            <View style={styles.filters}>
              <Pill>All</Pill>
              <View style={styles.filterPill}><Text>Renovation</Text></View>
              <View style={styles.filterPill}><Text>Construction</Text></View>
              <View style={styles.filterPill}><Text>Electrical</Text></View>
            </View>
          </>
        }
        renderItem={({ item }) => {
          const project = item.project;
          return (
            <View style={styles.workCard}>
              <BeforeAfterSlider before={item.before} after={item.after} />
              <Pressable
                onPress={() =>
                  router.push({ pathname: '/work/[id]', params: { id: project.id } })
                }
                style={({ pressed }) => [
                  styles.workBody,
                  pressed && { opacity: 0.86 },
                ]}
              >
                <View style={styles.workTitleRow}>
                  <Text style={styles.workName}>{project.name}</Text>
                  <Pill>Completed</Pill>
                </View>
                <Text style={styles.workLocation}>
                  <Feather
                    name="map-pin"
                    size={12}
                    color={colors.light.mutedForeground}
                  />{' '}
                  {project.location}{'  '}
                  <MaterialCommunityIcons
                    name="shape-outline"
                    size={12}
                    color={colors.light.mutedForeground}
                  />{' '}
                  {project.category}
                </Text>
                <Text style={styles.workDescription}>{project.description}</Text>
                <View style={styles.workFooter}>
                  <Text style={styles.completedDate}>
                    <Feather
                      name="check-circle"
                      size={12}
                      color={colors.light.mutedForeground}
                    />{' '}
                    Completed project
                  </Text>
                  <Text style={styles.workAmount}>
                    {formatINR(project.raised)} raised
                  </Text>
                </View>
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No completed projects yet</Text>
            <Text style={styles.emptyCopy}>
              Completed projects will appear here once they are published from the Admin Panel.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.light.background },
  list: { paddingBottom: 100 },
  impactStrip: {
    marginHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 15,
    backgroundColor: '#DDF3E6',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  impactValue: {
    color: colors.light.primary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  impactLabel: {
    color: '#718A7C',
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  impactDivider: { width: 1, height: 31, backgroundColor: '#BBDAC7' },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 13 },
  filterPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    height: 31,
    justifyContent: 'center',
    borderRadius: 16,
  },
  workCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#1F4D3B',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  workBody: { padding: 12 },
  workTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 7 },
  workName: { flex: 1, color: colors.light.foreground, fontSize: 15, fontWeight: '600' },
  workLocation: { color: colors.light.mutedForeground, fontSize: 11, marginTop: 6 },
  workDescription: { color: '#67756D', fontSize: 12, lineHeight: 17, marginTop: 8 },
  workFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 11, alignItems: 'center' },
  completedDate: { color: colors.light.mutedForeground, fontSize: 10 },
  workAmount: { color: colors.light.primary, fontSize: 11, fontWeight: '600' },
  empty: { marginHorizontal: 16, marginTop: 30, padding: 24, borderRadius: 16, backgroundColor: '#FFFFFF', alignItems: 'center' },
  emptyTitle: { color: colors.light.foreground, fontSize: 16, fontWeight: '600' },
  emptyCopy: { color: colors.light.mutedForeground, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 8 },
});
