import { useEffect, useState } from "react";
import { Building2, Save, ShieldCheck, Users } from "lucide-react";
import { AppShell } from "@/components/agila/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { workspaceApi, type WorkspaceSettings } from "@/lib/workspace-api";
import { peopleApi } from "@/lib/people-api";

const initial: WorkspaceSettings = { schoolName: "", schoolYear: "", timezone: "Asia/Manila", classStart: "07:00", lateCutoff: "07:15", absentCutoff: "08:00", dismissal: "16:30", channels: { sms: true, push: true, email: true, adviser: false } };

export default function SettingsPage() {
  const [settings, setSettings] = useState(initial); const [devices, setDevices] = useState<{ id: string; gate: string; online: boolean }[]>([]); const [team, setTeam] = useState<{ id: string; name: string; email: string; department: string }[]>([]); const [message, setMessage] = useState("");
  useEffect(() => { void Promise.all([workspaceApi.settings(), peopleApi.teachers()]).then(([workspace, teachers]) => { setSettings(workspace.settings); setDevices(workspace.devices); setTeam(teachers.teachers); }).catch((error) => setMessage(error instanceof Error ? error.message : "Unable to load settings")); }, []);
  const save = async () => { try { const result = await workspaceApi.saveSettings(settings); setSettings(result.settings); setMessage("Settings saved."); } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save settings"); } };
  const update = (key: keyof WorkspaceSettings, value: string) => setSettings({ ...settings, [key]: value });
  return <AppShell title="Settings" description="Persisted workspace configuration" actions={<Button className="rounded-xl" onClick={() => void save()}><Save className="size-4" /> Save changes</Button>}>
    <Tabs defaultValue="school"><TabsList className="flex w-full justify-start gap-1 overflow-x-auto rounded-2xl p-1"><TabsTrigger value="school"><Building2 className="size-4" /> School</TabsTrigger><TabsTrigger value="attendance"><ShieldCheck className="size-4" /> Attendance</TabsTrigger><TabsTrigger value="team"><Users className="size-4" /> Team</TabsTrigger></TabsList>
      <TabsContent value="school" className="mt-4"><Card className="rounded-2xl border-border/70 shadow-card"><CardHeader><CardTitle>School profile</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">{([['schoolName','School name'], ['schoolYear','School year'], ['timezone','Timezone']] as const).map(([key,label]) => <div key={key} className="space-y-2"><Label>{label}</Label><Input value={settings[key]} onChange={(event) => update(key, event.target.value)} /></div>)}</CardContent></Card></TabsContent>
      <TabsContent value="attendance" className="mt-4"><Card className="rounded-2xl border-border/70 shadow-card"><CardHeader><CardTitle>Attendance rules</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">{([['classStart','Class start'], ['lateCutoff','Late cut-off'], ['absentCutoff','Absent cut-off'], ['dismissal','Dismissal']] as const).map(([key,label]) => <div key={key} className="space-y-2"><Label>{label}</Label><Input type="time" value={settings[key]} onChange={(event) => update(key, event.target.value)} /></div>)}</CardContent></Card><Card className="mt-4 rounded-2xl border-border/70 shadow-card"><CardHeader><CardTitle>Gates & devices</CardTitle></CardHeader><CardContent className="space-y-2">{devices.map((device) => <div key={device.id} className="flex justify-between rounded-xl bg-muted p-3"><span>{device.gate}</span><span className="font-mono text-xs">{device.id} · {device.online ? "online" : "offline"}</span></div>)}</CardContent></Card></TabsContent>
      <TabsContent value="team" className="mt-4"><Card className="rounded-2xl border-border/70 shadow-card"><CardHeader><CardTitle>Workspace team</CardTitle></CardHeader><CardContent className="space-y-2">{team.map((member) => <div key={member.id} className="rounded-xl border border-border/70 p-3"><p className="font-medium">{member.name}</p><p className="text-xs text-muted-foreground">{member.email} · {member.department}</p></div>)}<Button className="mt-3" onClick={() => setMessage("Use Teachers to invite or create team members.")}>Invite member</Button></CardContent></Card></TabsContent>
    </Tabs>{message && <p className="mt-4 text-sm text-muted-foreground">{message}</p>}
  </AppShell>;
}
