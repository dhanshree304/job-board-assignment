import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Download, FileText, Inbox } from "lucide-react";
import { myApplications, openResume } from "@/api/applications";
import { Card } from "@/components/ui/Card";
import { Badge, APPLICATION_STATUS_TONE } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { QueryError } from "@/components/ui/QueryError";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { formatRelativeDate, APPLICATION_STATUS_LABELS } from "@/utils/format";
import { Job } from "@/types";

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    data: applications,
    isLoading,
    isError,
    refetch,
  } = useQuery({ queryKey: ["my-applications"], queryFn: myApplications });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My applications</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track the status of every job you've applied to.</p>

      <div className="mt-8">
        {isLoading && <Spinner />}

        {!isLoading && isError && <QueryError onRetry={() => refetch()} />}

        {!isLoading && !isError && applications?.length === 0 && (
          <EmptyState
            icon={<Inbox className="h-10 w-10" />}
            title="No applications yet"
            description="Browse open roles and apply to start tracking them here."
            action={<Button onClick={() => navigate("/")}>Browse jobs</Button>}
          />
        )}

        {!isLoading && !isError && applications && applications.length > 0 && (
          <div className="space-y-3">
            {applications.map((app) => {
              const job = app.job as Job;
              return (
                <Card key={app.id} className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
                  <div>
                    <Link to={`/jobs/${job._id}`} className="font-medium text-slate-900 hover:text-brand-600 dark:text-white">
                      {job.title}
                    </Link>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {job.companyName} · {job.location} · Applied {formatRelativeDate(app.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={APPLICATION_STATUS_TONE[app.status]}>{APPLICATION_STATUS_LABELS[app.status]}</Badge>
                    <button
                      onClick={() => openResume(app.id, app.resume.filename).catch((e) => toast.error(e.message))}
                      className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 focus-ring dark:text-slate-400 dark:hover:bg-slate-800"
                      title="View submitted resume"
                    >
                      <FileText className="h-4 w-4" /> Resume <Download className="h-3 w-3" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
