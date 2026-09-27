
import { useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ImageSourcePropType } from 'react-native';
import { projects as localProjects, type Project } from '@/lib/data';
import { supabase } from '@/lib/supabase';

type PublicProjectMediaRow = {
  id: string;
  project_id: string;
  media_type: 'image' | 'video';
  stage: 'before' | 'progress' | 'after';
  file_url: string;
  caption: string | null;
  sort_order: number;
};

type CoreProjectRow = {
  id: string;
  title: string;
  masjid_id: string;
  category_id: string | null;
  short_description: string | null;
  full_description: string | null;
  target_amount: number | string;
  raised_amount: number | string;
  status: 'draft' | 'ongoing' | 'completed' | 'hidden';
  featured: boolean;
};

type PublicMasjidRow = {
  id: string;
  name: string;
  location: string;
  city: string;
  is_urgent: boolean;
  image_url: string | null;
};

type PublicCategoryRow = { id: string; name: string };
type PublicDocumentRow = { id: string; masjid_id?: string; project_id?: string; document_type: string; file_url: string; is_private: boolean };
type PublicExpenseRow = { id: string; project_id: string; title: string; amount: number | string; expense_date: string | null };
type PublicExpenseDocumentRow = { id: string; expense_id: string; document_type: string; file_url: string; is_private: boolean };

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

export type PublishedProjectsResult = { projects: Project[]; source: ContentSource };
const localImageFor = (id: string): ImageSourcePropType | undefined => localProjects.find((project) => project.id === id)?.image;

function mediaSources(rows: PublicProjectMediaRow[], stage: PublicProjectMediaRow['stage']) {
  return rows.filter((item) => item.media_type === 'image' && item.stage === stage && !!item.file_url).sort((a, b) => a.sort_order - b.sort_order).map((item) => ({ uri: item.file_url } as ImageSourcePropType));
}
function videoSources(rows: PublicProjectMediaRow[]) {
  return rows.filter((item) => item.media_type === 'video' && !!item.file_url).sort((a, b) => a.sort_order - b.sort_order).map((item) => item.file_url);
}

function documentTitle(documentType: string) {
  if (documentType === 'qazi_permission') return 'Qazi-e-Shaher Permission Letter';
  if (documentType === 'support_letter') return 'Support Letter';
  if (documentType === 'verification') return 'Verification Document';
  return 'Project Document';
}

function toProject(
  row: CoreProjectRow,
  masjid: PublicMasjidRow | undefined,
  category: PublicCategoryRow | undefined,
  media: PublicProjectMediaRow[],
  projectDocs: PublicDocumentRow[],
  expenses: PublicExpenseRow[],
  expenseDocs: PublicExpenseDocumentRow[],
  masjidDocs: PublicDocumentRow[],
): Project {
  const target = Number(row.target_amount);
  const raised = Number(row.raised_amount);
  const beforeImages = mediaSources(media, 'before');
  const afterImages = mediaSources(media, 'after');
  const documents = projectDocs.map((doc) => ({ id: doc.id, title: documentTitle(doc.document_type), url: doc.file_url, isPrivate: doc.is_private }));
  const projectExpenses = expenses.map((expense) => {
    const bill = expenseDocs.find((doc) => doc.expense_id === expense.id && (doc.document_type === 'bill' || doc.document_type === 'invoice'));
    return { id: expense.id, title: expense.title, amount: Number(expense.amount), date: expense.expense_date, billUrl: bill?.file_url ?? null, billPrivate: bill?.is_private ?? false };
  });
  const fallbackImage = masjid?.image_url ? ({ uri: masjid.image_url } as ImageSourcePropType) : localImageFor(row.id) ?? localProjects[0].image;
  return {
    id: row.id,
    masjidId: row.masjid_id,
    name: masjid?.name ?? row.title,
    workTitle: row.title,
    location: masjid?.location ?? masjid?.city ?? 'Community location',
    category: category?.name ?? 'Community support',
    status: masjid?.is_urgent ? 'Urgent' : row.status === 'completed' ? 'Completed' : 'Active',
    description: row.short_description ?? row.full_description ?? '',
    problem: row.full_description ?? row.short_description ?? '',
    target,
    raised,
    image: fallbackImage,
    beforeImages,
    afterImages,
    videoUrls: videoSources(media),
    documents,
    expenses: projectExpenses,
    masjidDocuments: masjidDocs.filter((doc) => doc.masjid_id === row.masjid_id).map((doc) => ({ id: doc.id, title: documentTitle(doc.document_type), url: doc.file_url, isPrivate: doc.is_private })),
    verification: 'Published by Our Masjid',
  };
}

async function readCachedProjects(): Promise<PublishedProjectsResult | null> {
  try {
    const raw = await AsyncStorage.getItem(PROJECTS_CACHE_KEY);
    if (!raw) return null;
    const projects = JSON.parse(raw) as Project[];
    return Array.isArray(projects) && projects.length ? { projects, source: 'cache' } : null;
  } catch { return null; }
}

async function fetchPublishedProjects(): Promise<PublishedProjectsResult> {
  if (!supabase) return (await readCachedProjects()) ?? { projects: [], source: 'cache' };

  const core = await supabase
    .from('projects')
    .select('id,title,masjid_id,category_id,short_description,full_description,target_amount,raised_amount,status,featured')
    .eq('published', true)
    .neq('status', 'hidden')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });
  if (core.error) return (await readCachedProjects()) ?? { projects: [], source: 'cache' };

  const rows = (core.data ?? []) as CoreProjectRow[];
  if (!rows.length) return (await readCachedProjects()) ?? { projects: [], source: 'supabase' };

  const projectIds = rows.map((row) => row.id);
  const masjidIds = [...new Set(rows.map((row) => row.masjid_id).filter(Boolean))];
  const categoryIds = [...new Set(rows.map((row) => row.category_id).filter(Boolean) as string[])];

  const [masjidsResult, categoriesResult, mediaResult, projectDocsResult, expensesResult, masjidDocsResult] = await Promise.all([
    masjidIds.length ? supabase.from('masjids').select('id,name,location,city,is_urgent,image_url').in('id', masjidIds) : Promise.resolve({ data: [], error: null }),
    categoryIds.length ? supabase.from('categories').select('id,name').in('id', categoryIds) : Promise.resolve({ data: [], error: null }),
    projectIds.length ? supabase.from('project_media').select('id,project_id,media_type,stage,file_url,caption,sort_order').in('project_id', projectIds).order('sort_order', { ascending: true }) : Promise.resolve({ data: [], error: null }),
    projectIds.length ? supabase.from('project_documents').select('id,project_id,document_type,file_url,is_private').in('project_id', projectIds).eq('is_private', false) : Promise.resolve({ data: [], error: null }),
    projectIds.length ? supabase.from('project_expenses').select('id,project_id,title,amount,expense_date').in('project_id', projectIds).order('expense_date', { ascending: false }) : Promise.resolve({ data: [], error: null }),
    masjidIds.length ? supabase.from('masjid_documents').select('id,masjid_id,document_type,file_url,is_private').in('masjid_id', masjidIds).eq('is_private', false) : Promise.resolve({ data: [], error: null }),
  ]);

  const expenseRows = (expensesResult.data ?? []) as PublicExpenseRow[];
  const expenseIds = expenseRows.map((expense) => expense.id);
  const expenseDocsResult = expenseIds.length
    ? await supabase.from('expense_documents').select('id,expense_id,document_type,file_url,is_private').in('expense_id', expenseIds).eq('is_private', false)
    : { data: [], error: null };

  const masjids = (masjidsResult.data ?? []) as PublicMasjidRow[];
  const categories = (categoriesResult.data ?? []) as PublicCategoryRow[];
  const media = (mediaResult.data ?? []) as PublicProjectMediaRow[];
  const projectDocs = (projectDocsResult.data ?? []) as PublicDocumentRow[];
  const masjidDocs = (masjidDocsResult.data ?? []) as PublicDocumentRow[];
  const expenseDocs = (expenseDocsResult.data ?? []) as PublicExpenseDocumentRow[];

  const projects = rows.map((row) => toProject(
    row,
    masjids.find((item) => item.id === row.masjid_id),
    categories.find((item) => item.id === row.category_id),
    media.filter((item) => item.project_id === row.id),
    projectDocs.filter((item) => item.project_id === row.id),
    expenseRows.filter((item) => item.project_id === row.id),
    expenseDocs,
    masjidDocs,
  ));

  try { await AsyncStorage.setItem(PROJECTS_CACHE_KEY, JSON.stringify(projects)); } catch { /* cache is best effort */ }
  return { projects, source: 'supabase' };
}

export function usePublishedProjects() {
  const query = useQuery({ queryKey: ['our-masjid', 'published-projects'], queryFn: fetchPublishedProjects, staleTime: 60_000, retry: false });
  // Do not render the old cache before the first online request completes.
  // fetchPublishedProjects returns the cache only when Supabase is unavailable/errors,
  // so offline mode still works without flashing stale/demo data on startup.
  return { ...query, data: query.data };
}

export function usePublishedProject(id: string | undefined) {
  const query = usePublishedProjects();
  return { ...query, project: query.data?.projects.find((item) => item.id === id) };
}

export function useCompletedWork() {
  const query = usePublishedProjects();
  return { ...query, projects: query.data?.projects.filter((project) => project.status === 'Completed') ?? [] };
}

async function readCachedHomeSlides(): Promise<PublicSlideRow[]> {
  try {
    const raw = await AsyncStorage.getItem(HOME_SLIDES_CACHE_KEY);
    if (!raw) return [];
    const slides = JSON.parse(raw) as PublicSlideRow[];
    return Array.isArray(slides) ? slides : [];
  } catch { return []; }
}

export function usePublishedHomeSlides() {
  const query = useQuery({
    queryKey: ['our-masjid', 'home-slides'],
    queryFn: async (): Promise<PublicSlideRow[]> => {
      if (!supabase) return readCachedHomeSlides();
      const { data, error } = await supabase.from('home_slides').select('id,title,subtitle,image_url,action_type,action_id').eq('published', true).order('sort_order', { ascending: true });
      if (error) return readCachedHomeSlides();
      const slides = (data ?? []) as PublicSlideRow[];
      if (slides.length) { try { await AsyncStorage.setItem(HOME_SLIDES_CACHE_KEY, JSON.stringify(slides)); } catch { /* ignore */ } }
      return slides;
    },
    staleTime: 60_000,
    retry: false,
  });
  return { ...query, data: query.data };
}
