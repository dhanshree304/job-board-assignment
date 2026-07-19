import { Schema, model, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "employer" | "jobseeker";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  headline?: string;
  skills?: string[];
  location?: string;
  company?: {
    name?: string;
    website?: string;
    about?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["employer", "jobseeker"], required: true },
    headline: { type: String, maxlength: 150 },
    skills: [{ type: String, trim: true }],
    location: { type: String, maxlength: 100 },
    company: {
      name: { type: String, maxlength: 150 },
      website: { type: String, maxlength: 200 },
      about: { type: String, maxlength: 2000 },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const User = model<IUser>("User", userSchema);
