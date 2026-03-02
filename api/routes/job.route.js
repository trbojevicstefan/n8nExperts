import express from "express";
import { optionalAuth, verifyToken } from "../middleware/jwt.js";
import { validateBody } from "../middleware/validate.js";
import {
  createInvitation,
  createJob,
  createJobApplication,
  getJobApplications,
  getJobById,
  getJobs,
  getMyJobs,
  updateJob,
  updateJobStatus,
} from "../controllers/job.controller.js";
import { createJobReview } from "../controllers/jobReview.controller.js";

const router = express.Router();

router.get("/", getJobs);
router.get("/mine", verifyToken, getMyJobs);
router.get("/:jobId", optionalAuth, getJobById);

router.post(
  "/",
  verifyToken,
  validateBody({
    title: { type: "string", required: true, minLength: 10, maxLength: 140 },
    description: { type: "string", required: true, minLength: 30, maxLength: 5000 },
    budgetType: { type: "string", required: true, enum: ["hourly", "fixed"] },
    budgetAmount: { type: "number", required: true, min: 1 },
    visibility: { type: "string", required: false, enum: ["public", "invite_only"] },
    skills: { type: "array", required: false },
    attachments: { type: "array", required: false },
  }),
  createJob
);

router.patch(
  "/:jobId",
  verifyToken,
  validateBody({
    title: { type: "string", required: false, minLength: 10, maxLength: 140 },
    description: { type: "string", required: false, minLength: 30, maxLength: 5000 },
    budgetType: { type: "string", required: false, enum: ["hourly", "fixed"] },
    budgetAmount: { type: "number", required: false, min: 1 },
    visibility: { type: "string", required: false, enum: ["public", "invite_only"] },
    skills: { type: "array", required: false },
    attachments: { type: "array", required: false },
  }),
  updateJob
);

router.patch(
  "/:jobId/status",
  verifyToken,
  validateBody({
    status: {
      type: "string",
      required: true,
      enum: ["open", "in_progress", "completed", "closed", "cancelled"],
    },
  }),
  updateJobStatus
);

router.post(
  "/:jobId/applications",
  verifyToken,
  validateBody({
    coverLetter: { type: "string", required: true, minLength: 30, maxLength: 3000 },
    bidAmount: { type: "number", required: false, min: 1 },
    estimatedDuration: { type: "string", required: false, maxLength: 120 },
  }),
  createJobApplication
);

router.get("/:jobId/applications", verifyToken, getJobApplications);

router.post(
  "/:jobId/invitations",
  verifyToken,
  validateBody({
    expertId: { type: "string", required: true },
    message: { type: "string", required: false, maxLength: 1000 },
  }),
  createInvitation
);

router.post(
  "/:jobId/reviews",
  verifyToken,
  validateBody({
    rating: { type: "number", required: true, min: 1, max: 5 },
    comment: { type: "string", required: false, maxLength: 1200 },
  }),
  createJobReview
);

export default router;
