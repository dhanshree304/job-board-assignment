import type { IncomingMessage, ServerResponse } from "http";
import { createApp } from "../src/app";
import { connectDB } from "../src/config/db";

const app = createApp();

/**
 * Vercel Node serverless entry point. Each cold start awaits the (cached)
 * Mongo connection before delegating to the Express app.
 */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await connectDB();
  app(req, res);
}
