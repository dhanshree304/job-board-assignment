import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      errors: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err && typeof err === "object" && "code" in err && (err as { code: unknown }).code === 11000) {
    return res.status(409).json({ message: "A record with these details already exists" });
  }

  const message = err instanceof Error ? err.message : "Internal server error";
  if (env.nodeEnv !== "test") {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  res.status(500).json({ message: env.nodeEnv === "production" ? "Internal server error" : message });
}
