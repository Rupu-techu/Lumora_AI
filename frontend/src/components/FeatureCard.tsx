import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient?: string;
  className?: string;
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient = "from-purple-500 to-blue-500",
  className,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        "glass-card rounded-2xl p-6 group hover:border-purple-500/40 transition-all duration-300 hover:-translate-y-1",
        className
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br",
          gradient
        )}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>

      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
