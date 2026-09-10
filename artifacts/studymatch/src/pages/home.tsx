import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Check, Clock3, MapPin, Search, Sparkles, Users, Wifi, X } from 'lucide-react';
import { Link } from 'wouter';
import {
  getGetAnalyticsQueryKey,
  getListStudyRequestsQueryKey,
  useJoinStudyRequest,
  useListStudyRequests,
} from '@workspace/api-client-react';
import type { ListStudyRequestsParams, StudyRequest } from '@workspace/api-client-react';

function dateLabel(value: string) {
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(date);
}

function RequestSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="skeleton h-4 w-24 rounded" />
      <div className="skeleton mt-4 h-6 w-3/4 rounded" />
      <div className="skeleton mt-3 h-4 w-full rounded" />
      <div className="skeleton mt-2 h-4 w-2/3 rounded" />
      <div className="mt-6 flex justify-between"><div className="skeleton h-9 w-28 rounded-xl" /><div className="skeleton h-9 w-24 rounded-xl" /></div>
    </div>
  );
}

function RequestCard({ request, onJoin, pending }: { request: StudyRequest; onJoin: (request: StudyRequest) => void; pending: boolean }) {
  const joined = request.hasJoined || Boolean(request.contactInfo);
  return (
    <article className="rise-in group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-indigo-900/[.07]" data-testid={`card-request-${request.id}`}>
      <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-secondary/70 transition-transform duration-500 group-hover:scale-150" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="inline-flex rounded-md bg-accent px-2 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-accent-foreground">{request.subject}</span>
            <h3 className="display-font mt-3 text-[20px] font-bold leading-tight tracking-[-.025em] text-foreground">{request.topic}</h3>
          </div>
          <span className={`flex h-8 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-bold ${request.location === 'online' ? 'bg-secondary text-secondary-foreground' : 'bg-amber-50 text-amber-800'}`}>
            {request.location === 'online' ? <Wifi size={13} /> : <MapPin size={13} />}
            {request.location === 'online' ? 'Online' : 'On campus'}
          </span>
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{request.note}</p>

        <div className="mt-5 grid grid-cols-2 gap-2 border-y border-border/70 py-4 text-xs font-semibold text-foreground/75">
          <span className="flex items-center gap-2"><CalendarDays size={14} className="text-primary" />{dateLabel(request.preferredDate)}</span>
          <span className="flex items-center gap-2"><Clock3 size={14} className="text-primary" />{request.preferredTime}</span>
          <span className="col-span-2 flex items-center gap-2"><Users size={14} className="text-primary" />{request.joinedCount} {request.joinedCount === 1 ? 'person' : 'people'} joining</span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{request.creatorName}</p>
            <p className="truncate text-xs text-muted-foreground">{request.creatorCourse} · Year {request.creatorYear}</p>
          </div>
          {request.isOwner ? (
            <span className="rounded-xl bg-muted px-3 py-2 text-xs font-bold text-muted-foreground">Your request</span>
          ) : joined ? (
            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"><Check size={14} />Joined</span>
              {request.contactInfo && <p className="mt-1.5 max-w-[145px] truncate text-[11px] text-muted-foreground" title={request.contactInfo}>{request.contactInfo}</p>}
            </div>
          ) : (
            <button type="button" onClick={() => onJoin(request)} disabled={pending} className="focus-ring rounded-xl bg-primary px-3.5 py-2.5 text-xs font-bold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60" data-testid={`button-join-${request.id}`}>
              {pending ? 'Joining…' : 'Join group'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function HomePage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [joinedId, setJoinedId] = useState<number | null>(null);
  const filters = useMemo<ListStudyRequestsParams>(() => ({
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(subject ? { subject } : {}),
    ...(date ? { date } : {}),
    ...(location ? { location: location as ListStudyRequestsParams['location'] } : {}),
  }), [search, subject, date, location]);
  const requestsQuery = useListStudyRequests(filters);
  const joinRequest = useJoinStudyRequest();
  const requests = requestsQuery.data ?? [];

  function handleJoin(request: StudyRequest) {
    setJoinedId(request.id);
    joinRequest.mutate({ id: request.id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListStudyRequestsQueryKey(filters) });
        queryClient.invalidateQueries({ queryKey: getGetAnalyticsQueryKey() });
        setJoinedId(null);
      },
      onError: () => setJoinedId(null),
    });
  }

  return (
    <div className="app-grid -mx-5 -my-7 min-h-[calc(100dvh-70px)] px-5 py-7 sm:-mx-8 sm:px-8 lg:-mx-12 lg:-my-10 lg:px-12 lg:py-10">
      <section className="mx-auto max-w-[1200px]">
        <div className="rise-in relative overflow-hidden rounded-[28px] bg-[#17235b] px-6 py-8 text-white shadow-xl shadow-indigo-950/10 sm:px-10 sm:py-10">
          <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full border-[36px] border-indigo-400/20" />
          <div className="absolute -bottom-24 right-36 h-48 w-48 rounded-full border-[22px] border-cyan-300/10" />
          <div className="relative max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.15em] text-indigo-100"><Sparkles size={13} /> The campus study board</div>
            <h1 className="display-font text-4xl font-bold leading-[1.06] tracking-[-.045em] sm:text-5xl">Find the right room<br className="hidden sm:block" /> for your next breakthrough.</h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-indigo-100/75 sm:text-base">Browse focused study sessions from people in your classes. Join when it feels right, and get the details you need to show up.</p>
          </div>
          <div className="relative mt-8 flex max-w-3xl flex-col gap-3 sm:flex-row">
            <label className="flex flex-1 items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur transition-colors focus-within:border-white/40 focus-within:bg-white/15">
              <Search size={18} className="shrink-0 text-indigo-200" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search a topic, course, or person" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-indigo-200/65" data-testid="input-search-requests" />
              {search && <button type="button" onClick={() => setSearch('')} className="text-indigo-200 hover:text-white" data-testid="button-clear-search"><X size={16} /></button>}
            </label>
            <Link href="/create" className="focus-ring flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#243286] transition-all hover:-translate-y-0.5 hover:bg-indigo-50" data-testid="link-create-hero">Post a request <span className="ml-2 text-lg leading-none">+</span></Link>
          </div>
        </div>

        <div className="rise-in delay-1 mt-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Open invitations</p>
            <h2 className="display-font mt-1 text-2xl font-bold tracking-[-.03em]">Sessions looking for you</h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Updated live from campus</div>
        </div>

        <div className="rise-in delay-2 mt-5 flex flex-wrap gap-2">
          <select value={subject} onChange={(event) => setSubject(event.target.value)} className="focus-ring rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-semibold text-foreground shadow-sm outline-none" data-testid="select-subject-filter">
            <option value="">All subjects</option><option value="Computer Science">Computer Science</option><option value="Mathematics">Mathematics</option><option value="Biology">Biology</option><option value="Business">Business</option><option value="Psychology">Psychology</option>
          </select>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="focus-ring rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-semibold text-foreground shadow-sm outline-none" data-testid="input-date-filter" />
          <select value={location} onChange={(event) => setLocation(event.target.value)} className="focus-ring rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs font-semibold text-foreground shadow-sm outline-none" data-testid="select-location-filter">
            <option value="">Any location</option><option value="campus">On campus</option><option value="online">Online</option>
          </select>
          {(subject || date || location) && <button type="button" onClick={() => { setSubject(''); setDate(''); setLocation(''); }} className="px-2 text-xs font-bold text-primary hover:underline" data-testid="button-clear-filters">Clear filters</button>}
        </div>

        {requestsQuery.isLoading ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3"><RequestSkeleton /><RequestSkeleton /><RequestSkeleton /></div>
        ) : requestsQuery.isError ? (
          <div className="mt-6 rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center" data-testid="status-requests-error">
            <p className="font-bold text-destructive">We couldn’t load the study board.</p>
            <p className="mt-1 text-sm text-muted-foreground">Try again in a moment.</p>
            <button type="button" onClick={() => requestsQuery.refetch()} className="focus-ring mt-4 rounded-xl bg-destructive px-4 py-2 text-xs font-bold text-white" data-testid="button-retry-requests">Retry</button>
          </div>
        ) : requests.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-primary/25 bg-card/70 px-6 py-14 text-center" data-testid="status-requests-empty">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary"><Search size={21} /></div>
            <h3 className="display-font mt-4 text-lg font-bold">No matching sessions yet</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Try another search, or be the first person to set the study table.</p>
            <Link href="/create" className="mt-5 inline-flex rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground" data-testid="link-create-empty">Post a request</Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {requests.map((request) => <RequestCard key={request.id} request={request} onJoin={handleJoin} pending={joinedId === request.id || joinRequest.isPending} />)}
          </div>
        )}
      </section>
    </div>
  );
}
