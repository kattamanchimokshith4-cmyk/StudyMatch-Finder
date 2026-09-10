import { Activity, BarChart3, CalendarDays, RefreshCw, TrendingUp, Users } from 'lucide-react';
import { useGetAnalytics } from '@workspace/api-client-react';

function MetricCard({ label, value, detail, icon: Icon, tint }: { label: string; value: number; detail: string; icon: typeof Activity; tint: string }) {
  return <div className="rise-in rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.13em] text-muted-foreground">{label}</p><p className="display-font mt-3 text-4xl font-bold tracking-[-.05em]">{value.toLocaleString()}</p></div><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tint}`}><Icon size={19} /></span></div><p className="mt-5 text-xs font-semibold text-muted-foreground">{detail}</p></div>;
}

function BarList({ title, subtitle, items, color }: { title: string; subtitle: string; items: { label: string; count: number }[]; color: string }) {
  const max = Math.max(...items.map((item) => item.count), 1);
  return <div className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-7"><div className="flex items-start justify-between"><div><h2 className="display-font text-xl font-bold tracking-[-.025em]">{title}</h2><p className="mt-1 text-xs text-muted-foreground">{subtitle}</p></div><BarChart3 size={19} className="text-primary" /></div><div className="mt-7 space-y-5">{items.length === 0 ? <div className="rounded-xl bg-muted px-4 py-8 text-center text-sm text-muted-foreground">Not enough activity to show this yet.</div> : items.map((item) => <div key={item.label} data-testid={`row-analytics-${item.label.replaceAll(' ', '-').toLowerCase()}`}><div className="mb-2 flex items-center justify-between text-xs font-bold"><span>{item.label}</span><span className="text-muted-foreground">{item.count}</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${Math.max(8, (item.count / max) * 100)}%` }} /></div></div>)}</div></div>;
}

export function AnalyticsPage() {
  const analyticsQuery = useGetAnalytics();
  const analytics = analyticsQuery.data;

  if (analyticsQuery.isLoading) return <div className="mx-auto max-w-[1100px]"><div className="skeleton h-10 w-72 rounded-lg" /><div className="skeleton mt-3 h-5 w-96 max-w-full rounded" /><div className="mt-8 grid gap-4 md:grid-cols-3"><div className="skeleton h-40 rounded-2xl" /><div className="skeleton h-40 rounded-2xl" /><div className="skeleton h-40 rounded-2xl" /></div><div className="mt-5 grid gap-5 lg:grid-cols-2"><div className="skeleton h-96 rounded-3xl" /><div className="skeleton h-96 rounded-3xl" /></div></div>;
  if (analyticsQuery.isError || !analytics) return <div className="mx-auto max-w-lg rounded-3xl border border-destructive/20 bg-destructive/5 p-10 text-center"><Activity className="mx-auto text-destructive" /><h1 className="display-font mt-4 text-2xl font-bold">Campus pulse is taking a pause</h1><p className="mt-2 text-sm text-muted-foreground">We couldn’t load the latest activity.</p><button type="button" onClick={() => analyticsQuery.refetch()} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground" data-testid="button-retry-analytics"><RefreshCw size={14} /> Try again</button></div>;

  return <div className="mx-auto max-w-[1100px]">
    <div className="rise-in flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Campus pulse</p><h1 className="display-font mt-2 text-4xl font-bold tracking-[-.045em] sm:text-5xl">Study patterns, at a glance.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">A living view of how your campus is making time to learn together.</p></div><span className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 sm:self-auto"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Live activity</span></div>
    <div className="mt-8 grid gap-4 md:grid-cols-3">
      <MetricCard label="Active requests" value={analytics.totalRequests} detail="Open invitations on the board" icon={TrendingUp} tint="bg-secondary text-primary" />
      <MetricCard label="Members learning" value={analytics.totalMembers} detail="Students in the StudyMatch circle" icon={Users} tint="bg-accent text-accent-foreground" />
      <MetricCard label="Active today" value={analytics.activeToday} detail="People making study plans today" icon={CalendarDays} tint="bg-amber-50 text-amber-700" />
    </div>
    <div className="mt-5 grid gap-5 lg:grid-cols-2">
      <BarList title="Popular subjects" subtitle="Where classmates are gathering" items={analytics.popularSubjects} color="bg-primary" />
      <BarList title="Busiest study windows" subtitle="When the board comes alive" items={analytics.busySlots} color="bg-cyan-500" />
    </div>
    <div className="mt-5 flex items-center gap-3 rounded-2xl border border-border bg-secondary/45 px-5 py-4 text-xs font-semibold text-secondary-foreground"><Activity size={16} className="shrink-0 text-primary" /><span>These numbers update as classmates post and join. Use the board to turn a trend into a plan.</span></div>
  </div>;
}
