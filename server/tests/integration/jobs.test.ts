import request from "supertest";
import { app, registerAndLogin } from "../helpers";

async function createSampleJob(token: string, overrides: Record<string, unknown> = {}) {
  return request(app)
    .post("/api/jobs")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Software Engineer",
      companyName: "Acme Corp",
      location: "Remote",
      type: "full-time",
      workMode: "remote",
      description: "Build great software with a small, focused team of engineers who care about quality.",
      requirements: ["3+ years experience"],
      tags: ["node", "react"],
      ...overrides,
    });
}

describe("Jobs", () => {
  it("allows an employer to create a job and rejects jobseekers from doing so", async () => {
    const { token: employerToken } = await registerAndLogin({ role: "employer", email: "emp1@example.com" });
    const created = await createSampleJob(employerToken);
    expect(created.status).toBe(201);
    expect(created.body.job.title).toBe("Software Engineer");

    const { token: seekerToken } = await registerAndLogin({ role: "jobseeker", email: "seeker1@example.com" });
    const rejected = await createSampleJob(seekerToken);
    expect(rejected.status).toBe(403);
  });

  it("lists open jobs publicly with pagination", async () => {
    const { token: employerToken } = await registerAndLogin({ role: "employer", email: "emp2@example.com" });
    await createSampleJob(employerToken, { title: "Job A" });
    await createSampleJob(employerToken, { title: "Job B" });

    const res = await request(app).get("/api/jobs?page=1&limit=1");
    expect(res.status).toBe(200);
    expect(res.body.jobs).toHaveLength(1);
    expect(res.body.pagination.total).toBe(2);
    expect(res.body.pagination.totalPages).toBe(2);
  });

  it("filters jobs by type and workMode", async () => {
    const { token: employerToken } = await registerAndLogin({ role: "employer", email: "emp3@example.com" });
    await createSampleJob(employerToken, { title: "Remote Job", workMode: "remote", type: "full-time" });
    await createSampleJob(employerToken, { title: "Onsite Job", workMode: "onsite", type: "contract" });

    const res = await request(app).get("/api/jobs?workMode=onsite");
    expect(res.status).toBe(200);
    expect(res.body.jobs).toHaveLength(1);
    expect(res.body.jobs[0].title).toBe("Onsite Job");
  });

  it("only lets the owning employer update or delete a job", async () => {
    const { token: ownerToken } = await registerAndLogin({ role: "employer", email: "owner@example.com" });
    const { token: otherToken } = await registerAndLogin({ role: "employer", email: "other@example.com" });

    const created = await createSampleJob(ownerToken);
    const jobId = created.body.job._id;

    const otherUpdate = await request(app)
      .patch(`/api/jobs/${jobId}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ title: "Hijacked title" });
    expect(otherUpdate.status).toBe(403);

    const ownerUpdate = await request(app)
      .patch(`/api/jobs/${jobId}`)
      .set("Authorization", `Bearer ${ownerToken}`)
      .send({ title: "Updated title" });
    expect(ownerUpdate.status).toBe(200);
    expect(ownerUpdate.body.job.title).toBe("Updated title");

    const otherDelete = await request(app).delete(`/api/jobs/${jobId}`).set("Authorization", `Bearer ${otherToken}`);
    expect(otherDelete.status).toBe(403);

    const ownerDelete = await request(app).delete(`/api/jobs/${jobId}`).set("Authorization", `Bearer ${ownerToken}`);
    expect(ownerDelete.status).toBe(204);
  });

  it("returns 404 for a job that does not exist", async () => {
    const res = await request(app).get("/api/jobs/000000000000000000000000");
    expect(res.status).toBe(404);
  });
});
