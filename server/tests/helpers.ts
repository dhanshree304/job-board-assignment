import request from "supertest";
import { createApp } from "../src/app";

export const app = createApp();

export async function registerAndLogin(
  overrides: Partial<{
    name: string;
    email: string;
    password: string;
    role: "employer" | "jobseeker";
  }> = {},
) {
  const payload = {
    name: overrides.name ?? "Test User",
    email:
      overrides.email ??
      `user-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
    password: overrides.password ?? "password@123",
    role: overrides.role ?? "jobseeker",
  };
  const res = await request(app).post("/api/auth/register").send(payload);
  return { token: res.body.token as string, user: res.body.user, res };
}
