export type AttendanceStatus = "present" | "late" | "absent" | "excused";

export type Student = {
  id: string;
  name: string;
  gradeLevel: string;
  section: string;
  guardian: string;
  guardianPhone: string;
  status: AttendanceStatus;
  rate: number;
  lastScan: string;
};

export type Teacher = {
  id: string;
  name: string;
  email: string;
  department: string;
  advisory: string;
  classes: number;
  status: "active" | "on leave";
};

export type AttendanceRecord = {
  id: string;
  student: string;
  gradeSection: string;
  timeIn: string;
  status: AttendanceStatus;
  gate: string;
  guardianNotified: boolean;
};

export const school = {
  name: "Northgate Senior High School",
  plan: "Enterprise",
  admin: "Marisol Duran",
  role: "School Administrator",
  schoolYear: "S.Y. 2026–2027",
};

export const statCards = [
  { label: "Total students", value: "1,482", delta: "+34", trend: "up" as const, hint: "vs last term" },
  { label: "Present today", value: "1,371", delta: "92.5%", trend: "up" as const, hint: "attendance rate" },
  { label: "Late arrivals", value: "63", delta: "-12", trend: "down" as const, hint: "vs yesterday" },
  { label: "Guardians notified", value: "111", delta: "SMS + push", trend: "flat" as const, hint: "auto-sent 7:45 AM" },
];

export const weeklyAttendance = [
  { day: "Mon", present: 1362, late: 71, absent: 49 },
  { day: "Tue", present: 1398, late: 52, absent: 32 },
  { day: "Wed", present: 1341, late: 84, absent: 57 },
  { day: "Thu", present: 1405, late: 46, absent: 31 },
  { day: "Fri", present: 1371, late: 63, absent: 48 },
];

export const monthlyRate = [
  { month: "Jan", rate: 93.4 },
  { month: "Feb", rate: 94.1 },
  { month: "Mar", rate: 92.2 },
  { month: "Apr", rate: 95.0 },
  { month: "May", rate: 94.6 },
  { month: "Jun", rate: 91.8 },
  { month: "Jul", rate: 92.5 },
];

export const statusSplit = [
  { name: "Present", value: 1371, key: "present" },
  { name: "Late", value: 63, key: "late" },
  { name: "Absent", value: 33, key: "absent" },
  { name: "Excused", value: 15, key: "excused" },
];

export const gradeBreakdown = [
  { grade: "Grade 7", rate: 95.2 },
  { grade: "Grade 8", rate: 93.7 },
  { grade: "Grade 9", rate: 91.4 },
  { grade: "Grade 10", rate: 94.8 },
  { grade: "Grade 11", rate: 89.9 },
  { grade: "Grade 12", rate: 92.6 },
];

export const students: Student[] = [
  { id: "NG-24-0117", name: "Althea Marquez", gradeLevel: "Grade 11", section: "Sampaguita", guardian: "Rowena Marquez", guardianPhone: "+63 917 224 8890", status: "present", rate: 97.4, lastScan: "6:52 AM" },
  { id: "NG-24-0132", name: "Jomar Villanueva", gradeLevel: "Grade 12", section: "Narra", guardian: "Elias Villanueva", guardianPhone: "+63 918 776 1203", status: "late", rate: 88.1, lastScan: "7:41 AM" },
  { id: "NG-24-0145", name: "Bianca Solano", gradeLevel: "Grade 9", section: "Molave", guardian: "Cristina Solano", guardianPhone: "+63 926 330 5512", status: "present", rate: 99.1, lastScan: "6:38 AM" },
  { id: "NG-24-0158", name: "Rafael Ocampo", gradeLevel: "Grade 10", section: "Acacia", guardian: "Dennis Ocampo", guardianPhone: "+63 915 902 7734", status: "absent", rate: 81.6, lastScan: "Yesterday" },
  { id: "NG-24-0163", name: "Kylie Bautista", gradeLevel: "Grade 8", section: "Ilang-Ilang", guardian: "Marites Bautista", guardianPhone: "+63 927 118 4460", status: "present", rate: 96.8, lastScan: "6:47 AM" },
  { id: "NG-24-0170", name: "Diego Fernandez", gradeLevel: "Grade 12", section: "Narra", guardian: "Anna Fernandez", guardianPhone: "+63 939 445 2201", status: "excused", rate: 90.3, lastScan: "Jul 29" },
  { id: "NG-24-0184", name: "Marianne Reyes", gradeLevel: "Grade 7", section: "Dama de Noche", guardian: "Joel Reyes", guardianPhone: "+63 922 651 3390", status: "present", rate: 98.2, lastScan: "6:41 AM" },
  { id: "NG-24-0191", name: "Paolo Gutierrez", gradeLevel: "Grade 11", section: "Sampaguita", guardian: "Lorna Gutierrez", guardianPhone: "+63 906 774 8812", status: "late", rate: 85.9, lastScan: "7:52 AM" },
];

export const teachers: Teacher[] = [
  { id: "T-1042", name: "Ma. Lourdes Aquino", email: "l.aquino@northgate.edu.ph", department: "Mathematics", advisory: "Grade 11 – Sampaguita", classes: 6, status: "active" },
  { id: "T-1055", name: "Ferdinand Cruz", email: "f.cruz@northgate.edu.ph", department: "Science", advisory: "Grade 9 – Molave", classes: 5, status: "active" },
  { id: "T-1063", name: "Grace Palomar", email: "g.palomar@northgate.edu.ph", department: "English", advisory: "Grade 8 – Ilang-Ilang", classes: 7, status: "on leave" },
  { id: "T-1071", name: "Noel Santiago", email: "n.santiago@northgate.edu.ph", department: "Values Education", advisory: "Grade 12 – Narra", classes: 4, status: "active" },
  { id: "T-1088", name: "Divina Lorenzo", email: "d.lorenzo@northgate.edu.ph", department: "Filipino", advisory: "Grade 7 – Dama de Noche", classes: 6, status: "active" },
  { id: "T-1094", name: "Arnel Bagtas", email: "a.bagtas@northgate.edu.ph", department: "MAPEH", advisory: "Grade 10 – Acacia", classes: 8, status: "active" },
];

export const recentAttendance: AttendanceRecord[] = [
  { id: "A-8891", student: "Bianca Solano", gradeSection: "Grade 9 – Molave", timeIn: "6:38 AM", status: "present", gate: "Main Gate", guardianNotified: true },
  { id: "A-8892", student: "Marianne Reyes", gradeSection: "Grade 7 – Dama de Noche", timeIn: "6:41 AM", status: "present", gate: "Main Gate", guardianNotified: true },
  { id: "A-8893", student: "Kylie Bautista", gradeSection: "Grade 8 – Ilang-Ilang", timeIn: "6:47 AM", status: "present", gate: "East Gate", guardianNotified: true },
  { id: "A-8894", student: "Althea Marquez", gradeSection: "Grade 11 – Sampaguita", timeIn: "6:52 AM", status: "present", gate: "Main Gate", guardianNotified: true },
  { id: "A-8895", student: "Jomar Villanueva", gradeSection: "Grade 12 – Narra", timeIn: "7:41 AM", status: "late", gate: "East Gate", guardianNotified: true },
  { id: "A-8896", student: "Paolo Gutierrez", gradeSection: "Grade 11 – Sampaguita", timeIn: "7:52 AM", status: "late", gate: "Main Gate", guardianNotified: true },
  { id: "A-8897", student: "Rafael Ocampo", gradeSection: "Grade 10 – Acacia", timeIn: "—", status: "absent", gate: "—", guardianNotified: true },
  { id: "A-8898", student: "Diego Fernandez", gradeSection: "Grade 12 – Narra", timeIn: "—", status: "excused", gate: "—", guardianNotified: false },
];

export type Notification = {
  id: string;
  title: string;
  body: string;
  time: string;
  type: "alert" | "info" | "success";
  unread: boolean;
};

export const notifications: Notification[] = [
  { id: "N-01", title: "Absence alert sent to 33 guardians", body: "Automated 8:00 AM cut-off digest delivered via SMS and mobile push.", time: "8:02 AM", type: "alert", unread: true },
  { id: "N-02", title: "Grade 11 – Sampaguita attendance finalized", body: "Ma. Lourdes Aquino confirmed 41 of 44 learners present.", time: "7:58 AM", type: "success", unread: true },
  { id: "N-03", title: "East Gate scanner reconnected", body: "Device NG-SCN-02 resumed syncing after a 4-minute outage.", time: "7:33 AM", type: "info", unread: true },
  { id: "N-04", title: "Weekly report ready", body: "Attendance summary for Jul 27 – Jul 31 is available for download.", time: "Yesterday", type: "info", unread: false },
  { id: "N-05", title: "3 learners flagged for chronic tardiness", body: "Guidance office notified for Grade 12 – Narra advisory.", time: "Yesterday", type: "alert", unread: false },
  { id: "N-06", title: "Guardian portal invites accepted", body: "128 guardians completed onboarding this week.", time: "Jul 29", type: "success", unread: false },
];

export const recentScans = [
  { id: "S-01", name: "Althea Marquez", section: "Grade 11 – Sampaguita", time: "6:52:14 AM", status: "present" as AttendanceStatus },
  { id: "S-02", name: "Kylie Bautista", section: "Grade 8 – Ilang-Ilang", time: "6:47:02 AM", status: "present" as AttendanceStatus },
  { id: "S-03", name: "Marianne Reyes", section: "Grade 7 – Dama de Noche", time: "6:41:55 AM", status: "present" as AttendanceStatus },
  { id: "S-04", name: "Bianca Solano", section: "Grade 9 – Molave", time: "6:38:31 AM", status: "present" as AttendanceStatus },
];

export const reports = [
  { id: "R-2291", name: "Daily attendance summary", scope: "All grade levels", period: "Jul 31, 2026", format: "PDF", size: "412 KB" },
  { id: "R-2287", name: "Weekly tardiness report", scope: "Grades 11–12", period: "Jul 27 – Jul 31", format: "XLSX", size: "1.1 MB" },
  { id: "R-2280", name: "Guardian notification log", scope: "All guardians", period: "July 2026", format: "CSV", size: "784 KB" },
  { id: "R-2274", name: "Chronic absenteeism watchlist", scope: "Guidance office", period: "Q1 2026", format: "PDF", size: "296 KB" },
  { id: "R-2265", name: "Advisory class comparison", scope: "36 sections", period: "June 2026", format: "XLSX", size: "2.4 MB" },
];

export const statusStyles: Record<AttendanceStatus, string> = {
  present: "bg-emerald-soft text-accent-foreground",
  late: "bg-amber-soft text-foreground",
  absent: "bg-rose-soft text-destructive",
  excused: "bg-navy-soft text-primary",
};

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
