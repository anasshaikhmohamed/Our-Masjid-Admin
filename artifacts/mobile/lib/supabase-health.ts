import { supabaseAnonKey, supabaseUrl } from '@/lib/supabase';

export type SupabaseHealthResult = {
  ok: true;
  status: number;
};

/**
 * Performs a read-only request against Supabase Auth.
 * This verifies the URL and anon key without reading or changing app data.
 */
export async function verifySupabaseConnection(): Promise<SupabaseHealthResult> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase is not configured for this build.');
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
    headers: {
      apikey: supabaseAnonKey,
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase connection failed with HTTP ${response.status}.`);
  }

  return {
    ok: true,
    status: response.status,
  };
}