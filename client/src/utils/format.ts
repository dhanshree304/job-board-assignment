import { Job } from "@/types";

export function formatSalary(job: Pick<Job, "salaryMin" | "salaryMax" | "currency">): string | null {
  if (!job.salaryMin && !job.salaryMax) return null;
  const fmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
  const currency = job.currency && job.currency !== "USD" ? `${job.currency} ` : "$";
  if (job.salaryMin && job.salaryMax) {
    return `${currency}${fmt.format(job.salaryMin)} – ${currency}${fmt.format(job.salaryMax)}`;
  }
  return `${currency}${fmt.format(job.salaryMin ?? job.salaryMax ?? 0)}+`;
}

export function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return date.toLocaleDateString();
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const JOB_TYPE_LABELS: Record<string, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
};

export const WORK_MODE_LABELS: Record<string, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  applied: "Applied",
  reviewed: "Reviewed",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
  hired: "Hired",
};
