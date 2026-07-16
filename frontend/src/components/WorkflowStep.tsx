import { cn } from "@/lib/utils";

interface StepProps {
  step: number;
  title: string;
  description: string;
  isLast?: boolean;
}

export default function WorkflowStep({
  step,
  title,
  description,
  isLast = false,
}: StepProps) {
  return (
    <div className="relative flex gap-6">
      {/* Line connector */}
      {!isLast && (
        <div className="absolute left-5 top-12 w-0.5 h-full bg-gradient-to-b from-purple-500/50 to-transparent" />
      )}

      {/* Step number */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white z-10"
        style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>
        {step}
      </div>

      {/* Content */}
      <div className="pb-10">
        <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed max-w-md">
          {description}
        </p>
      </div>
    </div>
  );
}
