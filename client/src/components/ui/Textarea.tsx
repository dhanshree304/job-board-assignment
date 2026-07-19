import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/utils/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus-ring dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
            error && "border-red-400 focus-visible:ring-red-500",
            className
          )}
          aria-invalid={!!error}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
        {!error && hint && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
