import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import {
  createSavedSearch,
  deleteSavedSearch,
  getSavedExperts,
  getSavedJobs,
  listSavedSearches,
  markSavedSearchUsed,
  saveExpert,
  saveJob,
  unsaveExpert,
  unsaveJob,
  updateSavedSearch,
} from "../controllers/saved.controller.js";

const router = express.Router();

router.get("/jobs", verifyToken, getSavedJobs);
router.post("/jobs/:jobId", verifyToken, saveJob);
router.delete("/jobs/:jobId", verifyToken, unsaveJob);

router.get("/experts", verifyToken, getSavedExperts);
router.post("/experts/:expertId", verifyToken, saveExpert);
router.delete("/experts/:expertId", verifyToken, unsaveExpert);

router.get("/searches", verifyToken, listSavedSearches);
router.post("/searches", verifyToken, createSavedSearch);
router.patch("/searches/:searchId", verifyToken, updateSavedSearch);
router.patch("/searches/:searchId/use", verifyToken, markSavedSearchUsed);
router.delete("/searches/:searchId", verifyToken, deleteSavedSearch);

export default router;
