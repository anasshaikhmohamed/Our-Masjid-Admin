
$ErrorActionPreference = 'Stop'

$path = Join-Path $PSScriptRoot 'src\App.tsx'
$content = [System.IO.File]::ReadAllText($path)

$startMarker = 'function NotificationsPage() {'
$endMarker = 'function AuditLogsPage() {'

$start = $content.IndexOf($startMarker)
$end = $content.IndexOf($endMarker, $start)

if ($start -lt 0 -or $end -lt 0) {
    throw 'Notifications section not found. No changes were made.'
}

$oldSection = $content.Substring($start, $end - $start)

if ($oldSection.Contains('const deleteNotification = async')) {
    throw 'Edit/Delete feature already exists. No changes were made.'
}

$newSection = @'
function NotificationsPage() {
  const admin = useAdmin();
  const resource = useResource(() => selectRows<AppNotification>('notifications', 'id,title,body,published,created_at', 'created_at'), 'notifications');
  const tokens = useResource(() => selectRows<{ token: string; active: boolean }>('device_push_tokens', 'token,active', 'created_at'), 'push-tokens');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [editing, setEditing] = useState<AppNotification | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
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

  const openEdit = (item: AppNotification) => {
    setEditing(item);
    setEditTitle(item.title);
    setEditBody(item.body);
    setError('');
    setSuccess('');
  };

  const saveEdit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase || !editing || !editTitle.trim() || !editBody.trim()) return;
    setActionBusy(true); setError(''); setSuccess('');
    try {
      const result = await supabase.from('notifications')
        .update({ title: editTitle.trim(), body: editBody.trim() })
        .eq('id', editing.id)
        .select('id')
        .single();
      if (result.error) throw result.error;
      await recordAudit(admin.id, 'update', 'notification', editing.id, { title: editTitle.trim() });
      setEditing(null);
      setSuccess('Announcement updated. No new push notification was sent.');
      resource.reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to update announcement.');
    } finally { setActionBusy(false); }
  };

  const deleteNotification = async (item: AppNotification) => {
    if (!supabase) return;
    const confirmed = window.confirm('Delete this announcement from the app? This cannot be undone. Already-delivered phone notifications cannot be recalled.');
    if (!confirmed) return;
    setActionBusy(true); setError(''); setSuccess('');
    try {
      const result = await supabase.from('notifications').delete().eq('id', item.id).select('id').single();
      if (result.error) throw result.error;
      await recordAudit(admin.id, 'delete', 'notification', item.id, { title: item.title });
      if (editing?.id === item.id) setEditing(null);
      setSuccess('Announcement deleted from the database. The app list will refresh when it next fetches announcements.');
      resource.reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to delete announcement.');
    } finally { setActionBusy(false); }
  };

  return <div className="page-enter">
    <SectionHeading eyebrow="Broadcast desk" title="Notifications" description="Publish announcements to registered devices and manage announcements shown inside the app." />
    {error && <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
    {success && <div className="mb-4 rounded-lg bg-secondary p-3 text-sm text-primary">{success}</div>}
    <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <form onSubmit={send} className="rounded-xl border border-border bg-card p-5">
        <p className="font-mono-ui text-[10px] uppercase tracking-[0.16em] text-primary">New announcement</p>
        <h3 className="mt-1 font-display text-xl font-semibold">Send to all users</h3>
        <div className="mt-5 space-y-4">
          <Input label="Title" value={title} onChange={setTitle} placeholder="Important update" required />
          <Textarea label="Message" value={body} onChange={setBody} rows={6} required />
          <Button type="submit" disabled={busy}>{busy ? 'Sending…' : 'Publish & notify all users'}</Button>
        </div>
      </form>
      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-primary p-5 text-primary-foreground">
          <Megaphone size={20} className="text-accent" />
          <p className="mt-4 font-display text-3xl font-semibold">{tokens.loading ? '—' : String((tokens.data ?? []).filter((item) => item.active).length)}</p>
          <p className="mt-1 text-sm text-primary-foreground/70">Active push-enabled devices</p>
          <p className="mt-4 text-xs leading-relaxed text-primary-foreground/65">Users who deny notification permission still receive announcements inside the app when they open the Notifications screen.</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="font-mono-ui text-[10px] uppercase tracking-[0.16em] text-muted-foreground">All announcements</p>
          <QueryState loading={resource.loading} error={resource.error} onRetry={resource.reload} label="notifications">
            <div className="mt-4 space-y-3">
              {(resource.data ?? []).map((item) => <div key={item.id} className="rounded-lg bg-muted/40 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><p className="text-sm font-semibold">{item.title}</p><p className="mt-1 text-[10px] text-muted-foreground">{formatDate(item.created_at)}</p></div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" disabled={actionBusy} onClick={() => openEdit(item)} className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50">Edit</button>
                    <button type="button" disabled={actionBusy} onClick={() => void deleteNotification(item)} className="rounded-lg border border-destructive/30 px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50">Delete</button>
                  </div>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">{item.body}</p>
              </div>)}
              {!resource.data?.length && <p className="text-sm text-muted-foreground">No announcements yet.</p>}
            </div>
          </QueryState>
        </div>
      </div>
    </div>
    {editing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form onSubmit={saveEdit} className="w-full max-w-lg space-y-4 rounded-xl border border-border bg-card p-5 shadow-xl">
        <div className="flex items-center justify-between gap-3"><h3 className="font-display text-xl font-semibold">Edit announcement</h3><button type="button" onClick={() => setEditing(null)} className="rounded-lg p-2 hover:bg-muted" aria-label="Close edit form"><X size={18} /></button></div>
        <p className="text-xs text-muted-foreground">Saving edits updates the in-app announcement only. It will not send another push notification.</p>
        <Input label="Title" value={editTitle} onChange={setEditTitle} required />
        <Textarea label="Message" value={editBody} onChange={setEditBody} rows={6} required />
        <div className="flex justify-end gap-2"><Button type="button" variant="quiet" onClick={() => setEditing(null)} disabled={actionBusy}>Cancel</Button><Button type="submit" disabled={actionBusy}>{actionBusy ? 'Saving…' : 'Save changes'}</Button></div>
      </form>
    </div>}
  </div>;
}

'@

$newContent = $content.Substring(0, $start) + $newSection + $content.Substring($end)
[System.IO.File]::WriteAllText($path, $newContent, [System.Text.UTF8Encoding]::new($false))
Write-Host 'Notifications section updated. No other section was intentionally changed.'