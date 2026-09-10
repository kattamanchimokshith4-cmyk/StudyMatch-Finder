import type { ReactNode } from 'react';
import { BarChart3, BookOpen, Compass, PenLine, UserRound } from 'lucide-react';
import { Link, useLocation } from 'wouter';

const navItems = [
  { href: '/', label: 'Find a group', icon: Compass },
  { href: '/create', label: 'Post a request', icon: PenLine },
  { href: '/profile', label: 'My profile', icon: UserRound },
  { href: '/analytics', label: 'Campus pulse', icon: BarChart3 },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const initials = 'SC';

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[252px] flex-col border-r border-sidebar-border bg-sidebar px-4 py-5 text-sidebar-foreground lg:flex">
        <Link href="/" className="focus-ring mb-10 flex items-center gap-3 rounded-xl px-2 py-1" data-testid="link-brand">
          <span className="gradient-ink flex h-10 w-10 items-center justify-center rounded-[14px] text-lg font-bold text-white shadow-lg shadow-indigo-900/20">S</span>
          <span>
            <span className="display-font block text-[19px] font-bold tracking-[-.03em]">StudyMatch</span>
            <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[.2em] text-sidebar-foreground/55">Find your people</span>
          </span>
        </Link>

        <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-sidebar-foreground/45">Workspace</div>
        <nav className="space-y-1.5" aria-label="Main navigation">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? location === '/' : location.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}
                className={`focus-ring group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-200 ${active ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm' : 'text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'}`}
              >
                <Icon size={18} strokeWidth={active ? 2.4 : 1.9} className={active ? 'text-sidebar-primary' : 'transition-transform group-hover:translate-x-0.5'} />
                {label}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <div className="mb-4 rounded-2xl border border-sidebar-border bg-sidebar-accent/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[.16em] text-sidebar-foreground/50">Your focus</span>
              <BookOpen size={15} className="text-sidebar-primary" />
            </div>
            <p className="text-sm font-semibold leading-5">Small sessions. Better momentum.</p>
            <p className="mt-2 text-xs leading-5 text-sidebar-foreground/55">Find a study rhythm that feels easy to return to.</p>
          </div>
          <div className="flex items-center gap-3 border-t border-sidebar-border px-2 pt-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary text-xs font-bold text-sidebar-primary-foreground">{initials}</span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Student account</p>
              <p className="truncate text-xs text-sidebar-foreground/50">Ready to focus</p>
            </div>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex h-[70px] items-center justify-between border-b border-border/80 bg-background/90 px-5 backdrop-blur lg:hidden">
        <Link href="/" className="focus-ring flex items-center gap-2" data-testid="link-mobile-brand">
          <span className="gradient-ink flex h-9 w-9 items-center justify-center rounded-xl text-base font-bold text-white">S</span>
          <span className="display-font text-lg font-bold">StudyMatch</span>
        </Link>
        <Link href="/profile" className="focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground" data-testid="link-mobile-profile">{initials}</Link>
      </header>

      <main className="min-h-[100dvh] lg:pl-[252px]">
        <div className="mx-auto w-full max-w-[1440px] px-5 py-7 sm:px-8 lg:px-12 lg:py-10">{children}</div>
      </main>

      <nav className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-2xl border border-border bg-card/95 p-2 shadow-xl backdrop-blur lg:hidden" aria-label="Mobile navigation">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? location === '/' : location.startsWith(href);
          return (
            <Link key={href} href={href} className={`focus-ring flex min-w-0 flex-col items-center gap-1 rounded-xl px-3 py-2 text-[10px] font-bold ${active ? 'bg-secondary text-primary' : 'text-muted-foreground'}`} data-testid={`link-mobile-nav-${label.toLowerCase().replaceAll(' ', '-')}`}>
              <Icon size={17} />
              <span className="max-w-[72px] truncate">{label === 'Find a group' ? 'Find' : label === 'Post a request' ? 'Post' : label === 'My profile' ? 'Profile' : 'Pulse'}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
