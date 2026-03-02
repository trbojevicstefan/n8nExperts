import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import { getRecommendedExperts, getRecommendedJobs } from "../controllers/recommendation.controller.js";

const router = express.Router();

router.get("/jobs", verifyToken, getRecommendedJobs);
router.get("/experts", verifyToken, getRecommendedExperts);

export default router;
