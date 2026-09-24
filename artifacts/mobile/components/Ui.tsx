import React from 'react';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '@/constants/colors';
import { formatINR, progressFor, Project } from '@/lib/data';
import { usePublishedHomeSlides } from '@/lib/content';
import { FramedImage } from '@/components/FramedImage';

export function AppHeader({
  title = 'Our Masjid',
  subtitle,
  right,
}: {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <View>
        <Text style={styles.brand}>{title}</Text>
        {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function SectionTitle({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={10}>
          <Text style={styles.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Pill({
  children,
  tone = 'green',
}: {
  children: React.ReactNode;
  tone?: 'green' | 'red' | 'yellow' | 'blue' | 'dark';
}) {
  return (
    <View style={[styles.pill, pillToneStyles[tone]]}>
      <Text style={[styles.pillText, pillTextStyles[tone]]}>{children}</Text>
    </View>
  );
}

export function HeroCarousel() {
  const { data: remoteSlides, isLoading: slidesLoading } = usePublishedHomeSlides();
  const fallbackSlides = [
    {
      image: require('@/assets/images/masjid-hero.jpg'),
      title: 'Future For You',
      copy: 'Support your masjid and help build a better future together.',
    },
    {
      image: require('@/assets/images/masjid-exterior.jpg'),
      title: 'Our Masjid',
      copy: 'Support the places that serve our communities.',
    },
    {
      image: require('@/assets/images/masjid-interior.jpg'),
      title: 'Support Your Masjid',
      copy: 'Follow the work with transparency at every step.',
    },
  ];

  if (slidesLoading) {
    return <View style={styles.heroWrap} />;
  }

  const slides = remoteSlides?.length
    ? remoteSlides.map((slide) => ({
        image: slide.image_url ? ({ uri: slide.image_url } as ImageSourcePropType) : fallbackSlides[0].image,
        title: slide.title,
        copy: slide.subtitle ?? '',
      }))
    : fallbackSlides;

  return (
    <View style={styles.heroWrap}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        contentContainerStyle={styles.heroScroll}
      >
        {slides.map((slide, index) => (
          <View style={styles.heroSlide} key={`${slide.title}-${index}`}>
            <FramedImage
              source={slide.image}
              fallbackSource={fallbackSlides[index % fallbackSlides.length].image}
              style={styles.heroImage}
            />
            <View style={styles.heroShade} />
            <View style={styles.heroCopy}>
              <View style={styles.heroEyebrow}>
                <MaterialCommunityIcons name="mosque" size={13} color="#FFE795" />
                <Text style={styles.heroEyebrowText}>Our Masjid</Text>
              </View>
              <Text style={styles.heroTitle}>{slide.title}</Text>
              {slide.copy ? <Text style={styles.heroBody} numberOfLines={2}>{slide.copy}</Text> : null}
            </View>
            <View style={styles.dots}>
              {slides.map((_, dotIndex) => (
                <View
                  key={dotIndex}
                  style={[styles.dot, dotIndex === index && styles.dotActive]}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export function StatCard({
  icon,
  label,
  value,
  tone = 'green',
  onPress,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  tone?: 'green' | 'blue' | 'yellow';
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [styles.statCard, pressed && { opacity: 0.88 }]}>
      <View style={styles.statTop}>
        <Text style={styles.statLabel}>{label}</Text>
        <View style={[styles.statIcon, statIconStyles[tone]]}>
          <MaterialCommunityIcons
            name={icon}
            size={17}
            color={tone === 'blue' ? '#2974B9' : tone === 'yellow' ? '#A97411' : colors.light.primary}
          />
        </View>
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </Pressable>
  );
}

export function ProjectCard({
  project,
  onPress,
  compact = false,
  isSaved = false,
  onToggleSave,
}: {
  project: Project;
  onPress: () => void;
  compact?: boolean;
  isSaved?: boolean;
  onToggleSave?: () => void;
}) {
  const percentage = progressFor(project);
  const isUrgent = project.status === 'Urgent';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.projectCard, !compact && styles.projectCardList, compact && styles.projectCardCompact, pressed && { opacity: 0.92 }]}
    >
      <View style={styles.projectImageWrap}>
        <FramedImage source={project.image} style={compact ? styles.projectImageCompact : styles.projectImage} />
        {onToggleSave ? (
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              onToggleSave();
            }}
            hitSlop={8}
            style={[styles.saveButton, isSaved && styles.saveButtonSaved]}
          >
            <MaterialCommunityIcons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={isSaved ? '#FFFFFF' : colors.light.primary}
            />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.projectCardBody}>
        <View style={styles.projectMetaRow}>
          <Pill tone={isUrgent ? 'red' : 'green'}>{project.status}</Pill>
          <Text style={styles.projectCategory}>{project.category}</Text>
        </View>
        <Text style={styles.projectName} numberOfLines={1}>{project.name}</Text>
        {project.workTitle ? <Text style={styles.projectWorkTitle} numberOfLines={1}>{project.workTitle}</Text> : null}
        <Text style={styles.projectLocation}>
          <Feather name="map-pin" size={12} color={colors.light.mutedForeground} /> {project.location}
        </Text>
        {compact ? (
          <>
            <View style={[styles.progressTrack, isUrgent && styles.progressTrackUrgent]}><View style={[styles.progressFill, isUrgent && styles.progressFillUrgent, { width: `${percentage}%` }]} /></View>
            {project.status === 'Completed' ? (
              <View style={styles.compactMoneyRow}>
                <Text style={styles.compactRaised}>{formatINR(project.raised)} raised</Text>
                <Text style={styles.completedAmount}>✓ Completed</Text>
              </View>
            ) : (
              <View style={styles.compactMoneyRow}>
                <Text style={styles.compactRaised}>{formatINR(project.raised)} raised</Text>
                <Text style={[styles.compactLeft, isUrgent && styles.compactLeftUrgent]}>{formatINR(project.target - project.raised)} left</Text>
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={styles.projectDescription} numberOfLines={2}>{project.description}</Text>
            {project.status === 'Completed' ? (
              <View style={styles.completedRow}>
                <Text style={styles.moneyLabel}>Project status</Text>
                <Text style={styles.completedAmount}>✓ Completed</Text>
              </View>
            ) : (
              <View style={styles.moneyRow}>
                <View><Text style={styles.moneyLabel}>Target</Text><Text style={[styles.moneyValue, { color: colors.light.primary }]}>{formatINR(project.target)}</Text></View>
                <View><Text style={styles.moneyLabel}>Raised</Text><Text style={[styles.moneyValue, { color: colors.light.primary }]}>{formatINR(project.raised)}</Text></View>
                <View><Text style={styles.moneyLabel}>Needed</Text><Text style={[styles.moneyValue, { color: '#B4232D' }]}>{formatINR(project.target - project.raised)}</Text></View>
              </View>
            )}
            <View style={[styles.progressTrack, isUrgent && styles.progressTrackUrgent]}><View style={[styles.progressFill, isUrgent && styles.progressFillUrgent, { width: `${percentage}%` }]} /></View>
            <View style={styles.progressBottom}>
              <Text style={styles.progressText}>{percentage}% funded</Text>
              {project.status === 'Completed' ? <Text style={styles.progressText}>Fully funded</Text> : <Text style={styles.progressText}>{formatINR(project.target - project.raised)} left</Text>}
            </View>
            <View style={[styles.cardButton, isUrgent && styles.cardButtonUrgent]}><Text style={styles.cardButtonText}>View project</Text><Feather name="arrow-up-right" size={15} color="#FFFFFF" /></View>
          </>
        )}
      </View>
    </Pressable>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}><MaterialCommunityIcons name="archive-outline" size={26} color={colors.light.primary} /></View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

export function InfoRow({ icon, label, value }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}><MaterialCommunityIcons name={icon} size={18} color={colors.light.primary} /></View>
      <View style={{ flex: 1 }}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { color: colors.light.primary, fontSize: 22, fontWeight: '700', letterSpacing: -0.5 },
  headerSubtitle: { marginTop: 3, color: colors.light.mutedForeground, fontSize: 12 },
  sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: colors.light.foreground, fontSize: 17, fontWeight: '600' },
  sectionAction: { color: colors.light.primary, fontSize: 12, fontWeight: '600' },
  heroWrap: { marginHorizontal: 16, borderRadius: 20, overflow: 'hidden', height: 184, backgroundColor: '#173F31' },
  heroScroll: { alignItems: 'stretch' },
  heroSlide: { width: 356, height: 184, position: 'relative' },
  heroImage: { ...StyleSheet.absoluteFill },
  heroShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(7, 35, 24, 0.48)' },
  heroCopy: { position: 'absolute', left: 21, top: 18 },
  heroEyebrow: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20, backgroundColor: 'rgba(213, 178, 66, 0.28)', borderWidth: 1, borderColor: 'rgba(255,231,149,0.4)' },
  heroEyebrowText: { color: '#FFE795', fontSize: 11, fontWeight: '600', marginLeft: 5 },
  heroTitle: { color: '#FFFFFF', fontSize: 20, lineHeight: 24, fontWeight: '700', marginTop: 14 },
  heroBody: { color: 'rgba(255,255,255,0.82)', fontSize: 11, lineHeight: 16, marginTop: 6 },
  dots: { position: 'absolute', bottom: 11, width: '100%', flexDirection: 'row', justifyContent: 'center', gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.55)' },
  dotActive: { width: 18, backgroundColor: '#F2C644' },
  statCard: { width: '48.2%', backgroundColor: '#FFFFFF', borderRadius: 17, padding: 13, height: 104, justifyContent: 'space-between', shadowColor: '#1F4D3B', shadowOpacity: 0.06, shadowRadius: 11, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  statTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  statLabel: { color: colors.light.mutedForeground, fontSize: 12 },
  statIcon: { width: 29, height: 29, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  statIcon_green: { backgroundColor: '#DDF1E6' },
  statIcon_blue: { backgroundColor: '#E0F0FC' },
  statIcon_yellow: { backgroundColor: '#FFF3C9' },
  statValue: { color: colors.light.foreground, fontSize: 20, fontWeight: '500' },
  pill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 7, alignSelf: 'flex-start' },
  pillText: { color: colors.light.primary, fontSize: 10, fontWeight: '600' },
  pillText_red: { color: '#9E2630' },
  pill_green: { backgroundColor: '#DDF3E6' },
  pill_red: { backgroundColor: '#FFE3E5' },
  pill_yellow: { backgroundColor: '#FFF2C9' },
  pill_blue: { backgroundColor: '#DFEFFC' },
  pill_dark: { backgroundColor: '#E4EAE6' },
  projectCard: { backgroundColor: '#FFFFFF', borderRadius: 17, overflow: 'hidden', shadowColor: '#1F4D3B', shadowOpacity: 0.06, shadowRadius: 11, shadowOffset: { width: 0, height: 3 }, elevation: 2, marginBottom: 14 },
  projectCardList: { marginHorizontal: 16 },
  projectCardCompact: { width: 214, marginRight: 12, marginBottom: 0 },
  projectImageWrap: { position: 'relative' },
  saveButton: { position: 'absolute', right: 10, top: 10, width: 40, height: 40, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.94)', borderWidth: 1, borderColor: 'rgba(23,107,77,0.12)', alignItems: 'center', justifyContent: 'center', shadowColor: '#173F31', shadowOpacity: 0.13, shadowRadius: 7, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  saveButtonSaved: { backgroundColor: colors.light.primary, borderColor: colors.light.primary },
  projectImage: { width: '100%', height: 145 },
  projectImageCompact: { width: '100%', height: 108 },
  projectCardBody: { padding: 11 },
  projectMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  projectCategory: { color: colors.light.mutedForeground, fontSize: 11 },
  projectName: { color: colors.light.foreground, fontSize: 15, fontWeight: '600', marginTop: 8 },
  projectWorkTitle: { color: colors.light.mutedForeground, fontSize: 11, fontWeight: '600', marginTop: 3 },
  projectLocation: { color: colors.light.mutedForeground, fontSize: 11, marginTop: 4 },
  projectDescription: { color: '#69776F', fontSize: 12, lineHeight: 17, marginTop: 9 },
  moneyRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 },
  moneyLabel: { color: colors.light.mutedForeground, fontSize: 10, marginBottom: 3 },
  moneyValue: { color: colors.light.foreground, fontSize: 12, fontWeight: '600' },
  progressTrack: { height: 5, borderRadius: 4, backgroundColor: '#E1EAE4', marginTop: 14, overflow: 'hidden' },
  progressTrackUrgent: { backgroundColor: '#F4D5D8' },
  progressFill: { height: '100%', backgroundColor: colors.light.primary, borderRadius: 4 },
  progressFillUrgent: { backgroundColor: '#C51F2A' },
  compactMoneyRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  compactRaised: { color: colors.light.primary, fontSize: 10, fontWeight: '600' },
  compactLeft: { color: '#B4232D', fontSize: 10, fontWeight: '600' },
  compactLeftUrgent: { color: '#B4232D' },
  completedAmount: { color: '#1F7A4D', fontSize: 12, fontWeight: '700' },
  completedRow: { marginTop: 2, marginBottom: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressBottom: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  progressText: { color: colors.light.primary, fontSize: 10, fontWeight: '500' },
  cardButton: { marginTop: 12, backgroundColor: colors.light.primary, minHeight: 36, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  cardButtonUrgent: { backgroundColor: '#C51F2A' },
  cardButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  emptyState: { backgroundColor: '#FFFFFF', borderRadius: 17, padding: 28, alignItems: 'center' },
  emptyIcon: { backgroundColor: '#DDF3E6', width: 54, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { color: colors.light.foreground, fontWeight: '600', fontSize: 15, marginTop: 14 },
  emptyBody: { color: colors.light.mutedForeground, fontSize: 12, lineHeight: 17, textAlign: 'center', marginTop: 5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 9 },
  infoIcon: { width: 35, height: 35, borderRadius: 11, backgroundColor: '#DDF3E6', alignItems: 'center', justifyContent: 'center' },
  infoLabel: { color: colors.light.mutedForeground, fontSize: 11 },
  infoValue: { color: colors.light.foreground, fontSize: 13, fontWeight: '500', marginTop: 2 },
});

const pillToneStyles = {
  green: styles.pill_green,
  red: styles.pill_red,
  yellow: styles.pill_yellow,
  blue: styles.pill_blue,
  dark: styles.pill_dark,
};

const pillTextStyles = {
  green: styles.pillText,
  red: styles.pillText_red,
  yellow: styles.pillText,
  blue: styles.pillText,
  dark: styles.pillText,
};

const statIconStyles = {
  green: styles.statIcon_green,
  blue: styles.statIcon_blue,
  yellow: styles.statIcon_yellow,
};
