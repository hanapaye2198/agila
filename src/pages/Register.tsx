import { Link } from "react-router-dom";

import { AuthLayout } from "@/components/agila/auth-layout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RegisterPage() {
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
      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        <div className="space-y-2">
          <Label htmlFor="school">School name</Label>
          <Input id="school" placeholder="Northgate Senior High School" className="h-11 rounded-xl" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="type">School type</Label>
            <Select>
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
            <Select>
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
            <Input id="admin" placeholder="Marisol Duran" className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile number</Label>
            <Input id="phone" placeholder="+63 917 000 0000" className="h-11 rounded-xl" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="work-email">Work email</Label>
          <Input id="work-email" type="email" placeholder="admin@yourschool.edu.ph" className="h-11 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pw">Create password</Label>
          <Input id="pw" type="password" placeholder="At least 10 characters" className="h-11 rounded-xl" />
        </div>
        <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
          <Checkbox id="terms" className="mt-0.5" />
          <span>
            I agree to the AGILA Terms of Service and Data Privacy Agreement covering learner records.
          </span>
        </label>
        <Button asChild className="h-11 w-full rounded-xl">
          <Link to="/dashboard">Create workspace</Link>
        </Button>
      </form>
    </AuthLayout>
  );
}
