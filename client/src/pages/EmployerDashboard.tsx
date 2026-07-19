import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Briefcase, Pencil, Plus, Trash2, Users } from "lucide-react";
import { deleteJob, myJobs, updateJob } from "@/api/jobs";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { QueryError } from "@/components/ui/QueryError";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatRelativeDate, JOB_TYPE_LABELS } from "@/utils/format";
import { Job } from "@/types";

export default function EmployerDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);

  const {
    data: jobs,
    isLoading,
    isError,
    refetch,
  } = useQuery({ queryKey: ["my-jobs"], queryFn: myJobs });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteJob(id),
    onSuccess: () => {
      toast.success("Job posting deleted");
      queryClient.invalidateQueries({ queryKey: ["my-jobs"] });
      setJobToDelete(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "open" | "closed" }) => updateJob(id, { status }),
    onSuccess: () => {
      toast.success("Job status updated");
      queryClient.invalidateQueries({ queryKey: ["my-jobs"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Your job postings</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage listings and review applicants.</p>
        </div>
        <Button onClick={() => navigate("/employer/jobs/new")}>
          <Plus className="h-4 w-4" /> Post a job
        </Button>
      </div>

      <div className="mt-8">
        {isLoading && <Spinner />}

        {!isLoading && isError && <QueryError onRetry={() => refetch()} />}

        {!isLoading && !isError && jobs?.length === 0 && (
          <EmptyState
            icon={<Briefcase className="h-10 w-10" />}
            title="No job postings yet"
            description="Create your first listing to start receiving applicants."
            action={<Button onClick={() => navigate("/employer/jobs/new")}>Post a job</Button>}
          />
        )}

        {!isLoading && !isError && jobs && jobs.length > 0 && (
          <div className="space-y-3">
            {jobs.map((job) => (
              <Card key={job._id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => navigate(`/jobs/${job._id}`)} className="font-medium text-slate-900 hover:text-brand-600 dark:text-white">
                      {job.title}
                    </button>
                    <Badge tone={job.status === "open" ? "green" : "slate"}>{job.status === "open" ? "Open" : "Closed"}</Badge>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {JOB_TYPE_LABELS[job.type]} · {job.location} · Posted {formatRelativeDate(job.createdAt)} · {job.applicantsCount} applicant
                    {job.applicantsCount === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/employer/jobs/${job._id}/applicants`)}>
                    <Users className="h-3.5 w-3.5" /> Applicants
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/employer/jobs/${job._id}/edit`)}>
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => statusMutation.mutate({ id: job._id, status: job.status === "open" ? "closed" : "open" })}
                  >
                    {job.status === "open" ? "Close" : "Reopen"}
                  </Button>
                  <button
                    onClick={() => setJobToDelete(job)}
                    aria-label="Delete job"
                    className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 focus-ring dark:hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!jobToDelete}
        title="Delete job posting"
        description={`Delete "${jobToDelete?.title}"? This will permanently remove the listing and all of its applications.`}
        confirmLabel="Delete"
        isLoading={deleteMutation.isPending}
        onConfirm={() => jobToDelete && deleteMutation.mutate(jobToDelete._id)}
        onCancel={() => setJobToDelete(null)}
      />
    </div>
  );
}
