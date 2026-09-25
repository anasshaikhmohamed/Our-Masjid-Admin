import React from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import { formatINR } from '@/lib/data';
import { usePublishedProject } from '@/lib/content';
import { Pill } from '@/components/Ui';
import { FramedImage } from '@/components/FramedImage';
import { ThemedModal } from '@/components/ThemedModal';

function ProjectVideo({ url }: { url: string }) {
  const player = useVideoPlayer(url);
  return <View style={styles.videoWrap}><VideoView style={styles.video} player={player} allowsFullscreen allowsPictureInPicture contentFit="contain" /><View style={styles.videoLabel}><Feather name="play-circle" size={14} color="#FFFFFF" /><Text style={styles.videoLabelText}>Project video</Text></View></View>;
}

export default function WorkDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { project, isLoading } = usePublishedProject(id);
  const [privateNoticeOpen, setPrivateNoticeOpen] = React.useState(false);

  if (isLoading || !project) {
    return <View style={styles.loading}><Feather name="loader" size={22} color={colors.light.primary} /><Text style={styles.loadingText}>Loading project…</Text></View>;
  }

  const beforeImages = project.beforeImages?.length ? project.beforeImages : [project.image];
  const afterImages = project.afterImages?.length ? project.afterImages : [project.image];
  const galleries = [
    { title: 'Before', images: beforeImages },
    { title: 'After Your Support', images: afterImages },
  ];
  const expenses = project.expenses ?? [];
  const publicDocs = (project.documents ?? []).filter((doc) => !doc.isPrivate);
  const publicMasjidDocs = (project.masjidDocuments ?? []).filter((doc) => !doc.isPrivate);

  const showPrivateNotice = () => setPrivateNoticeOpen(true);

  return (
    <View style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backButton}><Feather name="arrow-left" size={20} color={colors.light.foreground} /></Pressable>
          <Text style={styles.topTitle}>Project detail</Text><View style={{ width: 44 }} />
        </View>
        <View style={styles.headerCard}>
          <View style={styles.headerImage}><FramedImage source={afterImages[0]} style={styles.coverImage} /></View>
          <View style={styles.headerBody}><View style={styles.titleRow}><View style={{ flex: 1 }}><Text style={styles.title}>{project.name}</Text>{project.workTitle ? <Text style={styles.workTitle}>{project.workTitle}</Text> : null}</View><Pill>Completed</Pill></View><Text style={styles.meta}><Feather name="map-pin" size={12} color={colors.light.mutedForeground} /> {project.location}  ·  {project.category}</Text><Text style={styles.description}>{project.description}</Text></View>
        </View>

        {galleries.map((gallery) => <View key={gallery.title} style={styles.section}><Text style={styles.sectionTitle}>{gallery.title}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gallery}>{gallery.images.map((image, index) => <View key={index} style={styles.galleryItem}><FramedImage source={image} style={styles.galleryImage} /><View style={styles.galleryDot}><Text style={styles.galleryDotText}>{index + 1} / {gallery.images.length}</Text></View></View>)}</ScrollView></View>)}

        {(project.videoUrls ?? []).length > 0 && <View style={styles.section}><Text style={styles.sectionTitle}>Project Videos</Text>{(project.videoUrls ?? []).map((url, index) => <ProjectVideo key={`${url}-${index}`} url={url} />)}</View>}

        <View style={styles.section}><Text style={styles.sectionTitle}>Project transparency</Text><View style={styles.transparencyCard}><View style={styles.transparencyTop}><View><Text style={styles.smallLabel}>Recorded project expenses</Text><Text style={styles.expenseTotal}>{formatINR(expenses.reduce((sum, item) => sum + item.amount, 0))}</Text></View><View style={styles.checkWrap}><Feather name="check" size={16} color={colors.light.primary} /></View></View><Text style={styles.transparencyCopy}>Expenses are recorded by the admin panel and supporting bills are protected according to their privacy setting.</Text>{expenses.length ? expenses.map((expense) => <ExpenseRow key={expense.id} expense={expense} onPrivate={showPrivateNotice} />) : <Text style={styles.noData}>No expense records have been published for this project.</Text>}</View></View>

        <View style={styles.section}><Text style={styles.sectionTitle}>Project description</Text><Text style={styles.longCopy}>{project.problem || project.description}</Text></View>

        <View style={styles.section}><Text style={styles.sectionTitle}>Documentation</Text>
          {publicDocs.map((doc) => <Pressable key={`project-${doc.id}`} onPress={() => void Linking.openURL(doc.url)} style={styles.docRow}><Feather name="file-text" size={18} color={colors.light.primary} /><Text style={styles.docTitle}>{doc.title}</Text><Feather name="external-link" size={16} color={colors.light.mutedForeground} /></Pressable>)}
          {publicMasjidDocs.map((doc) => <Pressable key={`masjid-${doc.id}`} onPress={() => void Linking.openURL(doc.url)} style={styles.docRow}><Feather name="file-text" size={18} color={colors.light.primary} /><Text style={styles.docTitle}>{doc.title}</Text><Feather name="external-link" size={16} color={colors.light.mutedForeground} /></Pressable>)}
          {!publicDocs.length && !publicMasjidDocs.length ? <View style={styles.docRow}><Feather name="file-text" size={18} color={colors.light.mutedForeground} /><Text style={styles.docTitle}>Qazi-e-Shaher permission letter</Text><Text style={styles.docMuted}>Not uploaded</Text></View> : null}
          <Pressable onPress={showPrivateNotice} style={styles.docRow}><Feather name="lock" size={18} color="#AD7D2C" /><Text style={styles.docTitle}>Private project / Masjid documents</Text><Feather name="chevron-right" size={16} color={colors.light.mutedForeground} /></Pressable>
        </View>
      </ScrollView>
      <ThemedModal
        visible={privateNoticeOpen}
        title="Private documents"
        message="Original supporting documents and private bills are protected. Please contact Our Masjid if verification is required."
        icon="lock"
        primaryLabel="Contact Us"
        onClose={() => setPrivateNoticeOpen(false)}
        onPrimary={() => {
          setPrivateNoticeOpen(false);
          router.push({ pathname: '/profile-section', params: { section: 'contact' } });
        }}
      />
    </View>
  );
}

function ExpenseRow({ expense, onPrivate }: { expense: NonNullable<import('@/lib/data').Project['expenses']>[number]; onPrivate: () => void }) {
  return <View style={styles.expenseRow}><View style={{ flex: 1 }}><Text style={styles.expenseTitle}>{expense.title}</Text><Text style={styles.expenseAmount}>{formatINR(expense.amount)}{expense.date ? ` · ${expense.date}` : ''}</Text></View>{expense.billUrl && !expense.billPrivate ? <Pressable onPress={() => void Linking.openURL(expense.billUrl!)}><Text style={styles.viewBill}>View bill</Text></Pressable> : <Pressable onPress={onPrivate}><Text style={styles.privateBill}><Feather name="lock" size={11} /> Private bill</Text></Pressable>}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.light.background }, content: { paddingBottom: 45 }, loading: { flex: 1, backgroundColor: colors.light.background, alignItems: 'center', justifyContent: 'center' }, loadingText: { color: colors.light.mutedForeground, fontSize: 12, marginTop: 8 },
  topBar: { paddingHorizontal: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, backButton: { width: 44, height: 44, borderRadius: 15, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', shadowColor: '#173F31', shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 }, topTitle: { color: colors.light.foreground, fontSize: 16, fontWeight: '600' },
  headerCard: { marginHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 17, overflow: 'hidden' }, headerImage: { height: 185 }, coverImage: { width: '100%', height: '100%' }, headerBody: { padding: 13 }, titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }, title: { color: colors.light.foreground, fontSize: 19, fontWeight: '700' }, workTitle: { color: colors.light.mutedForeground, fontSize: 12, fontWeight: '600', marginTop: 3 }, meta: { color: colors.light.mutedForeground, fontSize: 11, marginTop: 7 }, description: { color: '#64736B', fontSize: 12, lineHeight: 18, marginTop: 9 }, section: { marginTop: 22, paddingHorizontal: 16 }, sectionTitle: { color: colors.light.foreground, fontSize: 16, fontWeight: '600', marginBottom: 10 }, gallery: { gap: 10 }, galleryItem: { width: 250, height: 155, borderRadius: 15, overflow: 'hidden', position: 'relative' }, galleryImage: { width: '100%', height: '100%' }, galleryDot: { position: 'absolute', bottom: 9, right: 9, backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 7 }, galleryDotText: { color: '#FFFFFF', fontSize: 10 },
  videoWrap: { height: 210, borderRadius: 16, overflow: 'hidden', backgroundColor: '#0E3328', marginBottom: 10, position: 'relative' }, video: { width: '100%', height: '100%' }, videoLabel: { position: 'absolute', left: 10, bottom: 10, backgroundColor: 'rgba(0,0,0,.55)', borderRadius: 9, paddingHorizontal: 9, paddingVertical: 6, flexDirection: 'row', gap: 6, alignItems: 'center' }, videoLabelText: { color: '#FFFFFF', fontSize: 10, fontWeight: '600' },
  transparencyCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14 }, transparencyTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, smallLabel: { color: colors.light.mutedForeground, fontSize: 11 }, expenseTotal: { color: colors.light.foreground, fontSize: 21, fontWeight: '700', marginTop: 4 }, checkWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: '#DDF3E6', alignItems: 'center', justifyContent: 'center' }, transparencyCopy: { color: colors.light.mutedForeground, fontSize: 11, lineHeight: 16, marginTop: 9, marginBottom: 8 }, expenseRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 11, borderTopWidth: 1, borderTopColor: colors.light.border }, expenseTitle: { color: colors.light.foreground, fontSize: 12 }, expenseAmount: { color: colors.light.mutedForeground, fontSize: 11, marginTop: 3 }, viewBill: { color: colors.light.primary, fontSize: 11, fontWeight: '600' }, privateBill: { color: '#9B6A1C', fontSize: 11, fontWeight: '600' }, noData: { color: colors.light.mutedForeground, fontSize: 11, paddingTop: 10 }, longCopy: { color: '#64736B', fontSize: 13, lineHeight: 20 }, docRow: { backgroundColor: '#FFFFFF', minHeight: 54, borderRadius: 13, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }, docTitle: { color: colors.light.foreground, fontSize: 12, flex: 1 }, docMuted: { color: colors.light.mutedForeground, fontSize: 10 },
});
