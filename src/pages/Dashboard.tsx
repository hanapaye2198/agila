import { Link } from "react-router-dom";
import {
  Bell,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  GraduationCap,
  Info,
  QrCode,
  Send,
  TriangleAlert,
  UserPlus,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppShell } from "@/components/agila/app-shell";
import { StatCard } from "@/components/agila/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  gradeBreakdown,
  monthlyRate,
  notifications,
  recentAttendance,
  statCards,
  statusSplit,
  statusStyles,
  weeklyAttendance,
} from "@/lib/agila-data";

const statIcons = [GraduationCap, CheckCircle2, Clock3, Send];
const pieColors = ["var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

const quickActions = [
  { label: "Open QR scanner", to: "/scanner", icon: QrCode },
  { label: "Mark attendance", to: "/attendance", icon: CalendarCheck },
  { label: "Enroll learner", to: "/students", icon: UserPlus },
  { label: "Generate report", to: "/reports", icon: FileText },
];

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--border)",
  background: "var(--popover)",
  color: "var(--popover-foreground)",
  fontSize: 12,
};

export default function DashboardPage() {
  return (
    <AppShell
      title="Good morning, Marisol"
      description="Friday, July 31, 2026 · Attendance window closed at 8:00 AM"
      actions={
        <>
          <Button variant="outline" className="rounded-xl bg-surface">
            <Download className="size-4" /> Export
          </Button>
          <Button asChild className="rounded-xl">
            <Link to="/scanner">
              <QrCode className="size-4" /> Open scanner
            </Link>
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statCards.map((s, i) => (
          <StatCard key={s.label} {...s} icon={statIcons[i]} />
        ))}
      </div>

      <div className="space-y-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-4 lg:space-y-0">
        <Card className="rounded-2xl border-border/70 shadow-card">
          <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="font-display text-base">Weekly attendance</CardTitle>
              <p className="text-xs text-muted-foreground">Present, late, and absent counts</p>
            </div>
            <Badge variant="outline" className="rounded-full">This week</Badge>
          </CardHeader>
          <CardContent className="h-56 pl-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyAttendance} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" width={44} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="present" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="late" fill="var(--chart-3)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="absent" fill="var(--chart-4)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-base">Today's status split</CardTitle>
            <p className="text-xs text-muted-foreground">1,482 enrolled learners</p>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusSplit}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={54}
                    outerRadius={78}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {statusSplit.map((entry, i) => (
                      <Cell key={entry.key} fill={pieColors[i]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 space-y-2">
              {statusSplit.map((s, i) => (
                <li key={s.key} className="flex items-center gap-2 text-sm">
                  <span className="size-2.5 rounded-full" style={{ background: pieColors[i] }} />
                  <span className="text-muted-foreground">{s.name}</span>
                  <span className="ml-auto font-semibold">{s.value}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-4 lg:space-y-0">
        <Card className="rounded-2xl border-border/70 shadow-card">
          <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="font-display text-base">Attendance rate trend</CardTitle>
              <p className="text-xs text-muted-foreground">Monthly average, school-wide</p>
            </div>
            <span className="rounded-full bg-emerald-soft px-2.5 py-1 text-xs font-semibold text-accent-foreground">
              +1.4% YoY
            </span>
          </CardHeader>
          <CardContent className="h-56 pl-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRate}>
                <defs>
                  <linearGradient id="rateFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
                <YAxis domain={[85, 100]} tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" width={44} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="rate" stroke="var(--chart-2)" strokeWidth={2.5} fill="url(#rateFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-base">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {quickActions.map((a) => (
              <Link
                key={a.label}
                to={a.to}
                className="flex flex-col gap-2 rounded-2xl border border-border/70 bg-surface p-3 text-xs font-semibold transition-transform active:scale-[0.98]"
              >
                <span className="grid size-10 place-items-center rounded-xl bg-navy-soft text-primary">
                  <a.icon className="size-5" />
                </span>
                <span className="leading-tight">{a.label}</span>
              </Link>
            ))}
            <div className="col-span-2 rounded-2xl bg-navy p-4 text-navy-foreground">
              <p className="text-xs opacity-70">Guardian reach</p>
              <p className="mt-1 font-display text-2xl font-bold">98.2%</p>
              <Progress value={98} className="mt-3 h-1.5 bg-white/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-4 lg:space-y-0">
        <Card className="rounded-2xl border-border/70 shadow-card">
          <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
            <CardTitle className="font-display text-base">Recent attendance</CardTitle>
            <Button asChild variant="ghost" size="sm" className="rounded-lg">
              <Link to="/attendance">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentAttendance.slice(0, 6).map((r) => (
              <div key={r.id} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-surface p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{r.student}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{r.gradeSection} · {r.gate}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${statusStyles[r.status]}`}>
                    {r.status}
                  </span>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground">{r.timeIn}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-card">
          <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
            <CardTitle className="font-display text-base">Notifications</CardTitle>
            <Bell className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.slice(0, 4).map((n) => {
              const Icon = n.type === "alert" ? TriangleAlert : n.type === "success" ? CheckCircle2 : Info;
              const tone =
                n.type === "alert"
                  ? "bg-rose-soft text-destructive"
                  : n.type === "success"
                    ? "bg-emerald-soft text-accent-foreground"
                    : "bg-navy-soft text-primary";
              return (
                <div key={n.id} className="flex gap-3 rounded-xl border border-border/70 p-3">
                  <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${tone}`}>
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{n.title}</p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{n.time}</p>
                  </div>
                </div>
              );
            })}
            <Button asChild variant="outline" className="w-full rounded-xl bg-surface">
              <Link to="/notifications">See all notifications</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border/70 shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-base">Attendance by grade level</CardTitle>
          <p className="text-xs text-muted-foreground">Average rate this week</p>
        </CardHeader>
        <CardContent className="h-56 pl-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gradeBreakdown} layout="vertical" margin={{ left: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" domain={[80, 100]} tickLine={false} axisLine={false} fontSize={12} stroke="var(--muted-foreground)" />
              <YAxis type="category" dataKey="grade" tickLine={false} axisLine={false} fontSize={12} width={80} stroke="var(--muted-foreground)" />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
              <Bar dataKey="rate" fill="var(--chart-1)" radius={[0, 6, 6, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </AppShell>
  );
}
