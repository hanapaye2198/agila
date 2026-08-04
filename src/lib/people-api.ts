import { apiRequest } from "@/lib/api";
import type { Student, Teacher } from "@/lib/agila-data";

export type StudentQuery = { query?: string; grade?: string; status?: string; page?: number; pageSize?: number };
export type StudentPayload = Pick<Student, "id" | "name" | "gradeLevel" | "section" | "guardian" | "guardianPhone">;
export type TeacherPayload = Pick<Teacher, "name" | "email" | "department" | "advisory">;

function queryString(values: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) if (value !== undefined && value !== "") params.set(key, String(value));
  const result = params.toString();
  return result ? `?${result}` : "";
}

export const peopleApi = {
  students: (filters: StudentQuery = {}, signal?: AbortSignal) =>
    apiRequest<{ students: Student[]; total: number; hasMore: boolean; stats: { enrolled: number; guardiansLinked: number } }>(`/students${queryString(filters)}`, { signal }),
  createStudent: (payload: StudentPayload) => apiRequest<{ student: Student }>("/students", { method: "POST", body: payload }),
  importStudents: (students: StudentPayload[]) => apiRequest<{ imported: number; total: number }>("/students/import", { method: "POST", body: { students } }),
  teachers: (query = "", signal?: AbortSignal) => apiRequest<{ teachers: Teacher[]; total: number; stats: { faculty: number; advisers: number } }>(`/teachers${queryString({ query })}`, { signal }),
  createTeacher: (payload: TeacherPayload) => apiRequest<{ teacher: Teacher }>("/teachers", { method: "POST", body: payload }),
  inviteTeacher: (email: string) => apiRequest<{ message: string; email: string }>("/teachers/invite", { method: "POST", body: { email } }),
};
