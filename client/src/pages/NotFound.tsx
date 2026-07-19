import { useNavigate } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col items-center justify-center px-4 text-center">
      <Compass className="h-12 w-12 text-slate-300 dark:text-slate-700" />
      <h1 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">404</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">We couldn't find the page you're looking for.</p>
      <Button className="mt-6" onClick={() => navigate("/")}>
        Back to home
      </Button>
    </div>
  );
}
