import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { AuthLayout } from "@/components/agila/auth-layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signIn(email, password, remember);
      const destination = (location.state as { from?: string } | null)?.from ?? "/dashboard";
      navigate(destination, { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Sign in to AGILA"
      subtitle="Use your school-issued credentials to access the attendance workspace."
      footer={
        <>
          New to AGILA?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Register your school
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email">School email</Label>
          <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} required type="email" placeholder="m.duran@northgate.edu.ph" className="h-11 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" value={password} onChange={(e) => setPassword(e.target.value)} required type="password" placeholder="••••••••" className="h-11 rounded-xl" />
        </div>
        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox id="remember" checked={remember} onCheckedChange={(checked) => setRemember(checked === true)} /> Keep me signed in
          </label>
          <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
        <Button disabled={submitting} className="h-11 w-full rounded-xl" type="submit">{submitting ? "Signing in…" : "Sign in"}</Button>
        <div className="relative py-1 text-center">
          <span className="relative z-10 bg-card px-3 text-xs uppercase tracking-widest text-muted-foreground">
            or
          </span>
          <span className="absolute inset-x-0 top-1/2 h-px bg-border" />
        </div>
        <Button variant="outline" className="h-11 w-full rounded-xl" type="button" disabled>
          Continue with school SSO
        </Button>
      </form>
    </AuthLayout>
  );
}
