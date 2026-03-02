// routes/auth.route.js
import express from "express";
import passport from "passport";
import { register, login, logout, getCurrentUser, googleCallback } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/jwt.js";
import { validateBody } from "../middleware/validate.js";

const router = express.Router();

// Route for user registration
router.post(
    "/register",
    validateBody({
        username: { type: "string", required: true, minLength: 3, maxLength: 32 },
        email: { type: "string", required: true, minLength: 5, maxLength: 120 },
        password: { type: "string", required: true, minLength: 6, maxLength: 200 },
        role: { type: "string", required: false, enum: ["client", "expert"] },
    }),
    register
);

// Route for user login
router.post(
    "/login",
    validateBody({
        username: { type: "string", required: true, minLength: 1, maxLength: 120 },
        password: { type: "string", required: true, minLength: 1, maxLength: 200 },
    }),
    login
);

// Route for user logout
router.post("/logout", logout);

// Get current user
router.get("/me", verifyToken, getCurrentUser);

// Google OAuth routes
router.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"]
}));

router.get("/google/callback",
    passport.authenticate("google", {
        failureRedirect: "/auth/login?error=google_auth_failed",
        session: false
    }),
    googleCallback
);

export default router;
