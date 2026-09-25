import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ImageSourcePropType } from 'react-native';
import {
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
  project_expenses: Array<{ id: string; title: string; amount: number | string; expense_date: string | null; expense_documents: Array<{ id: string; document_type: string; file_url: string; is_private: boolean }> | null }> | null;
  project_documents: Array<{ id: string; document_type: string; file_url: string; is_private: boolean }> | null;
};

type PublicSlideRow = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  action_type: string | null;
  action_id: string | null;
};

export type ContentSource = 'cache' | 'supabase';

const PROJECTS_CACHE_KEY = '@our-masjid/cache/published-projects';
const HOME_SLIDES_CACHE_KEY = '@our-masjid/cache/home-slides';

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


function videoSources(rows: PublicProjectMediaRow[] | null | undefined) {
  return (rows ?? [])
    .filter((item) => item.media_type === 'video' && !!item.file_url)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => item.file_url);
}

function toProject(row: PublicProjectRow): Project {
  const target = Number(row.target_amount);
  const raised = Number(row.raised_amount);
  const beforeImages = mediaSources(row.project_media, 'before');
  const progressImages = mediaSources(row.project_media, 'progress');
  const afterImages = mediaSources(row.project_media, 'after');
  const videoUrls = videoSources(row.project_media);
  const documents = (row.project_documents ?? []).map((doc) => ({
    id: doc.id,
    title: doc.document_type === 'qazi_permission' ? 'Qazi-e-Shaher Permission Letter' : doc.document_type === 'support_letter' ? 'Support Letter' : doc.document_type === 'verification' ? 'Verification Document' : 'Project Document',
    url: doc.file_url,
    isPrivate: doc.is_private,
  }));
  const expenses = (row.project_expenses ?? []).map((expense) => {
    const bill = (expense.expense_documents ?? []).find((doc) => doc.document_type === 'bill' || doc.document_type === 'invoice');
    return { id: expense.id, title: expense.title, amount: Number(expense.amount), date: expense.expense_date, billUrl: bill?.file_url ?? null, billPrivate: bill?.is_private ?? true };
  });
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
    videoUrls,
    documents,
    expenses,
    verification: 'Published by Our Masjid',
  };
}

async function readCachedProjects(): Promise<PublishedProjectsResult | null> {
  try {
    const raw = await AsyncStorage.getItem(PROJECTS_CACHE_KEY);
    if (!raw) return null;
    const projects = JSON.parse(raw) as Project[];
    return Array.isArray(projects) && projects.length
      ? { projects, source: 'cache' }
      : null;
  } catch {
    return null;
  }
}

async function fetchPublishedProjects(): Promise<PublishedProjectsResult> {
  if (!supabase) {
    return (await readCachedProjects()) ?? { projects: [], source: 'cache' };
  }

  const { data, error } = await supabase
    .from('projects')
    .select(
      'id,title,short_description,full_description,target_amount,raised_amount,status,featured,category:categories(name),masjid:masjids(name,location,city,is_urgent,image_url),project_media(id,media_type,stage,file_url,caption,sort_order),project_documents(id,document_type,file_url,is_private),project_expenses(id,title,amount,expense_date,expense_documents(id,document_type,file_url,is_private))',
    )
    .eq('published', true)
    .neq('status', 'hidden')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    return (await readCachedProjects()) ?? Promise.reject(error);
  }

  const projects = ((data ?? []) as unknown as PublicProjectRow[]).map(toProject);
  try {
    await AsyncStorage.setItem(PROJECTS_CACHE_KEY, JSON.stringify(projects));
  } catch {
    // Cache failure must never block live content.
  }

  return { projects, source: 'supabase' };
}

export function usePublishedProjects() {
  return useQuery({
    queryKey: ['our-masjid', 'published-projects'],
    queryFn: fetchPublishedProjects,
    staleTime: 60_000,
    retry: false,
  });
}

export function usePublishedProject(id: string | undefined) {
  const query = usePublishedProjects();
  return {
    ...query,
    project: query.data?.projects.find((item) => item.id === id),
  };
}

export function useCompletedWork() {
  const query = usePublishedProjects();
  const remoteCompleted =
    query.data?.projects.filter((project) => project.status === 'Completed') ?? [];

  return {
    ...query,
    projects: remoteCompleted,
  };
}

async function readCachedHomeSlides(): Promise<PublicSlideRow[]> {
  try {
    const raw = await AsyncStorage.getItem(HOME_SLIDES_CACHE_KEY);
    if (!raw) return [];
    const slides = JSON.parse(raw) as PublicSlideRow[];
    return Array.isArray(slides) ? slides : [];
  } catch {
    return [];
  }
}

export function usePublishedHomeSlides() {
  return useQuery({
    queryKey: ['our-masjid', 'home-slides'],
    queryFn: async (): Promise<PublicSlideRow[]> => {
      if (!supabase) return readCachedHomeSlides();

      const { data, error } = await supabase
        .from('home_slides')
        .select('id,title,subtitle,image_url,action_type,action_id')
        .eq('published', true)
        .order('sort_order', { ascending: true });

      if (error) {
        return readCachedHomeSlides();
      }

      const slides = (data ?? []) as PublicSlideRow[];
      try {
        await AsyncStorage.setItem(HOME_SLIDES_CACHE_KEY, JSON.stringify(slides));
      } catch {
        // Cache failure must never block live content.
      }
      return slides;
    },
    staleTime: 60_000,
    retry: false,
  });
}
