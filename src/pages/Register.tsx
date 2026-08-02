import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthLayout } from "@/components/agila/auth-layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ schoolName: "", schoolType: "", enrollmentSize: "", name: "", phone: "", email: "", password: "" });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!termsAccepted) { setError("Accept the Terms of Service and Data Privacy Agreement to continue."); return; }
    setError(""); setSubmitting(true);
    try { await register(form); navigate("/dashboard", { replace: true }); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to create the workspace."); }
    finally { setSubmitting(false); }
  }

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Register your school"
      subtitle="Set up your workspace in minutes. A specialist will verify your school details within one business day."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="school">School name</Label>
          <Input id="school" value={form.schoolName} onChange={(e) => update("schoolName", e.target.value)} required placeholder="Northgate Senior High School" className="h-11 rounded-xl" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="type">School type</Label>
            <Select value={form.schoolType} onValueChange={(value) => update("schoolType", value)}>
              <SelectTrigger id="type" className="h-11 w-full rounded-xl">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="international">International</SelectItem>
                <SelectItem value="district">District / network</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="size">Enrollment size</Label>
            <Select value={form.enrollmentSize} onValueChange={(value) => update("enrollmentSize", value)}>
              <SelectTrigger id="size" className="h-11 w-full rounded-xl">
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="s">Under 300</SelectItem>
                <SelectItem value="m">300 – 1,000</SelectItem>
                <SelectItem value="l">1,000 – 3,000</SelectItem>
                <SelectItem value="xl">3,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="admin">Administrator name</Label>
            <Input id="admin" value={form.name} onChange={(e) => update("name", e.target.value)} required placeholder="Marisol Duran" className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile number</Label>
            <Input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} required placeholder="+63 917 000 0000" className="h-11 rounded-xl" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="work-email">Work email</Label>
          <Input id="work-email" value={form.email} onChange={(e) => update("email", e.target.value)} required type="email" placeholder="admin@yourschool.edu.ph" className="h-11 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pw">Create password</Label>
          <Input id="pw" value={form.password} onChange={(e) => update("password", e.target.value)} required minLength={10} type="password" placeholder="At least 10 characters" className="h-11 rounded-xl" />
        </div>
        <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
          <Checkbox id="terms" checked={termsAccepted} onCheckedChange={(checked) => setTermsAccepted(checked === true)} className="mt-0.5" />
          <span>
            I agree to the AGILA Terms of Service and Data Privacy Agreement covering learner records.
          </span>
        </label>
        {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
        <Button disabled={submitting} className="h-11 w-full rounded-xl" type="submit">{submitting ? "Creating workspace…" : "Create workspace"}</Button>
      </form>
    </AuthLayout>
  );
}
