-- Our Masjid foundation
-- Apply this migration to the connected Supabase project before publishing data.
-- Public clients can read approved content only. Fundraising totals and private
-- documents are never writable/readable from the anonymous client.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  phone text,
  role text not null default 'user' check (role in ('user', 'admin', 'super_admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  icon text,
  published boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.masjids (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  city text not null,
  description text,
  image_url text,
  target_amount numeric(14,2) not null default 0 check (target_amount >= 0),
  raised_amount numeric(14,2) not null default 0 check (raised_amount >= 0),
  status text not null check (status in ('active', 'completed', 'hidden')),
  is_urgent boolean not null default false,
  is_featured boolean not null default false,
  category_id uuid references public.categories(id) on delete set null,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.masjid_media (
  id uuid primary key default gen_random_uuid(),
  masjid_id uuid not null references public.masjids(id) on delete cascade,
  media_type text not null check (media_type in ('image', 'video')),
  file_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.masjid_documents (
  id uuid primary key default gen_random_uuid(),
  masjid_id uuid not null references public.masjids(id) on delete cascade,
  document_type text not null check (document_type in ('qazi_permission', 'support_letter', 'verification', 'other')),
  file_url text not null,
  is_private boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  masjid_id uuid not null references public.masjids(id) on delete restrict,
  category_id uuid references public.categories(id) on delete set null,
  short_description text,
  full_description text,
  target_amount numeric(14,2) not null default 0 check (target_amount >= 0),
  raised_amount numeric(14,2) not null default 0 check (raised_amount >= 0),
  total_expense numeric(14,2) not null default 0 check (total_expense >= 0),
  status text not null check (status in ('draft', 'ongoing', 'completed', 'hidden')),
  published boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  media_type text not null check (media_type in ('image', 'video')),
  stage text not null check (stage in ('before', 'progress', 'after')),
  file_url text not null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.project_expenses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete restrict,
  title text not null,
  description text,
  amount numeric(14,2) not null check (amount >= 0),
  expense_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.expense_documents (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.project_expenses(id) on delete cascade,
  document_type text not null,
  file_url text not null,
  is_private boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.project_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete restrict,
  document_type text not null check (document_type in ('qazi_permission', 'support_letter', 'verification', 'other')),
  file_url text not null,
  is_private boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.donation_intents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  masjid_id uuid not null references public.masjids(id) on delete restrict,
  project_id uuid references public.projects(id) on delete set null,
  amount numeric(14,2) not null check (amount > 0),
  donor_name text not null,
  message text,
  status text not null default 'initiated' check (status in ('initiated', 'pending', 'completed', 'failed', 'cancelled')),
  payment_reference text,
  created_at timestamptz not null default now()
);

create table if not exists public.home_slides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text,
  action_type text,
  action_id text,
  sort_order integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete restrict,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists categories_published_sort_idx on public.categories(published, sort_order);
create index if not exists masjids_published_status_idx on public.masjids(published, status);
create index if not exists masjids_category_published_idx on public.masjids(category_id, published);
create index if not exists masjids_city_published_idx on public.masjids(city, published);
create index if not exists masjids_urgent_published_idx on public.masjids(is_urgent, published);
create index if not exists masjids_featured_published_idx on public.masjids(is_featured, published);
create index if not exists masjid_media_parent_sort_idx on public.masjid_media(masjid_id, sort_order);
create index if not exists masjid_documents_access_idx on public.masjid_documents(masjid_id, is_private, created_at);
create index if not exists projects_masjid_published_status_idx on public.projects(masjid_id, published, status);
create index if not exists projects_category_published_idx on public.projects(category_id, published);
create index if not exists projects_featured_published_idx on public.projects(featured, published);
create index if not exists project_media_stage_sort_idx on public.project_media(project_id, stage, sort_order);
create index if not exists project_expenses_date_idx on public.project_expenses(project_id, expense_date);
create index if not exists expense_documents_parent_idx on public.expense_documents(expense_id);
create index if not exists project_documents_access_idx on public.project_documents(project_id, is_private);
create index if not exists donation_intents_user_created_idx on public.donation_intents(user_id, created_at desc);
create index if not exists donation_intents_masjid_status_idx on public.donation_intents(masjid_id, status);
create index if not exists donation_intents_project_status_idx on public.donation_intents(project_id, status);
create index if not exists home_slides_published_sort_idx on public.home_slides(published, sort_order);
create index if not exists audit_logs_admin_created_idx on public.audit_logs(admin_id, created_at desc);
create index if not exists audit_logs_entity_created_idx on public.audit_logs(entity_type, entity_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at before update on public.categories for each row execute function public.set_updated_at();
drop trigger if exists masjids_set_updated_at on public.masjids;
create trigger masjids_set_updated_at before update on public.masjids for each row execute function public.set_updated_at();
drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at before update on public.projects for each row execute function public.set_updated_at();
drop trigger if exists home_slides_set_updated_at on public.home_slides;
create trigger home_slides_set_updated_at before update on public.home_slides for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'super_admin')
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''), new.phone)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.masjids enable row level security;
alter table public.masjid_media enable row level security;
alter table public.masjid_documents enable row level security;
alter table public.projects enable row level security;
alter table public.project_media enable row level security;
alter table public.project_expenses enable row level security;
alter table public.expense_documents enable row level security;
alter table public.project_documents enable row level security;
alter table public.donation_intents enable row level security;
alter table public.home_slides enable row level security;
alter table public.app_settings enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists profiles_update_own_non_role on public.profiles;
create policy profiles_update_own_non_role on public.profiles for update
  using (id = auth.uid() or public.is_super_admin())
  with check ((id = auth.uid() and role = (select role from public.profiles where id = auth.uid())) or public.is_super_admin());
drop policy if exists profiles_admin_manage on public.profiles;
create policy profiles_admin_manage on public.profiles for all using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories for select using (published = true or public.is_admin());
drop policy if exists categories_admin_write on public.categories;
create policy categories_admin_write on public.categories for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists masjids_public_read on public.masjids;
create policy masjids_public_read on public.masjids for select using ((published = true and status <> 'hidden') or public.is_admin());
drop policy if exists masjids_admin_write on public.masjids;
create policy masjids_admin_write on public.masjids for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists masjid_media_public_read on public.masjid_media;
create policy masjid_media_public_read on public.masjid_media for select using (
  exists (select 1 from public.masjids m where m.id = masjid_id and m.published = true and m.status <> 'hidden')
  or public.is_admin()
);
drop policy if exists masjid_media_admin_write on public.masjid_media;
create policy masjid_media_admin_write on public.masjid_media for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists masjid_documents_public_read on public.masjid_documents;
create policy masjid_documents_public_read on public.masjid_documents for select using (
  (is_private = false and exists (select 1 from public.masjids m where m.id = masjid_id and m.published = true and m.status <> 'hidden'))
  or public.is_admin()
);
drop policy if exists masjid_documents_admin_write on public.masjid_documents;
create policy masjid_documents_admin_write on public.masjid_documents for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists projects_public_read on public.projects;
create policy projects_public_read on public.projects for select using (
  ((published = true and status <> 'hidden') and exists (select 1 from public.masjids m where m.id = masjid_id and m.published = true and m.status <> 'hidden'))
  or public.is_admin()
);
drop policy if exists projects_admin_write on public.projects;
create policy projects_admin_write on public.projects for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists project_media_public_read on public.project_media;
create policy project_media_public_read on public.project_media for select using (
  exists (select 1 from public.projects p where p.id = project_id and p.published = true and p.status <> 'hidden')
  or public.is_admin()
);
drop policy if exists project_media_admin_write on public.project_media;
create policy project_media_admin_write on public.project_media for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists project_expenses_public_read on public.project_expenses;
create policy project_expenses_public_read on public.project_expenses for select using (
  exists (select 1 from public.projects p where p.id = project_id and p.published = true and p.status <> 'hidden')
  or public.is_admin()
);
drop policy if exists project_expenses_admin_write on public.project_expenses;
create policy project_expenses_admin_write on public.project_expenses for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists expense_documents_public_read on public.expense_documents;
create policy expense_documents_public_read on public.expense_documents for select using (
  (is_private = false and exists (
    select 1 from public.project_expenses e
    join public.projects p on p.id = e.project_id
    where e.id = expense_id and p.published = true and p.status <> 'hidden'
  )) or public.is_admin()
);
drop policy if exists expense_documents_admin_write on public.expense_documents;
create policy expense_documents_admin_write on public.expense_documents for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists project_documents_public_read on public.project_documents;
create policy project_documents_public_read on public.project_documents for select using (
  (is_private = false and exists (select 1 from public.projects p where p.id = project_id and p.published = true and p.status <> 'hidden'))
  or public.is_admin()
);
drop policy if exists project_documents_admin_write on public.project_documents;
create policy project_documents_admin_write on public.project_documents for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists donation_intents_insert_own on public.donation_intents;
create policy donation_intents_insert_own on public.donation_intents for insert with check (
  (auth.uid() is null and user_id is null and status = 'initiated')
  or (auth.uid() is not null and user_id = auth.uid() and status = 'initiated')
);
drop policy if exists donation_intents_select_own on public.donation_intents;
create policy donation_intents_select_own on public.donation_intents for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists donation_intents_admin_update on public.donation_intents;
create policy donation_intents_admin_update on public.donation_intents for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists home_slides_public_read on public.home_slides;
create policy home_slides_public_read on public.home_slides for select using (published = true or public.is_admin());
drop policy if exists home_slides_admin_write on public.home_slides;
create policy home_slides_admin_write on public.home_slides for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists app_settings_super_admin_read on public.app_settings;
create policy app_settings_super_admin_read on public.app_settings for select using (public.is_super_admin());
drop policy if exists app_settings_super_admin_write on public.app_settings;
create policy app_settings_super_admin_write on public.app_settings for all using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists audit_logs_admin_read on public.audit_logs;
create policy audit_logs_admin_read on public.audit_logs for select using (public.is_super_admin());
drop policy if exists audit_logs_admin_insert on public.audit_logs;
create policy audit_logs_admin_insert on public.audit_logs for insert with check (public.is_admin() and admin_id = auth.uid());

insert into storage.buckets (id, name, public)
values
  ('public-masjid-media', 'public-masjid-media', true),
  ('public-project-media', 'public-project-media', true),
  ('public-home-media', 'public-home-media', true),
  ('private-documents', 'private-documents', false)
on conflict (id) do update set public = excluded.public;

drop policy if exists public_masjid_media_read on storage.objects;
create policy public_masjid_media_read on storage.objects for select using (bucket_id = 'public-masjid-media');
drop policy if exists public_project_media_read on storage.objects;
create policy public_project_media_read on storage.objects for select using (bucket_id = 'public-project-media');
drop policy if exists public_home_media_read on storage.objects;
create policy public_home_media_read on storage.objects for select using (bucket_id = 'public-home-media');
drop policy if exists public_media_admin_write on storage.objects;
create policy public_media_admin_write on storage.objects for all using (
  bucket_id in ('public-masjid-media', 'public-project-media', 'public-home-media') and public.is_admin()
) with check (
  bucket_id in ('public-masjid-media', 'public-project-media', 'public-home-media') and public.is_admin()
);
drop policy if exists private_documents_admin_access on storage.objects;
create policy private_documents_admin_access on storage.objects for all using (
  bucket_id = 'private-documents' and public.is_admin()
) with check (
  bucket_id = 'private-documents' and public.is_admin()
);