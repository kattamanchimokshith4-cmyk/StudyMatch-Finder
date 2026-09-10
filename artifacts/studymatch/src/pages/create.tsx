import type { FormEvent } from 'react';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CalendarDays, Check, Clock3, FileText, MapPin, Send, Users, Wifi } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { getGetAnalyticsQueryKey, getListStudyRequestsQueryKey, useCreateStudyRequest } from '@workspace/api-client-react';
import type { StudyRequestInputLocation } from '@workspace/api-client-react';

const subjects = ['Computer Science', 'Mathematics', 'Biology', 'Business', 'Psychology', 'Design', 'Economics'];

export function CreatePage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const createRequest = useCreateStudyRequest();
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [location, setRequestLocation] = useState<StudyRequestInputLocation>('campus');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState('');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!subject || !topic.trim() || !preferredDate || !preferredTime || !note.trim()) {
      setFormError('Fill in each field so people know what kind of session to join.');
      return;
    }
    setFormError('');
    createRequest.mutate({
      data: { subject, topic: topic.trim(), preferredDate, preferredTime, location, note: note.trim() },
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListStudyRequestsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAnalyticsQueryKey() });
        setLocation('/');
      },
      onError: () => setFormError('Your request could not be posted. Please try again.'),
    });
  }

  return (
    <div className="mx-auto max-w-[1040px]">
      <Link href="/" className="focus-ring inline-flex items-center gap-2 text-xs font-bold text-muted-foreground transition-colors hover:text-primary" data-testid="link-back-home"><ArrowLeft size={15} /> Back to study board</Link>
      <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_330px]">
        <section className="rise-in">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Open the table</p>
            <h1 className="display-font mt-2 text-4xl font-bold tracking-[-.045em] sm:text-5xl">Post a study request.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Give classmates enough context to say yes. A clear topic and a friendly note go a long way.</p>
          </div>
          <form onSubmit={submit} className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-8" data-testid="form-create-request">
            {formError && <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm font-semibold text-destructive" data-testid="status-create-error">{formError}</div>}
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="sm:col-span-2"><span className="mb-2 block text-xs font-bold uppercase tracking-[.12em] text-muted-foreground">Subject</span>
                <select value={subject} onChange={(event) => setSubject(event.target.value)} className="focus-ring w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-semibold outline-none transition-colors focus:border-primary" data-testid="select-request-subject">
                  <option value="">Choose a subject</option>{subjects.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="sm:col-span-2"><span className="mb-2 block text-xs font-bold uppercase tracking-[.12em] text-muted-foreground">What are you working on?</span>
                <input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="e.g. Discrete math problem set 4" className="focus-ring w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/65 focus:border-primary" data-testid="input-request-topic" />
              </label>
              <label><span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-muted-foreground"><CalendarDays size={14} /> Date</span>
                <input type="date" value={preferredDate} onChange={(event) => setPreferredDate(event.target.value)} className="focus-ring w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none focus:border-primary" data-testid="input-request-date" />
              </label>
              <label><span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-muted-foreground"><Clock3 size={14} /> Time window</span>
                <input value={preferredTime} onChange={(event) => setPreferredTime(event.target.value)} placeholder="e.g. 4:30–6:00 PM" className="focus-ring w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none placeholder:text-muted-foreground/65 focus:border-primary" data-testid="input-request-time" />
              </label>
              <fieldset className="sm:col-span-2">
                <legend className="mb-2 text-xs font-bold uppercase tracking-[.12em] text-muted-foreground">Where should you meet?</legend>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setRequestLocation('campus')} className={`focus-ring flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-bold transition-all ${location === 'campus' ? 'border-primary bg-secondary text-secondary-foreground' : 'border-input bg-background text-muted-foreground hover:border-primary/40'}`} data-testid="button-location-campus"><MapPin size={17} /> On campus</button>
                  <button type="button" onClick={() => setRequestLocation('online')} className={`focus-ring flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-bold transition-all ${location === 'online' ? 'border-primary bg-secondary text-secondary-foreground' : 'border-input bg-background text-muted-foreground hover:border-primary/40'}`} data-testid="button-location-online"><Wifi size={17} /> Online</button>
                </div>
              </fieldset>
              <label className="sm:col-span-2"><span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-muted-foreground"><FileText size={14} /> A note for your future group</span>
                <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} placeholder="What would make this session useful? Mention the pace, what you know so far, or what kind of study buddy you’re hoping to meet." className="focus-ring w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm leading-6 outline-none placeholder:text-muted-foreground/65 focus:border-primary" data-testid="textarea-request-note" />
              </label>
            </div>
            <div className="mt-7 flex flex-col-reverse items-stretch justify-end gap-3 border-t border-border pt-6 sm:flex-row sm:items-center">
              <Link href="/" className="focus-ring rounded-xl px-4 py-3 text-center text-sm font-bold text-muted-foreground hover:text-foreground" data-testid="link-cancel-create">Cancel</Link>
              <button type="submit" disabled={createRequest.isPending} className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-md shadow-indigo-900/15 transition-all hover:-translate-y-0.5 hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60" data-testid="button-submit-request"><Send size={16} /> {createRequest.isPending ? 'Posting…' : 'Post request'}</button>
            </div>
          </form>
        </section>
        <aside className="rise-in delay-1 h-fit rounded-3xl bg-[#17235b] p-6 text-white shadow-xl shadow-indigo-950/10">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-indigo-200"><Users size={19} /></div>
          <h2 className="display-font mt-5 text-xl font-bold">What happens next?</h2>
          <ol className="mt-5 space-y-5">
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-400/20 text-xs font-bold text-indigo-200">1</span><p className="text-sm leading-5 text-indigo-100/75">Your invitation appears on the campus study board.</p></li>
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-400/20 text-xs font-bold text-indigo-200">2</span><p className="text-sm leading-5 text-indigo-100/75">Classmates join when the topic and timing fit.</p></li>
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-400/20 text-xs font-bold text-indigo-200">3</span><p className="text-sm leading-5 text-indigo-100/75">Contact details reveal once they join, so you can coordinate.</p></li>
          </ol>
          <div className="mt-7 flex items-center gap-2 border-t border-white/10 pt-5 text-xs font-semibold text-indigo-200/75"><Check size={14} /> You can keep it casual and focused</div>
        </aside>
      </div>
    </div>
  );
}
