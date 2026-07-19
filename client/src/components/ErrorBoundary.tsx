import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("Unhandled UI error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500" />
          <h1 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">Something went wrong</h1>
          <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            An unexpected error occurred. Reloading the page usually fixes this.
          </p>
          <Button className="mt-6" onClick={() => window.location.assign("/")}>
            Reload app
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
