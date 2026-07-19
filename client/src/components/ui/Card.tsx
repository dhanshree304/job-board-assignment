import { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900",
        className
      )}
      {...props}
    />
  );
}
