import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import { validateBody } from "../middleware/validate.js";
import { getPublicClientProfile, updateMyClientProfile } from "../controllers/client.controller.js";

const router = express.Router();

router.patch(
  "/me/profile",
  verifyToken,
  validateBody({
    username: { type: "string", required: false, minLength: 3, maxLength: 32 },
    desc: { type: "string", required: false, maxLength: 2000 },
    country: { type: "string", required: false, maxLength: 80 },
    img: { type: "string", required: false, maxLength: 500 },
    companyName: { type: "string", required: false, maxLength: 120 },
    companyWebsite: { type: "string", required: false, maxLength: 300 },
    companySize: { type: "string", required: false, maxLength: 80 },
    industry: { type: "string", required: false, maxLength: 80 },
    foundedYear: { type: "number", required: false, min: 1900, max: 2100 },
    location: { type: "string", required: false, maxLength: 120 },
    teamDescription: { type: "string", required: false, maxLength: 2000 },
    logoUrl: { type: "string", required: false, maxLength: 500 },
    projectPreferences: { type: "array", required: false, maxItems: 12, of: { type: "string", maxLength: 120 } },
    hiringContext: {
      type: "object",
      required: false,
      schema: {
        automationGoal: { type: "string", required: false, maxLength: 500 },
        currentPainPoints: { type: "array", required: false, of: { type: "string", maxLength: 160 }, maxItems: 10 },
        expertTypeNeeded: { type: "string", required: false, enum: ["builder", "consultant", "maintainer"] },
        successDefinition: { type: "string", required: false, maxLength: 500 },
        communicationPreference: {
          type: "string",
          required: false,
          enum: ["async_updates", "weekly_live", "shared_channel", "mixed"],
        },
        timezoneOverlap: { type: "string", required: false, maxLength: 120 },
        documentationExpectation: { type: "string", required: false, enum: ["light", "standard", "runbook"] },
        engagementPreference: { type: "string", required: false, enum: ["one_off", "ongoing", "fractional"] },
      },
    },
  }),
  updateMyClientProfile
);

router.get("/:clientId/public", getPublicClientProfile);

export default router;
