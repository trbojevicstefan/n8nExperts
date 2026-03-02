import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import { validateBody } from "../middleware/validate.js";
import {
    createService,
    deleteService,
    getService,
    getServices,
    updateService,
    getFeaturedServices,
    getExpertServices,
} from "../controllers/service.controller.js";

const router = express.Router();

// Public routes
router.get("/", getServices);
router.get("/featured", getFeaturedServices);
router.get("/single/:id", getService);
router.get("/expert/:userId", getExpertServices);

// Protected routes (require authentication)
router.post(
    "/",
    verifyToken,
    validateBody({
        title: { type: "string", required: true, minLength: 5, maxLength: 140 },
        desc: { type: "string", required: true, minLength: 20, maxLength: 5000 },
        serviceType: { type: "string", required: true, enum: ["Fixed Price", "Consultation"] },
        price: { type: "number", required: true, min: 1 },
        cover: { type: "string", required: true, maxLength: 500 },
        shortTitle: { type: "string", required: true, minLength: 5, maxLength: 120 },
        shortDesc: { type: "string", required: true, minLength: 10, maxLength: 300 },
        deliveryTime: { type: "number", required: true, min: 1 },
    }),
    createService
);
router.put("/:id", verifyToken, updateService);
router.delete("/:id", verifyToken, deleteService);

export default router;
