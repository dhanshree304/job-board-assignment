import { ReactNode } from "react";
import { cn } from "@/utils/cn";

type Tone = "neutral" | "brand" | "green" | "amber" | "red" | "slate";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  brand: "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300",
  green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
  red: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300",
  slate: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", toneClasses[tone], className)}>
      {children}
    </span>
  );
}

export const APPLICATION_STATUS_TONE: Record<string, Tone> = {
  applied: "brand",
  reviewed: "amber",
  shortlisted: "green",
  hired: "green",
  rejected: "red",
};
