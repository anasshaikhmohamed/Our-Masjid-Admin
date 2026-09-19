import { useQuery } from '@tanstack/react-query';
import type { ImageSourcePropType } from 'react-native';
import {
  completedProjects,
  projects as localProjects,
  type Project,
} from '@/lib/data';
import { supabase } from '@/lib/supabase';

type PublicProjectRow = {
  id: string;
  title: string;
  short_description: string | null;
  full_description: string | null;
  target_amount: number | string;
  raised_amount: number | string;
  status: 'draft' | 'ongoing' | 'completed' | 'hidden';
  featured: boolean;
  category: { name: string } | null;
  masjid: {
    name: string;
    location: string;
    city: string;
    is_urgent: boolean;
    image_url: string | null;
  } | null;
};

type PublicProjectMediaRow = {
  id: string;
  project_id: string;
  media_type: 'image' | 'video';
  stage: 'before' | 'progress' | 'after';
  file_url: string;
  caption: string | null;
  sort_order: number;
};

export type ProjectMediaItem = PublicProjectMediaRow & {
  uri: string;
};

const publicProjectMediaUrl = (fileUrl: string) => {
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  const base = supabase?.supabaseUrl ?? '';
  return `${base}/storage/v1/object/public/public-project-media/${fileUrl.replace(/^\/+/, '')}`;
};

type PublicSlideRow = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  action_type: string | null;
  action_id: string | null;
};

export type ContentSource = 'demo' | 'supabase';

export type PublishedProjectsResult = {
  projects: Project[];
  source: ContentSource;
};

const localImageFor = (id: string): ImageSourcePropType | undefined =>
  localProjects.find((project) => project.id === id)?.image;

function toProject(row: PublicProjectRow): Project {
  const localMatch = localProjects.find((project) => project.id === row.id);
  const target = Number(row.target_amount);
  const raised = Number(row.raised_amount);

  return {
    id: row.id,
    name: row.title,
    location: row.masjid?.location ?? row.masjid?.city ?? 'Community location',
    category: row.category?.name ?? 'Community support',
    status: row.masjid?.is_urgent
      ? 'Urgent'
      : row.status === 'completed'
        ? 'Completed'
        : 'Active',
    description: row.short_description ?? row.full_description ?? '',
    problem: row.full_description ?? row.short_description ?? '',
    target,
    raised,
    image: row.masjid?.image_url
      ? { uri: row.masjid.image_url }
      : localImageFor(row.id) ?? localProjects[0].image,
    verification: 'Published by Our Masjid',
  };
}

async function fetchPublishedProjects(): Promise<PublishedProjectsResult> {
  if (!supabase) {
    return { projects: localProjects, source: 'demo' };
  }

  const { data, error } = await supabase
    .from('projects')
    .select(
      'id,title,short_description,full_description,target_amount,raised_amount,status,featured,category:categories(name),masjid:masjids(name,location,city,is_urgent,image_url)',
    )
    .eq('published', true)
    .neq('status', 'hidden')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;

  return {
    projects: ((data ?? []) as unknown as PublicProjectRow[]).map(toProject),
    source: 'supabase',
  };
}

export function usePublishedProjects() {
  return useQuery({
    queryKey: ['our-masjid', 'published-projects'],
    queryFn: fetchPublishedProjects,
    initialData: { projects: localProjects, source: 'demo' as const },
    staleTime: 60_000,
  });
}

export function usePublishedProject(id: string | undefined) {
  const query = usePublishedProjects();
  return {
    ...query,
    project: query.data?.projects.find((item) => item.id === id) ?? localProjects[0],
  };
}

export function useCompletedWork() {
  const query = usePublishedProjects();
  const remoteCompleted =
    query.data?.projects.filter((project) => project.status === 'Completed') ?? [];

  const localCompleted: Project[] = completedProjects.map((project) => ({
    id: project.id,
    name: project.name,
    location: project.location,
    category: project.category,
    status: 'Completed',
    description: project.description,
    problem: project.description,
    target: project.amount,
    raised: project.amount,
    image: project.after,
    verification: 'Completed',
  }));

  return {
    ...query,
    projects: remoteCompleted.length ? remoteCompleted : localCompleted,
  };
}

export function usePublishedProjectMedia(projectId: string | undefined) {
  return useQuery({
    queryKey: ['our-masjid', 'project-media', projectId],
    enabled: Boolean(supabase && projectId),
    queryFn: async (): Promise<ProjectMediaItem[]> => {
      if (!supabase || !projectId) return [];

      const { data, error } = await supabase
        .from('project_media')
        .select('id,project_id,media_type,stage,file_url,caption,sort_order')
        .eq('project_id', projectId)
        .eq('media_type', 'image')
        .order('stage', { ascending: true })
        .order('sort_order', { ascending: true });

      if (error) throw error;

      return ((data ?? []) as PublicProjectMediaRow[]).map((item) => ({
        ...item,
        uri: publicProjectMediaUrl(item.file_url),
      }));
    },
    initialData: [],
    staleTime: 60_000,
  });
}

export function usePublishedProjectMediaMap(projectIds: string[]) {
  return useQuery({
    queryKey: ['our-masjid', 'project-media-map', projectIds],
    enabled: Boolean(supabase && projectIds.length),
    queryFn: async (): Promise<Record<string, ProjectMediaItem[]>> => {
      if (!supabase || !projectIds.length) return {};

      const { data, error } = await supabase
        .from('project_media')
        .select('id,project_id,media_type,stage,file_url,caption,sort_order')
        .in('project_id', projectIds)
        .eq('media_type', 'image')
        .order('stage', { ascending: true })
        .order('sort_order', { ascending: true });

      if (error) throw error;

      return ((data ?? []) as PublicProjectMediaRow[]).reduce<Record<string, ProjectMediaItem[]>>(
        (map, item) => {
          const media = { ...item, uri: publicProjectMediaUrl(item.file_url) };
          (map[item.project_id] ??= []).push(media);
          return map;
        },
        {},
      );
    },
    initialData: {},
    staleTime: 60_000,
  });
}

export function usePublishedHomeSlides() {
  return useQuery({
    queryKey: ['our-masjid', 'home-slides'],
    queryFn: async (): Promise<PublicSlideRow[]> => {
      if (!supabase) return [];

      const { data, error } = await supabase
        .from('home_slides')
        .select('id,title,subtitle,image_url,action_type,action_id')
        .eq('published', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return (data ?? []) as PublicSlideRow[];
    },
    initialData: [],
    staleTime: 60_000,
  });
}
