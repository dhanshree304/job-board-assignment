export type UserRole = "employer" | "jobseeker";
export type JobType = "full-time" | "part-time" | "contract" | "internship";
export type WorkMode = "remote" | "hybrid" | "onsite";
export type JobStatus = "open" | "closed";
export type ApplicationStatus = "applied" | "reviewed" | "shortlisted" | "rejected" | "hired";

export interface Company {
  name?: string;
  website?: string;
  about?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  headline?: string;
  skills?: string[];
  location?: string;
  company?: Company;
  createdAt?: string;
}

export interface Job {
  _id: string;
  employer: string | { _id: string; name: string; company?: Company };
  title: string;
  companyName: string;
  location: string;
  type: JobType;
  workMode: WorkMode;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  description: string;
  requirements: string[];
  tags: string[];
  status: JobStatus;
  applicantsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Applicant {
  _id: string;
  name: string;
  email: string;
  headline?: string;
  skills?: string[];
  location?: string;
}

export interface Application {
  id: string;
  job: string | Pick<Job, "_id" | "title" | "companyName" | "location" | "type" | "workMode" | "status">;
  applicant?: string | Applicant;
  status: ApplicationStatus;
  coverNote?: string;
  resume: { filename: string; contentType: string; size: number };
  createdAt: string;
}

export interface SavedJobEntry {
  id: string;
  job: Job;
  savedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface JobFilters {
  q?: string;
  location?: string;
  type?: JobType;
  workMode?: WorkMode;
  tag?: string;
  salaryMin?: number;
  page?: number;
  limit?: number;
}

export const APPLICATION_STATUSES: ApplicationStatus[] = ["applied", "reviewed", "shortlisted", "rejected", "hired"];
export const JOB_TYPES: JobType[] = ["full-time", "part-time", "contract", "internship"];
export const WORK_MODES: WorkMode[] = ["remote", "hybrid", "onsite"];
