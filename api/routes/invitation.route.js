import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import { validateBody } from "../middleware/validate.js";
import { getMyInvitations, respondToInvitation } from "../controllers/invitation.controller.js";

const router = express.Router();

router.get("/mine", verifyToken, getMyInvitations);

router.patch(
  "/:invitationId/respond",
  verifyToken,
  validateBody({
    status: { type: "string", required: true, enum: ["accepted", "declined"] },
    coverLetter: { type: "string", required: false, minLength: 30, maxLength: 3000 },
    estimatedDuration: { type: "string", required: false, maxLength: 120 },
  }),
  respondToInvitation
);

export default router;
