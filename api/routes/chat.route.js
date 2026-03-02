import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import { validateBody } from "../middleware/validate.js";
import {
  createThreadMessage,
  getThreadMessages,
  getThreads,
  markThreadRead,
  openThread,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.post(
  "/threads/open",
  verifyToken,
  validateBody({
    jobId: { type: "string", required: true },
    peerId: { type: "string", required: true },
  }),
  openThread
);

router.get("/threads", verifyToken, getThreads);
router.get("/threads/:threadId/messages", verifyToken, getThreadMessages);

router.post(
  "/threads/:threadId/messages",
  verifyToken,
  validateBody({
    body: { type: "string", required: false, maxLength: 4000 },
    attachments: { type: "array", required: false },
  }),
  createThreadMessage
);

router.patch("/threads/:threadId/read", verifyToken, markThreadRead);

export default router;
