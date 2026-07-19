import { AlertTriangle } from "lucide-react";
import { EmptyState } from "./EmptyState";
import { Button } from "./Button";

export function QueryError({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon={<AlertTriangle className="h-10 w-10" />}
      title="Something went wrong"
      description="We couldn't load this data. Check your connection and try again."
      action={onRetry ? <Button onClick={onRetry}>Try again</Button> : undefined}
    />
  );
}
