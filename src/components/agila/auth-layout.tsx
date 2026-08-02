import { Link } from "react-router-dom";
import type { ReactNode } from "react";

import { AgilaMark } from "@/components/agila/app-shell";

export function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mesh-bg mx-auto flex min-h-screen w-full max-w-md flex-col border-border/60 bg-background sm:border-x">
        <div className="relative overflow-hidden rounded-b-3xl bg-sidebar px-5 pb-8 pt-[calc(2rem+env(safe-area-inset-top))] text-sidebar-foreground">
          <div className="grid-lines absolute inset-0 opacity-40" />
          <Link to="/" className="relative flex items-center gap-3">
            <AgilaMark />
            <span className="font-display text-xl font-bold text-sidebar-accent-foreground">AGILA</span>
          </Link>
          <p className="relative mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-sidebar-primary">
            {eyebrow}
          </p>
          <h1 className="relative mt-1.5 font-display text-2xl font-bold leading-tight text-sidebar-accent-foreground">
            {title}
          </h1>
          <p className="relative mt-2 text-sm text-sidebar-foreground/70">{subtitle}</p>
        </div>

        <div className="flex-1 px-5 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-6">
          <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-card">{children}</div>
          {footer ? (
            <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
          ) : null}
          <p className="mt-8 text-center text-[11px] text-muted-foreground">
            © 2026 AGILA · Automated Guardian Information on Learner Attendance
          </p>
        </div>
      </div>
    </div>
  );
}
