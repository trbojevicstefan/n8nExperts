import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import { validateBody } from "../middleware/validate.js";
import {
  bulkUpdateApplicationStatus,
  getClientApplicationsPipeline,
  getMyApplications,
  updateApplicationNote,
  updateApplicationStatus,
  withdrawApplication,
} from "../controllers/job.controller.js";

const router = express.Router();

router.get("/mine", verifyToken, getMyApplications);
router.get("/client", verifyToken, getClientApplicationsPipeline);

router.patch(
  "/bulk-status",
  verifyToken,
  validateBody({
    status: {
      type: "string",
      required: true,
      enum: ["shortlisted", "accepted", "rejected"],
    },
    applicationIds: {
      type: "array",
      required: true,
      minLength: 1,
      maxLength: 200,
      items: { type: "string", required: true },
    },
  }),
  bulkUpdateApplicationStatus
);

router.patch(
  "/:applicationId/status",
  verifyToken,
  validateBody({
    status: {
      type: "string",
      required: true,
      enum: ["shortlisted", "accepted", "rejected"],
    },
  }),
  updateApplicationStatus
);

router.patch(
  "/:applicationId/note",
  verifyToken,
  validateBody({
    clientNote: { type: "string", required: false, maxLength: 2000 },
  }),
  updateApplicationNote
);

router.delete("/:applicationId", verifyToken, withdrawApplication);

export default router;
