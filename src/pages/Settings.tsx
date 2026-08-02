
import { Building2, CreditCard, Save, ShieldCheck, Users } from "lucide-react";

import { AppShell } from "@/components/agila/app-shell";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { initials, school, teachers } from "@/lib/agila-data";

export default function SettingsPage() {
  return (
    <AppShell
      title="Settings"
      description="Workspace configuration for Northgate Senior High School"
      actions={
        <Button className="rounded-xl">
          <Save className="size-4" /> Save changes
        </Button>
      }
    >
      <Tabs defaultValue="school">
        <TabsList className="scrollbar-none flex w-full justify-start gap-1 overflow-x-auto rounded-2xl p-1">
          <TabsTrigger value="school" className="shrink-0 rounded-xl"><Building2 className="size-4" /> School</TabsTrigger>
          <TabsTrigger value="attendance" className="shrink-0 rounded-xl"><ShieldCheck className="size-4" /> Attendance</TabsTrigger>
          <TabsTrigger value="team" className="shrink-0 rounded-xl"><Users className="size-4" /> Team</TabsTrigger>
          <TabsTrigger value="billing" className="shrink-0 rounded-xl"><CreditCard className="size-4" /> Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="school" className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card className="rounded-2xl border-border/70 shadow-card">
            <CardHeader><CardTitle className="font-display text-base">School profile</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="s-name">School name</Label>
                <Input id="s-name" defaultValue={school.name} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-id">DepEd school ID</Label>
                <Input id="s-id" defaultValue="305711" className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-year">School year</Label>
                <Input id="s-year" defaultValue={school.schoolYear} className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-address">Address</Label>
                <Input id="s-address" defaultValue="14 Ilaya Road, Northgate District, Quezon City" className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-contact">Contact number</Label>
                <Input id="s-contact" defaultValue="+63 2 8123 4455" className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select>
                  <SelectTrigger className="h-11 w-full rounded-xl"><SelectValue placeholder="Asia/Manila (GMT+8)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mnl">Asia/Manila (GMT+8)</SelectItem>
                    <SelectItem value="sg">Asia/Singapore (GMT+8)</SelectItem>
                    <SelectItem value="hk">Asia/Hong_Kong (GMT+8)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/70 shadow-card">
            <CardHeader><CardTitle className="font-display text-base">Branding</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid place-items-center rounded-2xl border border-dashed border-border p-8 text-center">
                <Avatar className="size-16">
                  <AvatarFallback className="bg-navy text-lg text-navy-foreground">NG</AvatarFallback>
                </Avatar>
                <p className="mt-3 text-sm font-medium">Upload school seal</p>
                <p className="text-xs text-muted-foreground">PNG or SVG, up to 2 MB</p>
                <Button variant="outline" size="sm" className="mt-3 rounded-lg bg-surface">Choose file</Button>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border/70 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">Show seal on reports</p>
                  <p className="text-xs text-muted-foreground">Applies to PDF exports</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="mt-4 grid gap-4">
          <Card className="rounded-2xl border-border/70 shadow-card">
            <CardHeader><CardTitle className="font-display text-base">Attendance rules</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="start">Class start</Label>
                  <Input id="start" type="time" defaultValue="07:00" className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grace">Late cut-off</Label>
                  <Input id="grace" type="time" defaultValue="07:15" className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="absent">Absent cut-off</Label>
                  <Input id="absent" type="time" defaultValue="08:00" className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="out">Dismissal</Label>
                  <Input id="out" type="time" defaultValue="16:30" className="h-11 rounded-xl" />
                </div>
              </div>
              <Separator />
              {[
                { t: "Require adviser confirmation", d: "Advisers verify the register before 9:00 AM" },
                { t: "Allow manual overrides", d: "Registrar can change a status with a reason" },
                { t: "Count excused as present", d: "Applies to official school activities" },
              ].map((r) => (
                <div key={r.t} className="flex items-center gap-3 rounded-xl border border-border/70 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.t}</p>
                    <p className="truncate text-xs text-muted-foreground">{r.d}</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/70 shadow-card">
            <CardHeader><CardTitle className="font-display text-base">Gates & devices</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {["Main Gate", "East Gate", "Annex Gate", "Gym Entrance"].map((g, i) => (
                <div key={g} className="flex items-center gap-3 rounded-xl bg-muted/60 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{g}</p>
                    <p className="truncate font-mono text-[11px] text-muted-foreground">
                      NG-SCN-0{i + 1}
                    </p>
                  </div>
                  <Switch defaultChecked={i !== 3} />
                </div>
              ))}
              <Button variant="outline" className="w-full rounded-xl bg-surface">Pair new device</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <Card className="rounded-2xl border-border/70 shadow-card">
            <CardHeader><CardTitle className="font-display text-base">Workspace access</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[{ name: school.admin, role: "School Administrator", email: "m.duran@northgate.edu.ph" }].concat(
                teachers.slice(0, 4).map((t) => ({ name: t.name, role: "Adviser", email: t.email })),
              ).map((m) => (
                <div key={m.email} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border/70 px-4 py-3">
                  <Avatar className="size-9 shrink-0">
                    <AvatarFallback className="bg-navy-soft text-xs text-primary">{initials(m.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{m.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-navy-soft px-2.5 py-1 text-xs font-semibold text-primary">
                    {m.role}
                  </span>
                </div>
              ))}
              <Button className="rounded-xl">Invite member</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Card className="rounded-2xl border-none bg-navy text-navy-foreground shadow-card">
            <CardContent className="p-6">
              <p className="text-sm opacity-70">Current plan</p>
              <p className="mt-1 font-display text-3xl font-bold">{school.plan}</p>
              <p className="mt-2 text-sm opacity-70">1,482 of 3,000 learner seats used</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/20">
                <div className="h-full w-1/2 rounded-full bg-emerald" />
              </div>
              <Button variant="secondary" className="mt-6 rounded-xl">Manage subscription</Button>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border/70 shadow-card">
            <CardHeader><CardTitle className="font-display text-base">Billing contact</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="b-name">Name</Label>
                <Input id="b-name" defaultValue="Finance Office — Northgate SHS" className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-email">Billing email</Label>
                <Input id="b-email" defaultValue="finance@northgate.edu.ph" className="h-11 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-tin">TIN</Label>
                <Input id="b-tin" defaultValue="004-889-221-000" className="h-11 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
