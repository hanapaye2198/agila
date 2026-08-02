import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { MailCheck } from "lucide-react";

import { AuthLayout } from "@/components/agila/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setError("");
    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      setMessage("If the email is registered, a reset link has been sent.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to request a reset link.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Account recovery"
      title="Forgot your password?"
      subtitle="Enter your school email and we'll send a secure reset link valid for 30 minutes."
      footer={
        <>
          Remembered it?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Back to sign in
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="recover-email">School email</Label>
          <Input id="recover-email" value={email} onChange={(e) => setEmail(e.target.value)} required type="email" placeholder="m.duran@northgate.edu.ph" className="h-11 rounded-xl" />
        </div>
        {message ? <p role="status" className="text-sm text-accent-foreground">{message}</p> : null}
        {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
        <Button disabled={submitting} className="h-11 w-full rounded-xl" type="submit">{submitting ? "Sending…" : "Send reset link"}</Button>
        <div className="flex items-start gap-3 rounded-2xl bg-emerald-soft p-4 text-sm text-accent-foreground">
          <MailCheck className="mt-0.5 size-4.5 shrink-0" />
          <p>
            Reset links only go to verified school domains. If your email changed, contact your
            district IT administrator.
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
