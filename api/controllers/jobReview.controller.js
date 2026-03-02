import mongoose from "mongoose";
import Job from "../models/job.model.js";
import User from "../models/user.model.js";
import JobApplication from "../models/jobApplication.model.js";
import JobReview from "../models/jobReview.model.js";
import createError from "../utils/createError.js";
import { createNotification } from "../services/notification.service.js";

const asNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const refreshExpertRating = async (expertId) => {
  const [result] = await JobReview.aggregate([
    { $match: { expertId: new mongoose.Types.ObjectId(expertId) } },
    {
      $group: {
        _id: "$expertId",
        ratingTotal: { $sum: "$rating" },
        ratingCount: { $sum: 1 },
      },
    },
  ]);

  const ratingTotal = result?.ratingTotal || 0;
  const ratingCount = result?.ratingCount || 0;
  const ratingAvg = ratingCount > 0 ? Number((ratingTotal / ratingCount).toFixed(2)) : 0;

  await User.findByIdAndUpdate(expertId, {
    $set: { ratingTotal, ratingCount, ratingAvg },
  });
};

export const createJobReview = async (req, res, next) => {
  try {
    if (req.role !== "client") {
      return next(createError(403, "Only clients can leave job reviews."));
    }

    const { rating, comment } = req.body;
    const numericRating = Number(rating);
    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      return next(createError(400, "rating must be a number between 1 and 5."));
    }

    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return next(createError(404, "Job not found!"));
    }
    if (job.clientId.toString() !== req.userId) {
      return next(createError(403, "You can only review experts for your own jobs."));
    }
    if (job.status !== "completed") {
      return next(createError(400, "Reviews are allowed only when a job is completed."));
    }
    if (!job.acceptedApplicationId) {
      return next(createError(400, "No accepted expert found for this job."));
    }

    const acceptedApplication = await JobApplication.findById(job.acceptedApplicationId);
    if (!acceptedApplication) {
      return next(createError(404, "Accepted application not found for this job."));
    }

    const existing = await JobReview.findOne({ jobId: job._id, clientId: req.userId });
    if (existing) {
      return next(createError(409, "You have already reviewed this completed job."));
    }

    const review = await JobReview.create({
      jobId: job._id,
      clientId: req.userId,
      expertId: acceptedApplication.expertId,
      rating: numericRating,
      comment: comment || "",
    });

    await refreshExpertRating(acceptedApplication.expertId);

    await createNotification({
      userId: acceptedApplication.expertId,
      actorId: req.userId,
      type: "review_received",
      title: "New review received",
      message: "A client left a review on a completed job.",
      entityType: "review",
      entityId: review._id.toString(),
      metadata: { rating: numericRating, jobId: job._id.toString() },
    });

    res.status(201).json(review);
  } catch (err) {
    if (err?.code === 11000) {
      return next(createError(409, "You have already reviewed this completed job."));
    }
    next(err);
  }
};

export const getExpertReviews = async (req, res, next) => {
  try {
    const page = Math.max(1, asNumber(req.query.page, 1));
    const limit = Math.min(50, Math.max(1, asNumber(req.query.limit, 10)));
    const skip = (page - 1) * limit;

    const filters = { expertId: req.params.expertId };
    const [reviews, total] = await Promise.all([
      JobReview.find(filters)
        .populate("clientId", "username img")
        .populate("jobId", "title")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      JobReview.countDocuments(filters),
    ]);

    res.status(200).json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getMyReviews = async (req, res, next) => {
  try {
    const [asClient, asExpert] = await Promise.all([
      JobReview.find({ clientId: req.userId }).populate("expertId", "username img headline ratingAvg ratingCount").sort({ createdAt: -1 }),
      JobReview.find({ expertId: req.userId }).populate("clientId", "username img").populate("jobId", "title").sort({ createdAt: -1 }),
    ]);

    res.status(200).json({ asClient, asExpert });
  } catch (err) {
    next(err);
  }
};
