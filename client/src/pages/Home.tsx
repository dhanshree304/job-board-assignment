import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchX } from "lucide-react";
import { listJobs } from "@/api/jobs";
import { JobFilters } from "@/types";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { JobCard } from "@/components/jobs/JobCard";
import { JobFiltersBar } from "@/components/jobs/JobFiltersBar";
import { JobCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";

export default function Home() {
  const [filters, setFilters] = useState<JobFilters>({ page: 1, limit: 12 });
  const debouncedFilters = useDebouncedValue(filters, 350);
  const { savedJobIds, toggleSave, isEnabled: canSave } = useSavedJobs();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["jobs", debouncedFilters],
    queryFn: () => listJobs(debouncedFilters),
    placeholderData: (prev) => prev,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Find your next role</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          {data ? `${data.pagination.total} open position${data.pagination.total === 1 ? "" : "s"}` : "Searching open roles"}
        </p>
      </div>

      <JobFiltersBar filters={filters} onChange={setFilters} />

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}

        {!isLoading && isError && (
          <div className="col-span-full">
            <EmptyState title="Couldn't load jobs" description="Something went wrong reaching the server. Please try again shortly." />
          </div>
        )}

        {!isLoading &&
          !isError &&
          data?.jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              showSaveButton={canSave}
              isSaved={savedJobIds.has(job._id)}
              onToggleSave={toggleSave}
            />
          ))}

        {!isLoading && !isError && data?.jobs.length === 0 && (
          <div className="col-span-full">
            <EmptyState
              icon={<SearchX className="h-10 w-10" />}
              title="No jobs match your filters"
              description="Try broadening your search or clearing some filters."
            />
          </div>
        )}
      </div>

      {data && (
        <Pagination
          page={data.pagination.page}
          totalPages={data.pagination.totalPages}
          onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
        />
      )}
    </div>
  );
}
