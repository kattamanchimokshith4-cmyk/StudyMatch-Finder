import type { FormEvent, KeyboardEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { BookOpen, CalendarClock, Check, Mail, Phone, Save, UserRound } from 'lucide-react';
import { getGetProfileQueryKey, useGetProfile, useUpdateProfile } from '@workspace/api-client-react';

const availabilityOptions = ['Monday afternoon', 'Tuesday evening', 'Wednesday afternoon', 'Thursday evening', 'Friday afternoon', 'Weekend mornings'];

export function ProfilePage() {
  const queryClient = useQueryClient();
  const profileQuery = useGetProfile();
  const updateProfile = useUpdateProfile();
  const initialized = useRef(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('1');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectDraft, setSubjectDraft] = useState('');
  const [availability, setAvailability] = useState<string[]>([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (profileQuery.data && !initialized.current) {
      initialized.current = true;
      setName(profileQuery.data.name);
      setEmail(profileQuery.data.email);
      setWhatsapp(profileQuery.data.whatsapp ?? '');
      setCourse(profileQuery.data.course);
      setYear(String(profileQuery.data.year));
      setSubjects(profileQuery.data.subjects);
      setAvailability(profileQuery.data.availability);
    }
  }, [profileQuery.data]);

  function addSubject(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const next = subjectDraft.trim().replace(',', '');
      if (next && !subjects.some((item) => item.toLowerCase() === next.toLowerCase())) setSubjects((current) => [...current, next]);
      setSubjectDraft('');
    }
  }

  function removeSubject(subject: string) {
    setSubjects((current) => current.filter((item) => item !== subject));
  }

  function toggleAvailability(slot: string) {
    setAvailability((current) => current.includes(slot) ? current.filter((item) => item !== slot) : [...current, slot]);
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('');
    updateProfile.mutate({
      data: { name: name.trim(), email: email.trim(), whatsapp: whatsapp.trim() || null, course: course.trim(), year: Number(year), subjects, availability },
    }, {
      onSuccess: (nextProfile) => {
        queryClient.setQueryData(getGetProfileQueryKey(), nextProfile);
        queryClient.invalidateQueries({ queryKey: getGetProfileQueryKey() });
        setStatus('Profile saved just now');
      },
      onError: () => setStatus('Could not save your profile. Please try again.'),
    });
  }

  if (profileQuery.isLoading) {
    return <div className="mx-auto max-w-[950px]"><div className="skeleton h-9 w-52 rounded-lg" /><div className="mt-3 skeleton h-5 w-96 max-w-full rounded" /><div className="mt-8 grid gap-5 lg:grid-cols-[1fr_270px]"><div className="skeleton h-[620px] rounded-3xl" /><div className="skeleton h-[280px] rounded-3xl" /></div></div>;
  }
  if (profileQuery.isError || !profileQuery.data) {
    return <div className="mx-auto max-w-lg rounded-3xl border border-destructive/20 bg-destructive/5 p-10 text-center"><UserRound className="mx-auto text-destructive" /><h1 className="display-font mt-4 text-2xl font-bold">Profile unavailable</h1><p className="mt-2 text-sm text-muted-foreground">We couldn’t load your student profile.</p><button type="button" onClick={() => profileQuery.refetch()} className="mt-5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground" data-testid="button-retry-profile">Retry</button></div>;
  }

  return (
    <div className="mx-auto max-w-[1040px]">
      <div className="rise-in">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Your study identity</p>
        <h1 className="display-font mt-2 text-4xl font-bold tracking-[-.045em] sm:text-5xl">Make it easy to find you.</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Keep your details current so every new connection starts with the right context.</p>
      </div>
      <form onSubmit={saveProfile} className="mt-8 grid gap-5 lg:grid-cols-[1fr_300px]" data-testid="form-profile">
        <div className="rise-in delay-1 rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-8">
          {status && <div className={`mb-6 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${status.startsWith('Profile') ? 'bg-emerald-50 text-emerald-700' : 'bg-destructive/5 text-destructive'}`} data-testid="status-profile-save">{status.startsWith('Profile') && <Check size={16} />}{status}</div>}
          <div className="mb-6 flex items-center gap-3 border-b border-border pb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-lg font-bold text-primary">{name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'ST'}</div>
            <div><p className="font-bold">{name || 'Your name'}</p><p className="text-xs text-muted-foreground">Visible to your study matches</p></div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="sm:col-span-2"><span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-muted-foreground"><UserRound size={14} /> Name</span><input value={name} onChange={(event) => setName(event.target.value)} className="focus-ring w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" data-testid="input-profile-name" /></label>
            <label><span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-muted-foreground"><Mail size={14} /> Email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="focus-ring w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" data-testid="input-profile-email" /></label>
            <label><span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-muted-foreground"><Phone size={14} /> WhatsApp</span><input value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} placeholder="Optional" className="focus-ring w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary" data-testid="input-profile-whatsapp" /></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-[.12em] text-muted-foreground">Course</span><input value={course} onChange={(event) => setCourse(event.target.value)} placeholder="e.g. Computer Science" className="focus-ring w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary" data-testid="input-profile-course" /></label>
            <label><span className="mb-2 block text-xs font-bold uppercase tracking-[.12em] text-muted-foreground">Year</span><select value={year} onChange={(event) => setYear(event.target.value)} className="focus-ring w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-semibold outline-none focus:border-primary" data-testid="select-profile-year">{[1, 2, 3, 4, 5, 6, 7, 8].map((item) => <option key={item} value={item}>Year {item}</option>)}</select></label>
            <div className="sm:col-span-2"><span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-muted-foreground"><BookOpen size={14} /> Subjects you enjoy</span><input value={subjectDraft} onChange={(event) => setSubjectDraft(event.target.value)} onKeyDown={addSubject} placeholder="Type a subject and press Enter" className="focus-ring w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary" data-testid="input-profile-subjects" /><div className="mt-3 flex flex-wrap gap-2">{subjects.map((item) => <button type="button" key={item} onClick={() => removeSubject(item)} className="focus-ring inline-flex items-center gap-1.5 rounded-lg bg-secondary px-2.5 py-1.5 text-xs font-bold text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground" data-testid={`button-remove-subject-${item.replaceAll(' ', '-').toLowerCase()}`}>{item}<span className="text-sm leading-none opacity-60">×</span></button>)}</div></div>
          </div>
          <div className="mt-7 flex justify-end border-t border-border pt-6"><button type="submit" disabled={updateProfile.isPending} className="focus-ring inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-md shadow-indigo-900/15 transition-all hover:-translate-y-0.5 hover:bg-primary/90 disabled:opacity-60" data-testid="button-save-profile"><Save size={16} />{updateProfile.isPending ? 'Saving…' : 'Save profile'}</button></div>
        </div>
        <aside className="rise-in delay-2 h-fit rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-primary"><CalendarClock size={15} /> Availability</div>
          <h2 className="display-font mt-3 text-xl font-bold tracking-[-.025em]">When do you like to study?</h2>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">Choose every window that usually works. You can always change this later.</p>
          <div className="mt-5 space-y-2">{availabilityOptions.map((slot) => { const selected = availability.includes(slot); return <button type="button" key={slot} onClick={() => toggleAvailability(slot)} className={`focus-ring flex w-full items-center justify-between rounded-xl border px-3.5 py-3 text-left text-xs font-bold transition-all ${selected ? 'border-primary bg-secondary text-secondary-foreground' : 'border-border bg-background text-muted-foreground hover:border-primary/40'}`} data-testid={`button-availability-${slot.replaceAll(' ', '-').toLowerCase()}`}>{slot}<span className={`flex h-5 w-5 items-center justify-center rounded-full border ${selected ? 'border-primary bg-primary text-white' : 'border-border'}`}>{selected && <Check size={12} />}</span></button>; })}</div>
        </aside>
      </form>
    </div>
  );
}
