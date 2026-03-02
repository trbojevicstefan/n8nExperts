import User from "../models/user.model.js";
import { refreshClientMetrics } from "../services/clientMetrics.service.js";
import createError from "../utils/createError.js";

const safeClientProjection = "_id username img desc country companyName companyWebsite companySize industry foundedYear location teamDescription logoUrl projectPreferences createdAt updatedAt";

const parseArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const toRoleAwareClientGuard = (req) => {
  if (req.role === "expert" || req.isExpert) {
    throw createError(403, "Only clients can update client profile details.");
  }
};

export const updateMyClientProfile = async (req, res, next) => {
  try {
    toRoleAwareClientGuard(req);

    const allowedFields = [
      "username",
      "desc",
      "country",
      "img",
      "companyName",
      "companyWebsite",
      "companySize",
      "industry",
      "foundedYear",
      "location",
      "teamDescription",
      "logoUrl",
      "projectPreferences",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (updates.projectPreferences !== undefined) {
      updates.projectPreferences = parseArray(updates.projectPreferences);
    }

    updates.role = "client";
    updates.isClient = true;
    updates.isExpert = false;
    updates.isSeller = false;

    const updated = await User.findByIdAndUpdate(req.userId, { $set: updates }, { new: true }).select(safeClientProjection);
    if (!updated) {
      return next(createError(404, "User not found!"));
    }

    const metrics = await refreshClientMetrics(updated._id);

    return res.status(200).json({
      ...updated.toObject(),
      trustMetrics: {
        jobsPosted: metrics.jobsPosted,
        jobsCompleted: metrics.jobsCompleted,
        hireRate: metrics.hireRate,
        avgResponseHours: metrics.avgResponseHours,
        activeJobs: metrics.activeJobs,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getPublicClientProfile = async (req, res, next) => {
  try {
    const client = await User.findById(req.params.clientId).select(safeClientProjection).lean();
    if (!client) {
      return next(createError(404, "Client not found!"));
    }

    const role = client.role || (client.isExpert || client.isSeller ? "expert" : "client");
    if (role !== "client") {
      return next(createError(404, "Client not found!"));
    }

    const metrics = await refreshClientMetrics(client._id);

    return res.status(200).json({
      client,
      trustMetrics: {
        jobsPosted: metrics.jobsPosted,
        jobsCompleted: metrics.jobsCompleted,
        hireRate: metrics.hireRate,
        avgResponseHours: metrics.avgResponseHours,
        activeJobs: metrics.activeJobs,
      },
    });
  } catch (err) {
    next(err);
  }
};
