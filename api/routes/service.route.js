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
const serviceCreateSchema = {
    title: { type: "string", required: true, minLength: 5, maxLength: 140 },
    desc: { type: "string", required: true, minLength: 10, maxLength: 5000 },
    serviceType: { type: "string", required: true, enum: ["Fixed Price", "Consultation"] },
    price: { type: "number", required: true, min: 1 },
    cover: { type: "string", required: false, maxLength: 500 },
    bestFor: { type: "string", required: false, minLength: 10, maxLength: 300 },
    shortTitle: { type: "string", required: false, minLength: 5, maxLength: 120 },
    shortDesc: { type: "string", required: false, minLength: 10, maxLength: 300 },
    deliveryTime: { type: "number", required: true, min: 1 },
    revisionNumber: { type: "number", required: false, min: 0, max: 20 },
    features: {
        type: "array",
        required: false,
        maxItems: 10,
        of: { type: "string", minLength: 2, maxLength: 160 },
    },
};
const serviceUpdateSchema = {
    ...serviceCreateSchema,
    title: { ...serviceCreateSchema.title, required: false },
    desc: { ...serviceCreateSchema.desc, required: false },
    serviceType: { ...serviceCreateSchema.serviceType, required: false },
    price: { ...serviceCreateSchema.price, required: false },
    deliveryTime: { ...serviceCreateSchema.deliveryTime, required: false },
};

// Public routes
router.get("/", getServices);
router.get("/featured", getFeaturedServices);
router.get("/single/:id", getService);
router.get("/expert/:userId", getExpertServices);

// Protected routes (require authentication)
router.post(
    "/",
    verifyToken,
    validateBody(serviceCreateSchema),
    createService
);
router.put("/:id", verifyToken, validateBody(serviceUpdateSchema), updateService);
router.delete("/:id", verifyToken, deleteService);

export default router;
