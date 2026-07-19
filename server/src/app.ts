import express, { Application as ExpressApp } from "express";
import cors from "cors";
import { env } from "./config/env";
import authRoutes from "./routes/authRoutes";
import jobRoutes from "./routes/jobRoutes";
import applicationRoutes from "./routes/applicationRoutes";
import savedJobRoutes from "./routes/savedJobRoutes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

export function createApp(): ExpressApp {
  const app = express();

  app.use(
    cors({
      origin: env.clientOrigins,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

  app.use("/api/auth", authRoutes);
  app.use("/api/jobs", jobRoutes);
  app.use("/api/applications", applicationRoutes);
  app.use("/api/saved-jobs", savedJobRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
