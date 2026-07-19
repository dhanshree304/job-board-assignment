import { Schema, model, Document, Types } from "mongoose";

export type JobType = "full-time" | "part-time" | "contract" | "internship";
export type WorkMode = "remote" | "hybrid" | "onsite";
export type JobStatus = "open" | "closed";

export interface IJob extends Document {
  _id: Types.ObjectId;
  employer: Types.ObjectId;
  title: string;
  companyName: string;
  location: string;
  type: JobType;
  workMode: WorkMode;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  description: string;
  requirements: string[];
  tags: string[];
  status: JobStatus;
  applicantsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    employer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    companyName: { type: String, required: true, trim: true, maxlength: 150 },
    location: { type: String, required: true, trim: true, maxlength: 100 },
    type: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship"],
      required: true,
    },
    workMode: { type: String, enum: ["remote", "hybrid", "onsite"], required: true },
    salaryMin: { type: Number, min: 0 },
    salaryMax: { type: Number, min: 0 },
    currency: { type: String, default: "USD", maxlength: 10 },
    description: { type: String, required: true, maxlength: 10000 },
    requirements: [{ type: String, trim: true, maxlength: 300 }],
    tags: [{ type: String, trim: true, lowercase: true, maxlength: 40 }],
    status: { type: String, enum: ["open", "closed"], default: "open", index: true },
    applicantsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

jobSchema.index({ title: "text", companyName: "text", description: "text", tags: "text" });
jobSchema.index({ createdAt: -1 });

export const Job = model<IJob>("Job", jobSchema);
