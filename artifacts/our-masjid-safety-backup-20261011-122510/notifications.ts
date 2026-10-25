import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  created_at: string;
};

const NOTIFICATION_CACHE_KEY = '@our-masjid/cache/notifications';
const NOTIFICATION_READ_AT_KEY = '@our-masjid/notifications/read-at';

export async function registerForPushNotifications() {
  if (!supabase) return;
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('announcements', {
        name: 'Announcements',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 150, 250],
        sound: 'default',
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }
    if (status !== 'granted') return;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
    if (!projectId) return;

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    if (!token) return;

    await supabase.from('device_push_tokens').upsert(
      { token, platform: Platform.OS, active: true },
      { onConflict: 'token' },
    );
  } catch {
    // Push permission/token registration must never block the app.
  }
}

export async function readCachedNotifications(): Promise<AppNotification[]> {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATION_CACHE_KEY);
    if (!raw) return [];
    const rows = JSON.parse(raw) as AppNotification[];
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

export async function fetchNotifications(): Promise<AppNotification[]> {
  if (!supabase) return readCachedNotifications();
  const { data, error } = await supabase
    .from('notifications')
    .select('id,title,body,created_at')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) return readCachedNotifications();
  const rows = (data ?? []) as AppNotification[];
  try {
    await AsyncStorage.setItem(NOTIFICATION_CACHE_KEY, JSON.stringify(rows));
  } catch {
    // Cache failure must never block notifications.
  }
  return rows;
}

export async function getNotificationsReadAt() {
  return AsyncStorage.getItem(NOTIFICATION_READ_AT_KEY);
}

export async function markNotificationsRead() {
  await AsyncStorage.setItem(NOTIFICATION_READ_AT_KEY, new Date().toISOString());
}

export async function getUnreadNotificationCount() {
  const [rows, readAt] = await Promise.all([fetchNotifications(), getNotificationsReadAt()]);
  if (!readAt) return rows.length;
  const timestamp = new Date(readAt).getTime();
  return rows.filter((row) => new Date(row.created_at).getTime() > timestamp).length;
}
