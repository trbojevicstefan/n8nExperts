import jwt from "jsonwebtoken";
import createError from "../utils/createError.js";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return next(createError(401, "You are not authenticated!"));

  jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
    if (err) return next(createError(403, "Token is not valid!"));
    req.userId = payload.id;
    req.role = payload.role || (payload.isExpert || payload.isSeller ? "expert" : "client");
    req.isSeller = payload.isSeller || req.role === "expert";
    req.isExpert = payload.isExpert || req.role === "expert";
    req.isClient = payload.isClient ?? req.role === "client";
    req.isAdmin = payload.isAdmin;
    next();
  });
};

// Optional auth - doesn't fail if no token, just adds user info if available
export const optionalAuth = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) {
    return next();
  }

  jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
    if (!err) {
      req.userId = payload.id;
      req.role = payload.role || (payload.isExpert || payload.isSeller ? "expert" : "client");
      req.isSeller = payload.isSeller || req.role === "expert";
      req.isExpert = payload.isExpert || req.role === "expert";
      req.isClient = payload.isClient ?? req.role === "client";
      req.isAdmin = payload.isAdmin;
    }
    next();
  });
};
