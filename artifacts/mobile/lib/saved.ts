import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_MASJIDS_KEY = 'savedMasjids';

export async function loadSavedMasjidIds(): Promise<string[]> {
  try {
    const value = await AsyncStorage.getItem(SAVED_MASJIDS_KEY);
    if (!value) return [];
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export async function toggleSavedMasjid(id: string): Promise<string[]> {
  const current = await loadSavedMasjidIds();
  const next = current.includes(id)
    ? current.filter((savedId) => savedId !== id)
    : [...current, id];
  await AsyncStorage.setItem(SAVED_MASJIDS_KEY, JSON.stringify(next));
  return next;
}
