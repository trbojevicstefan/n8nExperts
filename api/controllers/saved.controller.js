import SavedItem from "../models/savedItem.model.js";
import SavedSearch from "../models/savedSearch.model.js";
import Job from "../models/job.model.js";
import User from "../models/user.model.js";
import createError from "../utils/createError.js";

const asNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const isPlainObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);

const ensureExpert = (req) => {
  if (req.role !== "expert" && !req.isExpert) {
    throw createError(403, "Only experts can perform this action.");
  }
};

const ensureClient = (req) => {
  if (req.role !== "client" || req.isExpert) {
    throw createError(403, "Only clients can perform this action.");
  }
};

const toSavedJobsResponse = (savedItems) =>
  savedItems
    .filter((item) => item.entityId)
    .map((item) => ({
      _id: item._id,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      job: item.entityId,
    }));

const toSavedExpertsResponse = (savedItems) =>
  savedItems
    .filter((item) => item.entityId)
    .map((item) => ({
      _id: item._id,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      expert: item.entityId,
    }));

export const saveJob = async (req, res, next) => {
  try {
    ensureExpert(req);

    const job = await Job.findById(req.params.jobId).select("_id clientId status");
    if (!job) {
      return next(createError(404, "Job not found!"));
    }
    if (job.clientId.toString() === req.userId) {
      return next(createError(400, "You cannot save your own job."));
    }

    const existing = await SavedItem.findOne({
      userId: req.userId,
      entityType: "job",
      entityId: job._id,
    });

    if (existing) {
      return res.status(200).json(existing);
    }

    const saved = await SavedItem.create({
      userId: req.userId,
      entityType: "job",
      entityId: job._id,
    });

    return res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
};

export const unsaveJob = async (req, res, next) => {
  try {
    ensureExpert(req);

    await SavedItem.findOneAndDelete({
      userId: req.userId,
      entityType: "job",
      entityId: req.params.jobId,
    });

    res.status(200).json({ message: "Job removed from saved list." });
  } catch (err) {
    next(err);
  }
};

export const getSavedJobs = async (req, res, next) => {
  try {
    ensureExpert(req);

    const page = Math.max(1, asNumber(req.query.page, 1));
    const limit = Math.min(80, Math.max(1, asNumber(req.query.limit, 20)));
    const skip = (page - 1) * limit;

    const filters = {
      userId: req.userId,
      entityType: "job",
    };

    const [savedItems, total] = await Promise.all([
      SavedItem.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "entityId",
          model: "Job",
          populate: {
            path: "clientId",
            select: "username img country companyName industry jobsPostedCount jobsCompletedCount hiresCount avgClientResponseHours",
          },
        }),
      SavedItem.countDocuments(filters),
    ]);

    res.status(200).json({
      items: toSavedJobsResponse(savedItems),
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

export const saveExpert = async (req, res, next) => {
  try {
    ensureClient(req);

    const expert = await User.findById(req.params.expertId).select("_id role isExpert isSeller");
    if (!expert || !(expert.role === "expert" || expert.isExpert || expert.isSeller)) {
      return next(createError(404, "Expert not found!"));
    }

    if (expert._id.toString() === req.userId) {
      return next(createError(400, "You cannot save your own profile."));
    }

    const existing = await SavedItem.findOne({
      userId: req.userId,
      entityType: "expert",
      entityId: expert._id,
    });

    if (existing) {
      return res.status(200).json(existing);
    }

    const saved = await SavedItem.create({
      userId: req.userId,
      entityType: "expert",
      entityId: expert._id,
    });

    return res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
};

export const unsaveExpert = async (req, res, next) => {
  try {
    ensureClient(req);

    await SavedItem.findOneAndDelete({
      userId: req.userId,
      entityType: "expert",
      entityId: req.params.expertId,
    });

    res.status(200).json({ message: "Expert removed from saved list." });
  } catch (err) {
    next(err);
  }
};

export const getSavedExperts = async (req, res, next) => {
  try {
    ensureClient(req);

    const page = Math.max(1, asNumber(req.query.page, 1));
    const limit = Math.min(80, Math.max(1, asNumber(req.query.limit, 20)));
    const skip = (page - 1) * limit;

    const filters = {
      userId: req.userId,
      entityType: "expert",
    };

    const [savedItems, total] = await Promise.all([
      SavedItem.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "entityId",
          model: "User",
          select:
            "username img headline desc country skills hourlyRate availability ratingAvg ratingCount companyName industry yearsExperience languages timezone responseSLAHours",
        }),
      SavedItem.countDocuments(filters),
    ]);

    res.status(200).json({
      items: toSavedExpertsResponse(savedItems),
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

export const listSavedSearches = async (req, res, next) => {
  try {
    const filters = {
      userId: req.userId,
      ...(req.query.scope && ["jobs", "experts"].includes(req.query.scope) ? { scope: req.query.scope } : {}),
    };

    const searches = await SavedSearch.find(filters).sort({ isPinned: -1, updatedAt: -1 });
    res.status(200).json(searches);
  } catch (err) {
    next(err);
  }
};

export const createSavedSearch = async (req, res, next) => {
  try {
    const { name, scope, filters, isPinned } = req.body;

    if (!name || typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80) {
      return next(createError(400, "name must be a string between 2 and 80 characters."));
    }
    if (!["jobs", "experts"].includes(scope)) {
      return next(createError(400, "scope must be either jobs or experts."));
    }
    if (filters !== undefined && !isPlainObject(filters)) {
      return next(createError(400, "filters must be a JSON object when provided."));
    }

    const created = await SavedSearch.create({
      userId: req.userId,
      name: name.trim(),
      scope,
      filters: filters || {},
      isPinned: Boolean(isPinned),
    });

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
};

export const updateSavedSearch = async (req, res, next) => {
  try {
    const savedSearch = await SavedSearch.findById(req.params.searchId);
    if (!savedSearch) {
      return next(createError(404, "Saved search not found."));
    }
    if (savedSearch.userId.toString() !== req.userId) {
      return next(createError(403, "You can only edit your own saved searches."));
    }

    const updates = {};

    if (req.body.name !== undefined) {
      if (typeof req.body.name !== "string" || req.body.name.trim().length < 2 || req.body.name.trim().length > 80) {
        return next(createError(400, "name must be a string between 2 and 80 characters."));
      }
      updates.name = req.body.name.trim();
    }

    if (req.body.filters !== undefined) {
      if (!isPlainObject(req.body.filters)) {
        return next(createError(400, "filters must be a JSON object."));
      }
      updates.filters = req.body.filters;
    }

    if (req.body.isPinned !== undefined) {
      updates.isPinned = Boolean(req.body.isPinned);
    }

    if (req.body.scope !== undefined) {
      if (!["jobs", "experts"].includes(req.body.scope)) {
        return next(createError(400, "scope must be either jobs or experts."));
      }
      updates.scope = req.body.scope;
    }

    const updated = await SavedSearch.findByIdAndUpdate(savedSearch._id, { $set: updates }, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

export const markSavedSearchUsed = async (req, res, next) => {
  try {
    const savedSearch = await SavedSearch.findById(req.params.searchId);
    if (!savedSearch) {
      return next(createError(404, "Saved search not found."));
    }
    if (savedSearch.userId.toString() !== req.userId) {
      return next(createError(403, "You can only use your own saved searches."));
    }

    savedSearch.lastUsedAt = new Date();
    await savedSearch.save();

    res.status(200).json(savedSearch);
  } catch (err) {
    next(err);
  }
};

export const deleteSavedSearch = async (req, res, next) => {
  try {
    const savedSearch = await SavedSearch.findById(req.params.searchId);
    if (!savedSearch) {
      return next(createError(404, "Saved search not found."));
    }
    if (savedSearch.userId.toString() !== req.userId) {
      return next(createError(403, "You can only delete your own saved searches."));
    }

    await SavedSearch.findByIdAndDelete(savedSearch._id);
    res.status(200).json({ message: "Saved search deleted." });
  } catch (err) {
    next(err);
  }
};
