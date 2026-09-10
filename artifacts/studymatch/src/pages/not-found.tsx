import { AlertCircle } from 'lucide-react';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="flex min-h-[70dvh] w-full items-center justify-center">
      <div className="mx-4 w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
        <AlertCircle className="mx-auto h-9 w-9 text-primary" />
        <h1 className="display-font mt-5 text-3xl font-bold tracking-[-.04em]">That page wandered off.</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">The study board is still here when you’re ready to head back.</p>
        <Link href="/" className="mt-6 inline-flex rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground" data-testid="link-not-found-home">Back to study board</Link>
      </div>
    </div>
  );
}
