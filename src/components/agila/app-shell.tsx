import { Link, useLocation } from "react-router-dom";
import {
  Bell,
  CalendarCheck,
  ChartNoAxesColumn,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  QrCode,
  Search,
  Settings,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

import { AgilaLogo } from "@/components/agila/agila-logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { initials, school } from "@/lib/agila-data";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

const tabs = [
  { label: "Home", to: "/dashboard", icon: LayoutDashboard },
  { label: "Register", to: "/attendance", icon: CalendarCheck },
  { label: "Scan", to: "/scanner", icon: QrCode },
  { label: "Students", to: "/students", icon: GraduationCap },
] as const;

const moreNav = [
  { label: "Teachers", to: "/teachers", icon: Users, hint: "Faculty & advisers" },
  { label: "Reports", to: "/reports", icon: ChartNoAxesColumn, hint: "Exports & analytics" },
  { label: "Notifications", to: "/notifications", icon: Bell, hint: "Guardian alerts" },
  { label: "Settings", to: "/settings", icon: Settings, hint: "School preferences" },
] as const;

export function AgilaMark({ className }: { className?: string }) {
  return (
    <AgilaLogo
      size="sm"
      className={cn("rounded-xl bg-emerald text-emerald-foreground shadow-card", className)}
    />
  );
}

function MoreSheet() {
  const { signOut, user } = useAuth();
  const displayName = user?.name ?? school.admin;
  const displayRole = user?.role ?? school.role;
  const displaySchool = user?.schoolName ?? school.name;
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          type="button"
          className="flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[10px] font-semibold text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="More navigation"
        >
          <span className="grid size-9 place-items-center rounded-2xl">
            <Avatar className="size-7">
              <AvatarFallback className="bg-navy-soft text-[10px] text-primary">
                {initials(displayName)}
              </AvatarFallback>
            </Avatar>
          </span>
          More
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-3xl border-border/60 p-0">
        <SheetTitle className="sr-only">More</SheetTitle>
        <div className="mx-auto w-full max-w-md space-y-4 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-3 rounded-2xl bg-navy-soft p-3">
            <Avatar className="size-11">
              <AvatarFallback className="bg-navy text-sm text-navy-foreground">
                {initials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {displayRole} · {displaySchool}
              </p>
            </div>
          </div>

          <div className="grid gap-2">
            {moreNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 rounded-2xl border border-border/70 bg-surface p-3 active:scale-[0.99]"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-soft text-emerald">
                  <item.icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{item.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{item.hint}</span>
                </span>
              </Link>
            ))}
          </div>

          <Button variant="outline" className="h-12 w-full rounded-2xl bg-surface" onClick={() => void signOut()}>
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function BottomTabs() {
  const pathname = useLocation().pathname;

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center lg:hidden"
    >
      <div className="glass w-full max-w-md border-t border-border/60 px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-stretch">
          {tabs.map((tab) => {
            const active = pathname === tab.to;
            const isScan = tab.label === "Scan";
            return (
              <Link
                key={tab.to}
                to={tab.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[10px] font-semibold transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-2xl transition-colors",
                    isScan
                      ? "bg-emerald text-emerald-foreground shadow-card"
                      : active
                        ? "bg-navy-soft text-primary"
                        : "text-muted-foreground",
                  )}
                >
                  <tab.icon className="size-5" aria-hidden="true" />
                </span>
                {tab.label}
              </Link>
            );
          })}
          <MoreSheet />
        </div>
      </div>
    </nav>
  );
}

function DesktopSidebar() {
  const { signOut, user } = useAuth();
  const displayName = user?.name ?? school.admin;
  const displayRole = user?.role ?? school.role;
  const displaySchool = user?.schoolName ?? school.name;
  const pathname = useLocation().pathname;
  const items = [...tabs, ...moreNav];

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-6 border-r border-border/60 bg-surface px-4 py-6 lg:flex">
      <Link to="/dashboard" className="flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <AgilaMark />
        <span className="min-w-0">
          <span className="block font-display text-sm font-bold leading-tight">AGILA</span>
          <span className="block truncate text-[11px] text-muted-foreground">{displaySchool}</span>
        </span>
      </Link>

      <nav aria-label="Primary" className="flex-1">
        <ul className="space-y-1">
          {items.map((item) => {
            const active = pathname === item.to;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "bg-navy-soft text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="size-4 shrink-0" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-3">
        <Avatar className="size-9">
          <AvatarFallback className="bg-navy text-xs text-navy-foreground">
            {initials(displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{displayName}</p>
          <p className="truncate text-[11px] text-muted-foreground">{displayRole}</p>
        </div>
        <Button variant="ghost" size="icon" className="size-9 shrink-0 rounded-xl" onClick={() => void signOut()} aria-label="Sign out">
          <LogOut className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </aside>
  );
}

export function AppShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-muted/40">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col border-border/60 bg-background sm:max-w-xl sm:border-x lg:max-w-7xl lg:flex-row lg:border-x-0">
        <DesktopSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="glass sticky top-0 z-30 border-b border-border/60 pt-[env(safe-area-inset-top)]">
            <div className="flex items-center gap-3 px-4 py-3 lg:px-8 lg:py-4">
              <Link to="/dashboard" className="shrink-0 lg:hidden" aria-label="AGILA home">
                <AgilaMark className="size-8 rounded-lg" />
              </Link>
              <div className="min-w-0 flex-1">
                <h1 className="truncate font-display text-lg font-bold leading-tight lg:text-2xl">
                  {title}
                </h1>
                <p className="truncate text-[11px] text-muted-foreground lg:text-sm">{description}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-10 shrink-0 rounded-xl"
                aria-label="Search"
              >
                <Search className="size-5" aria-hidden="true" />
              </Button>
              <Button asChild variant="ghost" size="icon" className="relative size-10 shrink-0 rounded-xl">
                <Link to="/notifications" aria-label="Notifications, unread alerts">
                  <Bell className="size-5" aria-hidden="true" />
                  <span className="absolute right-2 top-2 size-2 rounded-full bg-emerald" />
                </Link>
              </Button>
            </div>
            {actions ? (
              <div className="scrollbar-none flex gap-2 overflow-x-auto px-4 pb-3 lg:px-8">{actions}</div>
            ) : null}
          </header>

          <main className="flex-1 space-y-4 px-4 pb-28 pt-4 lg:px-8 lg:pb-10 lg:pt-6">{children}</main>
        </div>
      </div>

      <BottomTabs />
    </div>
  );
}
