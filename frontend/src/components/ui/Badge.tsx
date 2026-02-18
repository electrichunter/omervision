import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "secondary";
}

export function Badge({ 
  children, 
  className,
  variant = "default" 
}: BadgeProps) {
  const variants = {
    default: "bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]",
    outline: "border border-[var(--color-border)] text-[var(--color-text-muted)]",
    secondary: "bg-[var(--color-accent-blue)]/10 text-[var(--color-accent-blue)]",
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
