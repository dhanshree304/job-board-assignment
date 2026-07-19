import { Request, Response } from "express";
import { FilterQuery } from "mongoose";
import { Job, IJob } from "../models/Job";
import { Application } from "../models/Application";
import { catchAsync } from "../utils/catchAsync";
import { createJobSchema, listJobsQuerySchema, updateJobSchema } from "../validators/jobValidators";
import { ForbiddenError, NotFoundError } from "../utils/AppError";

export const listJobs = catchAsync(async (req: Request, res: Response) => {
  const query = listJobsQuerySchema.parse(req.query);
  const filter: FilterQuery<IJob> = { status: "open" };

  if (query.q) filter.$text = { $search: query.q };
  if (query.location) filter.location = new RegExp(query.location, "i");
  if (query.type) filter.type = query.type;
  if (query.workMode) filter.workMode = query.workMode;
  if (query.tag) filter.tags = query.tag.toLowerCase();
  if (query.salaryMin) filter.salaryMax = { $gte: query.salaryMin };

  const skip = (query.page - 1) * query.limit;
  const [jobs, total] = await Promise.all([
    Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(query.limit),
    Job.countDocuments(filter),
  ]);

  res.json({
    jobs,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    },
  });
});

export const getJob = catchAsync(async (req: Request, res: Response) => {
  const job = await Job.findById(req.params.id).populate("employer", "name company");
  if (!job) throw new NotFoundError("Job not found");
  res.json({ job });
});

export const myJobs = catchAsync(async (req: Request, res: Response) => {
  const jobs = await Job.find({ employer: req.user!.id }).sort({ createdAt: -1 });
  res.json({ jobs });
});

export const createJob = catchAsync(async (req: Request, res: Response) => {
  const input = createJobSchema.parse(req.body);
  const job = await Job.create({ ...input, employer: req.user!.id });
  res.status(201).json({ job });
});

async function findOwnedJob(jobId: string, employerId: string) {
  const job = await Job.findById(jobId);
  if (!job) throw new NotFoundError("Job not found");
  if (job.employer.toString() !== employerId) {
    throw new ForbiddenError("You do not own this job posting");
  }
  return job;
}

export const updateJob = catchAsync(async (req: Request, res: Response) => {
  const input = updateJobSchema.parse(req.body);
  const job = await findOwnedJob(req.params.id, req.user!.id);
  Object.assign(job, input);
  await job.save();
  res.json({ job });
});

export const deleteJob = catchAsync(async (req: Request, res: Response) => {
  const job = await findOwnedJob(req.params.id, req.user!.id);
  await Promise.all([job.deleteOne(), Application.deleteMany({ job: job._id })]);
  res.status(204).send();
});
