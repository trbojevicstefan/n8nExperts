import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { requireDbConnection } from "./middleware/dbReady.js";

import userRoute from "./routes/user.route.js";
import serviceRoute from "./routes/service.route.js";
import orderRoute from "./routes/order.route.js";
import conversationRoute from "./routes/conversation.route.js";
import reviewRoute from "./routes/review.route.js";
import messageRoute from "./routes/message.route.js";
import authRoute from "./routes/auth.route.js";
import adminRoute from "./routes/admin.route.js";
import expertRoute from "./routes/expert.route.js";
import clientRoute from "./routes/client.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";
import invitationRoute from "./routes/invitation.route.js";
import notificationRoute from "./routes/notification.route.js";
import chatRoute from "./routes/chat.route.js";
import savedRoute from "./routes/saved.route.js";
import recommendationRoute from "./routes/recommendation.route.js";
import gigRoute from "./routes/gig.route.js";

dotenv.config();

const FRONTEND_URL = process.env.FRONTEND_URL || process.env.CLIENT_URL || "http://localhost:5173";
const MONGO_URI = process.env.MONGO_URI || process.env.MONGO;

mongoose.set("strictQuery", true);
mongoose.set("bufferCommands", false);

let hasConfiguredPassport = false;
const configurePassport = () => {
  if (hasConfiguredPassport) {
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        callbackURL: "/api/auth/google/callback",
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user = {
            googleId: profile.id,
            email: profile.emails?.[0]?.value,
            name: profile.displayName,
            picture: profile.photos?.[0]?.value,
          };
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );

  hasConfiguredPassport = true;
};

export const connectDb = async (mongoUri = MONGO_URI) => {
  if (!mongoUri) {
    throw new Error("Mongo URI is missing. Set MONGO_URI or MONGO in api/.env");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 8000,
  });

  return mongoose.connection;
};

export const disconnectDb = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

export const createApp = () => {
  configurePassport();

  const app = express();
  const allowedOrigins = ["http://localhost:5173", "http://localhost:3000", FRONTEND_URL].filter(Boolean);

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());
  app.use(passport.initialize());

  app.get("/", (_req, res) => {
    const dbStateMap = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    res.json({
      status: "online",
      message: "n8nExperts API is running",
      version: "1.0.0",
      database: dbStateMap[mongoose.connection.readyState] || "unknown",
    });
  });

  app.use("/api", requireDbConnection);

  app.use("/api/auth", authRoute);
  app.use("/api/users", userRoute);
  app.use("/api/services", serviceRoute);
  app.use("/api/orders", orderRoute);
  app.use("/api/conversations", conversationRoute);
  app.use("/api/messages", messageRoute);
  app.use("/api/reviews", reviewRoute);
  app.use("/api/admin", adminRoute);
  app.use("/api/experts", expertRoute);
  app.use("/api/clients", clientRoute);
  app.use("/api/jobs", jobRoute);
  app.use("/api/applications", applicationRoute);
  app.use("/api/invitations", invitationRoute);
  app.use("/api/notifications", notificationRoute);
  app.use("/api/chat", chatRoute);
  app.use("/api/saved", savedRoute);
  app.use("/api/recommendations", recommendationRoute);
  app.use("/api/gigs", gigRoute);

  app.use((err, _req, res, _next) => {
    const errorStatus = err.status || 500;
    const errorMessage = err.message || "Something went wrong!";
    return res.status(errorStatus).json({
      success: false,
      status: errorStatus,
      message: errorMessage,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  });

  return app;
};

const app = createApp();

export default app;
