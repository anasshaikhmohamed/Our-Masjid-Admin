import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import { formatINR } from '@/lib/data';
import { useCompletedWork } from '@/lib/content';
import { AppHeader, Pill } from '@/components/Ui';
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider';

export default function OurWorkScreen() {
  const { projects, isLoading, isError, refetch } = useCompletedWork();

  return (
    <View style={styles.screen}>
      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <AppHeader title="Our Work" right={<Feather name="more-vertical" size={21} color={colors.light.foreground} />} />
            <View style={styles.impactStrip}>
              <View><Text style={styles.impactValue}>{projects.length}</Text><Text style={styles.impactLabel}>Completed</Text></View>
              <View style={styles.impactDivider} />
              <View><Text style={styles.impactValue}>{new Set(projects.map((item) => item.name)).size}</Text><Text style={styles.impactLabel}>Masjids</Text></View>
              <View style={styles.impactDivider} />
              <View><Text style={styles.impactValue}>₹{(projects.reduce((sum, item) => sum + item.raised, 0) / 100000).toFixed(1)}L</Text><Text style={styles.impactLabel}>Raised</Text></View>
            </View>
            <View style={styles.filters}><Pill>All</Pill><View style={styles.filterPill}><Text>Renovation</Text></View><View style={styles.filterPill}><Text>Construction</Text></View><View style={styles.filterPill}><Text>Electrical</Text></View></View>
            {isError ? (
              <Pressable onPress={() => refetch()} style={styles.retryBox}>
                <Text style={styles.retryTitle}>Could not load completed work</Text>
                <Text style={styles.retryCopy}>Tap to try again.</Text>
              </Pressable>
            ) : null}
            {isLoading && projects.length === 0 ? <Text style={styles.loadingText}>Loading completed work...</Text> : null}
          </>
        }
        renderItem={({ item }) => {
          const before = item.beforeImages?.[0] ?? item.image;
          const after = item.afterImages?.[0] ?? item.image;
          return (
            <View style={styles.workCard}>
              <BeforeAfterSlider before={before} after={after} />
              <Pressable
                onPress={() => router.push({ pathname: '/work/[id]', params: { id: item.id } })}
                style={({ pressed }) => [styles.workBody, pressed && { opacity: 0.86 }]}
              >
                <View style={styles.workTitleRow}><View style={{ flex: 1 }}><Text style={styles.workName}>{item.name}</Text>{item.workTitle ? <Text style={styles.workProjectTitle}>{item.workTitle}</Text> : null}</View><Pill>Completed</Pill></View>
                <Text style={styles.workLocation}><Feather name="map-pin" size={12} color={colors.light.mutedForeground} /> {item.location}  <MaterialCommunityIcons name="shape-outline" size={12} color={colors.light.mutedForeground} /> {item.category}</Text>
                <Text style={styles.workDescription}>{item.description}</Text>
                <View style={styles.workFooter}><Text style={styles.completedDate}><Feather name="check-circle" size={12} color={colors.light.mutedForeground} /> Completed</Text><Text style={styles.workAmount}>{formatINR(item.raised)} raised</Text></View>
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={!isLoading && !isError ? <View style={styles.empty}><Text style={styles.emptyTitle}>No completed work yet.</Text></View> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.light.background },
  list: { paddingBottom: 100 },
  impactStrip: { marginHorizontal: 16, paddingVertical: 11, borderRadius: 15, backgroundColor: '#DDF3E6', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  impactValue: { color: colors.light.primary, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  impactLabel: { color: '#718A7C', fontSize: 10, marginTop: 2, textAlign: 'center' },
  impactDivider: { width: 1, height: 31, backgroundColor: '#BBDAC7' },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 13 },
  filterPill: { backgroundColor: '#FFFFFF', paddingHorizontal: 14, height: 31, justifyContent: 'center', borderRadius: 16 },
  workCard: { marginHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 17, overflow: 'hidden', marginBottom: 14, shadowColor: '#1F4D3B', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  workBody: { padding: 12 },
  workTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 7 },
  workName: { color: colors.light.foreground, fontSize: 15, fontWeight: '600' },
  workProjectTitle: { color: colors.light.mutedForeground, fontSize: 11, fontWeight: '600', marginTop: 3 },
  workLocation: { color: colors.light.mutedForeground, fontSize: 11, marginTop: 6 },
  workDescription: { color: '#67756D', fontSize: 12, lineHeight: 17, marginTop: 8 },
  workFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 11, alignItems: 'center' },
  completedDate: { color: colors.light.mutedForeground, fontSize: 10 },
  workAmount: { color: colors.light.primary, fontSize: 11, fontWeight: '600' },
  retryBox: { marginHorizontal: 16, marginBottom: 12, padding: 12, borderRadius: 12, backgroundColor: '#FFF0F1' },
  retryTitle: { color: '#9E2630', fontSize: 12, fontWeight: '600' },
  retryCopy: { color: '#9E2630', fontSize: 10, marginTop: 3 },
  loadingText: { marginHorizontal: 16, marginBottom: 12, color: colors.light.mutedForeground, fontSize: 11 },
  empty: { marginHorizontal: 16, padding: 24, backgroundColor: '#FFFFFF', borderRadius: 16 },
  emptyTitle: { textAlign: 'center', color: colors.light.foreground, fontSize: 13, fontWeight: '600' },
});
