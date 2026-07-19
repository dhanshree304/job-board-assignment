import { Request, Response } from "express";
import { SavedJob } from "../models/SavedJob";
import { Job } from "../models/Job";
import { catchAsync } from "../utils/catchAsync";
import { NotFoundError } from "../utils/AppError";

export const toggleSaveJob = catchAsync(async (req: Request, res: Response) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new NotFoundError("Job not found");

  const existing = await SavedJob.findOne({ user: req.user!.id, job: job._id });
  if (existing) {
    await existing.deleteOne();
    return res.json({ saved: false });
  }

  await SavedJob.create({ user: req.user!.id, job: job._id });
  res.json({ saved: true });
});

export const mySavedJobs = catchAsync(async (req: Request, res: Response) => {
  const saved = await SavedJob.find({ user: req.user!.id }).populate("job").sort({ createdAt: -1 });
  res.json({ savedJobs: saved.filter((s) => s.job).map((s) => ({ id: s._id.toString(), job: s.job, savedAt: s.createdAt })) });
});
