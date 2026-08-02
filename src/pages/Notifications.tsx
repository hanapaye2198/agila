
import { BellRing, CheckCheck, CheckCircle2, Info, Settings2, TriangleAlert } from "lucide-react";

import { AppShell } from "@/components/agila/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { notifications } from "@/lib/agila-data";

const channels = [
  { label: "SMS to guardians", desc: "Late and absent alerts", on: true },
  { label: "Mobile push", desc: "Guardian portal app", on: true },
  { label: "Email digest", desc: "Daily 4:00 PM summary", on: true },
  { label: "Adviser reminders", desc: "Unconfirmed advisory classes", on: false },
];

function Item({ n }: { n: (typeof notifications)[number] }) {
  const Icon = n.type === "alert" ? TriangleAlert : n.type === "success" ? CheckCircle2 : Info;
  const tone =
    n.type === "alert"
      ? "bg-rose-soft text-destructive"
      : n.type === "success"
        ? "bg-emerald-soft text-accent-foreground"
        : "bg-navy-soft text-primary";

  return (
    <div
      className={`flex gap-4 rounded-2xl border p-4 transition-colors ${
        n.unread ? "border-emerald/30 bg-emerald-soft/40" : "border-border/70 bg-surface"
      }`}
    >
      <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tone}`}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <p className="min-w-0 font-semibold">{n.title}</p>
          <span className="shrink-0 text-xs text-muted-foreground">{n.time}</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
      </div>
      {n.unread ? <span className="mt-2 size-2 shrink-0 rounded-full bg-emerald" /> : null}
    </div>
  );
}

export default function NotificationsPage() {
  return (
    <AppShell
      title="Notifications"
      description="3 unread · 1,204 guardian messages sent this month"
      actions={
        <>
          <Button variant="outline" className="rounded-xl bg-surface">
            <CheckCheck className="size-4" /> Mark all read
          </Button>
          <Button className="rounded-xl">
            <Settings2 className="size-4" /> Alert rules
          </Button>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card className="rounded-2xl border-border/70 shadow-card">
          <CardContent className="p-5">
            <Tabs defaultValue="all">
              <TabsList className="scrollbar-none w-full justify-start overflow-x-auto rounded-xl">
                <TabsTrigger value="all" className="rounded-lg">All</TabsTrigger>
                <TabsTrigger value="unread" className="rounded-lg">Unread</TabsTrigger>
                <TabsTrigger value="alerts" className="rounded-lg">Alerts</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4 space-y-3">
                {notifications.map((n) => (
                  <Item key={n.id} n={n} />
                ))}
              </TabsContent>
              <TabsContent value="unread" className="mt-4 space-y-3">
                {notifications.filter((n) => n.unread).map((n) => (
                  <Item key={n.id} n={n} />
                ))}
              </TabsContent>
              <TabsContent value="alerts" className="mt-4 space-y-3">
                {notifications.filter((n) => n.type === "alert").map((n) => (
                  <Item key={n.id} n={n} />
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-2xl border-border/70 shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-base">Delivery channels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {channels.map((c) => (
                <div key={c.label} className="flex items-center gap-3 rounded-xl border border-border/70 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{c.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{c.desc}</p>
                  </div>
                  <Switch defaultChecked={c.on} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none bg-navy text-navy-foreground shadow-card">
            <CardContent className="p-5">
              <BellRing className="size-6 opacity-80" />
              <p className="mt-3 font-display text-2xl font-bold">1,204</p>
              <p className="text-sm opacity-70">Guardian messages sent in July</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="font-display text-lg font-bold">98.2%</p>
                  <p className="text-xs opacity-70">Delivered</p>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="font-display text-lg font-bold">2.4s</p>
                  <p className="text-xs opacity-70">Avg. latency</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
