import express from "express";
import { optionalAuth, verifyToken } from "../middleware/jwt.js";
import { validateBody } from "../middleware/validate.js";
import {
  createPortfolioItem,
  deletePortfolioItem,
  getExpertProfile,
  getExperts,
  updateMyExpertProfile,
  updatePortfolioItem,
} from "../controllers/expert.controller.js";
import { getExpertReviews } from "../controllers/jobReview.controller.js";

const router = express.Router();

router.get("/", getExperts);
router.get("/:expertId/reviews", getExpertReviews);
router.get("/:expertId", optionalAuth, getExpertProfile);

router.patch(
  "/me/profile",
  verifyToken,
  validateBody({
    username: { type: "string", required: false, minLength: 3, maxLength: 32 },
    headline: { type: "string", required: false, maxLength: 120 },
    desc: { type: "string", required: false, maxLength: 2000 },
    hourlyRate: { type: "number", required: false, min: 0 },
    skills: { type: "array", required: false, maxItems: 25, of: { type: "string", maxLength: 64 } },
    availability: { type: "string", required: false, enum: ["available", "busy", "unavailable"] },
    yearsExperience: { type: "number", required: false, min: 0, max: 60 },
    languages: { type: "array", required: false, maxItems: 15, of: { type: "string", maxLength: 40 } },
    timezone: { type: "string", required: false, maxLength: 80 },
    industries: { type: "array", required: false, maxItems: 15, of: { type: "string", maxLength: 80 } },
    certifications: { type: "array", required: false, maxItems: 20, of: { type: "string", maxLength: 120 } },
    preferredEngagements: {
      type: "array",
      required: false,
      maxItems: 3,
      of: { type: "string", enum: ["fixed", "hourly", "consulting"] },
    },
    minimumProjectBudget: { type: "number", required: false, min: 0 },
    availabilityHoursPerWeek: { type: "number", required: false, min: 0, max: 168 },
    responseSLAHours: { type: "number", required: false, min: 0, max: 336 },
    calendarLink: { type: "string", required: false, maxLength: 500 },
  }),
  updateMyExpertProfile
);

router.post(
  "/me/portfolio",
  verifyToken,
  validateBody({
    title: { type: "string", required: true, minLength: 3, maxLength: 120 },
    summary: { type: "string", required: true, minLength: 20, maxLength: 2000 },
    link: { type: "string", required: false, maxLength: 500 },
    imageUrl: { type: "string", required: false, maxLength: 500 },
    tags: { type: "array", required: false, maxItems: 10, of: { type: "string", maxLength: 40 } },
  }),
  createPortfolioItem
);

router.patch(
  "/me/portfolio/:itemId",
  verifyToken,
  validateBody({
    title: { type: "string", required: false, minLength: 3, maxLength: 120 },
    summary: { type: "string", required: false, minLength: 20, maxLength: 2000 },
    link: { type: "string", required: false, maxLength: 500 },
    imageUrl: { type: "string", required: false, maxLength: 500 },
    tags: { type: "array", required: false, maxItems: 10, of: { type: "string", maxLength: 40 } },
  }),
  updatePortfolioItem
);

router.delete("/me/portfolio/:itemId", verifyToken, deletePortfolioItem);

export default router;
