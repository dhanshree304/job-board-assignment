import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import { ForbiddenError, UnauthorizedError } from "../utils/AppError";
import { User, UserRole } from "../models/User";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; role: UserRole };
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing or malformed Authorization header");
    }
    const token = header.slice("Bearer ".length);
    const payload = verifyToken(token);

    const user = await User.findById(payload.sub).select("_id role");
    if (!user) throw new UnauthorizedError("User no longer exists");

    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired token"));
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenError(`This action requires role: ${roles.join(" or ")}`));
    }
    next();
  };
}
