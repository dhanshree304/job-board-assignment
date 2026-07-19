import { Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { JobCard } from "@/components/jobs/JobCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { QueryError } from "@/components/ui/QueryError";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";

export default function SavedJobs() {
  const navigate = useNavigate();
  const { savedJobs, savedJobIds, toggleSave, isLoading, isError, refetch } = useSavedJobs();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Saved jobs</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Roles you've bookmarked to review later.</p>

      <div className="mt-8">
        {isLoading && <Spinner />}

        {!isLoading && isError && <QueryError onRetry={() => refetch()} />}

        {!isLoading && !isError && savedJobs.length === 0 && (
          <EmptyState
            icon={<Bookmark className="h-10 w-10" />}
            title="No saved jobs yet"
            description="Tap the bookmark icon on any job listing to save it here."
            action={<Button onClick={() => navigate("/")}>Browse jobs</Button>}
          />
        )}

        {!isLoading && !isError && savedJobs.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savedJobs.map((entry) => (
              <JobCard
                key={entry.id}
                job={entry.job}
                showSaveButton
                isSaved={savedJobIds.has(entry.job._id)}
                onToggleSave={toggleSave}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
