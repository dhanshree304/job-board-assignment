import { api } from "./client";
import { Application, ApplicationStatus, SavedJobEntry } from "@/types";

export async function applyToJob(jobId: string, coverNote: string, resume: File): Promise<Application> {
  const formData = new FormData();
  if (coverNote) formData.append("coverNote", coverNote);
  formData.append("resume", resume);

  const { data } = await api.post<{ application: Application }>(`/jobs/${jobId}/apply`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.application;
}

export async function myApplications(): Promise<Application[]> {
  const { data } = await api.get<{ applications: Application[] }>("/applications/mine");
  return data.applications;
}

export async function jobApplicants(jobId: string): Promise<Application[]> {
  const { data } = await api.get<{ applications: Application[] }>(`/jobs/${jobId}/applicants`);
  return data.applications;
}

export async function updateApplicationStatus(applicationId: string, status: ApplicationStatus): Promise<Application> {
  const { data } = await api.patch<{ application: Application }>(`/applications/${applicationId}/status`, { status });
  return data.application;
}

export async function openResume(applicationId: string, filename: string): Promise<void> {
  const { data, headers } = await api.get(`/applications/${applicationId}/resume`, { responseType: "blob" });
  const contentType = typeof headers["content-type"] === "string" ? headers["content-type"] : "application/pdf";
  const blob = new Blob([data], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

export async function mySavedJobs(): Promise<SavedJobEntry[]> {
  const { data } = await api.get<{ savedJobs: SavedJobEntry[] }>("/saved-jobs");
  return data.savedJobs;
}
