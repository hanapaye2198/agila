import { Link } from "react-router-dom";

import { AuthLayout } from "@/components/agila/auth-layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
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
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <Label htmlFor="email">School email</Label>
          <Input id="email" type="email" placeholder="m.duran@northgate.edu.ph" className="h-11 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="••••••••" className="h-11 rounded-xl" />
        </div>
        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox id="remember" /> Keep me signed in
          </label>
          <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button asChild className="h-11 w-full rounded-xl">
          <Link to="/dashboard">Sign in</Link>
        </Button>
        <div className="relative py-1 text-center">
          <span className="relative z-10 bg-card px-3 text-xs uppercase tracking-widest text-muted-foreground">
            or
          </span>
          <span className="absolute inset-x-0 top-1/2 h-px bg-border" />
        </div>
        <Button variant="outline" className="h-11 w-full rounded-xl" type="button">
          Continue with school SSO
        </Button>
      </form>
    </AuthLayout>
  );
}
