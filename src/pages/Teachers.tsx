
import { Mail, Plus, Search } from "lucide-react";

import { AppShell } from "@/components/agila/app-shell";
import { StatCard } from "@/components/agila/stat-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { initials, teachers } from "@/lib/agila-data";

export default function TeachersPage() {
  return (
    <AppShell
      title="Teachers"
      description="86 faculty members · 36 advisers confirming daily attendance"
      actions={
        <>
          <Button variant="outline" className="rounded-xl bg-surface">
            <Mail className="size-4" /> Invite faculty
          </Button>
          <Button className="rounded-xl">
            <Plus className="size-4" /> Add teacher
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Faculty" value="86" delta="+4" trend="up" hint="this school year" />
        <StatCard label="Advisers" value="36" delta="100%" trend="flat" hint="sections covered" />
        <StatCard label="Confirmed today" value="33 / 36" delta="92%" trend="up" hint="advisory checks" />
        <StatCard label="On leave" value="2" delta="-1" trend="down" hint="vs last week" />
      </div>

      <Card className="rounded-2xl border-border/70 shadow-card">
        <CardContent className="p-5">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search faculty by name or department" className="h-10 rounded-xl pl-9" />
          </div>

          <div className="mt-5 grid gap-4">
            {teachers.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl border border-border/70 bg-surface p-5 transition-shadow hover:shadow-card"
              >
                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                  <Avatar className="size-11 shrink-0">
                    <AvatarFallback className="bg-navy text-sm text-navy-foreground">
                      {initials(t.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{t.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{t.email}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${
                      t.status === "active"
                        ? "bg-emerald-soft text-accent-foreground"
                        : "bg-amber-soft text-foreground"
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-muted-foreground">Department</dt>
                    <dd className="truncate font-medium">{t.department}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Classes</dt>
                    <dd className="font-medium">{t.classes} sections</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs text-muted-foreground">Advisory</dt>
                    <dd className="truncate font-medium">{t.advisory}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 rounded-lg bg-card">Profile</Button>
                  <Button size="sm" className="flex-1 rounded-lg">Message</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
