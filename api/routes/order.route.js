import express from "express";
import { verifyToken } from "../middleware/jwt.js";
import {
    createPaymentIntent,
    confirmOrder,
    getOrders,
    getOrder,
    updateOrderStatus,
    addDeliverables,
    createConnectAccount,
    getConnectStatus,
} from "../controllers/order.controller.js";

const router = express.Router();

// All order routes require authentication
router.use(verifyToken);

// Payment and orders
router.post("/create-payment-intent/:id", createPaymentIntent);
router.put("/confirm", confirmOrder);
router.get("/", getOrders);
router.get("/:id", getOrder);
router.patch("/:id/status", updateOrderStatus);
router.post("/:id/deliverables", addDeliverables);

// Stripe Connect
router.post("/connect/create", createConnectAccount);
router.get("/connect/status", getConnectStatus);

export default router;