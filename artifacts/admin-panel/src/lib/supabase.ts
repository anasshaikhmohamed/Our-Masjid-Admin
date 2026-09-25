import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

export type AdminProfile = {
  id: string;
  name: string | null;
  role: 'user' | 'admin' | 'super_admin';
};

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export async function getAdminProfile(session: Session): Promise<AdminProfile> {
  if (!supabase) throw new Error('Supabase is not configured for the admin panel.');
  const { data, error } = await supabase
    .from('profiles')
    .select('id,name,role')
    .eq('id', session.user.id)
    .single();
  if (error) throw error;
  if (!data || !['admin', 'super_admin'].includes(data.role)) {
    throw new Error('This account does not have administrator access.');
  }
  return data as AdminProfile;
}

export async function recordAudit(
  adminId: string,
  action: string,
  entityType: string,
  entityId?: string,
  details: Record<string, Json> = {},
) {
  if (!supabase) throw new Error('Supabase is not configured for the admin panel.');
  const { error } = await supabase.from('audit_logs').insert({
    admin_id: adminId,
    action,
    entity_type: entityType,
    entity_id: entityId ?? null,
    details,
  });
  if (error) throw error;
}

export function publicStorageUrl(bucket: string, path: string) {
  if (!supabase) return '';
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function deletePublicMedia(
  bucket: 'public-masjid-media' | 'public-project-media' | 'public-home-media',
  path: string,
) {
  if (!supabase) throw new Error('Supabase is not configured for the admin panel.');
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

export async function uploadPublicMedia(
  bucket: 'public-masjid-media' | 'public-project-media' | 'public-home-media',
  file: File,
  folder: string,
) {
  if (!supabase) throw new Error('Supabase is not configured for the admin panel.');
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
  const path = `${folder}/${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  return { path, url: publicStorageUrl(bucket, path) };
}
export async function uploadPrivateDocument(file: File, folder: string) {
  if (!supabase) throw new Error('Supabase is not configured for the admin panel.');
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
  const path = `${folder}/${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage.from('private-documents').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  return { path };
}

export async function deletePrivateDocument(path: string) {
  if (!supabase) throw new Error('Supabase is not configured for the admin panel.');
  const { error } = await supabase.storage.from('private-documents').remove([path]);
  if (error) throw error;
}
