import { Link } from "react-router-dom";
import { MailCheck } from "lucide-react";

import { AuthLayout } from "@/components/agila/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
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
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <Label htmlFor="recover-email">School email</Label>
          <Input id="recover-email" type="email" placeholder="m.duran@northgate.edu.ph" className="h-11 rounded-xl" />
        </div>
        <Button className="h-11 w-full rounded-xl" type="submit">
          Send reset link
        </Button>
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
