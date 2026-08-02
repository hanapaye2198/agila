
import { useState } from "react";
import { CalendarDays, ChevronRight, Download, Send, SlidersHorizontal } from "lucide-react";

import { AppShell } from "@/components/agila/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import type { AttendanceStatus } from "@/lib/agila-data";
import { initials, recentAttendance, statusStyles } from "@/lib/agila-data";

const timeline = [
  { window: "6:00 – 6:30 AM", count: 214, share: 15 },
  { window: "6:30 – 7:00 AM", count: 612, share: 44 },
  { window: "7:00 – 7:30 AM", count: 482, share: 34 },
  { window: "7:30 – 8:00 AM", count: 63, share: 5 },
  { window: "After 8:00 AM", count: 11, share: 2 },
];

const statusOrder: Record<AttendanceStatus, number> = { absent: 0, late: 1, excused: 2, present: 3 };
const grades = ["All grades", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
const gates = ["All gates", "Main Gate", "East Gate", "Annex Gate", "Gym Entrance"];

const summary = [
  { key: "present", label: "Present", value: "1,371", tone: "text-emerald" },
  { key: "late", label: "Late", value: "63", tone: "text-amber" },
  { key: "absent", label: "Absent", value: "33", tone: "text-destructive" },
  { key: "excused", label: "Excused", value: "15", tone: "text-primary" },
];

const dotTone: Record<AttendanceStatus, string> = {
  present: "bg-emerald",
  late: "bg-amber",
  absent: "bg-rose",
  excused: "bg-navy",
};

export default function AttendancePage() {
  const [tab, setTab] = useState<"all" | "late" | "absent">("all");
  const [grade, setGrade] = useState(grades[0]);
  const [gate, setGate] = useState(gates[0]);

  const rows = [...recentAttendance]
    .filter((r) => (tab === "all" ? true : r.status === tab))
    .sort((a, b) => statusOrder[a.status] - statusOrder[b.status] || a.student.localeCompare(b.student));

  const tabs = [
    { key: "all" as const, label: "All", count: recentAttendance.length },
    { key: "late" as const, label: "Late", count: recentAttendance.filter((r) => r.status === "late").length },
    { key: "absent" as const, label: "Absent", count: recentAttendance.filter((r) => r.status === "absent").length },
  ];

  return (
    <AppShell
      title="Attendance"
      description="Fri, Jul 31 · Locked 8:00 AM"
      actions={
        <>
          <Button variant="outline" className="h-11 rounded-full bg-surface">
            <Download className="size-4" aria-hidden="true" /> Export
          </Button>
          <Button className="h-11 rounded-full">
            <Send className="size-4" aria-hidden="true" /> Notify
          </Button>
        </>
      }
    >
      {/* Day summary strip — native-style single card */}
      <Card className="overflow-hidden rounded-3xl border-border/70 shadow-card">
        <CardContent className="p-0">
          <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">Attendance rate</p>
              <p className="font-display text-2xl font-bold leading-tight">92.5%</p>
            </div>
            <Button variant="outline" className="h-10 shrink-0 rounded-full bg-surface text-xs">
              <CalendarDays className="size-4" aria-hidden="true" /> Jul 31
            </Button>
          </div>
          <div className="grid grid-cols-4 divide-x divide-border/60">
            {summary.map((s) => (
              <div key={s.key} className="px-2 py-3 text-center">
                <p className={`font-display text-lg font-bold ${s.tone}`}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-4 lg:space-y-0">
        <div className="space-y-3">
          {/* Segmented control */}
          <div className="flex rounded-full bg-muted p-1" role="tablist" aria-label="Register filter">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className={`min-h-11 flex-1 rounded-full px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  tab === t.key ? "bg-surface text-foreground shadow-card" : "text-muted-foreground"
                }`}
              >
                {t.label} <span className="text-xs font-medium opacity-70">{t.count}</span>
              </button>
            ))}
          </div>

          {/* Scrollable filter chips + filter sheet */}
          <div className="flex items-center gap-2">
            <div className="scrollbar-none -mx-1 flex flex-1 gap-2 overflow-x-auto px-1">
              {[grade, gate].map((chip) => (
                <span
                  key={chip}
                  className="whitespace-nowrap rounded-full border border-border/70 bg-surface px-3 py-2 text-xs font-medium text-muted-foreground"
                >
                  {chip}
                </span>
              ))}
            </div>
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" size="icon" className="size-11 shrink-0 rounded-full bg-surface" aria-label="Filter register">
                  <SlidersHorizontal className="size-4" aria-hidden="true" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader className="text-left">
                  <DrawerTitle className="font-display">Filter register</DrawerTitle>
                  <DrawerDescription>Narrow the daily list by grade level and gate.</DrawerDescription>
                </DrawerHeader>
                <div className="space-y-5 px-4 pb-8">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Grade level</p>
                    <div className="flex flex-wrap gap-2">
                      {grades.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGrade(g)}
                          className={`min-h-11 rounded-full px-4 text-sm font-medium transition ${
                            grade === g ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Gate</p>
                    <div className="flex flex-wrap gap-2">
                      {gates.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setGate(g)}
                          className={`min-h-11 rounded-full px-4 text-sm font-medium transition ${
                            gate === g ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>

          {/* Grouped native list */}
          <div className="overflow-hidden rounded-3xl border border-border/70 bg-card shadow-card">
            <div className="flex items-center justify-between px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Daily register</p>
              <p className="text-xs text-muted-foreground">{rows.length} learners</p>
            </div>
            <ul className="divide-y divide-border/60 border-t border-border/60">
              {rows.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left transition active:bg-muted/60"
                  >
                    <span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-navy-soft text-xs font-bold text-primary">
                      {initials(r.student)}
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card ${dotTone[r.status]}`}
                        aria-hidden="true"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-semibold">{r.student}</span>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${statusStyles[r.status]}`}>
                          {r.status}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                        {r.gradeSection} · {r.gate}
                      </span>
                      <span
                        className={`block truncate text-[11px] font-medium ${r.guardianNotified ? "text-emerald" : "text-muted-foreground"}`}
                      >
                        Guardian {r.guardianNotified ? "notified" : "pending"}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1">
                      <span className="font-mono text-[11px] text-muted-foreground">{r.timeIn}</span>
                      <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {rows.length === 0 && (
              <p className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">No {tab} records today.</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Card className="rounded-3xl border-border/70 shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-base">Arrival windows</CardTitle>
              <p className="text-xs text-muted-foreground">Distribution of gate scans</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {timeline.map((t) => (
                <div key={t.window}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t.window}</span>
                    <span className="font-semibold">{t.count}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-navy" style={{ width: `${t.share * 2}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-emerald/30 bg-emerald-soft shadow-card">
            <CardContent className="p-5">
              <p className="text-sm font-semibold text-accent-foreground">Automated cut-off</p>
              <p className="mt-1 text-xs text-accent-foreground/80">
                Learners scanning after 7:15 AM are flagged late. Absences are auto-notified at 8:00 AM.
              </p>
              <Button variant="secondary" className="mt-4 h-11 w-full rounded-full bg-card">
                Adjust grace period
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
