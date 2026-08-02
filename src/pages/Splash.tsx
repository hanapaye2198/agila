import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";

import { AgilaLogo } from "@/components/agila/agila-logo";
import { cn } from "@/lib/utils";

const APP_VERSION = "v1.0.0";
const SPLASH_DURATION_MS = 2500;
const STEP_INTERVAL_MS = 520;

const INIT_STEPS = [
  "Initializing Application",
  "Checking Internet Connection",
  "Loading User Preferences",
  "Verifying Authentication",
  "Synchronizing School Data",
  "Preparing Dashboard",
] as const;

type Phase = "splash" | "init";
type StepStatus = "pending" | "active" | "done";

/** UI-only mock — no backend. Toggle via localStorage key `agila_authenticated`. */
function isAuthenticated(): boolean {
  try {
    return localStorage.getItem("agila_authenticated") === "true";
  } catch {
    return false;
  }
}

function SplashBrand({ visible }: { visible: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center px-6 text-center transition-all duration-700 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
      )}
    >
      <div
        className={cn(
          "transition-all duration-700 delay-75 ease-out",
          visible ? "scale-100 opacity-100" : "scale-90 opacity-0",
        )}
      >
        <AgilaLogo size="xl" className="ring-4 ring-primary/10" />
      </div>

      <h1
        className={cn(
          "mt-7 font-display text-4xl font-extrabold tracking-tight text-primary transition-all duration-700 delay-150 ease-out sm:text-5xl",
          visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        )}
      >
        AGILA
      </h1>

      <p
        className={cn(
          "mt-3 max-w-[18rem] text-[13px] font-medium leading-relaxed text-muted-foreground transition-all duration-700 delay-200 ease-out sm:max-w-xs sm:text-sm",
          visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        )}
      >
        Automated Guardian Information on Learner Attendance
      </p>

      <p
        className={cn(
          "mt-5 font-display text-[13px] font-semibold tracking-wide text-emerald transition-all duration-700 delay-300 ease-out sm:text-sm",
          visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        )}
      >
        Monitoring Today, Securing Tomorrow.
      </p>
    </div>
  );
}

function SplashPhase({ ready }: { ready: boolean }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex flex-1 flex-col items-center justify-center pb-8 pt-[env(safe-area-inset-top)]">
        <SplashBrand visible={ready} />
      </div>

      <div
        className={cn(
          "flex flex-col items-center gap-5 pb-[calc(1.75rem+env(safe-area-inset-bottom))] transition-all duration-700 delay-500 ease-out",
          ready ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        )}
      >
        <div
          className="size-9 animate-spin rounded-full border-[2.5px] border-primary/15 border-t-primary"
          role="status"
          aria-label="Loading"
        />
        <span className="font-mono text-[11px] tracking-wider text-muted-foreground/80">
          {APP_VERSION}
        </span>
      </div>
    </div>
  );
}

function InitStepRow({
  label,
  status,
  index,
}: {
  label: string;
  status: StepStatus;
  index: number;
}) {
  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all duration-400",
        status === "active" && "bg-navy-soft/70",
        status === "done" && "opacity-100",
        status === "pending" && "opacity-45",
      )}
      style={{ transitionDelay: status === "pending" ? `${index * 20}ms` : "0ms" }}
    >
      <span
        className={cn(
          "grid size-7 shrink-0 place-items-center rounded-full transition-all duration-300",
          status === "done" && "scale-100 bg-emerald text-emerald-foreground shadow-sm",
          status === "active" && "bg-primary/10 text-primary",
          status === "pending" && "bg-muted text-muted-foreground",
        )}
      >
        {status === "done" ? (
          <Check
            className="size-3.5 animate-in zoom-in-50 fade-in duration-300"
            strokeWidth={2.75}
          />
        ) : status === "active" ? (
          <Loader2 className="size-3.5 animate-spin" strokeWidth={2.5} />
        ) : (
          <span className="size-1.5 rounded-full bg-current opacity-40" />
        )}
      </span>

      <span
        className={cn(
          "min-w-0 flex-1 text-[13px] font-medium tracking-tight sm:text-sm",
          status === "done" && "text-foreground",
          status === "active" && "text-primary",
          status === "pending" && "text-muted-foreground",
        )}
      >
        {label}
      </span>
    </li>
  );
}

function InitPhase({
  completedCount,
  visible,
}: {
  completedCount: number;
  visible: boolean;
}) {
  const activeIndex = completedCount < INIT_STEPS.length ? completedCount : -1;

  return (
    <div className="flex min-h-dvh flex-col px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(1.25rem+env(safe-area-inset-top))]">
      <div
        className={cn(
          "mb-6 flex items-center gap-3 transition-all duration-500 ease-out",
          visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
        )}
      >
        <AgilaLogo size="sm" />
        <div className="min-w-0">
          <p className="font-display text-sm font-bold tracking-tight text-primary">AGILA</p>
          <p className="text-[11px] text-muted-foreground">Preparing your workspace</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-center py-4">
        <div
          className={cn(
            "glass mx-auto w-full max-w-sm rounded-3xl p-5 shadow-lift transition-all duration-600 ease-out",
            visible ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-[0.98] opacity-0",
          )}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
                Almost ready
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Running startup checks for your school
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-navy-soft px-2.5 py-1 font-mono text-[11px] font-semibold tabular-nums text-primary">
              {Math.min(completedCount, INIT_STEPS.length)}/{INIT_STEPS.length}
            </span>
          </div>

          <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-emerald transition-all duration-500 ease-out"
              style={{
                width: `${(Math.min(completedCount, INIT_STEPS.length) / INIT_STEPS.length) * 100}%`,
              }}
            />
          </div>

          <ul className="space-y-0.5" aria-live="polite" aria-busy={completedCount < INIT_STEPS.length}>
            {INIT_STEPS.map((label, index) => {
              let status: StepStatus = "pending";
              if (index < completedCount) status = "done";
              else if (index === activeIndex) status = "active";

              return (
                <InitStepRow key={label} label={label} status={status} index={index} />
              );
            })}
          </ul>
        </div>
      </div>

      <p
        className={cn(
          "mx-auto max-w-xs text-center text-xs leading-relaxed text-muted-foreground transition-all duration-500 delay-150 ease-out",
          visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        )}
      >
        Please wait while we prepare your experience.
      </p>
    </div>
  );
}

export default function SplashPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("splash");
  const [splashReady, setSplashReady] = useState(false);
  const [initVisible, setInitVisible] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  // Mount fade-in for splash content
  useEffect(() => {
    const frame = requestAnimationFrame(() => setSplashReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Splash duration → init
  useEffect(() => {
    const timer = window.setTimeout(() => setPhase("init"), SPLASH_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, []);

  // Init phase entrance + sequential steps
  useEffect(() => {
    if (phase !== "init") return;

    const enter = requestAnimationFrame(() => setInitVisible(true));
    let step = 0;
    setCompletedCount(0);

    const interval = window.setInterval(() => {
      step += 1;
      setCompletedCount(step);
      if (step >= INIT_STEPS.length) {
        window.clearInterval(interval);
      }
    }, STEP_INTERVAL_MS);

    return () => {
      cancelAnimationFrame(enter);
      window.clearInterval(interval);
    };
  }, [phase]);

  // Navigate after checklist completes
  useEffect(() => {
    if (phase !== "init" || completedCount < INIT_STEPS.length) return;

    const done = window.setTimeout(() => {
      navigate(isAuthenticated() ? "/dashboard" : "/login", { replace: true });
    }, 450);

    return () => window.clearTimeout(done);
  }, [phase, completedCount, navigate]);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      {/* Subtle premium gradient atmosphere */}
      <div className="mesh-bg pointer-events-none absolute inset-0" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.45]"
        style={{
          background:
            "radial-gradient(90% 55% at 50% -10%, oklch(1 0 0 / 80%) 0%, transparent 55%), linear-gradient(180deg, oklch(0.99 0.004 260) 0%, oklch(0.97 0.01 260) 100%)",
        }}
      />

      <div className="relative mx-auto min-h-dvh w-full max-w-md sm:max-w-lg">
        {phase === "splash" ? (
          <div key="splash" className="animate-in fade-in duration-500">
            <SplashPhase ready={splashReady} />
          </div>
        ) : (
          <div key="init" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <InitPhase completedCount={completedCount} visible={initVisible} />
          </div>
        )}
      </div>
    </div>
  );
}
