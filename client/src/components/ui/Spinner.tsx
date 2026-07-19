import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

export function Spinner({ className }: { className?: string }) {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className={cn("h-6 w-6 animate-spin text-brand-600", className)} />
    </div>
  );
}
