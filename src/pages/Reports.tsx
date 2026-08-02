
import { CalendarDays, Download, FileSpreadsheet, FileText, Plus } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppShell } from "@/components/agila/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { gradeBreakdown, reports, weeklyAttendance } from "@/lib/agila-data";

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--popover)",
  color: "var(--popover-foreground)",
  fontSize: 12,
};

export default function ReportsPage() {
  return (
    <AppShell
      title="Reports"
      description="Build, schedule, and export attendance intelligence"
      actions={
        <>
          <Button variant="outline" className="rounded-xl bg-surface">
            <CalendarDays className="size-4" /> Schedule
          </Button>
          <Button className="rounded-xl">
            <Plus className="size-4" /> New report
          </Button>
        </>
      }
    >
      <Card className="rounded-2xl border-border/70 shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-base">Report builder</CardTitle>
          <p className="text-xs text-muted-foreground">Pick a scope and period, then export</p>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Select>
            <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Report type" /></SelectTrigger>
            <SelectContent>
              {["Daily summary", "Weekly tardiness", "Monthly rate", "Guardian log", "Watchlist"].map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Scope" /></SelectTrigger>
            <SelectContent>
              {["All grade levels", "Junior high", "Senior high", "Single section"].map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Period" /></SelectTrigger>
            <SelectContent>
              {["Today", "This week", "This month", "Quarter 1", "Custom range"].map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="h-11 rounded-xl">
            <Download className="size-4" /> Generate export
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="rounded-2xl border-border/70 shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-base">Present vs late</CardTitle>
            <p className="text-xs text-muted-foreground">Rolling five school days</p>
          </CardHeader>
          <CardContent className="h-72 pl-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyAttendance}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" width={44} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="present" stroke="var(--chart-1)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="late" stroke="var(--chart-3)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="absent" stroke="var(--chart-4)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-base">Rate by grade level</CardTitle>
            <p className="text-xs text-muted-foreground">Ranked highest to lowest</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...gradeBreakdown]
              .sort((a, b) => b.rate - a.rate)
              .map((g) => (
                <div key={g.grade}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{g.grade}</span>
                    <span className="font-semibold">{g.rate}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${g.rate >= 93 ? "bg-emerald" : g.rate >= 91 ? "bg-navy" : "bg-amber"}`}
                      style={{ width: `${g.rate}%` }}
                    />
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border/70 shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-base">Generated reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {reports.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-3 rounded-2xl border border-border/70 bg-surface p-3"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-navy-soft text-primary">
                {r.format === "PDF" ? <FileText className="size-4.5" /> : <FileSpreadsheet className="size-4.5" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{r.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {r.scope} · {r.period} · {r.size}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="size-9 shrink-0 rounded-xl" aria-label={`Download ${r.name}`}>
                <Download className="size-4" />
              </Button>
            </div>
          ))}
        </CardContent>

      </Card>
    </AppShell>
  );
}
