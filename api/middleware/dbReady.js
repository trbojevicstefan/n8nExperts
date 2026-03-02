import mongoose from "mongoose";

export const requireDbConnection = (_req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      status: 503,
      message: "Database unavailable. Check MONGO_URI and ensure MongoDB is running.",
    });
  }

  return next();
};
