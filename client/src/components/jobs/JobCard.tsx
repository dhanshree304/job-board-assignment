import { Link } from "react-router-dom";
import { Bookmark, Building2, Clock, MapPin } from "lucide-react";
import { Job } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatRelativeDate, formatSalary, JOB_TYPE_LABELS, WORK_MODE_LABELS } from "@/utils/format";
import { cn } from "@/utils/cn";

interface JobCardProps {
  job: Job;
  isSaved?: boolean;
  onToggleSave?: (job: Job) => void;
  showSaveButton?: boolean;
}

export function JobCard({ job, isSaved, onToggleSave, showSaveButton }: JobCardProps) {
  const salary = formatSalary(job);

  return (
    <Card className="group relative p-5 transition-shadow hover:shadow-md">
      {showSaveButton && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleSave?.(job);
          }}
          aria-label={isSaved ? "Remove from saved jobs" : "Save job"}
          className={cn(
            "absolute right-4 top-4 rounded-lg p-2 transition-colors focus-ring",
            isSaved
              ? "text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-500/10"
              : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <Bookmark className={cn("h-5 w-5", isSaved && "fill-current")} />
        </button>
      )}

      <Link to={`/jobs/${job._id}`} className="block pr-10">
        <h3 className="text-base font-semibold text-slate-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
          {job.title}
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5" /> {job.companyName}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {job.location}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {formatRelativeDate(job.createdAt)}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge tone="brand">{JOB_TYPE_LABELS[job.type]}</Badge>
          <Badge tone="neutral">{WORK_MODE_LABELS[job.workMode]}</Badge>
          {salary && <Badge tone="green">{salary}</Badge>}
          {job.status === "closed" && <Badge tone="red">Closed</Badge>}
        </div>

        <p className="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{job.description}</p>
      </Link>
    </Card>
  );
}
