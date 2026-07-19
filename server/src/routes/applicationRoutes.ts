import { Router } from "express";
import { getResumeFile, myApplications, updateApplicationStatus } from "../controllers/applicationController";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get("/mine", requireAuth, requireRole("jobseeker"), myApplications);
router.patch("/:id/status", requireAuth, requireRole("employer"), updateApplicationStatus);
router.get("/:id/resume", requireAuth, getResumeFile);

export default router;
