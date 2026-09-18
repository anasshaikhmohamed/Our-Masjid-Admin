import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_KEY = 'demoAuthSession';
const PENDING_PHONE_KEY = 'demoPendingPhone';

export type DemoAuthSession = {
  authenticated: true;
  phone: string;
  name: string;
};

export async function getDemoSession(): Promise<DemoAuthSession | null> {
  const value = await AsyncStorage.getItem(SESSION_KEY);
  if (!value) return null;

  try {
    const session = JSON.parse(value) as Partial<DemoAuthSession>;
    if (session.authenticated && session.phone && session.name) {
      return {
        authenticated: true,
        phone: session.phone,
        name: session.name,
      };
    }
  } catch {
    // Treat a malformed local value as an expired demo session.
  }

  return null;
}

export async function savePendingPhone(phone: string): Promise<void> {
  await AsyncStorage.setItem(PENDING_PHONE_KEY, phone);
}

export async function getPendingPhone(): Promise<string> {
  return (await AsyncStorage.getItem(PENDING_PHONE_KEY)) ?? '';
}

export async function completeDemoLogin({
  phone,
  name,
}: {
  phone: string;
  name: string;
}): Promise<void> {
  const profileValue = await AsyncStorage.getItem('profile');
  let existingProfile: { email?: string } = {};

  if (profileValue) {
    try {
      existingProfile = JSON.parse(profileValue) as { email?: string };
    } catch {
      existingProfile = {};
    }
  }

  await AsyncStorage.multiSet([
    [
      SESSION_KEY,
      JSON.stringify({
        authenticated: true,
        phone,
        name,
      } satisfies DemoAuthSession),
    ],
    [
      'profile',
      JSON.stringify({
        ...existingProfile,
        name,
        phone,
      }),
    ],
  ]);
  await AsyncStorage.removeItem(PENDING_PHONE_KEY);
}

export async function clearDemoSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}