import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  delta,
  trend,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "flat";
  hint: string;
  icon?: LucideIcon | undefined;
}) {
  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;

  return (
    <Card className="rounded-2xl border-border/70 shadow-card">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 truncate text-xs font-medium text-muted-foreground">{label}</p>
          {Icon ? (
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-navy-soft text-primary">
              <Icon className="size-4" />
            </span>
          ) : null}
        </div>
        <p className="mt-2 font-display text-2xl font-bold tracking-tight">{value}</p>
        <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold",
              trend === "up" && "bg-emerald-soft text-accent-foreground",
              trend === "down" && "bg-rose-soft text-destructive",
              trend === "flat" && "bg-muted text-muted-foreground",
            )}
          >
            <TrendIcon className="size-3" />
            {delta}
          </span>
          <span className="truncate text-muted-foreground">{hint}</span>
        </div>
      </CardContent>
    </Card>

  );
}
