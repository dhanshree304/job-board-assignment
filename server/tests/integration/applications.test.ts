import request from "supertest";
import path from "path";
import fs from "fs";
import os from "os";
import { app, registerAndLogin } from "../helpers";

function makeFakeResume(): string {
  const filePath = path.join(os.tmpdir(), `resume-${Date.now()}.pdf`);
  fs.writeFileSync(filePath, "%PDF-1.4 fake resume content for tests");
  return filePath;
}

async function createJob(employerToken: string) {
  const res = await request(app)
    .post("/api/jobs")
    .set("Authorization", `Bearer ${employerToken}`)
    .send({
      title: "QA Engineer",
      companyName: "Acme Corp",
      location: "Remote",
      type: "full-time",
      workMode: "remote",
      description: "Own quality across our platform, from automated tests to release processes.",
    });
  return res.body.job._id as string;
}

describe("Applications", () => {
  it("lets a jobseeker apply with a resume and prevents duplicate applications", async () => {
    const { token: employerToken } = await registerAndLogin({ role: "employer", email: "emp-app@example.com" });
    const { token: seekerToken } = await registerAndLogin({ role: "jobseeker", email: "seeker-app@example.com" });
    const jobId = await createJob(employerToken);
    const resumePath = makeFakeResume();

    const first = await request(app)
      .post(`/api/jobs/${jobId}/apply`)
      .set("Authorization", `Bearer ${seekerToken}`)
      .field("coverNote", "I would love to join your team.")
      .attach("resume", resumePath, { contentType: "application/pdf" });

    expect(first.status).toBe(201);
    expect(first.body.application.status).toBe("applied");

    const duplicate = await request(app)
      .post(`/api/jobs/${jobId}/apply`)
      .set("Authorization", `Bearer ${seekerToken}`)
      .field("coverNote", "Again please")
      .attach("resume", resumePath, { contentType: "application/pdf" });

    expect(duplicate.status).toBe(409);
    fs.unlinkSync(resumePath);
  });

  it("rejects applying without a resume file", async () => {
    const { token: employerToken } = await registerAndLogin({ role: "employer", email: "emp-app2@example.com" });
    const { token: seekerToken } = await registerAndLogin({ role: "jobseeker", email: "seeker-app2@example.com" });
    const jobId = await createJob(employerToken);

    const res = await request(app)
      .post(`/api/jobs/${jobId}/apply`)
      .set("Authorization", `Bearer ${seekerToken}`)
      .field("coverNote", "No resume attached");

    expect(res.status).toBe(400);
  });

  it("lets the owning employer see applicants and update status, but not other employers", async () => {
    const { token: employerToken } = await registerAndLogin({ role: "employer", email: "emp-app3@example.com" });
    const { token: otherEmployerToken } = await registerAndLogin({ role: "employer", email: "emp-app4@example.com" });
    const { token: seekerToken } = await registerAndLogin({ role: "jobseeker", email: "seeker-app3@example.com" });
    const jobId = await createJob(employerToken);
    const resumePath = makeFakeResume();

    const applied = await request(app)
      .post(`/api/jobs/${jobId}/apply`)
      .set("Authorization", `Bearer ${seekerToken}`)
      .attach("resume", resumePath, { contentType: "application/pdf" });
    const applicationId = applied.body.application.id;

    const forbiddenList = await request(app)
      .get(`/api/jobs/${jobId}/applicants`)
      .set("Authorization", `Bearer ${otherEmployerToken}`);
    expect(forbiddenList.status).toBe(403);

    const list = await request(app).get(`/api/jobs/${jobId}/applicants`).set("Authorization", `Bearer ${employerToken}`);
    expect(list.status).toBe(200);
    expect(list.body.applications).toHaveLength(1);

    const forbiddenUpdate = await request(app)
      .patch(`/api/applications/${applicationId}/status`)
      .set("Authorization", `Bearer ${otherEmployerToken}`)
      .send({ status: "rejected" });
    expect(forbiddenUpdate.status).toBe(403);

    const update = await request(app)
      .patch(`/api/applications/${applicationId}/status`)
      .set("Authorization", `Bearer ${employerToken}`)
      .send({ status: "shortlisted" });
    expect(update.status).toBe(200);
    expect(update.body.application.status).toBe("shortlisted");

    fs.unlinkSync(resumePath);
  });

  it("lists a jobseeker's own applications", async () => {
    const { token: employerToken } = await registerAndLogin({ role: "employer", email: "emp-app5@example.com" });
    const { token: seekerToken } = await registerAndLogin({ role: "jobseeker", email: "seeker-app5@example.com" });
    const jobId = await createJob(employerToken);
    const resumePath = makeFakeResume();

    await request(app)
      .post(`/api/jobs/${jobId}/apply`)
      .set("Authorization", `Bearer ${seekerToken}`)
      .attach("resume", resumePath, { contentType: "application/pdf" });

    const res = await request(app).get("/api/applications/mine").set("Authorization", `Bearer ${seekerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.applications).toHaveLength(1);

    fs.unlinkSync(resumePath);
  });
});
