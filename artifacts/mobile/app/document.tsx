import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import colors from '@/constants/colors';

export default function DocumentScreen() {
  const { url = '', title = 'Document' } = useLocalSearchParams<{ url?: string; title?: string }>();
  const documentUrl = String(url);
  const documentTitle = String(title);
  const isPdf = /\.pdf(?:$|[?#])/i.test(documentUrl);
  const viewerUrl = isPdf
    ? `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(documentUrl)}`
    : documentUrl;

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.back}><Feather name="arrow-left" size={19} color={colors.light.foreground} /></Pressable>
        <Text numberOfLines={1} style={styles.title}>{documentTitle}</Text>
        <View style={{ width: 42 }} />
      </View>
      {documentUrl ? (
        <WebView
          source={{ uri: viewerUrl }}
          style={styles.webview}
          startInLoadingState
          renderLoading={() => <View style={styles.loading}><ActivityIndicator size="small" color={colors.light.primary} /><Text style={styles.loadingText}>Opening document…</Text></View>}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={['*']}
        />
      ) : (
        <View style={styles.loading}><Text style={styles.loadingText}>Document unavailable.</Text></View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.light.background },
  header: { height: 76, paddingHorizontal: 14, paddingTop: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: colors.light.border },
  back: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#EEF6F1', alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, marginHorizontal: 12, textAlign: 'center', color: colors.light.foreground, fontSize: 14, fontWeight: '700' },
  webview: { flex: 1, backgroundColor: colors.light.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 9 },
  loadingText: { color: colors.light.mutedForeground, fontSize: 12 },
});
