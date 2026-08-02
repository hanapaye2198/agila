
import { CheckCircle2, Keyboard, RefreshCw, ScanLine, Wifi } from "lucide-react";

import { AppShell } from "@/components/agila/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { initials, recentScans, statusStyles } from "@/lib/agila-data";

const devices = [
  { id: "NG-SCN-01", gate: "Main Gate", scans: 921, online: true },
  { id: "NG-SCN-02", gate: "East Gate", scans: 388, online: true },
  { id: "NG-SCN-03", gate: "Annex Gate", scans: 104, online: true },
  { id: "NG-SCN-04", gate: "Gym Entrance", scans: 21, online: false },
];

export default function ScannerPage() {
  return (
    <AppShell
      title="QR Scanner"
      description="Main Gate console · Session started 5:55 AM"
      actions={
        <>
          <Button variant="outline" className="rounded-xl bg-surface">
            <RefreshCw className="size-4" /> Sync now
          </Button>
          <Button className="rounded-xl">
            <ScanLine className="size-4" /> Start session
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Card className="mesh-bg overflow-hidden rounded-3xl border-border/70 shadow-card">
          <CardContent className="p-6 sm:p-8">
            <div className="mx-auto max-w-md">
              <div className="glass relative aspect-square w-full overflow-hidden rounded-3xl">
                <div className="grid-lines absolute inset-0 opacity-70" />
                <div className="absolute inset-8 rounded-2xl border-2 border-dashed border-emerald/40" />
                {["left-6 top-6 border-l-4 border-t-4 rounded-tl-xl", "right-6 top-6 border-r-4 border-t-4 rounded-tr-xl", "left-6 bottom-6 border-b-4 border-l-4 rounded-bl-xl", "right-6 bottom-6 border-b-4 border-r-4 rounded-br-xl"].map((pos) => (
                  <span key={pos} className={`absolute size-12 border-emerald ${pos}`} />
                ))}
                <span className="absolute inset-x-10 top-1/2 h-0.5 animate-pulse bg-emerald" />
                <div className="absolute inset-0 grid place-items-center">
                  <div className="text-center">
                    <ScanLine className="mx-auto size-10 text-emerald" />
                    <p className="mt-3 font-display text-lg font-semibold">Align QR inside the frame</p>
                    <p className="text-xs text-muted-foreground">Camera preview · 1080p · 30 fps</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="grid gap-3">
                  <div className="space-y-1.5">
                    <Label>Gate</Label>
                    <Select>
                      <SelectTrigger className="h-11 w-full rounded-xl bg-surface"><SelectValue placeholder="Main Gate" /></SelectTrigger>
                      <SelectContent>
                        {devices.map((d) => (
                          <SelectItem key={d.id} value={d.id}>{d.gate}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Session type</Label>
                    <Select>
                      <SelectTrigger className="h-11 w-full rounded-xl bg-surface"><SelectValue placeholder="Morning check-in" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in">Morning check-in</SelectItem>
                        <SelectItem value="out">Afternoon check-out</SelectItem>
                        <SelectItem value="event">Special event</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="manual">Manual entry</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Keyboard className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input id="manual" placeholder="Enter LRN e.g. NG-24-0117" className="h-11 rounded-xl bg-surface pl-9" />
                    </div>
                    <Button className="h-11 rounded-xl">Log</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-surface px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">Notify guardian on scan</p>
                    <p className="text-xs text-muted-foreground">Sends SMS + push within 3 seconds</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-2xl border-border/70 shadow-card">
            <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
              <CardTitle className="font-display text-base">Live scan feed</CardTitle>
              <Badge className="rounded-full bg-emerald-soft text-accent-foreground">
                1,434 today
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentScans.map((s) => (
                <div key={s.id} className="flex items-center gap-3 rounded-xl border border-border/70 p-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-navy-soft text-xs font-semibold text-primary">
                    {initials(s.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{s.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{s.section}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-mono text-[11px] text-muted-foreground">{s.time}</p>
                    <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${statusStyles[s.status]}`}>
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
              <p className="flex items-center gap-2 text-xs text-emerald">
                <CheckCircle2 className="size-3.5" /> All scans synced to the cloud
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/70 shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-base">Scanner devices</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {devices.map((d) => (
                <div key={d.id} className="flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-2.5">
                  <Wifi className={`size-4 shrink-0 ${d.online ? "text-emerald" : "text-muted-foreground"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{d.gate}</p>
                    <p className="truncate font-mono text-[11px] text-muted-foreground">{d.id}</p>
                  </div>
                  <span className="shrink-0 text-xs font-semibold">{d.scans}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
