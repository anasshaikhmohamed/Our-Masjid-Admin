import { createContext, useContext, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
  Activity,
  AlertTriangle,
  Archive,
  ArrowUpRight,
  Building2,
  Check,
  ChevronRight,
  FileCheck2,
  FileText,
  FileUp,
  Video,
  Filter,
  GalleryHorizontalEnd,
  HeartHandshake,
  LayoutDashboard,
  LibraryBig,
  LogOut,
  Menu,
  Megaphone,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Upload,
  Users,
  WalletCards,
  X,
} from 'lucide-react';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import NotFound from '@/pages/not-found';
import {
  createPrivateDocumentUrl,
  deletePublicMedia,
  getAdminProfile,
  publicStorageUrl,
  recordAudit,
  supabase,
  uploadPublicMedia,
  uploadPrivateDocument,
  deletePrivateDocument,
  type AdminProfile,
} from '@/lib/supabase';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

type Category = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  published: boolean;
  sort_order: number;
};

type Masjid = {
  id: string;
  name: string;
  location: string;
  city: string;
  description: string | null;
  image_url: string | null;
  target_amount: number | string;
  raised_amount: number | string;
  status: 'active' | 'completed' | 'hidden';
  is_urgent: boolean;
  is_featured: boolean;
  category_id: string | null;
  published: boolean;
  category?: { name: string } | null;
};

type ProjectMedia = {
  id: string;
  project_id: string;
  media_type: 'image' | 'video';
  stage: 'before' | 'progress' | 'after';
  file_url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
};

type Project = {
  id: string;
  title: string;
  masjid_id: string;
  category_id: string | null;
  short_description: string | null;
  full_description: string | null;
  target_amount: number | string;
  raised_amount: number | string;
  total_expense: number | string;
  status: 'draft' | 'ongoing' | 'completed' | 'hidden';
  published: boolean;
  featured: boolean;
  masjid?: { name: string } | null;
  category?: { name: string } | null;
};

type HomeSlide = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  action_type: string | null;
  action_id: string | null;
  sort_order: number;
  published: boolean;
};

type Donation = {
  id: string;
  amount: number | string;
  donor_name: string;
  message: string | null;
  status: 'initiated' | 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_reference: string | null;
  created_at: string;
  masjid?: { name: string } | null;
  project?: { title: string } | null;
};

type Expense = {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  amount: number | string;
  expense_date: string | null;
  project?: { title: string } | null;
};

type AppNotification = {
  id: string;
  title: string;
  body: string;
  published: boolean;
  created_at: string;
};

type AuditLog = {
  id: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
};

const navItems = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/masjids', label: 'Masjids', icon: Building2 },
  { href: '/projects', label: 'Projects', icon: HeartHandshake },
  { href: '/categories', label: 'Categories', icon: SlidersHorizontal },
  { href: '/slides', label: 'Home slides', icon: GalleryHorizontalEnd },
  { href: '/donations', label: 'Donations', icon: WalletCards },
  { href: '/notifications', label: 'Notifications', icon: Megaphone },
  { href: '/documents', label: 'Documents', icon: FileCheck2 },
  { href: '/audit-logs', label: 'Audit logs', icon: Activity },
];

function cn(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(' ');
}

function formatMoney(value: number | string | null | undefined) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(value));
}

async function selectRows<T>(table: string, select = '*', order?: string) {
  if (!supabase) throw new Error('Supabase is not configured.');
  let query = supabase.from(table).select(select);
  if (order) query = query.order(order, { ascending: false });
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as T[];
}

function useResource<T>(loader: () => Promise<T>, key: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    void loader()
      .then((value) => {
        if (active) setData(value);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Unable to load this data.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // The key intentionally controls refreshes; loaders are page-local and stable for this request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, reloadKey]);

  return { data, loading, error, reload: () => setReloadKey((value) => value + 1) };
}

function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'quiet' | 'danger' | 'gold';
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/90',
        variant === 'gold' && 'bg-accent text-accent-foreground hover:bg-accent/90',
        variant === 'quiet' && 'border border-border bg-card text-foreground hover:bg-muted',
        variant === 'danger' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      )}
    >
      {children}
    </button>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  min,
  step,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  min?: string;
  step?: string;
}) {
  return (
    <label className="block text-xs font-semibold text-foreground">
      {label}
      <input
        required={required}
        type={type}
        value={value}
        min={min}
        step={step}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none transition-shadow placeholder:text-muted-foreground/70 focus:ring-2 focus:ring-ring/30"
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label className="block text-xs font-semibold">
      {label}
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm font-normal outline-none focus:ring-2 focus:ring-ring/30"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block text-xs font-semibold">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full rounded-lg border border-input bg-background px-3 text-sm font-normal outline-none focus:ring-2 focus:ring-ring/30"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5 text-sm">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
      {label}
    </label>
  );
}

function QueryState({
  loading,
  error,
  onRetry,
  label,
  children,
}: {
  loading: boolean;
  error: string;
  onRetry: () => void;
  label: string;
  children: ReactNode;
}) {
  if (loading) return <div className="space-y-3"><div className="shimmer h-20 rounded-xl" /><div className="shimmer h-20 rounded-xl" /><div className="shimmer h-20 rounded-xl" /></div>;
  if (error) return <div className="rounded-xl border border-destructive/25 bg-destructive/5 px-6 py-12 text-center"><AlertTriangle className="mx-auto text-destructive" size={24} /><h3 className="mt-3 font-display text-xl font-semibold">Couldn’t load {label}</h3><p className="mt-1 text-sm text-muted-foreground">{error}</p><Button onClick={onRetry} variant="quiet"><RefreshCw size={15} /> Try again</Button></div>;
  return <>{children}</>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[hsl(155_32%_10%/.55)] p-4 pt-10 backdrop-blur-sm">
      <div className="flex w-full max-w-2xl max-h-[calc(100dvh-80px)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-2xl font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="Close dialog"><X size={18} /></button>
        </div>
        <div className="min-h-0 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="font-mono-ui text-[10px] uppercase tracking-[0.2em] text-primary">{eyebrow}</p><h2 className="mt-1 font-display text-3xl font-semibold tracking-tight">{title}</h2>{description && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>}</div>{action}</div>;
}

function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-9 text-sm outline-none focus:ring-2 focus:ring-ring/30" />{value && <button onClick={() => onChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted" aria-label="Clear search"><X size={15} /></button>}</div>;
}

function SignInScreen({ message }: { message?: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(message ?? '');
  const client = supabase;
  if (!client) return <div className="flex min-h-[100dvh] items-center justify-center bg-background p-5"><div className="w-full max-w-md rounded-2xl border border-border bg-card p-8"><ShieldCheck className="text-primary" size={28} /><h1 className="mt-5 font-display text-3xl font-semibold">Supabase setup required</h1><p className="mt-3 text-sm leading-relaxed text-muted-foreground">The public Supabase settings are not available to this panel yet.</p></div></div>;
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    const { error: signInError } = await client.auth.signInWithPassword({ email, password });
    if (signInError) setError(signInError.message);
    setBusy(false);
  };
  return <div className="flex min-h-[100dvh] items-center justify-center bg-background px-5"><form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm"><ShieldCheck className="text-primary" size={28} /><p className="mt-5 font-mono-ui text-[10px] uppercase tracking-[0.18em] text-primary">Trusted workspace</p><h1 className="mt-2 font-display text-3xl font-semibold">Sign in to Our Masjid Admin</h1><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Only accounts with an admin or super-admin role can access publication tools.</p>{error && <div className="mt-5 rounded-lg border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive">{error}</div>}<Input label="Email" value={email} onChange={setEmail} type="email" required /><div className="mt-4"><Input label="Password" value={password} onChange={setPassword} type="password" required /></div><Button type="submit" disabled={busy}>{busy ? 'Checking access…' : 'Sign in'}</Button></form></div>;
}

function AdminGate({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const client = supabase;
    if (!client) { setReady(true); return; }
    let active = true;
    const load = async () => {
      const { data } = await client.auth.getSession();
      if (!active) return;
      if (!data.session) { setProfile(null); setError(''); setReady(true); return; }
      try {
        setProfile(await getAdminProfile(data.session));
        setError('');
      } catch (reason) {
        setProfile(null);
        setError(reason instanceof Error ? reason.message : 'Administrator access denied.');
      } finally {
        setReady(true);
      }
    };
    void load();
    const { data: listener } = client.auth.onAuthStateChange(() => void load());
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);
  if (!ready) return <div className="flex min-h-[100dvh] items-center justify-center bg-background"><span className="font-mono-ui text-xs uppercase tracking-wider text-muted-foreground">Checking administrator session…</span></div>;
  if (!supabase || !profile || error) return <SignInScreen message={error} />;
  return <AdminContext.Provider value={profile}>{children}</AdminContext.Provider>;
}

const AdminContext = createContext<AdminProfile | null>(null);

function useAdmin() {
  const profile = useContext(AdminContext);
  if (!profile) throw new Error('Administrator profile is not available.');
  return profile;
}

function Header({ onMenu }: { onMenu: () => void }) {
  const [location] = useLocation();
  const current = navItems.find((item) => item.href === location)?.label ?? 'Admin console';
  return <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-border/80 bg-background/95 px-5 backdrop-blur-md lg:px-8"><div className="flex items-center gap-3"><button className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden" onClick={onMenu} aria-label="Open navigation"><Menu size={20} /></button><div><p className="font-mono-ui text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Operations / {current}</p><h1 className="font-display text-xl font-semibold tracking-tight lg:text-2xl">{current}</h1></div></div><div className="hidden items-center gap-3 sm:flex"><div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs text-muted-foreground"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Live Supabase data</div><div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">OM</div></div></header>;
}

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [location] = useLocation();
  return <><div className={cn('fixed inset-0 z-30 bg-[hsl(155_32%_10%/.5)] lg:hidden', !open && 'hidden')} onClick={onClose} /><aside className={cn('fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:translate-x-0', open ? 'translate-x-0' : '-translate-x-full')}><div className="flex h-[104px] items-center border-b border-sidebar-border px-7"><div className="mr-3 flex h-11 w-11 items-center justify-center rounded-xl border border-sidebar-primary/50 bg-sidebar-primary/10 text-sidebar-primary"><span className="font-display text-2xl font-bold">O</span></div><div><p className="font-display text-[21px] font-semibold leading-none">Our Masjid</p><p className="mt-1 font-mono-ui text-[9px] uppercase tracking-[0.22em] text-sidebar-foreground/55">Admin console</p></div></div><div className="overflow-y-auto px-4 py-7"><p className="px-3 pb-3 font-mono-ui text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/45">Workspace</p><nav className="space-y-1">{navItems.map((item) => { const Icon = item.icon; const active = item.href === location; return <Link href={item.href} onClick={onClose} key={item.href} className={cn('group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors', active ? 'bg-sidebar-accent font-semibold text-sidebar-primary' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground')}><Icon size={17} /><span>{item.label}</span>{active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />}</Link>; })}</nav></div><div className="mt-auto p-4"><div className="rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-4"><div className="flex items-center gap-2 text-sidebar-primary"><ShieldCheck size={16} /><span className="font-mono-ui text-[10px] uppercase tracking-[0.12em]">Protected workspace</span></div><p className="mt-2 text-xs leading-relaxed text-sidebar-foreground/60">Every write is protected by Supabase roles and recorded for review.</p></div><Link href="/settings" onClick={onClose} className="mt-3 flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-sidebar-foreground/65 hover:bg-sidebar-accent/70"><Settings2 size={17} /> Settings</Link></div></aside></>;
}

function Shell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <div className="min-h-[100dvh] bg-background"><Sidebar open={open} onClose={() => setOpen(false)} /><div className="lg:pl-[260px]"><Header onMenu={() => setOpen(true)} /><main className="mx-auto max-w-[1500px] px-5 py-7 lg:px-8 lg:py-9">{children}</main></div></div>;
}

function MetricCard({ label, value, detail, icon: Icon, accent = 'green' }: { label: string; value: string; detail: string; icon: typeof Activity; accent?: 'green' | 'gold' | 'red' }) {
  return <div className="rounded-xl border border-border bg-card p-5 shadow-[0_2px_0_hsl(var(--foreground)/.03)]"><div className="flex items-start justify-between"><p className="font-mono-ui text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p><div className={cn('rounded-lg p-2', accent === 'green' ? 'bg-secondary text-primary' : accent === 'gold' ? 'bg-accent/25 text-[hsl(38_56%_40%)]' : 'bg-destructive/10 text-destructive')}><Icon size={16} /></div></div><p className="mt-5 font-display text-3xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div>;
}

function Overview() {
  const masjids = useResource(() => selectRows<Masjid>('masjids', 'id,name,city,status,is_urgent,is_featured,published', 'created_at'), 'overview-masjids');
  const projects = useResource(() => selectRows<Project>('projects', 'id,title,status,target_amount,raised_amount,total_expense,published', 'created_at'), 'overview-projects');
  const donations = useResource(() => selectRows<Donation>('donation_intents', 'id,amount,status,created_at,donor_name', 'created_at'), 'overview-donations');
  const ms = masjids.data ?? [];
  const ps = projects.data ?? [];
  const ds = donations.data ?? [];
  const target = ps.reduce((sum, item) => sum + Number(item.target_amount), 0);
  const raised = ps.reduce((sum, item) => sum + Number(item.raised_amount), 0);
  const expenses = ps.reduce((sum, item) => sum + Number(item.total_expense), 0);
  /*
  return <div className="page-enter"><SectionHeading eyebrow="Publication desk" title="Good work, carefully shared." description="A live view of the records your community can see, the funds attached to projects, and the activity that needs review." /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Total masjids" value={masjids.loading ? '—' : String(ms.length)} detail={`${ms.filter((item) => item.status === 'active').length} active · ${ms.filter((item) => item.is_urgent).length} urgent`} icon={Building2} /><MetricCard label="Active projects" value={projects.loading ? '—' : String(ps.filter((item) => item.status === 'ongoing').length)} detail={`${ps.filter((item) => item.status === 'completed').length} completed`} icon={HeartHandshake} accent="gold" /><MetricCard label="Project raised" value={projects.loading ? '—' : formatMoney(raised)} detail={`${formatMoney(target)} total target`} icon={WalletCards} /><MetricCard label="Donation intents" value={donations.loading ? '—' : String(ds.length)} detail={`${formatMoney(ds.reduce((sum, item) => sum + Number(item.amount), 0))} intended`} icon={Users} accent={ds.length ? 'green' : 'red'} /></div><div className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_.9fr]"><div className="rounded-xl border border-border bg-card"><div className="border-b border-border px-5 py-4"><p className="font-mono-ui text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Live register</p><h3 className="mt-1 font-display text-xl font-semibold">Projects needing attention</h3></div><QueryState loading={projects.loading} error={projects.error} onRetry={projects.reload} label="projects"><div className="divide-y divide-border">{ps.filter((item) => item.status !== 'hidden').slice(0, 7).map((project) => <div key={project.id} className="flex items-center gap-4 px-5 py-4"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary"><HeartHandshake size={18} /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{project.title}</p><p className="mt-1 text-xs text-muted-foreground">{project.status} · {project.published ? 'published' : 'draft'}</p></div><span className="font-mono-ui text-[10px] text-muted-foreground">{project.target_amount ? Math.round((Number(project.raised_amount) / Number(project.target_amount)) * 100) : 0}%</span></div>)}</QueryState></div><div className="space-y-6"><div className="rounded-xl border border-border bg-card p-5"><div className="flex items-center gap-2"><div className="rounded-lg bg-destructive/10 p-2 text-destructive"><AlertTriangle size={17} /></div><div><p className="font-mono-ui text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Needs attention</p><h3 className="font-display text-xl font-semibold">Urgent Masjids</h3></div></div><QueryState loading={masjids.loading} error={masjids.error} onRetry={masjids.reload} label="Masjids"><div className="mt-4 space-y-2">{ms.filter((item) => item.is_urgent && item.published && item.status !== 'hidden').slice(0, 5).map((masjid) => <div key={masjid.id} className="flex items-center justify-between rounded-lg bg-destructive/5 px-3 py-3"><div><p className="text-sm font-semibold">{masjid.name}</p><p className="mt-0.5 text-xs text-muted-foreground">{masjid.city}</p></div><span className="font-mono-ui text-[10px] uppercase tracking-wider text-destructive">Urgent</span></div>)}{!ms.some((item) => item.is_urgent && item.published && item.status !== 'hidden') && <p className="rounded-lg bg-secondary/70 px-3 py-4 text-sm text-muted-foreground">No urgent Masjids are currently published.</p>}</div></QueryState><Link href="/masjids" className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary">Review Masjids <ChevronRight size={14} /></Link></div><div className="rounded-xl border border-border bg-primary p-5 text-primary-foreground"><div className="flex items-center gap-2"><FileCheck2 size={18} /><p className="font-mono-ui text-[10px] uppercase tracking-[0.16em] opacity-75">Transparency snapshot</p></div><div className="mt-4 grid grid-cols-2 gap-4"><div><p className="font-display text-2xl font-semibold">{formatMoney(expenses)}</p><p className="mt-1 text-xs opacity-70">Recorded expenses</p></div><div><p className="font-display text-2xl font-semibold">{ms.filter((item) => item.published).length}</p><p className="mt-1 text-xs opacity-70">Published Masjids</p></div></div></div></div></div></div></div>;
  */
  return <div className="page-enter"><SectionHeading eyebrow="Publication desk" title="Good work, carefully shared." description="Live records, verified fundraising figures, and activity that needs review." /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Total masjids" value={masjids.loading ? '—' : String(ms.length)} detail={`${ms.filter((item) => item.status === 'active').length} active`} icon={Building2} /><MetricCard label="Active projects" value={projects.loading ? '—' : String(ps.filter((item) => item.status === 'ongoing').length)} detail={`${ps.filter((item) => item.status === 'completed').length} completed`} icon={HeartHandshake} accent="gold" /><MetricCard label="Project raised" value={projects.loading ? '—' : formatMoney(raised)} detail={`${formatMoney(target)} total target`} icon={WalletCards} /><MetricCard label="Donation intents" value={donations.loading ? '—' : String(ds.length)} detail={`${formatMoney(ds.reduce((sum, item) => sum + Number(item.amount), 0))} intended`} icon={Users} accent={ds.length ? 'green' : 'red'} /></div><div className="mt-8 grid gap-6 lg:grid-cols-2"><div className="rounded-xl border border-border bg-card p-5"><div className="flex items-center justify-between"><h3 className="font-display text-xl font-semibold">Projects needing attention</h3><Link href="/projects" className="text-xs font-semibold text-primary">Manage <ArrowUpRight size={14} className="inline" /></Link></div><div className="mt-4 divide-y divide-border">{ps.filter((item) => item.status !== 'hidden').slice(0, 7).map((project) => <div key={project.id} className="flex items-center justify-between gap-4 py-3"><div className="min-w-0"><p className="truncate text-sm font-semibold">{project.title}</p><p className="mt-1 text-xs text-muted-foreground">{project.status} · {project.published ? 'published' : 'draft'}</p></div><span className="font-mono-ui text-[10px] text-muted-foreground">{project.target_amount ? Math.round((Number(project.raised_amount) / Number(project.target_amount)) * 100) : 0}%</span></div>)}</div></div><div className="rounded-xl border border-border bg-card p-5"><div className="flex items-center gap-2"><AlertTriangle size={18} className="text-destructive" /><h3 className="font-display text-xl font-semibold">Urgent Masjids</h3></div><div className="mt-4 space-y-2">{ms.filter((item) => item.is_urgent && item.published && item.status !== 'hidden').slice(0, 5).map((masjid) => <div key={masjid.id} className="flex items-center justify-between rounded-lg bg-destructive/5 px-3 py-3"><div><p className="text-sm font-semibold">{masjid.name}</p><p className="mt-0.5 text-xs text-muted-foreground">{masjid.city}</p></div><span className="font-mono-ui text-[10px] uppercase text-destructive">Urgent</span></div>)}{!ms.some((item) => item.is_urgent && item.published && item.status !== 'hidden') && <p className="rounded-lg bg-secondary/70 px-3 py-4 text-sm text-muted-foreground">No urgent Masjids are currently published.</p>}</div></div></div></div>;
}

function FormActions({ busy, onCancel }: { busy: boolean; onCancel: () => void }) {
  return <div className="flex justify-end gap-2 border-t border-border pt-4"><Button variant="quiet" onClick={onCancel}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</Button></div>;
}


function MasjidEvidenceManager({ masjidId, adminId }: { masjidId: string; adminId: string }) {
  type MasjidDocument = {
    id: string;
    masjid_id: string;
    document_type: 'qazi_permission' | 'support_letter' | 'verification' | 'other';
    file_url: string;
    is_private: boolean;
    created_at: string;
  };
  const [docs, setDocs] = useState<MasjidDocument[]>([]);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    if (!supabase) return;
    const result = await supabase.from('masjid_documents').select('id,masjid_id,document_type,file_url,is_private,created_at').eq('masjid_id', masjidId).order('created_at', { ascending: false });
    if (result.error) setError(result.error.message);
    else setDocs((result.data ?? []) as MasjidDocument[]);
  };
  useEffect(() => { void load(); }, [masjidId]);

  const uploadDoc = async (file: File, type: MasjidDocument['document_type'], isPrivate: boolean) => {
    if (!supabase) return;
    setBusy(type); setError('');
    try {
      const existing = docs.find((doc) => doc.document_type === type && doc.is_private === isPrivate);
      const uploaded = isPrivate
        ? await uploadPrivateDocument(file, `${masjidId}/documents`)
        : await uploadPublicMedia('public-masjid-media', file, `${masjidId}/documents`);
      if (existing) {
        if (existing.is_private) await deletePrivateDocument(existing.file_url).catch(() => undefined);
        else {
          const marker = '/storage/v1/object/public/public-masjid-media/';
          if (existing.file_url.includes(marker)) await deletePublicMedia('public-masjid-media', decodeURIComponent(existing.file_url.split(marker)[1])).catch(() => undefined);
        }
        const result = await supabase.from('masjid_documents').update({ document_type: type, file_url: isPrivate ? uploaded.path : uploaded.url, is_private: isPrivate }).eq('id', existing.id).select('id').single();
        if (result.error) throw result.error;
        await recordAudit(adminId, 'update', 'masjid_document', existing.id, { masjid_id: masjidId, document_type: type, private: isPrivate });
      } else {
        const result = await supabase.from('masjid_documents').insert({ masjid_id: masjidId, document_type: type, file_url: isPrivate ? uploaded.path : uploaded.url, is_private: isPrivate }).select('id').single();
        if (result.error) throw result.error;
        await recordAudit(adminId, 'upload', 'masjid_document', result.data.id, { masjid_id: masjidId, document_type: type, private: isPrivate });
      }
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to update Masjid document.');
    } finally {
      setBusy('');
    }
  };

  const removeDoc = async (doc: MasjidDocument) => {
    if (!supabase || !window.confirm('Delete this Masjid document?')) return;
    setBusy(`delete-${doc.id}`); setError('');
    try {
      if (doc.is_private) await deletePrivateDocument(doc.file_url).catch(() => undefined);
      else {
        const marker = '/storage/v1/object/public/public-masjid-media/';
        if (doc.file_url.includes(marker)) await deletePublicMedia('public-masjid-media', decodeURIComponent(doc.file_url.split(marker)[1])).catch(() => undefined);
      }
      const result = await supabase.from('masjid_documents').delete().eq('id', doc.id);
      if (result.error) throw result.error;
      await recordAudit(adminId, 'delete', 'masjid_document', doc.id, { masjid_id: masjidId, document_type: doc.document_type });
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to delete Masjid document.');
    } finally {
      setBusy('');
    }
  };

  const openPrivate = async (doc: MasjidDocument) => {
    try {
      const url = await createPrivateDocumentUrl(doc.file_url);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to open private document.');
    }
  };

  const qazi = docs.find((doc) => doc.document_type === 'qazi_permission');
  const publicDocs = docs.filter((doc) => doc.document_type !== 'qazi_permission' && !doc.is_private);
  const privateDocs = docs.filter((doc) => doc.is_private);

  return (
    <div className="space-y-5 rounded-xl border border-border bg-muted/20 p-4">
      <div>
        <p className="font-mono-ui text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Documents & verification</p>
        <h3 className="mt-1 font-display text-lg font-semibold">Qazi letter, Masjid documents & protected records</h3>
        <p className="mt-1 text-xs text-muted-foreground">Public documents can be opened by app users. Private Masjid Real Documents stay protected.</p>
      </div>
      {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-sm font-semibold">Qazi-e-Shaher Permission Letter</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Public verification document shown in the mobile app.</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="cursor-pointer rounded-lg border border-border px-3 py-2 text-xs font-semibold">
              <span className="flex items-center gap-1.5"><Upload size={13} /> {qazi ? 'Replace letter' : 'Upload letter'}</span>
              <input type="file" accept="image/*,.pdf" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadDoc(file, 'qazi_permission', false); }} />
            </label>
            {qazi && <span className="text-[10px] text-emerald-700">Uploaded</span>}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-sm font-semibold">Masjid Documents</p>
          <p className="mt-1 text-[11px] text-muted-foreground">Public supporting / verification documents shown in the mobile app.</p>
          <label className="mt-3 inline-flex cursor-pointer rounded-lg border border-border px-3 py-2 text-xs font-semibold">
            <span className="flex items-center gap-1.5"><FileUp size={13} /> Add document</span>
            <input type="file" accept="image/*,.pdf" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadDoc(file, 'verification', false); }} />
          </label>
          <div className="mt-3 space-y-2">
            {publicDocs.map((doc) => <div key={doc.id} className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 p-2.5"><div><p className="text-xs font-semibold">Masjid Document</p><p className="text-[10px] text-muted-foreground">Public</p></div><div className="flex items-center gap-2"><a href={doc.file_url} target="_blank" rel="noreferrer" className="text-[10px] font-semibold text-primary">Open</a><button type="button" onClick={() => void removeDoc(doc)} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><X size={14} /></button></div></div>)}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-3">
        <p className="text-sm font-semibold">Masjid Real Documents</p>
        <p className="mt-1 text-[11px] text-muted-foreground">Private records remain protected and are not publicly accessible from the mobile app.</p>
        <label className="mt-3 inline-flex cursor-pointer rounded-lg border border-border px-3 py-2 text-xs font-semibold">
          <span className="flex items-center gap-1.5"><FileUp size={13} /> Upload private document</span>
          <input type="file" accept="image/*,.pdf" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadDoc(file, 'other', true); }} />
        </label>
        <div className="mt-3 space-y-2">
          {privateDocs.map((doc) => <div key={doc.id} className="flex items-center justify-between gap-2 rounded-lg bg-muted/40 p-2.5"><div><p className="text-xs font-semibold">Masjid Real Document</p><p className="text-[10px] text-muted-foreground">Private & protected</p></div><div className="flex items-center gap-2"><button type="button" onClick={() => void openPrivate(doc)} className="text-[10px] font-semibold text-primary">View</button><button type="button" onClick={() => void removeDoc(doc)} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><X size={14} /></button></div></div>)}
        </div>
      </div>
    </div>
  );
}

function MasjidForm({ initial, categories, onDone, onCancel, adminId }: { initial?: Masjid; categories: Category[]; onDone: () => void; onCancel: () => void; adminId: string }) {
  const [form, setForm] = useState({ name: initial?.name ?? '', location: initial?.location ?? '', city: initial?.city ?? '', description: initial?.description ?? '', image_url: initial?.image_url ?? '', target_amount: String(initial?.target_amount ?? 0), status: initial?.status ?? 'active', category_id: initial?.category_id ?? '', published: initial?.published ?? false, is_urgent: initial?.is_urgent ?? false, is_featured: initial?.is_featured ?? false });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true); setError('');
    try {
      let imageUrl = form.image_url || null;
      if (file) imageUrl = (await uploadPublicMedia('public-masjid-media', file, initial?.id ?? 'masjids')).url;
      const payload = { name: form.name, location: form.location, city: form.city, description: form.description || null, image_url: imageUrl, target_amount: Number(form.target_amount), status: form.status, category_id: form.category_id || null, published: form.published, is_urgent: form.is_urgent, is_featured: form.is_featured };
      const result = initial ? await supabase.from('masjids').update(payload).eq('id', initial.id).select('id').single() : await supabase.from('masjids').insert(payload).select('id').single();
      if (result.error) throw result.error;
      await recordAudit(adminId, initial ? 'update' : 'create', 'masjid', result.data?.id ?? initial?.id, { name: form.name, published: form.published });
      onDone();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to save Masjid.'); } finally { setBusy(false); }
  };
  return <form onSubmit={submit} className="space-y-4">{error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}<div className="grid gap-4 sm:grid-cols-2"><Input label="Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required /><Input label="Location" value={form.location} onChange={(value) => setForm({ ...form, location: value })} required /><Input label="City" value={form.city} onChange={(value) => setForm({ ...form, city: value })} required /><Input label="Fundraising target" value={form.target_amount} onChange={(value) => setForm({ ...form, target_amount: value })} type="number" min="0" step="0.01" /><Select label="Status" value={form.status} onChange={(value) => setForm({ ...form, status: value as Masjid['status'] })} options={[{ value: 'active', label: 'Active' }, { value: 'completed', label: 'Completed' }, { value: 'hidden', label: 'Hidden' }]} /><Select label="Category" value={form.category_id} onChange={(value) => setForm({ ...form, category_id: value })} options={[{ value: '', label: 'No category' }, ...categories.map((category) => ({ value: category.id, label: category.name }))]} /></div><Textarea label="Description" value={form.description} onChange={(value) => setForm({ ...form, description: value })} /><div className="grid gap-4 sm:grid-cols-2"><Input label="Image URL (optional)" value={form.image_url} onChange={(value) => setForm({ ...form, image_url: value })} /><label className="block text-xs font-semibold">Upload cover image<input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="mt-2 block w-full text-xs font-normal" /></label></div><div className="grid gap-2 sm:grid-cols-3"><Toggle label="Published" checked={form.published} onChange={(checked) => setForm({ ...form, published: checked })} /><Toggle label="Urgent" checked={form.is_urgent} onChange={(checked) => setForm({ ...form, is_urgent: checked })} /><Toggle label="Featured" checked={form.is_featured} onChange={(checked) => setForm({ ...form, is_featured: checked })} /></div>{initial?.id && <MasjidEvidenceManager masjidId={initial.id} adminId={adminId} />}<FormActions busy={busy} onCancel={onCancel} /></form>;
}

function MasjidsPage() {
  const admin = useAdmin();
  const resource = useResource(() => selectRows<Masjid>('masjids', '*,category:categories(name)', 'created_at'), 'masjids');
  const categories = useResource(() => selectRows<Category>('categories', 'id,name,published,sort_order', 'sort_order'), 'masjid-categories');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'new' | Masjid | null>(null);
  const rows = (resource.data ?? []).filter((item) => `${item.name} ${item.city} ${item.location}`.toLowerCase().includes(search.toLowerCase()));
  const saveDone = () => { setModal(null); resource.reload(); };
  return <div className="page-enter"><SectionHeading eyebrow="Content management" title="Masjids" description="Create, publish, classify, and maintain the Masjid directory." action={<Button onClick={() => setModal('new')}><Plus size={16} /> New Masjid</Button>} /><div className="mb-5 rounded-xl border border-border bg-card p-3"><SearchBar value={search} onChange={setSearch} placeholder="Search by name, city, or location" /></div><QueryState loading={resource.loading} error={resource.error} onRetry={resource.reload} label="Masjids"><div className="overflow-hidden rounded-xl border border-border bg-card"><div className="hidden grid-cols-[1.4fr_.8fr_.55fr_.65fr_.7fr] gap-4 border-b border-border bg-muted/50 px-5 py-3 font-mono-ui text-[10px] uppercase tracking-[0.14em] text-muted-foreground md:grid"><span>Masjid</span><span>Status</span><span>Flags</span><span>Visibility</span><span /></div>{rows.map((masjid) => <MasjidRow key={masjid.id} masjid={masjid} onEdit={() => setModal(masjid)} onArchive={async () => { if (!supabase) return; const result = await supabase.from('masjids').update({ status: 'hidden', published: false }).eq('id', masjid.id); if (!result.error) { await recordAudit(admin.id, 'archive', 'masjid', masjid.id, { name: masjid.name }); resource.reload(); } }} />)}{!rows.length && <p className="px-5 py-12 text-center text-sm text-muted-foreground">No Masjids match this search.</p>}</div></QueryState>{modal && <Modal title={modal === 'new' ? 'Create Masjid' : `Edit ${modal.name}`} onClose={() => setModal(null)}><MasjidForm initial={modal === 'new' ? undefined : modal} categories={categories.data ?? []} adminId={admin.id} onDone={saveDone} onCancel={() => setModal(null)} /></Modal>}</div>;
}

function MasjidRow({ masjid, onEdit, onArchive }: { masjid: Masjid; onEdit: () => void; onArchive: () => void }) {
  return <div className="grid gap-3 border-b border-border px-5 py-4 last:border-0 md:grid-cols-[1.4fr_.8fr_.55fr_.65fr_.7fr] md:items-center md:gap-4"><div className="min-w-0"><p className="truncate text-sm font-semibold">{masjid.name}</p><p className="mt-1 truncate text-xs text-muted-foreground">{masjid.location} · {masjid.city}</p></div><div><span className={cn('rounded-full px-2 py-1 font-mono-ui text-[9px] uppercase tracking-wider', masjid.status === 'active' ? 'bg-secondary text-primary' : 'bg-muted text-muted-foreground')}>{masjid.status}</span></div><div className="flex gap-1">{masjid.is_urgent && <span className="rounded-full bg-destructive/10 px-2 py-1 font-mono-ui text-[9px] uppercase text-destructive">Urgent</span>}{masjid.is_featured && <span className="rounded-full bg-accent/20 px-2 py-1 font-mono-ui text-[9px] uppercase text-[hsl(38_56%_40%)]">Featured</span>}</div><span className={cn('text-xs', masjid.published ? 'text-emerald-700' : 'text-muted-foreground')}>{masjid.published ? 'Published' : 'Draft'}</span><div className="flex gap-1 md:justify-end"><button onClick={onEdit} className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Edit Masjid"><Pencil size={15} /></button><button onClick={onArchive} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Archive Masjid"><Archive size={15} /></button></div></div>;
}

function ProjectMediaManager({ projectId, adminId }: { projectId: string; adminId: string }) {
  const [media, setMedia] = useState<ProjectMedia[]>([]);
  const [imageFiles, setImageFiles] = useState<Record<'before' | 'after', File[]>>({ before: [], after: [] });
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    if (!supabase) return;
    const result = await supabase.from('project_media').select('*').eq('project_id', projectId).order('stage').order('sort_order');
    if (result.error) setError(result.error.message);
    else setMedia((result.data ?? []) as ProjectMedia[]);
  };
  useEffect(() => { void load(); }, [projectId]);

  const chooseImages = (stage: 'before' | 'after', selected: FileList | null) => setImageFiles((current) => ({ ...current, [stage]: selected ? Array.from(selected) : [] }));

  const uploadImages = async (stage: 'before' | 'after') => {
    if (!supabase || !imageFiles[stage].length) return;
    setBusy(`images-${stage}`); setError('');
    try {
      const existingCount = media.filter((item) => item.stage === stage && item.media_type === 'image').length;
      for (const [index, file] of imageFiles[stage].entries()) {
        if (!file.type.startsWith('image/')) throw new Error('Please choose image files only for Before / After.');
        const uploaded = await uploadPublicMedia('public-project-media', file, `${projectId}/${stage}`);
        const result = await supabase.from('project_media').insert({ project_id: projectId, media_type: 'image', stage, file_url: uploaded.url, sort_order: existingCount + index }).select('id').single();
        if (result.error) { await deletePublicMedia('public-project-media', uploaded.path).catch(() => undefined); throw result.error; }
      }
      await recordAudit(adminId, 'upload', 'project_media', projectId, { stage, media_type: 'image', count: imageFiles[stage].length });
      setImageFiles((current) => ({ ...current, [stage]: [] }));
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to upload project images.'); }
    finally { setBusy(''); }
  };

  const uploadVideos = async () => {
    if (!supabase || !videoFiles.length) return;
    setBusy('videos'); setError('');
    try {
      const existingCount = media.filter((item) => item.media_type === 'video').length;
      for (const [index, file] of videoFiles.entries()) {
        if (!file.type.startsWith('video/')) throw new Error('Please choose video files only for Project Videos.');
        const uploaded = await uploadPublicMedia('public-project-media', file, `${projectId}/videos`);
        // The schema requires a stage; project videos are independent of Before/After, so they use after as the storage stage and are rendered from media_type=video only.
        const result = await supabase.from('project_media').insert({ project_id: projectId, media_type: 'video', stage: 'after', file_url: uploaded.url, sort_order: existingCount + index }).select('id').single();
        if (result.error) { await deletePublicMedia('public-project-media', uploaded.path).catch(() => undefined); throw result.error; }
      }
      await recordAudit(adminId, 'upload', 'project_media', projectId, { media_type: 'video', count: videoFiles.length });
      setVideoFiles([]); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to upload project videos.'); }
    finally { setBusy(''); }
  };

  const removeMedia = async (item: ProjectMedia) => {
    if (!supabase || !window.confirm('Delete this project media? This cannot be undone.')) return;
    setError('');
    try {
      const marker = '/storage/v1/object/public/public-project-media/';
      const path = item.file_url.includes(marker) ? decodeURIComponent(item.file_url.split(marker)[1]) : '';
      if (path) await deletePublicMedia('public-project-media', path);
      const result = await supabase.from('project_media').delete().eq('id', item.id);
      if (result.error) throw result.error;
      await recordAudit(adminId, 'delete', 'project_media', item.id, { project_id: projectId, media_type: item.media_type });
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to delete project media.'); }
  };

  const imagesFor = (stage: 'before' | 'after') => media.filter((item) => item.stage === stage && item.media_type === 'image');
  const videos = media.filter((item) => item.media_type === 'video');

  return <div className="space-y-5 rounded-xl border border-border bg-muted/20 p-4">
    <div><p className="font-mono-ui text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Project Media</p><h3 className="mt-1 font-display text-lg font-semibold">Before / After Your Support / Project Videos</h3><p className="mt-1 text-xs text-muted-foreground">Completed projects use Before and After Your Support photos plus a separate Project Videos section. Progress is not shown in the mobile app.</p></div>
    {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
    <div className="grid gap-4 lg:grid-cols-2">
      {(['before', 'after'] as const).map((stage) => {
        const stageMedia = imagesFor(stage);
        const label = stage === 'before' ? 'Before' : 'After Your Support';
        return <div key={stage} className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-center justify-between gap-2"><div><p className="text-sm font-semibold">{label}</p><p className="text-[11px] text-muted-foreground">{stageMedia.length} photo{stageMedia.length === 1 ? '' : 's'}</p></div><label className="cursor-pointer rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted"><span className="flex items-center gap-1.5"><Upload size={14} /> Choose photos</span><input type="file" accept="image/*" multiple className="hidden" onChange={(event) => chooseImages(stage, event.target.files)} /></label></div>
          {imageFiles[stage].length > 0 && <div className="mt-3 rounded-lg bg-secondary/60 p-2 text-xs"><p className="font-semibold">{imageFiles[stage].length} new photo{imageFiles[stage].length === 1 ? '' : 's'} selected</p><button type="button" onClick={() => void uploadImages(stage)} disabled={busy !== ''} className="mt-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50">{busy === `images-${stage}` ? 'Uploading…' : 'Upload photos'}</button></div>}
          {stageMedia.length > 0 && <div className="mt-3 grid grid-cols-2 gap-2">{stageMedia.map((item) => <div key={item.id} className="group relative overflow-hidden rounded-lg border border-border bg-muted"><img src={item.file_url} alt={`${label} project media`} className="aspect-square w-full object-cover" /><button type="button" onClick={() => void removeMedia(item)} className="absolute right-1.5 top-1.5 rounded-md bg-black/70 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100" aria-label="Delete project media"><X size={13} /></button></div>)}</div>}
          {!stageMedia.length && !imageFiles[stage].length && <p className="mt-4 rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">No photos yet.</p>}
        </div>;
      })}
    </div>
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center justify-between gap-2"><div><p className="text-sm font-semibold">Project Videos</p><p className="text-[11px] text-muted-foreground">{videos.length} video{videos.length === 1 ? '' : 's'}</p></div><label className="cursor-pointer rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted"><span className="flex items-center gap-1.5"><Video size={14} /> Choose videos</span><input type="file" accept="video/*" multiple className="hidden" onChange={(event) => setVideoFiles(event.target.files ? Array.from(event.target.files) : [])} /></label></div>
      {videoFiles.length > 0 && <div className="mt-3 rounded-lg bg-secondary/60 p-2 text-xs"><p className="font-semibold">{videoFiles.length} video{videoFiles.length === 1 ? '' : 's'} selected</p><button type="button" onClick={() => void uploadVideos()} disabled={busy !== ''} className="mt-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50">{busy === 'videos' ? 'Uploading…' : 'Upload videos'}</button></div>}
      {videos.length > 0 && <div className="mt-3 grid gap-2 sm:grid-cols-2">{videos.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3"><div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Video size={18} /></div><div><p className="text-xs font-semibold">Project video</p><a href={item.file_url} target="_blank" rel="noreferrer" className="text-[10px] text-muted-foreground hover:text-primary">Open video</a></div></div><button type="button" onClick={() => void removeMedia(item)} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Delete project video"><X size={14} /></button></div>)}</div>}
      {!videos.length && !videoFiles.length && <p className="mt-4 rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">No project videos yet.</p>}
    </div>
  </div>;
}

function ProjectEvidenceManager({ projectId, adminId }: { projectId: string; adminId: string }) {
  const [docs, setDocs] = useState<Array<{ id: string; document_type: string; file_url: string; is_private: boolean }>>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseDocs, setExpenseDocs] = useState<Record<string, Array<{ id: string; file_url: string; is_private: boolean; document_type: string }>>>({});
  const [qaziFile, setQaziFile] = useState<File | null>(null);
  const [privateFile, setPrivateFile] = useState<File | null>(null);
  const [billFiles, setBillFiles] = useState<Record<string, File | null>>({});
  const [newExpense, setNewExpense] = useState({ title: '', amount: '', expense_date: '', description: '' });
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    if (!supabase) return;
    const [docsResult, expensesResult] = await Promise.all([
      supabase.from('project_documents').select('id,document_type,file_url,is_private').eq('project_id', projectId).order('created_at', { ascending: false }),
      supabase.from('project_expenses').select('id,project_id,title,description,amount,expense_date').eq('project_id', projectId).order('expense_date', { ascending: false }),
    ]);
    if (docsResult.error) setError(docsResult.error.message); else setDocs((docsResult.data ?? []) as typeof docs);
    if (expensesResult.error) setError(expensesResult.error.message); else setExpenses((expensesResult.data ?? []) as Expense[]);
    const next: typeof expenseDocs = {};
    for (const expense of (expensesResult.data ?? []) as Expense[]) {
      const result = await supabase.from('expense_documents').select('id,file_url,is_private,document_type').eq('expense_id', expense.id).order('created_at', { ascending: false });
      if (!result.error) next[expense.id] = (result.data ?? []) as typeof next[string];
    }
    setExpenseDocs(next);
  };
  useEffect(() => { void load(); }, [projectId]);

  const replaceQazi = async (file: File) => {
    if (!supabase) return;
    setBusy('qazi'); setError('');
    try {
      const old = await supabase.from('project_documents').select('id,file_url,is_private').eq('project_id', projectId).eq('document_type', 'qazi_permission');
      for (const item of (old.data ?? []) as Array<{ id: string; file_url: string; is_private: boolean }>) {
        const marker = '/storage/v1/object/public/public-project-media/';
        if (!item.is_private && item.file_url.includes(marker)) await deletePublicMedia('public-project-media', decodeURIComponent(item.file_url.split(marker)[1])).catch(() => undefined);
        await supabase.from('project_documents').delete().eq('id', item.id);
      }
      const uploaded = await uploadPublicMedia('public-project-media', file, `${projectId}/documents`);
      const result = await supabase.from('project_documents').insert({ project_id: projectId, document_type: 'qazi_permission', file_url: uploaded.url, is_private: false }).select('id').single();
      if (result.error) { await deletePublicMedia('public-project-media', uploaded.path).catch(() => undefined); throw result.error; }
      await recordAudit(adminId, 'upload', 'project_document', result.data.id, { project_id: projectId, document_type: 'qazi_permission' });
      setQaziFile(null); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to update permission letter.'); }
    finally { setBusy(''); }
  };

  const replacePrivateDoc = async (existing: typeof docs[number] | null, file: File) => {
    if (!supabase) return;
    setBusy(existing ? `doc-${existing.id}` : 'document'); setError('');
    try {
      const uploaded = await uploadPrivateDocument(file, `${projectId}/documents`);
      if (existing) {
        await deletePrivateDocument(existing.file_url).catch(() => undefined);
        const result = await supabase.from('project_documents').update({ file_url: uploaded.path, is_private: true }).eq('id', existing.id).select('id').single();
        if (result.error) { await deletePrivateDocument(uploaded.path).catch(() => undefined); throw result.error; }
        await recordAudit(adminId, 'update', 'project_document', existing.id, { project_id: projectId, document_type: existing.document_type });
      } else {
        const result = await supabase.from('project_documents').insert({ project_id: projectId, document_type: 'other', file_url: uploaded.path, is_private: true }).select('id').single();
        if (result.error) { await deletePrivateDocument(uploaded.path).catch(() => undefined); throw result.error; }
        await recordAudit(adminId, 'upload', 'project_document', result.data.id, { project_id: projectId, document_type: 'other', private: true });
      }
      setPrivateFile(null); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to update project document.'); }
    finally { setBusy(''); }
  };

  const replaceBill = async (expenseId: string, file: File) => {
    if (!supabase) return;
    setBusy(`bill-${expenseId}`); setError('');
    try {
      const existing = (expenseDocs[expenseId] ?? []).find((doc) => doc.document_type === 'bill' || doc.document_type === 'invoice');
      const uploaded = await uploadPrivateDocument(file, `${projectId}/expenses/${expenseId}`);
      if (existing) {
        await deletePrivateDocument(existing.file_url).catch(() => undefined);
        const result = await supabase.from('expense_documents').update({ file_url: uploaded.path, document_type: 'bill', is_private: true }).eq('id', existing.id).select('id').single();
        if (result.error) { await deletePrivateDocument(uploaded.path).catch(() => undefined); throw result.error; }
        await recordAudit(adminId, 'update', 'expense_document', existing.id, { project_id: projectId, expense_id: expenseId });
      } else {
        const result = await supabase.from('expense_documents').insert({ expense_id: expenseId, document_type: 'bill', file_url: uploaded.path, is_private: true }).select('id').single();
        if (result.error) { await deletePrivateDocument(uploaded.path).catch(() => undefined); throw result.error; }
        await recordAudit(adminId, 'upload', 'expense_document', result.data.id, { project_id: projectId, expense_id: expenseId });
      }
      setBillFiles((current) => ({ ...current, [expenseId]: null })); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to update expense bill.'); }
    finally { setBusy(''); }
  };


  const addExpense = async () => {
    if (!supabase || !newExpense.title.trim() || !newExpense.amount) return;
    setBusy('add-expense'); setError('');
    try {
      const result = await supabase.from('project_expenses').insert({
        project_id: projectId,
        title: newExpense.title.trim(),
        description: newExpense.description.trim() || null,
        amount: Number(newExpense.amount),
        expense_date: newExpense.expense_date || null,
      }).select('id').single();
      if (result.error) throw result.error;
      await recordAudit(adminId, 'create', 'project_expense', result.data.id, { project_id: projectId, title: newExpense.title.trim() });
      setNewExpense({ title: '', amount: '', expense_date: '', description: '' });
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to add expense.');
    } finally {
      setBusy('');
    }
  };

  const openBill = async (path: string) => {
    setError('');
    try {
      const url = await createPrivateDocumentUrl(path);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to open bill.');
    }
  };

  const updateExpense = async (expense: Expense, patch: Partial<Expense>) => {
    if (!supabase) return;
    setBusy(`expense-${expense.id}`); setError('');
    try {
      const result = await supabase.from('project_expenses').update({ title: patch.title ?? expense.title, description: patch.description ?? expense.description ?? null, amount: Number(patch.amount ?? expense.amount), expense_date: patch.expense_date ?? expense.expense_date ?? null }).eq('id', expense.id);
      if (result.error) throw result.error;
      await recordAudit(adminId, 'update', 'project_expense', expense.id, { project_id: projectId, title: patch.title ?? expense.title });
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to update expense.'); }
    finally { setBusy(''); }
  };

  const deleteExpense = async (expense: Expense) => {
    if (!supabase || !window.confirm(`Delete expense “${expense.title}”?`)) return;
    setBusy(`delete-expense-${expense.id}`); setError('');
    try {
      for (const doc of expenseDocs[expense.id] ?? []) if (doc.is_private) await deletePrivateDocument(doc.file_url).catch(() => undefined);
      const result = await supabase.from('project_expenses').delete().eq('id', expense.id);
      if (result.error) throw result.error;
      await recordAudit(adminId, 'delete', 'project_expense', expense.id, { project_id: projectId });
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to delete expense.'); }
    finally { setBusy(''); }
  };

  const deleteDoc = async (doc: typeof docs[number]) => {
    if (!supabase || !window.confirm('Delete this project document?')) return;
    try {
      if (doc.is_private) await deletePrivateDocument(doc.file_url).catch(() => undefined);
      else {
        const marker = '/storage/v1/object/public/public-project-media/';
        if (doc.file_url.includes(marker)) await deletePublicMedia('public-project-media', decodeURIComponent(doc.file_url.split(marker)[1])).catch(() => undefined);
      }
      const result = await supabase.from('project_documents').delete().eq('id', doc.id); if (result.error) throw result.error;
      await recordAudit(adminId, 'delete', 'project_document', doc.id, { project_id: projectId }); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to delete document.'); }
  };

  return <div className="space-y-5 rounded-xl border border-border bg-muted/20 p-4">
    <div><p className="font-mono-ui text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Documents & expenses</p><h3 className="mt-1 font-display text-lg font-semibold">Qazi letter, project documents, expense bills and expense editing</h3><p className="mt-1 text-xs text-muted-foreground">Available in both ongoing and completed project Edit screens. Public Qazi documents can be opened by users; private documents and bills stay protected.</p></div>
    {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-lg border border-border bg-card p-3"><p className="text-sm font-semibold">Qazi-e-Shaher Permission Letter</p><p className="mt-1 text-[11px] text-muted-foreground">Public verification document</p><div className="mt-3 flex flex-wrap items-center gap-2"><label className="cursor-pointer rounded-lg border border-border px-3 py-2 text-xs font-semibold"><span className="flex items-center gap-1.5"><Upload size={13} /> {docs.some((doc) => doc.document_type === 'qazi_permission') ? 'Replace letter' : 'Upload letter'}</span><input type="file" accept="image/*,.pdf" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) { setQaziFile(file); void replaceQazi(file); } }} /></label>{docs.some((doc) => doc.document_type === 'qazi_permission') && <span className="text-[10px] text-emerald-700">Uploaded</span>}</div></div>
      <div className="rounded-lg border border-border bg-card p-3"><p className="text-sm font-semibold">Private Project Documents</p><p className="mt-1 text-[11px] text-muted-foreground">Upload supporting documents. They are not publicly downloadable.</p><div className="mt-3 flex flex-wrap gap-2"><label className="cursor-pointer rounded-lg border border-border px-3 py-2 text-xs font-semibold"><span className="flex items-center gap-1.5"><FileUp size={13} /> Add document</span><input type="file" accept="image/*,.pdf" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) { setPrivateFile(file); void replacePrivateDoc(null, file); } }} /></label></div><div className="mt-3 space-y-2">{docs.filter((doc) => doc.document_type !== 'qazi_permission').map((doc) => <div key={doc.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/40 p-2.5"><div className="flex items-center gap-2"><FileText size={14} className="text-primary" /><div><p className="text-xs font-semibold">Private Project Document</p><p className="text-[10px] text-muted-foreground">Protected</p></div></div><div className="flex items-center gap-2"><label className="cursor-pointer rounded-md border border-border px-2 py-1 text-[10px] font-semibold">Replace<input type="file" accept="image/*,.pdf" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void replacePrivateDoc(doc, file); }} /></label><button type="button" onClick={() => void deleteDoc(doc)} className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><X size={14} /></button></div></div>)}</div></div>
    </div>
    <div className="rounded-lg border border-border bg-card p-3"><div className="flex items-center justify-between gap-2"><div><p className="text-sm font-semibold">Expenses</p><p className="text-[11px] text-muted-foreground">Add and edit every expense here. Bills / expense photos can be uploaded, replaced and viewed without leaving the project.</p></div><FileCheck2 size={18} className="text-primary" /></div>
      <div className="mt-3 rounded-lg border border-dashed border-border bg-muted/20 p-3">
        <p className="text-xs font-semibold">Add expense to this project</p>
        <div className="mt-3 grid gap-3 md:grid-cols-4">
          <Input label="Expense name" value={newExpense.title} onChange={(value) => setNewExpense({ ...newExpense, title: value })} />
          <Input label="Amount" value={newExpense.amount} onChange={(value) => setNewExpense({ ...newExpense, amount: value })} type="number" min="0" step="0.01" />
          <Input label="Date" value={newExpense.expense_date} onChange={(value) => setNewExpense({ ...newExpense, expense_date: value })} type="date" />
          <Input label="Description" value={newExpense.description} onChange={(value) => setNewExpense({ ...newExpense, description: value })} />
        </div>
        <button type="button" onClick={() => void addExpense()} disabled={busy !== '' || !newExpense.title.trim() || !newExpense.amount} className="mt-3 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50">{busy === 'add-expense' ? 'Adding…' : 'Add expense'}</button>
      </div>
      <div className="mt-3 space-y-3">{expenses.map((expense) => { const bill = (expenseDocs[expense.id] ?? []).find((doc) => doc.document_type === 'bill' || doc.document_type === 'invoice'); return <div key={expense.id} className="rounded-lg border border-border bg-muted/30 p-3"><div className="grid gap-3 md:grid-cols-4"><Input label="Expense name" value={expense.title} onChange={(value) => setExpenses((items) => items.map((item) => item.id === expense.id ? { ...item, title: value } : item))} /><Input label="Amount" value={String(expense.amount)} onChange={(value) => setExpenses((items) => items.map((item) => item.id === expense.id ? { ...item, amount: value } : item))} type="number" min="0" step="0.01" /><Input label="Date" value={expense.expense_date ?? ''} onChange={(value) => setExpenses((items) => items.map((item) => item.id === expense.id ? { ...item, expense_date: value } : item))} type="date" /><Input label="Description" value={expense.description ?? ''} onChange={(value) => setExpenses((items) => items.map((item) => item.id === expense.id ? { ...item, description: value } : item))} /></div><div className="mt-3 flex flex-wrap items-center gap-2"><button type="button" onClick={() => void updateExpense(expense, expense)} disabled={busy !== ''} className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50">{busy === `expense-${expense.id}` ? 'Saving…' : 'Save expense'}</button><label className="cursor-pointer rounded-lg border border-border px-3 py-2 text-xs font-semibold"><span className="flex items-center gap-1.5"><Upload size={13} /> {bill ? 'Replace bill / photo' : 'Upload bill / photo'}</span><input type="file" accept="image/*,.pdf" className="hidden" disabled={busy !== ''} onChange={(event) => { const file = event.target.files?.[0]; if (file) { setBillFiles((current) => ({ ...current, [expense.id]: file })); void replaceBill(expense.id, file); } }} /></label>{bill && <><span className="text-[10px] text-emerald-700">Bill uploaded</span><button type="button" onClick={() => void openBill(bill.file_url)} className="text-[10px] font-semibold text-primary">View bill</button></>}<button type="button" onClick={() => void deleteExpense(expense)} disabled={busy !== ''} className="rounded-lg border border-destructive/30 px-3 py-2 text-xs font-semibold text-destructive disabled:opacity-50">Delete expense</button></div></div>; })}{!expenses.length && <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">No expenses recorded for this project yet. Use the Add expense form above.</p>}</div></div>
  </div>;
}

function ProjectForm({ initial, categories, masjids, onDone, onCancel, adminId }: { initial?: Project; categories: Category[]; masjids: Masjid[]; onDone: () => void; onCancel: () => void; adminId: string }) {
  const [form, setForm] = useState({ title: initial?.title ?? '', masjid_id: initial?.masjid_id ?? masjids[0]?.id ?? '', category_id: initial?.category_id ?? '', short_description: initial?.short_description ?? '', full_description: initial?.full_description ?? '', target_amount: String(initial?.target_amount ?? 0), raised_amount: String(initial?.raised_amount ?? 0), total_expense: String(initial?.total_expense ?? 0), status: initial?.status ?? 'draft', published: initial?.published ?? false, featured: initial?.featured ?? false });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event: FormEvent) => {
    event.preventDefault(); if (!supabase) return;
    setBusy(true); setError('');
    try {
      const payload = { title: form.title, masjid_id: form.masjid_id, category_id: form.category_id || null, short_description: form.short_description || null, full_description: form.full_description || null, target_amount: Number(form.target_amount), raised_amount: Number(form.raised_amount), total_expense: Number(form.total_expense), status: form.status, published: form.published, featured: form.featured };
      const result = initial ? await supabase.from('projects').update(payload).eq('id', initial.id).select('id').single() : await supabase.from('projects').insert(payload).select('id').single();
      if (result.error) throw result.error;
      await recordAudit(adminId, initial ? 'update' : 'create', 'project', result.data?.id ?? initial?.id, { title: form.title, published: form.published });
      onDone();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to save project.'); } finally { setBusy(false); }
  };
  return <form onSubmit={submit} className="space-y-4">{error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}<div className="grid gap-4 sm:grid-cols-2"><Input label="Title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} required /><Select label="Masjid" value={form.masjid_id} onChange={(value) => setForm({ ...form, masjid_id: value })} options={masjids.map((masjid) => ({ value: masjid.id, label: masjid.name }))} /><Select label="Category" value={form.category_id} onChange={(value) => setForm({ ...form, category_id: value })} options={[{ value: '', label: 'No category' }, ...categories.map((category) => ({ value: category.id, label: category.name }))]} /><Select label="Status" value={form.status} onChange={(value) => setForm({ ...form, status: value as Project['status'] })} options={[{ value: 'draft', label: 'Draft' }, { value: 'ongoing', label: 'Ongoing' }, { value: 'completed', label: 'Completed' }, { value: 'hidden', label: 'Hidden' }]} /><Input label="Target amount" value={form.target_amount} onChange={(value) => setForm({ ...form, target_amount: value })} type="number" min="0" step="0.01" /><Input label="Raised amount (verified only)" value={form.raised_amount} onChange={(value) => setForm({ ...form, raised_amount: value })} type="number" min="0" step="0.01" /><Input label="Total expense (verified only)" value={form.total_expense} onChange={(value) => setForm({ ...form, total_expense: value })} type="number" min="0" step="0.01" /></div><Textarea label="Short description" value={form.short_description} onChange={(value) => setForm({ ...form, short_description: value })} /><Textarea label="Full description / work completed" value={form.full_description} onChange={(value) => setForm({ ...form, full_description: value })} rows={5} /><div className="grid gap-2 sm:grid-cols-2"><Toggle label="Published" checked={form.published} onChange={(checked) => setForm({ ...form, published: checked })} /><Toggle label="Featured" checked={form.featured} onChange={(checked) => setForm({ ...form, featured: checked })} /></div>{initial?.id && <><ProjectMediaManager projectId={initial.id} adminId={adminId} /><ProjectEvidenceManager projectId={initial.id} adminId={adminId} /></>}<FormActions busy={busy} onCancel={onCancel} /></form>;
}

function ProjectsPage() {
  const admin = useAdmin();
  const resource = useResource(() => selectRows<Project>('projects', '*,masjid:masjids(name),category:categories(name)', 'created_at'), 'projects');
  const masjids = useResource(() => selectRows<Masjid>('masjids', 'id,name,status', 'name'), 'project-masjids');
  const categories = useResource(() => selectRows<Category>('categories', 'id,name,published,sort_order', 'sort_order'), 'project-categories');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'new' | Project | null>(null);
  const rows = (resource.data ?? []).filter((item) => `${item.title} ${item.masjid?.name ?? ''} ${item.category?.name ?? ''}`.toLowerCase().includes(search.toLowerCase()));
  return <div className="page-enter"><SectionHeading eyebrow="Fundraising management" title="Projects / Our Work" description="Keep project narratives, verified figures, publication state, and featured placement in sync." action={<Button onClick={() => setModal('new')}><Plus size={16} /> New project</Button>} /><div className="mb-5 rounded-xl border border-border bg-card p-3"><SearchBar value={search} onChange={setSearch} placeholder="Search projects, Masjids, or categories" /></div><QueryState loading={resource.loading} error={resource.error} onRetry={resource.reload} label="projects"><div className="overflow-hidden rounded-xl border border-border bg-card"><div className="hidden grid-cols-[1.4fr_.8fr_.7fr_.7fr_.65fr] gap-4 border-b border-border bg-muted/50 px-5 py-3 font-mono-ui text-[10px] uppercase tracking-[0.14em] text-muted-foreground md:grid"><span>Project</span><span>Status</span><span>Progress</span><span>Visibility</span><span /></div>{rows.map((project) => <ProjectRow key={project.id} project={project} onEdit={() => setModal(project)} onArchive={async () => { if (!supabase) return; const result = await supabase.from('projects').update({ status: 'hidden', published: false }).eq('id', project.id); if (!result.error) { await recordAudit(admin.id, 'archive', 'project', project.id, { title: project.title }); resource.reload(); } }} />)}{!rows.length && <p className="px-5 py-12 text-center text-sm text-muted-foreground">No projects match this search.</p>}</div></QueryState>{modal && <Modal title={modal === 'new' ? 'Create project' : `Edit ${modal.title}`} onClose={() => setModal(null)}><ProjectForm initial={modal === 'new' ? undefined : modal} categories={categories.data ?? []} masjids={masjids.data ?? []} adminId={admin.id} onDone={() => { setModal(null); resource.reload(); }} onCancel={() => setModal(null)} /></Modal>}</div>;
}

function ProjectRow({ project, onEdit, onArchive }: { project: Project; onEdit: () => void; onArchive: () => void }) {
  const progress = Number(project.target_amount) ? Math.min(100, Math.round((Number(project.raised_amount) / Number(project.target_amount)) * 100)) : 0;
  return <div className="grid gap-3 border-b border-border px-5 py-4 last:border-0 md:grid-cols-[1.4fr_.8fr_.7fr_.7fr_.65fr] md:items-center md:gap-4"><div className="min-w-0"><p className="truncate text-sm font-semibold">{project.title}</p><p className="mt-1 truncate text-xs text-muted-foreground">{project.masjid?.name ?? 'Unassigned'} · {project.category?.name ?? 'No category'}</p></div><span className={cn('w-fit rounded-full px-2 py-1 font-mono-ui text-[9px] uppercase tracking-wider', project.status === 'ongoing' ? 'bg-secondary text-primary' : 'bg-muted text-muted-foreground')}>{project.status}</span><div className="flex items-center gap-2"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} /></div><span className="font-mono-ui text-[10px] text-muted-foreground">{progress}%</span></div><span className={cn('text-xs', project.published ? 'text-emerald-700' : 'text-muted-foreground')}>{project.published ? 'Published' : 'Draft'}</span><div className="flex gap-1 md:justify-end"><button onClick={onEdit} className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="Edit project"><Pencil size={15} /></button><button onClick={onArchive} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Archive project"><Archive size={15} /></button></div></div>;
}

function CategoriesPage() {
  const resource = useResource(() => selectRows<Category>('categories', '*', 'sort_order'), 'categories');
  const [editing, setEditing] = useState<Category | 'new' | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [published, setPublished] = useState(true);
  const [sortOrder, setSortOrder] = useState('0');
  const open = (category: Category | 'new') => { setEditing(category); setName(category === 'new' ? '' : category.name); setDescription(category === 'new' ? '' : category.description ?? ''); setPublished(category === 'new' ? true : category.published); setSortOrder(category === 'new' ? '0' : String(category.sort_order)); };
  const save = async (event: FormEvent) => { event.preventDefault(); if (!supabase || !editing) return; const payload = { name, description: description || null, published, sort_order: Number(sortOrder) }; const result = editing === 'new' ? await supabase.from('categories').insert(payload).select('id').single() : await supabase.from('categories').update(payload).eq('id', editing.id); if (!result.error) { setEditing(null); resource.reload(); } };
  return <div className="page-enter"><SectionHeading eyebrow="Content taxonomy" title="Categories" description="Manage the labels used to organize Masjids and projects." action={<Button onClick={() => open('new')}><Plus size={16} /> New category</Button>} /><QueryState loading={resource.loading} error={resource.error} onRetry={resource.reload} label="categories"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{(resource.data ?? []).map((category) => <div key={category.id} className="rounded-xl border border-border bg-card p-5"><div className="flex items-start justify-between"><div><p className="font-display text-xl font-semibold">{category.name}</p><p className="mt-1 text-xs text-muted-foreground">Order {category.sort_order} · {category.published ? 'Published' : 'Hidden'}</p></div><button onClick={() => open(category)} className="rounded-lg p-2 text-muted-foreground hover:bg-muted"><Pencil size={15} /></button></div><p className="mt-4 text-sm leading-relaxed text-muted-foreground">{category.description || 'No description.'}</p></div>)}</div></QueryState>{editing && <Modal title={editing === 'new' ? 'Create category' : 'Edit category'} onClose={() => setEditing(null)}><form onSubmit={save} className="space-y-4"><Input label="Name" value={name} onChange={setName} required /><Textarea label="Description" value={description} onChange={setDescription} /><div className="grid gap-4 sm:grid-cols-2"><Input label="Sort order" value={sortOrder} onChange={setSortOrder} type="number" min="0" /><Toggle label="Published" checked={published} onChange={setPublished} /></div><FormActions busy={false} onCancel={() => setEditing(null)} /></form></Modal>}</div>;
}

function SlideForm({ initial, onDone, onCancel, adminId }: { initial?: HomeSlide; onDone: () => void; onCancel: () => void; adminId: string }) {
  const [form, setForm] = useState({ title: initial?.title ?? '', subtitle: initial?.subtitle ?? '', image_url: initial?.image_url ?? '', action_type: initial?.action_type ?? '', action_id: initial?.action_id ?? '', sort_order: String(initial?.sort_order ?? 0), published: initial?.published ?? false });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent) => { event.preventDefault(); if (!supabase) return; setBusy(true); try { let imageUrl = form.image_url || null; if (file) imageUrl = (await uploadPublicMedia('public-home-media', file, initial?.id ?? 'slides')).url; const payload = { title: form.title, subtitle: form.subtitle || null, image_url: imageUrl, action_type: form.action_type || null, action_id: form.action_id || null, sort_order: Number(form.sort_order), published: form.published }; const result = initial ? await supabase.from('home_slides').update(payload).eq('id', initial.id).select('id').single() : await supabase.from('home_slides').insert(payload).select('id').single(); if (result.error) throw result.error; await recordAudit(adminId, initial ? 'update' : 'create', 'home_slide', result.data?.id ?? initial?.id, { title: form.title, published: form.published }); onDone(); } finally { setBusy(false); } };
  return <form onSubmit={submit} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><Input label="Title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} required /><Input label="Subtitle" value={form.subtitle} onChange={(value) => setForm({ ...form, subtitle: value })} /><Input label="Action type" value={form.action_type} onChange={(value) => setForm({ ...form, action_type: value })} placeholder="project or masjid" /><Input label="Action target" value={form.action_id} onChange={(value) => setForm({ ...form, action_id: value })} /><Input label="Sort order" value={form.sort_order} onChange={(value) => setForm({ ...form, sort_order: value })} type="number" min="0" /><Input label="Image URL" value={form.image_url} onChange={(value) => setForm({ ...form, image_url: value })} /></div><label className="block text-xs font-semibold">Upload slide image<input type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="mt-2 block w-full text-xs font-normal" /></label><Toggle label="Published" checked={form.published} onChange={(checked) => setForm({ ...form, published: checked })} /><FormActions busy={busy} onCancel={onCancel} /></form>;
}

function SlidesPage() {
  const admin = useAdmin();
  const resource = useResource(() => selectRows<HomeSlide>('home_slides', '*', 'sort_order'), 'slides');
  const [modal, setModal] = useState<'new' | HomeSlide | null>(null);
  return <div className="page-enter"><SectionHeading eyebrow="Homepage CMS" title="Home slides" description="Control the published sequence shown on the mobile home experience." action={<Button onClick={() => setModal('new')}><Plus size={16} /> New slide</Button>} /><QueryState loading={resource.loading} error={resource.error} onRetry={resource.reload} label="slides"><div className="grid gap-5 lg:grid-cols-2">{(resource.data ?? []).map((slide, index) => <article key={slide.id} className="overflow-hidden rounded-xl border border-border bg-card"><div className="relative aspect-[2.25/1] overflow-hidden bg-primary">{slide.image_url ? <img src={slide.image_url} alt="" className="h-full w-full object-cover opacity-80" /> : <div className="flex h-full items-center justify-center text-primary-foreground/25"><GalleryHorizontalEnd size={65} strokeWidth={1} /></div>}<div className="absolute inset-0 bg-gradient-to-t from-[hsl(155_38%_12%/.82)] to-transparent" /><span className="absolute left-4 top-4 rounded-full bg-[hsl(42_30%_96%/.9)] px-2.5 py-1 font-mono-ui text-[10px] font-semibold text-primary">0{index + 1}</span><div className="absolute bottom-4 left-4 right-4 text-primary-foreground"><h3 className="font-display text-2xl font-semibold">{slide.title}</h3>{slide.subtitle && <p className="mt-1 line-clamp-1 text-sm opacity-80">{slide.subtitle}</p>}</div></div><div className="flex items-center justify-between px-4 py-3"><span className={cn('font-mono-ui text-[10px] uppercase tracking-wider', slide.published ? 'text-emerald-700' : 'text-muted-foreground')}>{slide.published ? 'Published' : 'Draft'}</span><button onClick={() => setModal(slide)} className="flex items-center gap-1 text-xs font-semibold text-primary"><Pencil size={14} /> Edit</button></div></article>)}</div></QueryState>{modal && <Modal title={modal === 'new' ? 'Create home slide' : `Edit ${modal.title}`} onClose={() => setModal(null)}><SlideForm initial={modal === 'new' ? undefined : modal} adminId={admin.id} onDone={() => { setModal(null); resource.reload(); }} onCancel={() => setModal(null)} /></Modal>}</div>;
}

function DonationsPage() {
  const resource = useResource(() => selectRows<Donation>('donation_intents', '*,masjid:masjids(name),project:projects(title)', 'created_at'), 'donations');
  const [filter, setFilter] = useState('all');
  const rows = (resource.data ?? []).filter((item) => filter === 'all' || item.status === filter);
  const updateStatus = async (donation: Donation, status: Donation['status']) => { if (!supabase || status === donation.status) return; const result = await supabase.from('donation_intents').update({ status }).eq('id', donation.id); if (!result.error) resource.reload(); };
  return <div className="page-enter"><SectionHeading eyebrow="Donation intents" title="Donations" description="Review intent records without pretending that an intent is a completed payment." action={<Select label="Status" value={filter} onChange={setFilter} options={[{ value: 'all', label: 'All statuses' }, { value: 'initiated', label: 'Initiated' }, { value: 'pending', label: 'Pending' }, { value: 'completed', label: 'Completed' }, { value: 'failed', label: 'Failed' }, { value: 'cancelled', label: 'Cancelled' }]} />} /><QueryState loading={resource.loading} error={resource.error} onRetry={resource.reload} label="donations"><div className="overflow-hidden rounded-xl border border-border bg-card"><div className="hidden grid-cols-[1fr_.8fr_.8fr_.8fr_1fr] gap-4 border-b border-border bg-muted/50 px-5 py-3 font-mono-ui text-[10px] uppercase tracking-[0.14em] text-muted-foreground md:grid"><span>Donor</span><span>Destination</span><span>Amount</span><span>Status</span><span>Created</span></div>{rows.map((donation) => <div key={donation.id} className="grid gap-3 border-b border-border px-5 py-4 last:border-0 md:grid-cols-[1fr_.8fr_.8fr_.8fr_1fr] md:items-center md:gap-4"><div><p className="text-sm font-semibold">{donation.donor_name}</p>{donation.message && <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{donation.message}</p>}</div><p className="text-xs text-muted-foreground">{donation.project?.title ?? donation.masjid?.name ?? 'Masjid'}</p><p className="font-mono-ui text-xs font-semibold">{formatMoney(donation.amount)}</p><select value={donation.status} onChange={(event) => void updateStatus(donation, event.target.value as Donation['status'])} className="h-9 rounded-lg border border-input bg-background px-2 text-xs"><option value="initiated">Initiated</option><option value="pending">Pending</option><option value="completed">Completed</option><option value="failed">Failed</option><option value="cancelled">Cancelled</option></select><p className="text-xs text-muted-foreground">{formatDate(donation.created_at)}</p></div>)}</div></QueryState></div>;
}

function ExpensesPage() {
  const resource = useResource(() => selectRows<Expense>('project_expenses', '*,project:projects(title)', 'expense_date'), 'expenses');
  const projects = useResource(() => selectRows<Project>('projects', 'id,title', 'title'), 'expense-projects');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ project_id: '', title: '', description: '', amount: '', expense_date: '' });
  const [error, setError] = useState('');
  useEffect(() => { if (!form.project_id && projects.data?.[0]) setForm((value) => ({ ...value, project_id: projects.data?.[0]?.id ?? '' })); }, [form.project_id, projects.data]);
  const save = async (event: FormEvent) => { event.preventDefault(); if (!supabase) return; const result = await supabase.from('project_expenses').insert({ project_id: form.project_id, title: form.title, description: form.description || null, amount: Number(form.amount), expense_date: form.expense_date || null }); if (result.error) setError(result.error.message); else { setModal(false); setForm({ project_id: projects.data?.[0]?.id ?? '', title: '', description: '', amount: '', expense_date: '' }); resource.reload(); } };
  return <div className="page-enter"><SectionHeading eyebrow="Financial transparency" title="Expenses" description="Record verified project expenses. Bills and supporting documents should remain private unless explicitly published." action={<Button onClick={() => setModal(true)}><Plus size={16} /> Add expense</Button>} /><QueryState loading={resource.loading} error={resource.error} onRetry={resource.reload} label="expenses"><div className="overflow-hidden rounded-xl border border-border bg-card"><div className="hidden grid-cols-[1fr_1fr_.7fr_.7fr] gap-4 border-b border-border bg-muted/50 px-5 py-3 font-mono-ui text-[10px] uppercase tracking-[0.14em] text-muted-foreground md:grid"><span>Expense</span><span>Project</span><span>Amount</span><span>Date</span></div>{(resource.data ?? []).map((expense) => <div key={expense.id} className="grid gap-3 border-b border-border px-5 py-4 last:border-0 md:grid-cols-[1fr_1fr_.7fr_.7fr] md:items-center md:gap-4"><div><p className="text-sm font-semibold">{expense.title}</p><p className="mt-1 text-xs text-muted-foreground">{expense.description || 'No description'}</p></div><p className="text-xs text-muted-foreground">{expense.project?.title ?? 'Unknown project'}</p><p className="font-mono-ui text-xs font-semibold">{formatMoney(expense.amount)}</p><p className="text-xs text-muted-foreground">{expense.expense_date || '—'}</p></div>)}</div></QueryState>{modal && <Modal title="Record verified expense" onClose={() => setModal(false)}><form onSubmit={save} className="space-y-4">{error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}<Select label="Project" value={form.project_id} onChange={(value) => setForm({ ...form, project_id: value })} options={(projects.data ?? []).map((project) => ({ value: project.id, label: project.title }))} /><Input label="Title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} required /><Input label="Amount" value={form.amount} onChange={(value) => setForm({ ...form, amount: value })} type="number" min="0" step="0.01" required /><Input label="Expense date" value={form.expense_date} onChange={(value) => setForm({ ...form, expense_date: value })} type="date" /><Textarea label="Description" value={form.description} onChange={(value) => setForm({ ...form, description: value })} /><FormActions busy={false} onCancel={() => setModal(false)} /></form></Modal>}</div>;
}

function DocumentsPage() {
  type DocumentRecord = {
    id: string;
    document_type: string;
    file_url: string;
    is_private: boolean;
    created_at: string;
    scope: string;
  };
  const masjidDocs = useResource(() => selectRows<Record<string, unknown>>('masjid_documents', 'id,masjid_id,document_type,file_url,is_private,created_at', 'created_at'), 'masjid-documents');
  const projectDocs = useResource(() => selectRows<Record<string, unknown>>('project_documents', 'id,project_id,document_type,file_url,is_private,created_at', 'created_at'), 'project-documents');
  const expenseDocs = useResource(() => selectRows<Record<string, unknown>>('expense_documents', 'id,expense_id,document_type,file_url,is_private,created_at', 'created_at'), 'expense-documents');
  const all: DocumentRecord[] = [
    ...(masjidDocs.data ?? []).map((item) => ({ ...item, scope: 'Masjid' } as unknown as DocumentRecord)),
    ...(projectDocs.data ?? []).map((item) => ({ ...item, scope: 'Project' } as unknown as DocumentRecord)),
    ...(expenseDocs.data ?? []).map((item) => ({ ...item, scope: 'Expense' } as unknown as DocumentRecord)),
  ];
  const loading = masjidDocs.loading || projectDocs.loading || expenseDocs.loading;
  const error = masjidDocs.error || projectDocs.error || expenseDocs.error;
  return <div className="page-enter"><SectionHeading eyebrow="Evidence library" title="Documents" description="Private documents are visible here only to authorized administrators through RLS-protected rows and storage objects." /><QueryState loading={loading} error={error} onRetry={() => { masjidDocs.reload(); projectDocs.reload(); expenseDocs.reload(); }} label="documents"><div className="overflow-hidden rounded-xl border border-border bg-card"><div className="hidden grid-cols-[.7fr_1fr_.8fr_.7fr_.8fr] gap-4 border-b border-border bg-muted/50 px-5 py-3 font-mono-ui text-[10px] uppercase tracking-[0.14em] text-muted-foreground md:grid"><span>Scope</span><span>Type</span><span>Storage path</span><span>Access</span><span>Added</span></div>{all.map((document) => <div key={String(document.id)} className="grid gap-3 border-b border-border px-5 py-4 last:border-0 md:grid-cols-[.7fr_1fr_.8fr_.7fr_.8fr] md:items-center md:gap-4"><span className="text-xs font-semibold">{document.scope}</span><span className="text-sm">{String(document.document_type)}</span><span className="truncate font-mono-ui text-[10px] text-muted-foreground">{String(document.file_url)}</span><span className={cn('text-xs', document.is_private ? 'text-amber-700' : 'text-emerald-700')}>{document.is_private ? 'Private' : 'Public'}</span><span className="text-xs text-muted-foreground">{formatDate(String(document.created_at))}</span></div>)}{!all.length && <p className="px-5 py-12 text-center text-sm text-muted-foreground">No document records yet.</p>}</div></QueryState></div>;
}

async function sendExpoAnnouncement(title: string, body: string, tokens: string[]) {
  const endpoint = 'https://exp.host/--/api/v2/push/send';
  let accepted = 0;
  for (let index = 0; index < tokens.length; index += 100) {
    const batch = tokens.slice(index, index + 100).map((to) => ({
      to,
      title,
      body,
      sound: 'default',
      channelId: 'announcements',
      data: { url: '/notifications' },
    }));
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batch),
    });
    if (!response.ok) throw new Error(`Push service returned ${response.status}.`);
    const result = await response.json() as { data?: Array<{ status?: string }> };
    accepted += (result.data ?? []).filter((ticket) => ticket.status === 'ok').length;
  }
  return accepted;
}

function NotificationsPage() {
  const admin = useAdmin();
  const resource = useResource(() => selectRows<AppNotification>('notifications', 'id,title,body,published,created_at', 'created_at'), 'notifications');
  const tokens = useResource(() => selectRows<{ token: string; active: boolean }>('device_push_tokens', 'token,active', 'created_at'), 'push-tokens');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const send = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase || !title.trim() || !body.trim()) return;
    setBusy(true); setError(''); setSuccess('');
    try {
      const inserted = await supabase.from('notifications').insert({ title: title.trim(), body: body.trim(), published: true, created_by: admin.id }).select('id').single();
      if (inserted.error) throw inserted.error;
      await recordAudit(admin.id, 'create', 'notification', inserted.data.id, { title: title.trim(), broadcast: true });
      const activeTokens = (tokens.data ?? []).filter((item) => item.active).map((item) => item.token);
      let accepted = 0;
      if (activeTokens.length) accepted = await sendExpoAnnouncement(title.trim(), body.trim(), activeTokens);
      setSuccess(activeTokens.length ? `Announcement published. ${accepted} device notifications accepted.` : 'Announcement published. No push-enabled devices are registered yet.');
      setTitle(''); setBody(''); resource.reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to send announcement.');
    } finally { setBusy(false); }
  };

  return <div className="page-enter"><SectionHeading eyebrow="Broadcast desk" title="Notifications" description="Publish an announcement once and deliver it to every registered device. The same announcement also appears inside the app." />
    <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <form onSubmit={send} className="rounded-xl border border-border bg-card p-5">
        <p className="font-mono-ui text-[10px] uppercase tracking-[0.16em] text-primary">New announcement</p>
        <h3 className="mt-1 font-display text-xl font-semibold">Send to all users</h3>
        {error && <div className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
        {success && <div className="mt-4 rounded-lg bg-secondary p-3 text-sm text-primary">{success}</div>}
        <div className="mt-5 space-y-4"><Input label="Title" value={title} onChange={setTitle} placeholder="Important update" required /><Textarea label="Message" value={body} onChange={setBody} rows={6} /><Button type="submit" disabled={busy}>{busy ? 'Sending…' : 'Publish & notify all users'}</Button></div>
      </form>
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-primary p-5 text-primary-foreground"><Megaphone size={20} className="text-accent" /><p className="mt-4 font-display text-3xl font-semibold">{tokens.loading ? '—' : String((tokens.data ?? []).filter((item) => item.active).length)}</p><p className="mt-1 text-sm text-primary-foreground/70">Active push-enabled devices</p><p className="mt-4 text-xs leading-relaxed text-primary-foreground/65">Users who deny notification permission still receive announcements inside the app when they open the Notifications screen.</p></div>
        <div className="rounded-xl border border-border bg-card p-5"><p className="font-mono-ui text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Recent announcements</p><QueryState loading={resource.loading} error={resource.error} onRetry={resource.reload} label="notifications"><div className="mt-4 space-y-3">{(resource.data ?? []).slice(0, 8).map((item) => <div key={item.id} className="rounded-lg bg-muted/40 p-3"><div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold">{item.title}</p><span className="text-[10px] text-muted-foreground">{formatDate(item.created_at)}</span></div><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.body}</p></div>)}{!resource.data?.length && <p className="text-sm text-muted-foreground">No announcements yet.</p>}</div></QueryState></div>
      </div>
    </div>
  </div>;
}

function AuditLogsPage() {
  const resource = useResource(() => selectRows<AuditLog>('audit_logs', '*', 'created_at'), 'audit-logs');
  return <div className="page-enter"><SectionHeading eyebrow="Accountability" title="Audit logs" description="Append-only records of publishing, content, role, fundraising, and expense actions." /><QueryState loading={resource.loading} error={resource.error} onRetry={resource.reload} label="audit logs"><div className="overflow-hidden rounded-xl border border-border bg-card">{(resource.data ?? []).map((log) => <div key={log.id} className="flex flex-col gap-2 border-b border-border px-5 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold">{log.action} · {log.entity_type}</p><p className="mt-1 font-mono-ui text-[10px] text-muted-foreground">{log.entity_id ?? 'No entity id'} · admin {log.admin_id}</p></div><span className="text-xs text-muted-foreground">{formatDate(log.created_at)}</span></div>)}{!resource.data?.length && <p className="px-5 py-12 text-center text-sm text-muted-foreground">No audit entries yet.</p>}</div></QueryState></div>;
}

function SettingsPage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  useEffect(() => { void supabase?.auth.getSession().then(async ({ data }) => { if (data.session) setProfile(await getAdminProfile(data.session)); }); }, []);
  const signOut = async () => { await supabase?.auth.signOut(); };
  return <div className="page-enter"><SectionHeading eyebrow="Workspace controls" title="Settings" description="Connection visibility and secure access controls for the publication workspace." /><div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><div className="rounded-xl border border-border bg-card"><div className="border-b border-border px-5 py-4"><p className="font-mono-ui text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Connections</p><h3 className="mt-1 font-display text-xl font-semibold">Service health</h3></div><div className="divide-y divide-border"><div className="flex items-center justify-between px-5 py-4"><div><p className="text-sm font-semibold">Supabase database and auth</p><p className="mt-1 text-xs text-muted-foreground">Public client with RLS-enforced administrator access</p></div><span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 font-mono-ui text-[9px] uppercase text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Connected</span></div><div className="flex items-center justify-between px-5 py-4"><div><p className="text-sm font-semibold">Storage buckets</p><p className="mt-1 text-xs text-muted-foreground">Public media and private evidence paths</p></div><span className="text-xs text-emerald-700">Configured</span></div></div></div><div className="space-y-6"><div className="rounded-xl border border-border bg-primary p-6 text-primary-foreground"><ShieldCheck size={22} className="text-accent" /><h3 className="mt-5 font-display text-2xl font-semibold">{profile?.name || 'Administrator'}</h3><p className="mt-2 text-sm text-primary-foreground/70">Role: {profile?.role}</p><Button onClick={signOut} variant="gold"><LogOut size={15} /> Sign out</Button></div><div className="rounded-xl border border-dashed border-border bg-card/60 p-5"><div className="flex items-center gap-2 text-muted-foreground"><Check size={17} /><p className="font-mono-ui text-[10px] uppercase tracking-[0.16em]">Guardrails active</p></div><p className="mt-3 text-sm leading-relaxed text-muted-foreground">This panel never receives a service-role credential. Fundraising totals and private document access remain governed by Supabase policies.</p></div></div></div></div>;
}

function AppRouter() {
  return <Switch><Route path="/" component={Overview} /><Route path="/masjids" component={MasjidsPage} /><Route path="/projects" component={ProjectsPage} /><Route path="/categories" component={CategoriesPage} /><Route path="/slides" component={SlidesPage} /><Route path="/donations" component={DonationsPage} /><Route path="/notifications" component={NotificationsPage} /><Route path="/documents" component={DocumentsPage} /><Route path="/audit-logs" component={AuditLogsPage} /><Route path="/settings" component={SettingsPage} /><Route component={NotFound} /></Switch>;
}

function App() {
  return <TooltipProvider><AdminGate><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Shell><ErrorBoundary><AppRouter /></ErrorBoundary></Shell></WouterRouter></AdminGate><Toaster /></TooltipProvider>;
}

export default App;