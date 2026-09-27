import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '@/constants/colors';
import { usePublishedProjects } from '@/lib/content';
import { AppHeader, ProjectCard } from '@/components/Ui';
import { loadSavedMasjidIds, toggleSavedMasjid } from '@/lib/saved';

const filters = ['All', 'Urgent', 'Renovation', 'Construction', 'Electrical', 'Plumbing', 'Roofing'];
export default function MasjidsScreen() {
  const { data } = usePublishedProjects();
  const projects = data?.projects ?? [];
  const activeProjectCount = projects.filter((project) => project.status === 'Active').length;
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  useFocusEffect(React.useCallback(() => {
    let active = true;
    void loadSavedMasjidIds().then((ids) => { if (active) setSavedIds(ids); });
    return () => { active = false; };
  }, []));
  const toggleSaved = async (id: string) => {
    const next = await toggleSavedMasjid(id);
    setSavedIds(next);
  };
  const filteredProjects = useMemo(() => projects.filter((project) => {
    const matchesSearch = `${project.name} ${project.location}`.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || (filter === 'Urgent' && project.status === 'Urgent') || project.category === filter;
    return matchesSearch && matchesFilter;
  }), [projects, search, filter]);

  return (
    <View style={styles.screen}>
      <FlatList
        data={filteredProjects}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ListHeaderComponent={() => (
          <>
            <AppHeader title="Masjids" right={<View style={styles.activeBadge}><MaterialCommunityIcons name="mosque" size={14} color={colors.light.primary} /><Text style={styles.activeBadgeText}>{activeProjectCount} Active</Text></View>} />
            <View style={styles.searchBox}><Feather name="search" size={18} color={colors.light.mutedForeground} /><TextInput value={search} onChangeText={setSearch} placeholder="Search masjid or location..." placeholderTextColor={colors.light.mutedForeground} style={styles.searchInput} /></View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
              {filters.map((item) => (
                <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filterChip, item === 'Urgent' && styles.filterChipUrgent, filter === item && styles.filterChipActive, filter === item && item === 'Urgent' && styles.filterChipUrgentActive]}>
                  {item === 'All' ? <MaterialCommunityIcons name="view-grid-outline" size={14} color={filter === item ? colors.light.primary : colors.light.mutedForeground} /> : null}
                  <Text style={[styles.filterText, item === 'Urgent' && styles.urgentFilterText, filter === item && styles.filterTextActive, filter === item && item === 'Urgent' && styles.urgentFilterTextActive]}>{item}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Text style={styles.resultText}>{filteredProjects.length} masjids found</Text>
          </>
        )}
        extraData={`${filter}|${search}|${projects.length}|${savedIds.join(',')}`}
        renderItem={({ item }) => <ProjectCard project={item} isSaved={savedIds.includes(item.id)} onToggleSave={() => toggleSaved(item.id)} onPress={() => router.push({ pathname: '/masjid/[id]', params: { id: item.id } })} />}
        ListEmptyComponent={<View style={{ marginTop: 18 }}><Text style={styles.emptyText}>No Masjids match your search.</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.light.background },
  list: { paddingBottom: 100 },
  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#DDF3E6', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20 },
  activeBadgeText: { color: colors.light.primary, fontSize: 11, fontWeight: '600' },
  searchBox: { marginHorizontal: 16, height: 45, borderRadius: 15, backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 13, gap: 10, shadowColor: '#1F4D3B', shadowOpacity: 0.04, shadowRadius: 7, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  searchInput: { flex: 1, color: colors.light.foreground, fontSize: 13 },
  filterList: { paddingHorizontal: 16, paddingVertical: 13, gap: 8 },
  filterChip: { height: 32, borderRadius: 17, backgroundColor: '#FFFFFF', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: 'transparent' },
  filterChipActive: { backgroundColor: '#DDF3E6', borderColor: '#8CB9A1' },
  filterChipUrgent: { backgroundColor: '#FFF0F1' },
  filterChipUrgentActive: { borderColor: '#E4A4A9' },
  filterText: { color: colors.light.mutedForeground, fontSize: 11 },
  filterTextActive: { color: colors.light.primary, fontWeight: '600' },
  urgentFilterText: { color: '#9E2630' },
  urgentFilterTextActive: { color: '#9E2630', fontWeight: '600' },
  resultText: { color: colors.light.mutedForeground, fontSize: 11, marginHorizontal: 16, marginBottom: 10 },
  emptyText: { textAlign: 'center', color: colors.light.mutedForeground, fontSize: 13 },
});
