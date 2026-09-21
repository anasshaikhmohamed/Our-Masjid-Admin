import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import { formatINR } from '@/lib/data';
import { usePublishedProject } from '@/lib/content';
import { Pill } from '@/components/Ui';
import { FramedImage } from '@/components/FramedImage';

export default function WorkDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { project, isLoading } = usePublishedProject(id);

  if (isLoading && !project) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={styles.loadingText}>Loading project...</Text>
      </View>
    );
  }

  const image = project.image;

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          >
            <Feather name="arrow-left" size={20} color={colors.light.foreground} />
          </Pressable>
          <Text style={styles.topTitle}>Project detail</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.headerCard}>
          <View style={styles.headerImage}>
            <FramedImage source={image} style={styles.coverImage} />
          </View>
          <View style={styles.headerBody}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{project.name}</Text>
              <Pill>Completed</Pill>
            </View>
            <Text style={styles.meta}>
              <Feather name="map-pin" size={12} color={colors.light.mutedForeground} />{' '}
              {project.location}  ·  {project.category}
            </Text>
            <Text style={styles.description}>{project.description}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project gallery</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gallery}>
            {[image, image].map((source, index) => (
              <View key={index} style={styles.galleryItem}>
                <FramedImage source={source} style={styles.galleryImage} />
                <View style={styles.galleryDot}>
                  <Text style={styles.galleryDotText}>{index + 1} / 2</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project transparency</Text>
          <View style={styles.transparencyCard}>
            <View style={styles.transparencyTop}>
              <View>
                <Text style={styles.smallLabel}>Project amount raised</Text>
                <Text style={styles.expenseTotal}>{formatINR(project.raised)}</Text>
              </View>
              <View style={styles.checkWrap}>
                <Feather name="check" size={16} color={colors.light.primary} />
              </View>
            </View>
            <Text style={styles.transparencyCopy}>
              Project information is published by Our Masjid for transparency and community visibility.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project description</Text>
          <Text style={styles.longCopy}>{project.problem || project.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documentation</Text>
          <Pressable
            onPress={() => router.push({ pathname: '/document', params: { title: 'Qazi-e-Shaher Documentation' } })}
            style={styles.docRow}
          >
            <Feather name="file-text" size={18} color={colors.light.primary} />
            <Text style={styles.docTitle}>Qazi-e-Shaher documentation</Text>
            <Feather name="chevron-right" size={16} color={colors.light.mutedForeground} />
          </Pressable>
          <Pressable
            onPress={() =>
              Alert.alert(
                'Masjid Real Documents',
                'For privacy and security reasons, the original Masjid documents are not publicly accessible. Please contact us for further information or verification.',
                [
                  { text: 'Contact Us', onPress: () => router.push({ pathname: '/profile-section', params: { section: 'contact' } }) },
                  { text: 'Close', style: 'cancel' },
                ],
              )
            }
            style={styles.docRow}
          >
            <Feather name="lock" size={18} color="#AD7D2C" />
            <Text style={styles.docTitle}>Masjid Real Documents</Text>
            <Feather name="chevron-right" size={16} color={colors.light.mutedForeground} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.light.background },
  loadingScreen: { flex: 1, backgroundColor: colors.light.background, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: colors.light.mutedForeground, fontSize: 13 },
  content: { paddingBottom: 45 },
  topBar: { paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#173F31', shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  backButtonPressed: { opacity: 0.72 },
  topTitle: { color: colors.light.foreground, fontSize: 16, fontWeight: '600' },
  headerCard: { marginHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 17, overflow: 'hidden' },
  headerImage: { height: 190 },
  coverImage: { width: '100%', height: '100%' },
  headerBody: { padding: 13 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { flex: 1, color: colors.light.foreground, fontSize: 18, fontWeight: '700' },
  meta: { color: colors.light.mutedForeground, fontSize: 11, marginTop: 7 },
  description: { color: '#67756D', fontSize: 12, lineHeight: 18, marginTop: 9 },
  section: { marginHorizontal: 16, marginTop: 19 },
  sectionTitle: { color: colors.light.foreground, fontSize: 16, fontWeight: '600', marginBottom: 10 },
  gallery: { gap: 10 },
  galleryItem: { width: 270, height: 175, borderRadius: 15, overflow: 'hidden', backgroundColor: '#E8F0EA', position: 'relative' },
  galleryImage: { width: '100%', height: '100%' },
  galleryDot: { position: 'absolute', right: 9, bottom: 9, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8 },
  galleryDotText: { color: '#FFFFFF', fontSize: 10 },
  transparencyCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14 },
  transparencyTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  smallLabel: { color: colors.light.mutedForeground, fontSize: 10 },
  expenseTotal: { color: colors.light.primary, fontSize: 20, fontWeight: '700', marginTop: 3 },
  checkWrap: { width: 34, height: 34, borderRadius: 11, backgroundColor: '#DDF3E6', alignItems: 'center', justifyContent: 'center' },
  transparencyCopy: { color: '#67756D', fontSize: 11, lineHeight: 17, marginTop: 10 },
  longCopy: { color: '#67756D', fontSize: 12, lineHeight: 19, backgroundColor: '#FFFFFF', borderRadius: 15, padding: 14 },
  docRow: { minHeight: 54, backgroundColor: '#FFFFFF', borderRadius: 14, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  docTitle: { color: colors.light.foreground, fontSize: 12, flex: 1 },
});
