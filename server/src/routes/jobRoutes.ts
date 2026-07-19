import { Router } from "express";
import { createJob, deleteJob, getJob, listJobs, myJobs, updateJob } from "../controllers/jobController";
import { applyToJob, jobApplicants } from "../controllers/applicationController";
import { toggleSaveJob } from "../controllers/savedJobController";
import { requireAuth, requireRole } from "../middleware/auth";
import { handleResumeUpload } from "../middleware/handleUpload";

const router = Router();

router.get("/", listJobs);
router.get("/mine", requireAuth, requireRole("employer"), myJobs);
router.get("/:id", getJob);
router.post("/", requireAuth, requireRole("employer"), createJob);
router.patch("/:id", requireAuth, requireRole("employer"), updateJob);
router.delete("/:id", requireAuth, requireRole("employer"), deleteJob);

router.post("/:id/apply", requireAuth, requireRole("jobseeker"), handleResumeUpload, applyToJob);
router.get("/:id/applicants", requireAuth, requireRole("employer"), jobApplicants);
router.post("/:id/save", requireAuth, requireRole("jobseeker"), toggleSaveJob);

export default router;
