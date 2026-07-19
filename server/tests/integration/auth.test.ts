import request from "supertest";
import { app, registerAndLogin } from "../helpers";

describe("Auth", () => {
  it("registers a new user and returns a token", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Ada Lovelace",
      email: "ada@example.com",
      password: "password@123",
      role: "jobseeker",
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe("ada@example.com");
    expect(res.body.user.password).toBeUndefined();
  });

  it("rejects duplicate email registration", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Ada",
      email: "dup@example.com",
      password: "password@123",
      role: "jobseeker",
    });

    const res = await request(app).post("/api/auth/register").send({
      name: "Ada 2",
      email: "dup@example.com",
      password: "password@123",
      role: "jobseeker",
    });

    expect(res.status).toBe(409);
  });

  it("rejects registration with an invalid payload", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "A",
      email: "not-an-email",
      password: "short",
      role: "jobseeker",
    });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it("logs in with correct credentials and rejects incorrect ones", async () => {
    await request(app).post("/api/auth/register").send({
      name: "Grace Hopper",
      email: "grace@example.com",
      password: "password@123",
      role: "employer",
    });

    const good = await request(app)
      .post("/api/auth/login")
      .send({ email: "grace@example.com", password: "password@123" });
    expect(good.status).toBe(200);
    expect(good.body.token).toBeDefined();

    const bad = await request(app)
      .post("/api/auth/login")
      .send({ email: "grace@example.com", password: "wrongpass" });
    expect(bad.status).toBe(401);
  });

  it("returns the current user for /me with a valid token, and 401 without one", async () => {
    const { token } = await registerAndLogin({ email: "me@example.com" });

    const withToken = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(withToken.status).toBe(200);
    expect(withToken.body.user.email).toBe("me@example.com");

    const withoutToken = await request(app).get("/api/auth/me");
    expect(withoutToken.status).toBe(401);
  });
});
