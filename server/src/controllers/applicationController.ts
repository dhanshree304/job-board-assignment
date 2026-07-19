import { Request, Response } from "express";
import { Job } from "../models/Job";
import { Application } from "../models/Application";
import { catchAsync } from "../utils/catchAsync";
import { applySchema, updateApplicationStatusSchema } from "../validators/jobValidators";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../utils/AppError";

function toPublicApplication(app: InstanceType<typeof Application>, includeApplicant = false) {
  const base = {
    id: app._id.toString(),
    job: app.job,
    status: app.status,
    coverNote: app.coverNote,
    resume: { filename: app.resume.filename, contentType: app.resume.contentType, size: app.resume.size },
    createdAt: app.createdAt,
  };
  if (includeApplicant) return { ...base, applicant: app.applicant };
  return base;
}

export const applyToJob = catchAsync(async (req: Request, res: Response) => {
  const input = applySchema.parse(req.body);
  const job = await Job.findById(req.params.id);
  if (!job) throw new NotFoundError("Job not found");
  if (job.status !== "open") throw new BadRequestError("This job is no longer accepting applications");
  if (!req.file) throw new BadRequestError("A resume file (PDF or Word doc) is required");

  const existing = await Application.findOne({ job: job._id, applicant: req.user!.id });
  if (existing) throw new ConflictError("You have already applied to this job");

  const application = await Application.create({
    job: job._id,
    applicant: req.user!.id,
    employer: job.employer,
    coverNote: input.coverNote,
    resume: {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
      size: req.file.size,
      data: req.file.buffer,
    },
  });

  job.applicantsCount += 1;
  await job.save();

  res.status(201).json({ application: toPublicApplication(application) });
});

export const myApplications = catchAsync(async (req: Request, res: Response) => {
  const applications = await Application.find({ applicant: req.user!.id })
    .populate("job", "title companyName location type workMode status")
    .sort({ createdAt: -1 });
  res.json({ applications: applications.map((a) => toPublicApplication(a)) });
});

export const jobApplicants = catchAsync(async (req: Request, res: Response) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new NotFoundError("Job not found");
  if (job.employer.toString() !== req.user!.id) {
    throw new ForbiddenError("You do not own this job posting");
  }

  const applications = await Application.find({ job: job._id })
    .populate("applicant", "name email headline skills location")
    .sort({ createdAt: -1 });

  res.json({ applications: applications.map((a) => toPublicApplication(a, true)) });
});

export const updateApplicationStatus = catchAsync(async (req: Request, res: Response) => {
  const input = updateApplicationStatusSchema.parse(req.body);
  const application = await Application.findById(req.params.id);
  if (!application) throw new NotFoundError("Application not found");
  if (application.employer.toString() !== req.user!.id) {
    throw new ForbiddenError("You do not own the job this application belongs to");
  }
  application.status = input.status;
  await application.save();
  res.json({ application: toPublicApplication(application, true) });
});

export const getResumeFile = catchAsync(async (req: Request, res: Response) => {
  const application = await Application.findById(req.params.id);
  if (!application) throw new NotFoundError("Application not found");

  const isOwnerEmployer = application.employer.toString() === req.user!.id;
  const isApplicant = application.applicant.toString() === req.user!.id;
  if (!isOwnerEmployer && !isApplicant) {
    throw new ForbiddenError("You do not have access to this resume");
  }

  res.setHeader("Content-Type", application.resume.contentType);
  res.setHeader("Content-Disposition", `inline; filename="${application.resume.filename}"`);
  res.send(application.resume.data);
});
