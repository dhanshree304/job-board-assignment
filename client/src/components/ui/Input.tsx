import { InputHTMLAttributes, forwardRef, ReactNode } from "react";
import { cn } from "@/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-ring disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
              icon && "pl-9",
              error && "border-red-400 focus-visible:ring-red-500",
              className
            )}
            aria-invalid={!!error}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
        {!error && hint && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
