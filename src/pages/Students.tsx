import { useCallback, useEffect, useRef, useState } from "react";
import { Filter, Plus, Search, Upload } from "lucide-react";

import { AppShell } from "@/components/agila/app-shell";
import { StatCard } from "@/components/agila/stat-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { initials, statusStyles } from "@/lib/agila-data";
import { peopleApi } from "@/lib/people-api";
import type { Student } from "@/lib/agila-data";

const emptyForm = { id: "", name: "", gradeLevel: "Grade 7", section: "", guardian: "", guardianPhone: "" };

export default function StudentsPage() {
  const [items, setItems] = useState<Student[]>([]);
  const [query, setQuery] = useState("");
  const [grade, setGrade] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [stats, setStats] = useState({ enrolled: 0, guardiansLinked: 0 });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async (nextPage = 1, append = false) => {
    try {
      const result = await peopleApi.students({ query, grade, status, page: nextPage });
      setItems((current) => append ? [...current, ...result.students] : result.students);
      setTotal(result.total); setHasMore(result.hasMore); setPage(nextPage); setStats(result.stats); setMessage("");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to load learners"); }
  }, [query, grade, status]);

  useEffect(() => { void load(); }, [load]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    try { await peopleApi.createStudent(form); setForm(emptyForm); setShowForm(false); await load(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Unable to add learner"); }
  };

  const importCsv = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    const rows = (await file.text()).split(/\r?\n/).filter(Boolean).map((line) => line.split(",").map((cell) => cell.trim()));
    const [header, ...data] = rows; const index = (name: string) => header?.findIndex((cell) => cell.toLowerCase() === name) ?? -1;
    const imported = data.map((row) => ({ id: row[index("id")] ?? "", name: row[index("name")] ?? "", gradeLevel: row[index("gradelevel")] ?? "", section: row[index("section")] ?? "", guardian: row[index("guardian")] ?? "", guardianPhone: row[index("guardianphone")] ?? "" })).filter((row) => row.id && row.name && row.gradeLevel && row.section);
    try { const result = await peopleApi.importStudents(imported); setMessage(`${result.imported} learner${result.imported === 1 ? "" : "s"} imported.`); await load(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Unable to import learners"); }
    event.target.value = "";
  };

  return <AppShell title="Students" description={`${stats.enrolled.toLocaleString()} enrolled learners`} actions={<>
    <input ref={fileInput} type="file" accept=".csv,text/csv" className="hidden" onChange={importCsv} />
    <Button variant="outline" className="rounded-xl bg-surface" onClick={() => fileInput.current?.click()}><Upload className="size-4" /> Import CSV</Button>
    <Button className="rounded-xl" onClick={() => setShowForm((value) => !value)}><Plus className="size-4" /> Add learner</Button>
  </>}>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard label="Enrolled" value={stats.enrolled.toLocaleString()} delta="live" trend="up" hint="from directory" />
      <StatCard label="Perfect attendance" value="—" delta="" trend="flat" hint="attendance report pending" />
      <StatCard label="At risk" value="—" delta="" trend="flat" hint="attendance report pending" />
      <StatCard label="Guardians linked" value={stats.guardiansLinked.toLocaleString()} delta="live" trend="up" hint="from directory" />
    </div>
    {showForm && <Card className="rounded-2xl border-border/70 shadow-card"><CardContent className="p-4"><form onSubmit={submit} className="grid gap-2 sm:grid-cols-2">
      {([["id", "LRN / learner ID"], ["name", "Full name"], ["section", "Section"], ["guardian", "Guardian"], ["guardianPhone", "Guardian phone"]] as const).map(([key, label]) => <Input key={key} required={key !== "guardian" && key !== "guardianPhone"} placeholder={label} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />)}
      <Select value={form.gradeLevel} onValueChange={(value) => setForm({ ...form, gradeLevel: value })}><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger><SelectContent>{[7, 8, 9, 10, 11, 12].map((value) => <SelectItem key={value} value={`Grade ${value}`}>Grade {value}</SelectItem>)}</SelectContent></Select>
      <Button type="submit" className="rounded-xl sm:col-span-2">Save learner</Button>
    </form></CardContent></Card>}
    <Card className="rounded-2xl border-border/70 shadow-card"><CardContent className="space-y-3 p-4">
      <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, LRN, or guardian" className="h-11 rounded-xl pl-9" /></div>
      <div className="grid grid-cols-2 gap-2"><Select value={grade} onValueChange={setGrade}><SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Grade" /></SelectTrigger><SelectContent>{[7, 8, 9, 10, 11, 12].map((value) => <SelectItem key={value} value={`Grade ${value}`}>Grade {value}</SelectItem>)}</SelectContent></Select><Select value={status} onValueChange={setStatus}><SelectTrigger className="h-10 rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent>{["present", "late", "absent", "excused"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div>
      <Button variant="outline" className="h-10 w-full rounded-xl bg-surface" onClick={() => { setQuery(""); setGrade(""); setStatus(""); }}><Filter className="size-4" /> Clear filters</Button>
    </CardContent></Card>
    {message && <p className="text-sm text-muted-foreground">{message}</p>}
    <div className="space-y-3">{items.map((student) => <button key={student.id} type="button" className="w-full rounded-2xl border border-border/70 bg-card p-4 text-left shadow-card transition-transform active:scale-[0.99]"><div className="flex items-center gap-3"><Avatar className="size-11 shrink-0"><AvatarFallback className="bg-navy-soft text-xs text-primary">{initials(student.name)}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{student.name}</p><p className="truncate text-xs text-muted-foreground">{student.section} · {student.gradeLevel}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${statusStyles[student.status]}`}>{student.status}</span></div><div className="mt-3 flex items-center gap-2"><Progress value={student.rate} className="h-1.5" /><span className="w-10 shrink-0 text-right text-xs font-semibold">{student.rate}%</span></div><div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground"><span className="truncate">Guardian · {student.guardian || "Not linked"}</span><span className="truncate text-right font-mono">{student.guardianPhone}</span><span className="truncate font-mono">LRN {student.id}</span><span className="truncate text-right font-mono">Scan {student.lastScan}</span></div></button>)}
      {hasMore && <Button variant="outline" className="h-11 w-full rounded-2xl bg-surface" onClick={() => void load(page + 1, true)}>Load more learners</Button>}<p className="text-center text-xs text-muted-foreground">Showing {items.length} of {total} learners</p>
    </div>
  </AppShell>;
}
