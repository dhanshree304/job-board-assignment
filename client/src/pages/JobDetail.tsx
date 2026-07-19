import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Bookmark, Building2, CheckCircle2, Clock, MapPin, Users } from "lucide-react";
import { getJob } from "@/api/jobs";
import { myApplications } from "@/api/applications";
import { useAuthStore } from "@/store/authStore";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ApplyModal } from "@/components/applications/ApplyModal";
import { formatRelativeDate, formatSalary, JOB_TYPE_LABELS, WORK_MODE_LABELS } from "@/utils/format";
import { cn } from "@/utils/cn";

export default function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [applyOpen, setApplyOpen] = useState(false);
  const { savedJobIds, toggleSave, isEnabled: canSave } = useSavedJobs();

  const {
    data: job,
    isLoading,
    isError,
  } = useQuery({ queryKey: ["job", id], queryFn: () => getJob(id as string), enabled: !!id });

  const { data: applications = [] } = useQuery({
    queryKey: ["my-applications"],
    queryFn: myApplications,
    enabled: user?.role === "jobseeker",
  });

  if (isLoading) return <Spinner />;

  if (isError || !job) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState title="Job not found" description="This posting may have been removed." action={<Button onClick={() => navigate("/")}>Back to listings</Button>} />
      </div>
    );
  }

  const isOwner = user?.role === "employer" && (typeof job.employer === "string" ? job.employer : job.employer._id) === user.id;
  const existingApplication = applications.find((a) => (typeof a.job === "string" ? a.job : a.job._id) === job._id);
  const salary = formatSalary(job);
  const isSaved = savedJobIds.has(job._id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Card className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{job.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Building2 className="h-4 w-4" /> {job.companyName}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {job.location}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> Posted {formatRelativeDate(job.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" /> {job.applicantsCount} applicant{job.applicantsCount === 1 ? "" : "s"}
              </span>
            </div>
          </div>
          {canSave && (
            <button
              onClick={() => toggleSave(job)}
              aria-label={isSaved ? "Remove from saved jobs" : "Save job"}
              className={cn(
                "flex-shrink-0 rounded-lg p-2.5 transition-colors focus-ring",
                isSaved ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10" : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              <Bookmark className={cn("h-5 w-5", isSaved && "fill-current")} />
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge tone="brand">{JOB_TYPE_LABELS[job.type]}</Badge>
          <Badge tone="neutral">{WORK_MODE_LABELS[job.workMode]}</Badge>
          {salary && <Badge tone="green">{salary}</Badge>}
          {job.status === "closed" && <Badge tone="red">Closed to applications</Badge>}
          {job.tags.map((tag) => (
            <Badge key={tag} tone="slate">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800">
          <h2 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">About this role</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">{job.description}</p>
        </div>

        {job.requirements.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-slate-900 dark:text-white">Requirements</h2>
            <ul className="list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-300">
              {job.requirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 border-t border-slate-100 pt-6 dark:border-slate-800">
          {isOwner ? (
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => navigate(`/employer/jobs/${job._id}/applicants`)}>
                <Users className="h-4 w-4" /> View applicants ({job.applicantsCount})
              </Button>
              <Button variant="outline" onClick={() => navigate(`/employer/jobs/${job._id}/edit`)}>
                Edit job
              </Button>
            </div>
          ) : user?.role === "employer" ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Only job seekers can apply to postings.</p>
          ) : existingApplication ? (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" /> You applied to this job — status: {existingApplication.status}
            </div>
          ) : job.status === "closed" ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">This job is no longer accepting applications.</p>
          ) : user ? (
            <Button onClick={() => setApplyOpen(true)}>Apply now</Button>
          ) : (
            <Button onClick={() => navigate("/login", { state: { from: `/jobs/${job._id}` } })}>Log in to apply</Button>
          )}
        </div>
      </Card>

      <p className="mt-4 text-center text-sm">
        <Link to="/" className="text-slate-500 hover:text-brand-600 dark:text-slate-400">
          ← Back to all jobs
        </Link>
      </p>

      {user?.role === "jobseeker" && <ApplyModal job={job} open={applyOpen} onClose={() => setApplyOpen(false)} />}
    </div>
  );
}
