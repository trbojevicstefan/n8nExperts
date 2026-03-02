import mongoose from "mongoose";
import Job from "../models/job.model.js";
import JobApplication from "../models/jobApplication.model.js";
import Invitation from "../models/invitation.model.js";
import User from "../models/user.model.js";
import createError from "../utils/createError.js";
import { createNotification } from "../services/notification.service.js";
import { refreshClientMetrics } from "../services/clientMetrics.service.js";
import { ensureWorkspaceThread } from "../services/thread.service.js";

const asNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeStatusQuery = (value) => {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((status) => status.trim())
    .filter((status) => ["submitted", "shortlisted", "accepted", "rejected"].includes(status));
};

const toRegex = (query) => new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

const getApplicationSort = (sortParam) => {
  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    highestBid: { bidAmount: -1, createdAt: -1 },
    lowestBid: { bidAmount: 1, createdAt: -1 },
    updated: { statusChangedAt: -1, createdAt: -1 },
  };
  return sortMap[sortParam] || sortMap.newest;
};

const transitionApplicationStatus = async ({ application, toStatus, actorId }) => {
  const fromStatus = application.status;
  if (fromStatus === toStatus) {
    return false;
  }

  const at = new Date();
  application.status = toStatus;
  application.statusChangedAt = at;
  application.statusHistory = [
    ...(application.statusHistory || []),
    {
      from: fromStatus,
      to: toStatus,
      byUserId: actorId || null,
      at,
    },
  ];

  await application.save();
  return true;
};

const ensureClient = (req, next) => {
  if (req.isExpert || req.role === "expert") {
    next(createError(403, "Only clients can perform this action."));
    return false;
  }
  return true;
};

const ensureExpert = (req, next) => {
  if (!req.isExpert && req.role !== "expert") {
    next(createError(403, "Only experts can perform this action."));
    return false;
  }
  return true;
};

const toJobFilters = (query) => {
  const filters = {
    status: query.status || "open",
    ...(query.clientId && { clientId: query.clientId }),
    ...(query.visibility && { visibility: query.visibility }),
  };

  if (query.search) {
    filters.$text = { $search: query.search };
  }
  if (query.skills) {
    const skills = String(query.skills)
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
    if (skills.length > 0) {
      filters.skills = { $all: skills };
    }
  }
  if (query.min || query.max) {
    filters.budgetAmount = {
      ...(query.min && { $gte: asNumber(query.min, 0) }),
      ...(query.max && { $lte: asNumber(query.max, Number.MAX_SAFE_INTEGER) }),
    };
  }

  return filters;
};

export const createJob = async (req, res, next) => {
  if (!ensureClient(req, next)) return;

  try {
    const newJob = new Job({
      clientId: req.userId,
      title: req.body.title,
      description: req.body.description,
      budgetType: req.body.budgetType || "fixed",
      budgetAmount: req.body.budgetAmount,
      skills: Array.isArray(req.body.skills) ? req.body.skills : [],
      attachments: Array.isArray(req.body.attachments) ? req.body.attachments : [],
      visibility: req.body.visibility || "public",
      status: "open",
    });

    const saved = await newJob.save();
    await refreshClientMetrics(req.userId);
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
};

export const getJobs = async (req, res, next) => {
  try {
    const page = Math.max(1, asNumber(req.query.page, 1));
    const limit = Math.min(50, Math.max(1, asNumber(req.query.limit, 12)));
    const skip = (page - 1) * limit;

    const filters = toJobFilters(req.query);
    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      budgetAsc: { budgetAmount: 1 },
      budgetDesc: { budgetAmount: -1 },
    };
    const sort = sortMap[req.query.sort] || sortMap.newest;

    const [jobs, total] = await Promise.all([
      Job.find(filters)
        .populate(
          "clientId",
          "username img country companyName industry jobsPostedCount jobsCompletedCount hiresCount avgClientResponseHours"
        )
        .skip(skip)
        .limit(limit)
        .sort(sort),
      Job.countDocuments(filters),
    ]);

    res.status(200).json({
      jobs,
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

export const getMyJobs = async (req, res, next) => {
  if (!ensureClient(req, next)) return;

  try {
    const jobs = await Job.find({ clientId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (err) {
    next(err);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.jobId).populate(
      "clientId",
      "username img country companyName industry jobsPostedCount jobsCompletedCount hiresCount avgClientResponseHours"
    );
    if (!job) {
      return next(createError(404, "Job not found!"));
    }

    if (job.visibility === "invite_only") {
      const isOwner = req.userId && job.clientId._id.toString() === req.userId;
      let hasAccess = false;

      if (req.userId && !isOwner) {
        const [invitation, application] = await Promise.all([
          Invitation.findOne({ jobId: job._id, expertId: req.userId }),
          JobApplication.findOne({ jobId: job._id, expertId: req.userId }),
        ]);
        hasAccess = Boolean(invitation || application);
      }

      if (!isOwner && !hasAccess) {
        return next(createError(403, "This job is invite-only."));
      }
    }

    res.status(200).json(job);
  } catch (err) {
    next(err);
  }
};

export const updateJob = async (req, res, next) => {
  if (!ensureClient(req, next)) return;

  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return next(createError(404, "Job not found!"));
    }
    if (job.clientId.toString() !== req.userId) {
      return next(createError(403, "You can only update your own jobs."));
    }
    if (job.status !== "open") {
      return next(createError(400, "Only open jobs can be updated."));
    }

    const allowed = ["title", "description", "budgetType", "budgetAmount", "skills", "visibility", "attachments"];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updated = await Job.findByIdAndUpdate(job._id, { $set: updates }, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

export const updateJobStatus = async (req, res, next) => {
  if (!ensureClient(req, next)) return;

  try {
    const { status } = req.body;
    const allowed = ["open", "in_progress", "completed", "closed", "cancelled"];
    if (!allowed.includes(status)) {
      return next(createError(400, "Invalid job status."));
    }

    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return next(createError(404, "Job not found!"));
    }
    if (job.clientId.toString() !== req.userId) {
      return next(createError(403, "You can only change your own jobs."));
    }

    job.status = status;
    await job.save();
    await refreshClientMetrics(req.userId);

    if (job.acceptedApplicationId) {
      const acceptedApplication = await JobApplication.findById(job.acceptedApplicationId).select("expertId");
      if (acceptedApplication?.expertId) {
        await createNotification({
          userId: acceptedApplication.expertId,
          actorId: req.userId,
          type: "job_status_updated",
          title: "Job status updated",
          message: `A client changed the job status to ${status}.`,
          entityType: "job",
          entityId: job._id.toString(),
          metadata: { status },
        });
      }
    }

    res.status(200).json(job);
  } catch (err) {
    next(err);
  }
};

export const createJobApplication = async (req, res, next) => {
  if (!ensureExpert(req, next)) return;

  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return next(createError(404, "Job not found!"));
    }
    if (job.status !== "open") {
      return next(createError(400, "Only open jobs can receive applications."));
    }
    if (job.clientId.toString() === req.userId) {
      return next(createError(400, "You cannot apply to your own job."));
    }

    const existing = await JobApplication.findOne({ jobId: job._id, expertId: req.userId });
    if (existing) {
      return next(createError(409, "You have already applied to this job."));
    }

    const application = new JobApplication({
      jobId: job._id,
      clientId: job.clientId,
      expertId: req.userId,
      coverLetter: req.body.coverLetter,
      bidAmount: req.body.bidAmount,
      estimatedDuration: req.body.estimatedDuration,
      source: "direct",
    });

    const saved = await application.save();

    await ensureWorkspaceThread({
      jobId: job._id,
      clientId: job.clientId,
      expertId: req.userId,
      applicationId: saved._id,
    });

    await createNotification({
      userId: job.clientId,
      actorId: req.userId,
      type: "application_submitted",
      title: "New job application",
      message: "An expert submitted a proposal to your job.",
      entityType: "application",
      entityId: saved._id.toString(),
      metadata: { jobId: job._id.toString() },
    });

    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
};

export const getJobApplications = async (req, res, next) => {
  if (!ensureClient(req, next)) return;

  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return next(createError(404, "Job not found!"));
    }
    if (job.clientId.toString() !== req.userId) {
      return next(createError(403, "You can only view applications for your jobs."));
    }

    const page = Math.max(1, asNumber(req.query.page, 1));
    const limit = Math.min(100, Math.max(1, asNumber(req.query.limit, 24)));
    const skip = (page - 1) * limit;
    const statusFilters = normalizeStatusQuery(req.query.status);
    const queryText = (req.query.q || "").trim();
    const source = req.query.source;
    const minBid = req.query.minBid !== undefined ? asNumber(req.query.minBid, null) : null;
    const maxBid = req.query.maxBid !== undefined ? asNumber(req.query.maxBid, null) : null;

    const baseFilters = {
      jobId: job._id,
      ...(source && ["direct", "invitation"].includes(source) ? { source } : {}),
      ...((minBid !== null || maxBid !== null) && {
        bidAmount: {
          ...(minBid !== null && { $gte: minBid }),
          ...(maxBid !== null && { $lte: maxBid }),
        },
      }),
    };

    if (queryText) {
      const regex = toRegex(queryText);
      const matchedExperts = await User.find({
        $or: [
          { username: regex },
          { headline: regex },
          { desc: regex },
          { skills: { $in: [regex] } },
          { specialties: { $in: [regex] } },
        ],
      })
        .select("_id")
        .limit(200);

      baseFilters.$or = [
        { coverLetter: regex },
        { estimatedDuration: regex },
        { expertId: { $in: matchedExperts.map((expert) => expert._id) } },
      ];
    }

    const listFilters = {
      ...baseFilters,
      ...(statusFilters.length > 0 ? { status: { $in: statusFilters } } : {}),
    };

    const [applications, total, countsRaw] = await Promise.all([
      JobApplication.find(listFilters)
        .select("+clientNote")
        .populate("expertId", "username img headline hourlyRate skills country availability responseSLAHours")
        .sort(getApplicationSort(req.query.sort))
        .skip(skip)
        .limit(limit),
      JobApplication.countDocuments(listFilters),
      JobApplication.aggregate([
        { $match: baseFilters },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    const countsByStatus = {
      submitted: 0,
      shortlisted: 0,
      accepted: 0,
      rejected: 0,
    };

    countsRaw.forEach((row) => {
      if (countsByStatus[row._id] !== undefined) {
        countsByStatus[row._id] = row.count;
      }
    });

    res.status(200).json({
      applications,
      countsByStatus,
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

export const getMyApplications = async (req, res, next) => {
  if (!ensureExpert(req, next)) return;

  try {
    const page = Math.max(1, asNumber(req.query.page, 1));
    const limit = Math.min(100, Math.max(1, asNumber(req.query.limit, 20)));
    const skip = (page - 1) * limit;

    const statusParam = String(req.query.status || "").trim();
    const statusFilters = normalizeStatusQuery(req.query.status);
    const listFilters = {
      expertId: req.userId,
      ...(statusParam === "active"
        ? {
            status: { $in: ["submitted", "shortlisted"] },
          }
        : {}),
      ...(statusFilters.length > 0 ? { status: { $in: statusFilters } } : {}),
      ...(req.query.source && ["direct", "invitation"].includes(req.query.source)
        ? { source: req.query.source }
        : {}),
    };

    const [applications, total] = await Promise.all([
      JobApplication.find(listFilters)
        .select("-clientNote")
        .populate("jobId", "title budgetType budgetAmount status createdAt clientId")
        .populate(
          "clientId",
          "username img companyName industry avgClientResponseHours jobsPostedCount jobsCompletedCount hiresCount"
        )
        .sort(getApplicationSort(req.query.sort))
        .skip(skip)
        .limit(limit),
      JobApplication.countDocuments(listFilters),
    ]);

    res.status(200).json({
      applications,
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

export const getClientApplicationsPipeline = async (req, res, next) => {
  if (!ensureClient(req, next)) return;

  try {
    const clientId = new mongoose.Types.ObjectId(req.userId);
    const page = Math.max(1, asNumber(req.query.page, 1));
    const limit = Math.min(120, Math.max(1, asNumber(req.query.limit, 30)));
    const skip = (page - 1) * limit;
    const statusFilters = normalizeStatusQuery(req.query.status);
    const queryText = (req.query.q || "").trim();
    const source = req.query.source;
    const jobId = req.query.jobId;
    const minBid = req.query.minBid !== undefined ? asNumber(req.query.minBid, null) : null;
    const maxBid = req.query.maxBid !== undefined ? asNumber(req.query.maxBid, null) : null;

    const baseFilters = {
      clientId,
      ...(jobId ? { jobId } : {}),
      ...(source && ["direct", "invitation"].includes(source) ? { source } : {}),
      ...((minBid !== null || maxBid !== null) && {
        bidAmount: {
          ...(minBid !== null && { $gte: minBid }),
          ...(maxBid !== null && { $lte: maxBid }),
        },
      }),
    };

    if (queryText) {
      const regex = toRegex(queryText);
      const matchedExperts = await User.find({
        $or: [
          { username: regex },
          { headline: regex },
          { desc: regex },
          { skills: { $in: [regex] } },
          { specialties: { $in: [regex] } },
        ],
      })
        .select("_id")
        .limit(300);

      const matchedJobs = await Job.find({
        clientId: req.userId,
        $or: [{ title: regex }, { description: regex }, { skills: { $in: [regex] } }],
      })
        .select("_id")
        .limit(300);

      baseFilters.$or = [
        { coverLetter: regex },
        { estimatedDuration: regex },
        { expertId: { $in: matchedExperts.map((expert) => expert._id) } },
        { jobId: { $in: matchedJobs.map((job) => job._id) } },
      ];
    }

    const listFilters = {
      ...baseFilters,
      ...(statusFilters.length > 0 ? { status: { $in: statusFilters } } : {}),
    };

    const [applications, total, countsRaw, countsByJobRaw] = await Promise.all([
      JobApplication.find(listFilters)
        .select("+clientNote")
        .populate("jobId", "title status budgetType budgetAmount")
        .populate("expertId", "username img headline hourlyRate skills country availability responseSLAHours")
        .sort(getApplicationSort(req.query.sort))
        .skip(skip)
        .limit(limit),
      JobApplication.countDocuments(listFilters),
      JobApplication.aggregate([
        { $match: baseFilters },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      JobApplication.aggregate([
        { $match: baseFilters },
        { $group: { _id: "$jobId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 200 },
      ]),
    ]);

    const countsByStatus = {
      submitted: 0,
      shortlisted: 0,
      accepted: 0,
      rejected: 0,
    };

    countsRaw.forEach((row) => {
      if (countsByStatus[row._id] !== undefined) {
        countsByStatus[row._id] = row.count;
      }
    });

    let countsByJob = [];
    if (countsByJobRaw.length > 0) {
      const jobs = await Job.find({
        _id: { $in: countsByJobRaw.map((row) => row._id) },
        clientId: req.userId,
      }).select("title");

      const jobTitleById = Object.fromEntries(jobs.map((job) => [job._id.toString(), job.title]));
      countsByJob = countsByJobRaw.map((row) => ({
        jobId: row._id.toString(),
        title: jobTitleById[row._id.toString()] || "Untitled job",
        count: row.count,
      }));
    }

    res.status(200).json({
      applications,
      countsByStatus,
      countsByJob,
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

export const bulkUpdateApplicationStatus = async (req, res, next) => {
  if (!ensureClient(req, next)) return;

  try {
    const { applicationIds, status } = req.body;
    const allowed = ["shortlisted", "accepted", "rejected"];
    if (!allowed.includes(status)) {
      return next(createError(400, "Bulk status supports shortlisted, accepted, or rejected."));
    }

    const ids = Array.isArray(applicationIds)
      ? applicationIds.map((id) => String(id).trim()).filter(Boolean)
      : [];

    if (ids.length === 0) {
      return next(createError(400, "applicationIds must be a non-empty array."));
    }
    if (ids.length > 200) {
      return next(createError(400, "You can update up to 200 applications per request."));
    }

    const applications = await JobApplication.find({
      _id: { $in: ids },
      clientId: req.userId,
    });

    const applicationMap = new Map(applications.map((application) => [application._id.toString(), application]));
    const notFoundIds = ids.filter((id) => !applicationMap.has(id));

    const updated = [];
    const skipped = [];
    const acceptedJobIds = new Set();

    for (const id of ids) {
      const application = applicationMap.get(id);
      if (!application) continue;

      const canTransition =
        (status === "shortlisted" && application.status === "submitted") ||
        (status === "accepted" && application.status === "shortlisted") ||
        (status === "rejected" && ["submitted", "shortlisted"].includes(application.status));

      if (!canTransition) {
        skipped.push({
          applicationId: id,
          reason: `Cannot transition from ${application.status} to ${status}.`,
        });
        continue;
      }

      const jobIdString = application.jobId.toString();
      if (status === "accepted") {
        if (acceptedJobIds.has(jobIdString)) {
          skipped.push({
            applicationId: id,
            reason: "Only one application can be accepted per job in a bulk request.",
          });
          continue;
        }

        const job = await Job.findById(application.jobId);
        if (!job) {
          skipped.push({
            applicationId: id,
            reason: "Job not found.",
          });
          continue;
        }
        if (job.clientId.toString() !== req.userId) {
          skipped.push({
            applicationId: id,
            reason: "You can only update applications for your own jobs.",
          });
          continue;
        }
        if (job.acceptedApplicationId && job.acceptedApplicationId.toString() !== application._id.toString()) {
          skipped.push({
            applicationId: id,
            reason: "This job already has an accepted application.",
          });
          continue;
        }

        await transitionApplicationStatus({
          application,
          toStatus: "accepted",
          actorId: req.userId,
        });

        job.status = "in_progress";
        job.acceptedApplicationId = application._id;
        await job.save();

        const competingApplications = await JobApplication.find({
          jobId: application.jobId,
          _id: { $ne: application._id },
          status: { $in: ["submitted", "shortlisted"] },
        });
        for (const competingApplication of competingApplications) {
          await transitionApplicationStatus({
            application: competingApplication,
            toStatus: "rejected",
            actorId: req.userId,
          });
        }

        acceptedJobIds.add(jobIdString);
      } else {
        await transitionApplicationStatus({
          application,
          toStatus: status,
          actorId: req.userId,
        });
      }

      await ensureWorkspaceThread({
        jobId: application.jobId,
        clientId: application.clientId,
        expertId: application.expertId,
        applicationId: application._id,
        invitationId: application.invitationId || null,
      });

      await createNotification({
        userId: application.expertId,
        actorId: req.userId,
        type: "application_status_updated",
        title: "Application status updated",
        message: `Your application status changed to ${application.status}.`,
        entityType: "application",
        entityId: application._id.toString(),
        metadata: { status: application.status, jobId: application.jobId.toString(), source: "bulk" },
      });

      updated.push(application._id.toString());
    }

    await refreshClientMetrics(req.userId);

    res.status(200).json({
      requested: ids.length,
      updatedCount: updated.length,
      updatedIds: updated,
      skipped,
      notFoundIds,
    });
  } catch (err) {
    next(err);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  if (!ensureClient(req, next)) return;

  try {
    const { status } = req.body;
    const allowed = ["shortlisted", "accepted", "rejected"];
    if (!allowed.includes(status)) {
      return next(createError(400, "Invalid application status."));
    }

    const application = await JobApplication.findById(req.params.applicationId);
    if (!application) {
      return next(createError(404, "Application not found!"));
    }
    if (application.clientId.toString() !== req.userId) {
      return next(createError(403, "You can only update applications for your own jobs."));
    }

    const job = await Job.findById(application.jobId);
    if (!job) {
      return next(createError(404, "Job not found!"));
    }

    if (application.status === status) {
      return res.status(200).json(application);
    }

    await transitionApplicationStatus({
      application,
      toStatus: status,
      actorId: req.userId,
    });

    if (status === "accepted") {
      job.status = "in_progress";
      job.acceptedApplicationId = application._id;
      await job.save();

      const competingApplications = await JobApplication.find({
        jobId: application.jobId,
        _id: { $ne: application._id },
        status: { $in: ["submitted", "shortlisted"] },
      });

      for (const competingApplication of competingApplications) {
        await transitionApplicationStatus({
          application: competingApplication,
          toStatus: "rejected",
          actorId: req.userId,
        });
      }
    }

    await ensureWorkspaceThread({
      jobId: application.jobId,
      clientId: application.clientId,
      expertId: application.expertId,
      applicationId: application._id,
      invitationId: application.invitationId || null,
    });

    await createNotification({
      userId: application.expertId,
      actorId: req.userId,
      type: "application_status_updated",
      title: "Application status updated",
      message: `Your application status changed to ${status}.`,
      entityType: "application",
      entityId: application._id.toString(),
      metadata: { status, jobId: application.jobId.toString() },
    });

    await refreshClientMetrics(req.userId);

    res.status(200).json(application);
  } catch (err) {
    next(err);
  }
};

export const withdrawApplication = async (req, res, next) => {
  if (!ensureExpert(req, next)) return;

  try {
    const application = await JobApplication.findById(req.params.applicationId);
    if (!application) {
      return next(createError(404, "Application not found!"));
    }
    if (application.expertId.toString() !== req.userId) {
      return next(createError(403, "You can only withdraw your own applications."));
    }
    if (!["submitted", "shortlisted"].includes(application.status)) {
      return next(createError(400, "Only submitted or shortlisted applications can be withdrawn."));
    }

    application.withdrawnAt = new Date();
    await transitionApplicationStatus({
      application,
      toStatus: "rejected",
      actorId: req.userId,
    });
    await refreshClientMetrics(application.clientId);

    res.status(200).json({ message: "Application withdrawn." });
  } catch (err) {
    next(err);
  }
};

export const updateApplicationNote = async (req, res, next) => {
  if (!ensureClient(req, next)) return;

  try {
    const application = await JobApplication.findById(req.params.applicationId).select("+clientNote");
    if (!application) {
      return next(createError(404, "Application not found!"));
    }
    if (application.clientId.toString() !== req.userId) {
      return next(createError(403, "You can only update notes for your own job applications."));
    }

    application.clientNote = typeof req.body.clientNote === "string" ? req.body.clientNote.trim() : "";
    await application.save();

    res.status(200).json({
      _id: application._id,
      clientNote: application.clientNote,
      updatedAt: application.updatedAt,
    });
  } catch (err) {
    next(err);
  }
};

export const createInvitation = async (req, res, next) => {
  if (!ensureClient(req, next)) return;

  try {
    const { expertId, message } = req.body;
    if (!expertId) {
      return next(createError(400, "expertId is required."));
    }

    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return next(createError(404, "Job not found!"));
    }
    if (job.clientId.toString() !== req.userId) {
      return next(createError(403, "You can only invite experts to your own jobs."));
    }

    const expert = await User.findById(expertId).select("role isExpert isSeller");
    if (!expert || !(expert.role === "expert" || expert.isExpert || expert.isSeller)) {
      return next(createError(404, "Expert not found!"));
    }

    const invitation = await Invitation.findOneAndUpdate(
      { jobId: job._id, expertId, clientId: req.userId },
      {
        $set: {
          message: message || "",
          status: "sent",
          respondedAt: null,
          respondedBy: null,
        },
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    await ensureWorkspaceThread({
      jobId: job._id,
      clientId: req.userId,
      expertId,
      invitationId: invitation._id,
    });

    await createNotification({
      userId: expertId,
      actorId: req.userId,
      type: "invitation_received",
      title: "New invitation",
      message: "You were invited to apply for a job.",
      entityType: "invitation",
      entityId: invitation._id.toString(),
      metadata: { jobId: job._id.toString() },
    });

    res.status(201).json(invitation);
  } catch (err) {
    next(err);
  }
};
