import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import {
    isAdmin,
    getPendingExperts,
    getVerifiedExperts,
    verifyExpert,
    revokeVerification,
    getPlatformStats,
    getAllUsers,
    toggleAdmin
} from "../controllers/admin.controller.js";

const router = express.Router();

// All admin routes require authentication and admin status
router.use(verifyToken);

// Expert verification routes
router.get("/experts/pending", isAdmin, getPendingExperts);
router.get("/experts/verified", isAdmin, getVerifiedExperts);
router.patch("/experts/:userId/verify", isAdmin, verifyExpert);
router.patch("/experts/:userId/revoke", isAdmin, revokeVerification);

// Platform stats
router.get("/stats", isAdmin, getPlatformStats);

// User management
router.get("/users", isAdmin, getAllUsers);
router.patch("/users/:userId/toggle-admin", isAdmin, toggleAdmin);

export default router;
