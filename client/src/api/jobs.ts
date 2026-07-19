import { api } from "./client";
import { Job, JobFilters, Pagination } from "@/types";

export interface JobsResponse {
  jobs: Job[];
  pagination: Pagination;
}

export async function listJobs(filters: JobFilters): Promise<JobsResponse> {
  const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined && v !== ""));
  const { data } = await api.get<JobsResponse>("/jobs", { params });
  return data;
}

export async function getJob(id: string): Promise<Job> {
  const { data } = await api.get<{ job: Job }>(`/jobs/${id}`);
  return data.job;
}

export async function myJobs(): Promise<Job[]> {
  const { data } = await api.get<{ jobs: Job[] }>("/jobs/mine");
  return data.jobs;
}

export type JobFormInput = Pick<Job, "title" | "companyName" | "location" | "type" | "workMode" | "description"> &
  Partial<Pick<Job, "salaryMin" | "salaryMax" | "status" | "currency">> & {
    requirements?: string[];
    tags?: string[];
  };

export async function createJob(payload: JobFormInput): Promise<Job> {
  const { data } = await api.post<{ job: Job }>("/jobs", payload);
  return data.job;
}

export async function updateJob(id: string, payload: Partial<JobFormInput>): Promise<Job> {
  const { data } = await api.patch<{ job: Job }>(`/jobs/${id}`, payload);
  return data.job;
}

export async function deleteJob(id: string): Promise<void> {
  await api.delete(`/jobs/${id}`);
}

export async function toggleSaveJob(id: string): Promise<boolean> {
  const { data } = await api.post<{ saved: boolean }>(`/jobs/${id}/save`);
  return data.saved;
}
