import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "purple" | "blue" | "green" | "red" | "default";
  className?: string;
}

const variantClasses = {
  purple: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  blue: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  green: "bg-green-500/15 text-green-300 border-green-500/30",
  red: "bg-red-500/15 text-red-300 border-red-500/30",
  default: "bg-white/5 text-slate-300 border-white/10",
};

export default function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
