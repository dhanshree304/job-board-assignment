import multer from "multer";
import { env } from "../config/env";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export const uploadResume = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxResumeSizeBytes },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new Error("Resume must be a PDF or Word document"));
      return;
    }
    cb(null, true);
  },
}).single("resume");
