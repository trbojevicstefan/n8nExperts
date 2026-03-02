import Invitation from "../models/invitation.model.js";
import Job from "../models/job.model.js";
import JobApplication from "../models/jobApplication.model.js";
import createError from "../utils/createError.js";
import { createNotification } from "../services/notification.service.js";
import { ensureWorkspaceThread } from "../services/thread.service.js";

const asNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const getMyInvitations = async (req, res, next) => {
  try {
    const page = Math.max(1, asNumber(req.query.page, 1));
    const limit = Math.min(50, Math.max(1, asNumber(req.query.limit, 20)));
    const skip = (page - 1) * limit;

    const requestedRole = req.query.role;
    const effectiveRole = requestedRole || (req.role === "expert" ? "expert" : "client");
    if (!["expert", "client"].includes(effectiveRole)) {
      return next(createError(400, "role must be either expert or client."));
    }
    if (effectiveRole !== req.role) {
      return next(createError(403, "You can only view invitations for your own role."));
    }

    const filters = {
      ...(effectiveRole === "expert" ? { expertId: req.userId } : { clientId: req.userId }),
      ...(req.query.status && { status: req.query.status }),
    };

    const [invitations, total] = await Promise.all([
      Invitation.find(filters)
        .populate("jobId", "title status budgetType budgetAmount")
        .populate("clientId", "username img")
        .populate("expertId", "username img headline")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Invitation.countDocuments(filters),
    ]);

    res.status(200).json({
      invitations,
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

export const respondToInvitation = async (req, res, next) => {
  try {
    if (req.role !== "expert") {
      return next(createError(403, "Only experts can respond to invitations."));
    }

    const { status, coverLetter, estimatedDuration } = req.body;
    if (!["accepted", "declined"].includes(status)) {
      return next(createError(400, "status must be accepted or declined."));
    }

    const invitation = await Invitation.findById(req.params.invitationId);
    if (!invitation) {
      return next(createError(404, "Invitation not found!"));
    }
    if (invitation.expertId.toString() !== req.userId) {
      return next(createError(403, "You can only respond to your own invitations."));
    }

    // Idempotency guard for repeated responses.
    if (invitation.status !== "sent") {
      if (invitation.status === status) {
        const existingApplication = status === "accepted"
          ? await JobApplication.findOne({ jobId: invitation.jobId, expertId: req.userId })
          : null;
        return res.status(200).json({ invitation, application: existingApplication, idempotent: true });
      }
      return next(createError(400, "This invitation has already been responded to."));
    }

    if (status === "declined") {
      invitation.status = "declined";
      invitation.respondedAt = new Date();
      invitation.respondedBy = req.userId;
      await invitation.save();

      await createNotification({
        userId: invitation.clientId,
        actorId: req.userId,
        type: "invitation_declined",
        title: "Invitation declined",
        message: "An expert declined your job invitation.",
        entityType: "invitation",
        entityId: invitation._id.toString(),
        metadata: { jobId: invitation.jobId.toString() },
      });

      return res.status(200).json({ invitation });
    }

    const job = await Job.findById(invitation.jobId);
    if (!job) {
      return next(createError(404, "Job not found for this invitation."));
    }
    if (job.status !== "open") {
      return next(createError(400, "Only open jobs can be accepted from invitations."));
    }

    let application = await JobApplication.findOne({ jobId: invitation.jobId, expertId: req.userId });

    if (!application) {
      if (!coverLetter || String(coverLetter).trim().length < 30) {
        return next(createError(400, "coverLetter must be at least 30 characters when accepting an invitation."));
      }

      application = await JobApplication.create({
        jobId: invitation.jobId,
        clientId: invitation.clientId,
        expertId: req.userId,
        coverLetter: String(coverLetter).trim(),
        estimatedDuration,
        source: "invitation",
        invitationId: invitation._id,
      });
    } else if (!application.invitationId) {
      application.invitationId = invitation._id;
      application.source = "invitation";
      await application.save();
    }

    invitation.status = "accepted";
    invitation.respondedAt = new Date();
    invitation.respondedBy = req.userId;
    await invitation.save();

    const thread = await ensureWorkspaceThread({
      jobId: invitation.jobId,
      clientId: invitation.clientId,
      expertId: invitation.expertId,
      invitationId: invitation._id,
      applicationId: application?._id || null,
    });

    await createNotification({
      userId: invitation.clientId,
      actorId: req.userId,
      type: "invitation_accepted",
      title: "Invitation accepted",
      message: "An expert accepted your invitation.",
      entityType: "invitation",
      entityId: invitation._id.toString(),
      metadata: { applicationId: application._id.toString(), jobId: invitation.jobId.toString() },
    });

    return res.status(200).json({ invitation, application, thread });
  } catch (err) {
    if (err?.code === 11000) {
      return next(createError(409, "Duplicate invitation response."));
    }
    next(err);
  }
};
