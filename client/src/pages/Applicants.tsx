import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ArrowLeft, Download, FileText, Mail, Users } from "lucide-react";
import { jobApplicants, openResume, updateApplicationStatus } from "@/api/applications";
import { getJob } from "@/api/jobs";
import { Card } from "@/components/ui/Card";
import { Badge, APPLICATION_STATUS_TONE } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { QueryError } from "@/components/ui/QueryError";
import { formatRelativeDate, APPLICATION_STATUS_LABELS } from "@/utils/format";
import { APPLICATION_STATUSES, ApplicationStatus, Applicant } from "@/types";

export default function Applicants() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: job } = useQuery({ queryKey: ["job", id], queryFn: () => getJob(id as string), enabled: !!id });
  const {
    data: applications,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["job-applicants", id],
    queryFn: () => jobApplicants(id as string),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: string; status: ApplicationStatus }) =>
      updateApplicationStatus(applicationId, status),
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries({ queryKey: ["job-applicants", id] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <button
        onClick={() => navigate("/employer")}
        className="mb-4 flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600 dark:text-slate-400"
      >
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </button>

      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Applicants{job ? ` for ${job.title}` : ""}</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Review candidates and update their application status.</p>

      <div className="mt-8">
        {isLoading && <Spinner />}

        {!isLoading && isError && <QueryError onRetry={() => refetch()} />}

        {!isLoading && !isError && applications?.length === 0 && (
          <EmptyState icon={<Users className="h-10 w-10" />} title="No applicants yet" description="Check back once candidates start applying." />
        )}

        {!isLoading && !isError && applications && applications.length > 0 && (
          <div className="space-y-3">
            {applications.map((app) => {
              const applicant = app.applicant as Applicant;
              return (
                <Card key={app.id} className="p-4">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-900 dark:text-white">{applicant?.name}</p>
                        <Badge tone={APPLICATION_STATUS_TONE[app.status]}>{APPLICATION_STATUS_LABELS[app.status]}</Badge>
                      </div>
                      <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                        <Mail className="h-3.5 w-3.5" /> {applicant?.email}
                      </p>
                      {applicant?.headline && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{applicant.headline}</p>}
                      {applicant?.skills && applicant.skills.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {applicant.skills.map((s) => (
                            <Badge key={s} tone="slate">
                              {s}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {app.coverNote && (
                        <p className="mt-2 max-w-xl whitespace-pre-line text-sm text-slate-600 dark:text-slate-300">{app.coverNote}</p>
                      )}
                      <p className="mt-2 text-xs text-slate-400">Applied {formatRelativeDate(app.createdAt)}</p>
                    </div>

                    <div className="flex flex-shrink-0 flex-col items-stretch gap-2 sm:items-end">
                      <button
                        onClick={() => openResume(app.id, app.resume.filename).catch((e) => toast.error(e.message))}
                        className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 focus-ring dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <FileText className="h-3.5 w-3.5" /> Resume <Download className="h-3 w-3" />
                      </button>
                      <Select
                        className="w-40"
                        value={app.status}
                        onChange={(e) => statusMutation.mutate({ applicationId: app.id, status: e.target.value as ApplicationStatus })}
                        aria-label="Update application status"
                      >
                        {APPLICATION_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {APPLICATION_STATUS_LABELS[s]}
                          </option>
                        ))}
                      </Select>
                    </div>
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
