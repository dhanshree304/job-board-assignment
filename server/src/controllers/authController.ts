import { Request, Response } from "express";
import { User } from "../models/User";
import { catchAsync } from "../utils/catchAsync";
import { signToken } from "../utils/jwt";
import { loginSchema, registerSchema, updateProfileSchema } from "../validators/authValidators";
import { ConflictError, NotFoundError, UnauthorizedError } from "../utils/AppError";

function toPublicUser(user: InstanceType<typeof User>) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    headline: user.headline,
    skills: user.skills,
    location: user.location,
    company: user.company,
    createdAt: user.createdAt,
  };
}

export const register = catchAsync(async (req: Request, res: Response) => {
  const input = registerSchema.parse(req.body);

  const existing = await User.findOne({ email: input.email });
  if (existing) throw new ConflictError("An account with this email already exists");

  const user = await User.create(input);
  const token = signToken({ sub: user._id.toString(), role: user.role });

  res.status(201).json({ token, user: toPublicUser(user) });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const input = loginSchema.parse(req.body);

  const user = await User.findOne({ email: input.email }).select("+password");
  if (!user || !(await user.comparePassword(input.password))) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const token = signToken({ sub: user._id.toString(), role: user.role });
  res.json({ token, user: toPublicUser(user) });
});

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw new NotFoundError("User not found");
  res.json({ user: toPublicUser(user) });
});

export const updateMe = catchAsync(async (req: Request, res: Response) => {
  const input = updateProfileSchema.parse(req.body);
  const user = await User.findByIdAndUpdate(req.user!.id, input, { new: true, runValidators: true });
  if (!user) throw new NotFoundError("User not found");
  res.json({ user: toPublicUser(user) });
});
