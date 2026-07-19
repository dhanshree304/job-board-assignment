import { api } from "./client";
import { User } from "@/types";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: "employer" | "jobseeker";
  company?: { name?: string; website?: string };
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export async function registerRequest(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/register", payload);
  return data;
}

export async function loginRequest(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  return data;
}

export async function fetchMe(): Promise<User> {
  const { data } = await api.get<{ user: User }>("/auth/me");
  return data.user;
}

export async function updateProfile(payload: Partial<User>): Promise<User> {
  const { data } = await api.patch<{ user: User }>("/auth/me", payload);
  return data.user;
}
