import { cn } from "@/lib/utils";

/** Stylized eagle mark for AGILA branding. */
export function AgilaEagle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-full", className)}
      aria-hidden
    >
      <path
        d="M32 8c-1.8 4.2-3.2 8.8-3.4 13.2-.1 2.4.4 4.6 1.6 6.5 1.2-1.9 1.7-4.1 1.6-6.5C31.6 16.8 32.2 12.2 32 8z"
        fill="currentColor"
        opacity="0.95"
      />
      <path
        d="M32.2 27.2c2.4-1.1 5.1-1.6 7.9-1.4 3.8.3 7.4 1.8 10.3 4.2-2.1 1.1-4.5 1.7-7 1.7-2.9 0-5.6-.8-7.9-2.2-1.2-.7-2.3-1.6-3.3-2.3z"
        fill="currentColor"
      />
      <path
        d="M31.8 27.2c-2.4-1.1-5.1-1.6-7.9-1.4-3.8.3-7.4 1.8-10.3 4.2 2.1 1.1 4.5 1.7 7 1.7 2.9 0 5.6-.8 7.9-2.2 1.2-.7 2.3-1.6 3.3-2.3z"
        fill="currentColor"
      />
      <path
        d="M32 29.5c1.6 1.4 3.4 3.4 4.6 5.8 1.6 3.2 2.3 6.6 2.1 10.1-.1 1.8-.5 3.5-1.1 5.1-1.8-1.2-3.6-2.7-5.1-4.6-1.7-2.1-2.8-4.4-3.5-6.8.8-3.3 1.8-6.6 3-9.6z"
        fill="currentColor"
        opacity="0.92"
      />
      <path
        d="M32 29.5c-1.6 1.4-3.4 3.4-4.6 5.8-1.6 3.2-2.3 6.6-2.1 10.1.1 1.8.5 3.5 1.1 5.1 1.8-1.2 3.6-2.7 5.1-4.6 1.7-2.1 2.8-4.4 3.5-6.8-.8-3.3-1.8-6.6-3-9.6z"
        fill="currentColor"
        opacity="0.92"
      />
      <path
        d="M20.5 36.8c-3.2 1.4-6.1 3.6-8.2 6.4 2.6.2 5.3.1 7.8-.5 2.2-.5 4.3-1.4 6.1-2.6-1.7-1.5-3.6-2.6-5.7-3.3z"
        fill="currentColor"
        opacity="0.85"
      />
      <path
        d="M43.5 36.8c3.2 1.4 6.1 3.6 8.2 6.4-2.6.2-5.3.1-7.8-.5-2.2-.5-4.3-1.4-6.1-2.6 1.7-1.5 3.6-2.6 5.7-3.3z"
        fill="currentColor"
        opacity="0.85"
      />
      <path
        d="M28.2 50.2c1.1 2.2 2.4 4.1 3.8 5.6 1.4-1.5 2.7-3.4 3.8-5.6-1.2.3-2.5.4-3.8.4s-2.6-.1-3.8-.4z"
        fill="currentColor"
        opacity="0.9"
      />
      <circle cx="32" cy="22.5" r="2.2" fill="currentColor" opacity="0.55" />
    </svg>
  );
}

export function AgilaLogo({
  className,
  markClassName,
  size = "md",
}: {
  className?: string;
  markClassName?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizes = {
    sm: "size-9 rounded-xl",
    md: "size-12 rounded-2xl",
    lg: "size-16 rounded-2xl",
    xl: "size-20 rounded-[1.35rem]",
  };

  const icon = {
    sm: "size-5",
    md: "size-6",
    lg: "size-8",
    xl: "size-10",
  };

  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center bg-primary text-primary-foreground shadow-lift",
        sizes[size],
        className,
      )}
    >
      <span
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-40"
        style={{
          background:
            "radial-gradient(80% 80% at 30% 20%, oklch(1 0 0 / 22%) 0%, transparent 55%)",
        }}
      />
      <AgilaEagle className={cn(icon[size], markClassName)} />
    </span>
  );
}
