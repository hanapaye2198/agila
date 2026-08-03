import { useState, type FormEvent } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";

import { AuthLayout } from "@/components/agila/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const token = params.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return setError("This reset link is missing or invalid.");
    if (password.length < 10) return setError("Password must be at least 10 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setError(""); setSubmitting(true);
    try {
      await resetPassword(token, password);
      navigate("/login", { replace: true, state: { notice: "Password updated. Sign in with your new password." } });
    }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to reset password."); }
    finally { setSubmitting(false); }
  }

  if (!token) {
    return (
      <AuthLayout eyebrow="Account recovery" title="Reset link is invalid" subtitle="This link is missing its token or has already been used.">
        <div className="space-y-4">
          <p className="rounded-2xl bg-rose-soft p-4 text-sm text-destructive">Request a new reset link to continue.</p>
          <Button asChild className="h-11 w-full rounded-xl"><Link to="/forgot-password">Request a new link</Link></Button>
          <p className="text-center text-sm text-muted-foreground"><Link to="/login" className="font-semibold text-primary hover:underline">Back to sign in</Link></p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout eyebrow="Account recovery" title="Create a new password" subtitle="Choose a password with at least 10 characters.">
      <form className="space-y-5" onSubmit={submit}>
        <div className="space-y-2"><Label htmlFor="reset-password">New password</Label><Input id="reset-password" required minLength={10} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 rounded-xl" /></div>
        <div className="space-y-2"><Label htmlFor="confirm-password">Confirm password</Label><Input id="confirm-password" required minLength={10} type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} className="h-11 rounded-xl" /></div>
        {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
        <Button disabled={submitting} type="submit" className="h-11 w-full rounded-xl">{submitting ? "Updating…" : "Update password"}</Button>
        <p className="text-center text-sm text-muted-foreground"><Link to="/login" className="font-semibold text-primary hover:underline">Back to sign in</Link></p>
      </form>
    </AuthLayout>
  );
}
