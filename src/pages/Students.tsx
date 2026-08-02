
import { Filter, Plus, Search, Upload } from "lucide-react";

import { AppShell } from "@/components/agila/app-shell";
import { StatCard } from "@/components/agila/stat-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { initials, statusStyles, students } from "@/lib/agila-data";

export default function StudentsPage() {
  return (
    <AppShell
      title="Students"
      description="1,482 enrolled learners across 36 advisory sections"
      actions={
        <>
          <Button variant="outline" className="rounded-xl bg-surface">
            <Upload className="size-4" /> Import CSV
          </Button>
          <Button className="rounded-xl">
            <Plus className="size-4" /> Add learner
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Enrolled" value="1,482" delta="+34" trend="up" hint="this school year" />
        <StatCard label="Perfect attendance" value="418" delta="28%" trend="up" hint="of all learners" />
        <StatCard label="At risk" value="27" delta="+3" trend="down" hint="below 80% rate" />
        <StatCard label="Guardians linked" value="1,456" delta="98.2%" trend="up" hint="of learners" />
      </div>

      <Card className="rounded-2xl border-border/70 shadow-card">
        <CardContent className="space-y-3 p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search name, LRN, or guardian" className="h-11 rounded-xl pl-9" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Select>
              <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Grade" /></SelectTrigger>
              <SelectContent>
                {["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"].map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                {["Present", "Late", "Absent", "Excused"].map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" className="h-10 w-full rounded-xl bg-surface">
            <Filter className="size-4" /> More filters
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {students.map((s) => (
          <button
            key={s.id}
            type="button"
            className="w-full rounded-2xl border border-border/70 bg-card p-4 text-left shadow-card transition-transform active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <Avatar className="size-11 shrink-0">
                <AvatarFallback className="bg-navy-soft text-xs text-primary">
                  {initials(s.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{s.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {s.section} · {s.gradeLevel}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${statusStyles[s.status]}`}
              >
                {s.status}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Progress value={s.rate} className="h-1.5" />
              <span className="w-10 shrink-0 text-right text-xs font-semibold">{s.rate}%</span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
              <span className="truncate">Guardian · {s.guardian}</span>
              <span className="truncate text-right font-mono">{s.guardianPhone}</span>
              <span className="truncate font-mono">LRN {s.id}</span>
              <span className="truncate text-right font-mono">Scan {s.lastScan}</span>
            </div>
          </button>
        ))}

        <Button variant="outline" className="h-11 w-full rounded-2xl bg-surface">
          Load more learners
        </Button>
        <p className="text-center text-xs text-muted-foreground">Showing 8 of 1,482 learners</p>
      </div>

    </AppShell>
  );
}
