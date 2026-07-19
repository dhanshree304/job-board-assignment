import { NextFunction, Request, Response } from "express";
import { uploadResume } from "./upload";
import { BadRequestError } from "../utils/AppError";

export function handleResumeUpload(req: Request, _res: Response, next: NextFunction) {
  uploadResume(req, _res, (err: unknown) => {
    if (err) return next(new BadRequestError(err instanceof Error ? err.message : "Upload failed"));
    next();
  });
}
