import { useQuery } from '@tanstack/react-query';
import type { ImageSourcePropType } from 'react-native';
import {
  completedProjects,
  projects as localProjects,
  type Project,
} from '@/lib/data';
import { supabase } from '@/lib/supabase';

type PublicProjectMediaRow = {
  id: string;
  media_type: 'image' | 'video';
  stage: 'before' | 'progress' | 'after';
  file_url: string;
  caption: string | null;
  sort_order: number;
};

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
  project_media: PublicProjectMediaRow[] | null;
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

function mediaSources(rows: PublicProjectMediaRow[] | null | undefined, stage: PublicProjectMediaRow['stage']) {
  return (rows ?? [])
    .filter((item) => item.media_type === 'image' && item.stage === stage && !!item.file_url)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => ({ uri: item.file_url } as ImageSourcePropType));
}

function toProject(row: PublicProjectRow): Project {
  const target = Number(row.target_amount);
  const raised = Number(row.raised_amount);
  const beforeImages = mediaSources(row.project_media, 'before');
  const progressImages = mediaSources(row.project_media, 'progress');
  const afterImages = mediaSources(row.project_media, 'after');
  const fallbackImage = row.masjid?.image_url
    ? ({ uri: row.masjid.image_url } as ImageSourcePropType)
    : localImageFor(row.id) ?? localProjects[0].image;

  return {
    id: row.id,
    // The mobile app represents a masjid; keep the actual project/work title separately.
    name: row.masjid?.name ?? row.title,
    workTitle: row.title,
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
    image: fallbackImage,
    beforeImages,
    progressImages,
    afterImages,
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
      'id,title,short_description,full_description,target_amount,raised_amount,status,featured,category:categories(name),masjid:masjids(name,location,city,is_urgent,image_url),project_media(id,media_type,stage,file_url,caption,sort_order)',
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
    initialDataUpdatedAt: 0,
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

  return {
    ...query,
    projects: remoteCompleted.length ? remoteCompleted : completedProjects,
  };
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
    initialDataUpdatedAt: 0,
    staleTime: 60_000,
  });
}
