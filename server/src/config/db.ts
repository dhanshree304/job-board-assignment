import mongoose from "mongoose";
import { env } from "./env";

let connectionPromise: Promise<typeof mongoose> | null = null;

/**
 * Reuses a single connection across invocations - required on Vercel's
 * serverless runtime where the module can stay warm between requests.
 */
export function connectDB(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose);
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(env.mongodbUri).catch((err) => {
      connectionPromise = null;
      throw err;
    });
  }
  return connectionPromise;
}
