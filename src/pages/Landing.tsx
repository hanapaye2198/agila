import { Link } from "react-router-dom";
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  ChartNoAxesColumn,
  ChevronRight,
  Clock3,
  QrCode,
  ShieldCheck,
  Users,
} from "lucide-react";

import { AgilaMark } from "@/components/agila/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: QrCode,
    title: "QR gate scanning",
    body: "Learners tap in at any gate. Scans post in under three seconds, offline-tolerant.",
  },
  {
    icon: BellRing,
    title: "Guardian notifications",
    body: "SMS and push alerts fire automatically for late arrivals and absences.",
  },
  {
    icon: ChartNoAxesColumn,
    title: "Live dashboards",
    body: "Attendance rate, tardiness trends, and per-section breakdowns all day.",
  },
  {
    icon: Users,
    title: "Roles for every office",
    body: "Registrar, advisers, guidance, and principals get scoped views.",
  },
  {
    icon: Clock3,
    title: "Automated cut-offs",
    body: "Grace periods per grade level classify present, late, and absent.",
  },
  {
    icon: ShieldCheck,
    title: "Audit-ready records",
    body: "Every scan, override, and alert is logged and exportable.",
  },
];

const steps = [
  { step: "01", title: "Import your masterlist", body: "Upload learners and guardians via CSV. AGILA generates QR IDs instantly." },
  { step: "02", title: "Set up gates", body: "Any phone becomes a scanner. Assign gates, grace periods, and cut-offs." },
  { step: "03", title: "Go live", body: "Guardians get their first alert the same morning." },
];

const tiers = [
  { name: "Starter", price: "₱0", note: "Up to 200 learners", perks: ["1 gate scanner", "Daily digest", "Email support"], featured: false },
  { name: "Growth", price: "₱6,900", note: "per month, up to 1,500 learners", perks: ["Unlimited gates", "SMS + push alerts", "Advanced reports", "Adviser accounts"], featured: true },
  { name: "Enterprise", price: "Custom", note: "Districts and networks", perks: ["Multi-campus rollup", "SIS integration", "Dedicated CSM", "SLA & audit logs"], featured: false },
];

export default function Landing() {
  return (
    <div className="min-h-dvh bg-muted/40">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col border-border/60 bg-background sm:max-w-xl sm:border-x lg:max-w-6xl lg:border-x">
        <header className="glass sticky top-0 z-40 border-b border-border/60 pt-[env(safe-area-inset-top)]">
          <div className="flex items-center gap-2.5 px-4 py-3 lg:px-8">
            <AgilaMark className="size-8 rounded-lg" />
            <span className="min-w-0 flex-1">
              <span className="block font-display text-base font-bold leading-tight">AGILA</span>
              <span className="block truncate text-[11px] text-muted-foreground">
                Learner attendance
              </span>
            </span>
            <Button asChild variant="ghost" className="h-9 shrink-0 rounded-xl px-3 text-sm">
              <Link to="/login">Sign in</Link>
            </Button>
          </div>
        </header>

        <main className="flex-1 space-y-8 px-4 pb-32 pt-5 lg:px-8 lg:pb-16">
          {/* Hero */}
          <section className="space-y-5">
            <Badge
              variant="outline"
              className="rounded-full border-emerald/30 bg-emerald-soft text-[11px] text-accent-foreground"
            >
              Guardian alerts on every scan
            </Badge>
            <h1 className="font-display text-3xl font-bold leading-[1.12] sm:text-4xl lg:text-5xl">
              Attendance that tells <span className="text-emerald">guardians</span> before they ask.
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              QR check-ins, real-time dashboards, and automatic notifications for every learner,
              every day.
            </p>

            <div className="grid gap-2 sm:grid-cols-2">
              <Button asChild size="lg" className="h-12 w-full rounded-2xl">
                <Link to="/dashboard">
                  Open live demo <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 w-full rounded-2xl bg-surface"
              >
                <Link to="/register">Register your school</Link>
              </Button>
            </div>

            <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
              {["No hardware lock-in", "DepEd-ready exports", "Free 30-day pilot"].map((item) => (
                <li key={item} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Live tile */}
          <section className="glass rounded-3xl p-3 shadow-lift">
            <div className="rounded-2xl bg-sidebar p-4 text-sidebar-foreground">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/60">
                  Today · Main Gate
                </p>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] text-sidebar-primary">
                  <span className="size-2 animate-pulse rounded-full bg-sidebar-primary" /> Live
                </span>
              </div>
              <p className="mt-3 font-display text-4xl font-bold text-sidebar-accent-foreground">
                92.5%
              </p>
              <p className="text-xs text-sidebar-foreground/60">1,371 of 1,482 learners present</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-sidebar-accent">
                <div className="h-full w-[92.5%] rounded-full bg-sidebar-primary" />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
              {[
                { label: "Late arrivals", value: "63", tone: "bg-amber-soft" },
                { label: "Absent", value: "48", tone: "bg-rose-soft" },
                { label: "Guardians alerted", value: "111", tone: "bg-emerald-soft" },
                { label: "Gates online", value: "4 / 4", tone: "bg-navy-soft" },
              ].map((tile) => (
                <div key={tile.label} className={`rounded-2xl ${tile.tone} p-3`}>
                  <p className="font-display text-xl font-bold">{tile.value}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{tile.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Features */}
          <section id="features" className="space-y-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald">
                Platform
              </p>
              <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
                The whole attendance office, in your pocket
              </h2>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f) => (
                <Card key={f.title} className="rounded-2xl border-border/70 shadow-card">
                  <CardContent className="flex items-start gap-3 p-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-navy-soft text-primary">
                      <f.icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-sm font-semibold">{f.title}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">{f.body}</span>
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Steps */}
          <section id="how" className="space-y-3">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Three steps to launch</h2>
            <ol className="grid gap-2 lg:grid-cols-3">
              {steps.map((s) => (
                <li
                  key={s.step}
                  className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-card"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-soft font-mono text-xs font-bold text-emerald">
                    {s.step}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-sm font-semibold">{s.title}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{s.body}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {/* Pricing */}
          <section id="pricing" className="space-y-3">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Simple pricing</h2>
            <div className="grid gap-3 lg:grid-cols-3">
              {tiers.map((tier) => (
                <Card
                  key={tier.name}
                  className={`rounded-3xl shadow-card ${
                    tier.featured
                      ? "border-emerald/40 bg-sidebar text-sidebar-foreground"
                      : "border-border/70"
                  }`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <p
                        className={`text-sm font-semibold ${
                          tier.featured ? "text-sidebar-primary" : "text-muted-foreground"
                        }`}
                      >
                        {tier.name}
                      </p>
                      <p
                        className={`font-display text-2xl font-bold ${
                          tier.featured ? "text-sidebar-accent-foreground" : ""
                        }`}
                      >
                        {tier.price}
                      </p>
                    </div>
                    <p
                      className={`mt-1 text-[11px] ${
                        tier.featured ? "text-sidebar-foreground/60" : "text-muted-foreground"
                      }`}
                    >
                      {tier.note}
                    </p>
                    <ul className="mt-4 space-y-2 text-xs">
                      {tier.perks.map((perk) => (
                        <li key={perk} className="flex items-center gap-2">
                          <CheckCircle2
                            className={`size-3.5 shrink-0 ${
                              tier.featured ? "text-sidebar-primary" : "text-emerald"
                            }`}
                            aria-hidden="true"
                          />
                          {perk}
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      className="mt-5 h-11 w-full rounded-2xl"
                      variant={tier.featured ? "secondary" : "outline"}
                    >
                      <Link to="/register">Get started</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Links */}
          <section className="space-y-2">
            {[
              { label: "Sign in to your school", to: "/login" as const },
              { label: "Register a new school", to: "/register" as const },
              { label: "Explore the demo dashboard", to: "/dashboard" as const },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex min-h-12 items-center gap-3 rounded-2xl border border-border/70 bg-surface px-4 text-sm font-medium active:scale-[0.99]"
              >
                <span className="min-w-0 flex-1 truncate">{link.label}</span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </Link>
            ))}
            <p className="pt-2 text-center text-[11px] text-muted-foreground">
              © 2026 AGILA · Automated Guardian Information on Learner Attendance
            </p>
          </section>
        </main>
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center lg:hidden">
        <div className="glass w-full max-w-md border-t border-border/60 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:max-w-xl">
          <div className="flex gap-2">
            <Button asChild variant="outline" className="h-12 flex-1 rounded-2xl bg-surface">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild className="h-12 flex-1 rounded-2xl">
              <Link to="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
