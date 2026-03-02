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
    projectPreferences: { type: "array", required: false },
  }),
  updateMyClientProfile
);

router.get("/:clientId/public", getPublicClientProfile);

export default router;
