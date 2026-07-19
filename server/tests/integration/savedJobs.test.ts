import request from "supertest";
import { app, registerAndLogin } from "../helpers";

describe("Saved jobs", () => {
  it("toggles saving and unsaving a job for a jobseeker", async () => {
    const { token: employerToken } = await registerAndLogin({ role: "employer", email: "emp-save@example.com" });
    const { token: seekerToken } = await registerAndLogin({ role: "jobseeker", email: "seeker-save@example.com" });

    const job = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${employerToken}`)
      .send({
        title: "Data Analyst",
        companyName: "Acme Corp",
        location: "Remote",
        type: "full-time",
        workMode: "remote",
        description: "Analyze product data and present insights to stakeholders across the company.",
      });
    const jobId = job.body.job._id;

    const save = await request(app).post(`/api/jobs/${jobId}/save`).set("Authorization", `Bearer ${seekerToken}`);
    expect(save.status).toBe(200);
    expect(save.body.saved).toBe(true);

    const list = await request(app).get("/api/saved-jobs").set("Authorization", `Bearer ${seekerToken}`);
    expect(list.status).toBe(200);
    expect(list.body.savedJobs).toHaveLength(1);

    const unsave = await request(app).post(`/api/jobs/${jobId}/save`).set("Authorization", `Bearer ${seekerToken}`);
    expect(unsave.status).toBe(200);
    expect(unsave.body.saved).toBe(false);

    const listAfter = await request(app).get("/api/saved-jobs").set("Authorization", `Bearer ${seekerToken}`);
    expect(listAfter.body.savedJobs).toHaveLength(0);
  });

  it("rejects an employer trying to save a job", async () => {
    const { token: employerToken } = await registerAndLogin({ role: "employer", email: "emp-save2@example.com" });
    const job = await request(app)
      .post("/api/jobs")
      .set("Authorization", `Bearer ${employerToken}`)
      .send({
        title: "Recruiter",
        companyName: "Acme Corp",
        location: "Remote",
        type: "full-time",
        workMode: "remote",
        description: "Own recruiting pipelines end to end for engineering roles at Acme.",
      });
    const jobId = job.body.job._id;

    const res = await request(app).post(`/api/jobs/${jobId}/save`).set("Authorization", `Bearer ${employerToken}`);
    expect(res.status).toBe(403);
  });
});
