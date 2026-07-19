import { Router } from "express";
import { mySavedJobs } from "../controllers/savedJobController";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, requireRole("jobseeker"), mySavedJobs);

export default router;
