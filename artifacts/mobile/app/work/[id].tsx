import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import { completedProjects, formatINR } from '@/lib/data';
import { Pill } from '@/components/Ui';
import { FramedImage } from '@/components/FramedImage';

export default function WorkDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const project = completedProjects.find((item) => item.id === id) ?? completedProjects[0];
  const galleries = [
    { title: 'Before', images: [project.before, project.before] },
    { title: 'After Your Support', images: [project.after, project.after] },
  ];
  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}><Pressable onPress={() => router.back()} hitSlop={8} accessibilityRole="button" accessibilityLabel="Go back" style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}><Feather name="arrow-left" size={20} color={colors.light.foreground} /></Pressable><Text style={styles.topTitle}>Project detail</Text><View style={{ width: 44 }} /></View>
        <View style={styles.headerCard}><View style={styles.headerImage}><FramedImage source={project.after} style={styles.coverImage} /></View><View style={styles.headerBody}><View style={styles.titleRow}><Text style={styles.title}>{project.name}</Text><Pill>Completed</Pill></View><Text style={styles.meta}><Feather name="map-pin" size={12} color={colors.light.mutedForeground} /> {project.location}  ·  {project.category}</Text><Text style={styles.description}>{project.description}</Text></View></View>
        {galleries.map((gallery) => <View key={gallery.title} style={styles.section}><Text style={styles.sectionTitle}>{gallery.title}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gallery}>{gallery.images.map((image, index) => <View key={index} style={styles.galleryItem}><FramedImage source={image} style={styles.galleryImage} /><View style={styles.galleryDot}><Text style={styles.galleryDotText}>{index + 1} / {gallery.images.length}</Text></View></View>)}</ScrollView></View>)}
        <View style={styles.section}><Text style={styles.sectionTitle}>Project transparency</Text><View style={styles.transparencyCard}><View style={styles.transparencyTop}><View><Text style={styles.smallLabel}>Total project expenses</Text><Text style={styles.expenseTotal}>{formatINR(project.amount)}</Text></View><View style={styles.checkWrap}><Feather name="check" size={16} color={colors.light.primary} /></View></View><Text style={styles.transparencyCopy}>All expenses are recorded and linked to their corresponding bills or invoices.</Text><ExpenseRow title="Cement & materials" amount={25000} /><ExpenseRow title="Flooring and tiles" amount={18000} /><ExpenseRow title="Electrical work" amount={12000} /><ExpenseRow title="Labour" amount={20000} /></View></View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Project description</Text><Text style={styles.longCopy}>The original prayer hall needed repairs after years of heavy use. Our verified local team completed the work with community oversight, documenting each phase from the first day through the final handover. The renewed space is brighter, safer, and ready to serve the next generation.</Text></View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Documentation</Text><Pressable onPress={() => router.push({ pathname: '/document', params: { title: 'Qazi-e-Shaher Documentation' } })} style={styles.docRow}><Feather name="file-text" size={18} color={colors.light.primary} /><Text style={styles.docTitle}>Qazi-e-Shaher documentation</Text><Feather name="chevron-right" size={16} color={colors.light.mutedForeground} /></Pressable><Pressable onPress={() => Alert.alert('Masjid Real Documents', 'For privacy and security reasons, the original Masjid documents are not publicly accessible. Please contact us for further information or verification.', [{ text: 'Contact Us', onPress: () => router.push({ pathname: '/profile-section', params: { section: 'contact' } }) }, { text: 'Close', style: 'cancel' }])} style={styles.docRow}><Feather name="lock" size={18} color="#AD7D2C" /><Text style={styles.docTitle}>Masjid Real Documents</Text><Feather name="chevron-right" size={16} color={colors.light.mutedForeground} /></Pressable></View>
      </ScrollView>
    </View>
  );
}

function ExpenseRow({ title, amount }: { title: string; amount: number }) {
  return <View style={styles.expenseRow}><View><Text style={styles.expenseTitle}>{title}</Text><Text style={styles.expenseAmount}>{formatINR(amount)}</Text></View><Pressable onPress={() => Alert.alert('Bill viewer', `The original bill for ${title} is ready for viewing when document storage is connected.`)}><Text style={styles.viewBill}>View bill</Text></Pressable></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.light.background },
  content: { paddingBottom: 45 },
  topBar: { paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#173F31', shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  backButtonPressed: { opacity: 0.72 },
  topTitle: { color: colors.light.foreground, fontSize: 16, fontWeight: '600' },
  headerCard: { marginHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 17, overflow: 'hidden' },
  headerImage: { height: 185 },
  coverImage: { width: '100%', height: '100%' },
  headerBody: { padding: 13 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { color: colors.light.foreground, fontSize: 19, fontWeight: '700', flex: 1 },
  meta: { color: colors.light.mutedForeground, fontSize: 11, marginTop: 7 },
  description: { color: '#64736B', fontSize: 12, lineHeight: 18, marginTop: 9 },
  section: { marginTop: 22, paddingHorizontal: 16 },
  sectionTitle: { color: colors.light.foreground, fontSize: 16, fontWeight: '600', marginBottom: 10 },
  gallery: { gap: 10 },
  galleryItem: { width: 250, height: 155, borderRadius: 15, overflow: 'hidden', position: 'relative' },
  galleryImage: { width: '100%', height: '100%' },
  galleryDot: { position: 'absolute', bottom: 9, right: 9, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 7 },
  galleryDotText: { color: '#FFFFFF', fontSize: 10 },
  transparencyCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14 },
  transparencyTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  smallLabel: { color: colors.light.mutedForeground, fontSize: 11 },
  expenseTotal: { color: colors.light.foreground, fontSize: 21, fontWeight: '700', marginTop: 4 },
  checkWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#DDF3E6', alignItems: 'center', justifyContent: 'center' },
  transparencyCopy: { color: colors.light.mutedForeground, fontSize: 11, lineHeight: 16, marginTop: 9, marginBottom: 8 },
  expenseRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 11, borderTopWidth: 1, borderTopColor: colors.light.border },
  expenseTitle: { color: colors.light.foreground, fontSize: 12 },
  expenseAmount: { color: colors.light.mutedForeground, fontSize: 11, marginTop: 3 },
  viewBill: { color: colors.light.primary, fontSize: 11, fontWeight: '600' },
  longCopy: { color: '#64736B', fontSize: 13, lineHeight: 20 },
  docRow: { backgroundColor: '#FFFFFF', minHeight: 54, borderRadius: 13, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  docTitle: { color: colors.light.foreground, fontSize: 12, flex: 1 },
});
