import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import { getMyReviews } from "../controllers/jobReview.controller.js";

const router = express.Router();

router.get("/mine", verifyToken, getMyReviews);

export default router;
