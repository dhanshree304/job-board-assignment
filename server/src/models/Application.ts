import { Schema, model, Document, Types } from "mongoose";

export type ApplicationStatus = "applied" | "reviewed" | "shortlisted" | "rejected" | "hired";

export interface IApplication extends Document {
  _id: Types.ObjectId;
  job: Types.ObjectId;
  applicant: Types.ObjectId;
  employer: Types.ObjectId;
  coverNote?: string;
  resume: {
    filename: string;
    contentType: string;
    size: number;
    data: Buffer;
  };
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    applicant: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    employer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    coverNote: { type: String, maxlength: 3000 },
    resume: {
      filename: { type: String, required: true },
      contentType: { type: String, required: true },
      size: { type: Number, required: true },
      data: { type: Buffer, required: true },
    },
    status: {
      type: String,
      enum: ["applied", "reviewed", "shortlisted", "rejected", "hired"],
      default: "applied",
    },
  },
  { timestamps: true }
);

applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

export const Application = model<IApplication>("Application", applicationSchema);
