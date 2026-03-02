import Job from "../models/job.model.js";
import User from "../models/user.model.js";
import Invitation from "../models/invitation.model.js";
import JobApplication from "../models/jobApplication.model.js";
import WorkspaceThread from "../models/workspaceThread.model.js";
import WorkspaceMessage from "../models/workspaceMessage.model.js";
import createError from "../utils/createError.js";
import { ensureWorkspaceThread } from "../services/thread.service.js";
import { createNotification } from "../services/notification.service.js";

const asNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toRegex = (query) => new RegExp(String(query).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

const normalizeAttachment = (attachment) => {
  if (!attachment || typeof attachment !== "object") return null;

  const url = typeof attachment.url === "string" ? attachment.url.trim() : "";
  if (!url) return null;

  const derivedName = url.split("/").filter(Boolean).pop() || "Attachment";
  const name = typeof attachment.name === "string" && attachment.name.trim() ? attachment.name.trim() : derivedName;

  return {
    name: name.slice(0, 180),
    url: url.slice(0, 2000),
  };
};

const isParticipant = (thread, userId) =>
  thread.clientId.toString() === userId || thread.expertId.toString() === userId;

const assertChatEligibility = async ({ jobId, clientId, expertId }) => {
  const [invitation, application] = await Promise.all([
    Invitation.findOne({ jobId, clientId, expertId }),
    JobApplication.findOne({ jobId, clientId, expertId }),
  ]);

  return Boolean(invitation || application);
};

export const openThread = async (req, res, next) => {
  try {
    const { jobId, peerId } = req.body;
    if (!jobId || !peerId) {
      return next(createError(400, "jobId and peerId are required."));
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return next(createError(404, "Job not found!"));
    }

    const clientId = req.role === "client" ? req.userId : peerId;
    const expertId = req.role === "expert" ? req.userId : peerId;

    if (job.clientId.toString() !== clientId) {
      return next(createError(403, "Thread client must be the job owner."));
    }

    const eligible = await assertChatEligibility({ jobId, clientId, expertId });
    if (!eligible) {
      return next(createError(403, "Chat can only be opened after invite/application context exists."));
    }

    const thread = await ensureWorkspaceThread({ jobId, clientId, expertId });
    const populated = await WorkspaceThread.findById(thread._id)
      .populate("jobId", "title status")
      .populate("clientId", "username img")
      .populate("expertId", "username img headline");

    res.status(200).json(populated);
  } catch (err) {
    next(err);
  }
};

export const getThreads = async (req, res, next) => {
  try {
    const page = Math.max(1, asNumber(req.query.page, 1));
    const limit = Math.min(50, Math.max(1, asNumber(req.query.limit, 20)));
    const skip = (page - 1) * limit;
    const q = String(req.query.q || "").trim();

    const isExpert = req.role === "expert";
    const baseFilters = {
      ...(isExpert ? { expertId: req.userId, archivedByExpert: false } : { clientId: req.userId, archivedByClient: false }),
    };
    const filters = { ...baseFilters };

    if (q) {
      const regex = toRegex(q);
      const [matchingJobs, matchingUsers] = await Promise.all([
        Job.find({ title: regex }).select("_id").limit(200),
        User.find({
          $or: [{ username: regex }, { headline: regex }],
        })
          .select("_id")
          .limit(200),
      ]);

      filters.$or = [
        { lastMessage: regex },
        { jobId: { $in: matchingJobs.map((job) => job._id) } },
        { clientId: { $in: matchingUsers.map((user) => user._id) } },
        { expertId: { $in: matchingUsers.map((user) => user._id) } },
      ];
    }

    const [threads, total] = await Promise.all([
      WorkspaceThread.find(filters)
        .populate("jobId", "title status")
        .populate("clientId", "username img")
        .populate("expertId", "username img headline")
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit),
      WorkspaceThread.countDocuments(filters),
    ]);

    res.status(200).json({
      threads,
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

export const getThreadMessages = async (req, res, next) => {
  try {
    const thread = await WorkspaceThread.findById(req.params.threadId);
    if (!thread) {
      return next(createError(404, "Thread not found!"));
    }
    if (!isParticipant(thread, req.userId)) {
      return next(createError(403, "You are not a participant in this thread."));
    }

    const page = Math.max(1, asNumber(req.query.page, 1));
    const limit = Math.min(100, Math.max(1, asNumber(req.query.limit, 40)));
    const skip = (page - 1) * limit;
    const q = String(req.query.q || "").trim();
    const query = { threadId: thread._id };
    if (q) {
      const regex = toRegex(q);
      query.$or = [{ body: regex }, { "attachments.name": regex }, { "attachments.url": regex }];
    }

    const [messages, total] = await Promise.all([
      WorkspaceMessage.find(query)
        .populate("senderId", "username img")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      WorkspaceMessage.countDocuments(query),
    ]);

    res.status(200).json({
      messages: messages.reverse(),
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

export const createThreadMessage = async (req, res, next) => {
  try {
    const body = typeof req.body.body === "string" ? String(req.body.body).trim() : "";
    const attachmentsInput = Array.isArray(req.body.attachments) ? req.body.attachments : [];
    const attachments = attachmentsInput.map(normalizeAttachment).filter(Boolean);

    if (!body && attachments.length === 0) {
      return next(createError(400, "Message body or attachment is required."));
    }
    if (attachments.length > 5) {
      return next(createError(400, "A message supports up to 5 attachments."));
    }

    const thread = await WorkspaceThread.findById(req.params.threadId);
    if (!thread) {
      return next(createError(404, "Thread not found!"));
    }
    if (!isParticipant(thread, req.userId)) {
      return next(createError(403, "You are not a participant in this thread."));
    }

    const message = await WorkspaceMessage.create({
      threadId: thread._id,
      jobId: thread.jobId,
      senderId: req.userId,
      body,
      attachments,
    });

    const isSenderClient = thread.clientId.toString() === req.userId;
    const recipientId = isSenderClient ? thread.expertId : thread.clientId;

    thread.lastMessage = message.body || (message.attachments.length > 0 ? `Sent ${message.attachments.length} attachment(s)` : "");
    thread.lastMessageAt = message.createdAt;
    thread.lastMessageSenderId = req.userId;
    thread.archivedByClient = false;
    thread.archivedByExpert = false;
    if (isSenderClient) {
      thread.unreadByExpert += 1;
    } else {
      thread.unreadByClient += 1;
    }
    await thread.save();

    await createNotification({
      userId: recipientId,
      actorId: req.userId,
      type: "chat_message",
      title: "New message",
      message: "You received a new workspace message.",
      entityType: "thread",
      entityId: thread._id.toString(),
      metadata: { jobId: thread.jobId.toString() },
    });

    const populated = await WorkspaceMessage.findById(message._id).populate("senderId", "username img");
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

export const markThreadRead = async (req, res, next) => {
  try {
    const thread = await WorkspaceThread.findById(req.params.threadId);
    if (!thread) {
      return next(createError(404, "Thread not found!"));
    }
    if (!isParticipant(thread, req.userId)) {
      return next(createError(403, "You are not a participant in this thread."));
    }

    if (thread.clientId.toString() === req.userId) {
      thread.unreadByClient = 0;
    } else {
      thread.unreadByExpert = 0;
    }
    await thread.save();

    res.status(200).json(thread);
  } catch (err) {
    next(err);
  }
};
