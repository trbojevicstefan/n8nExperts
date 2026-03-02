import User from "../models/user.model.js";
import Service from "../models/service.model.js";
import PortfolioItem from "../models/portfolioItem.model.js";
import createError from "../utils/createError.js";

const safeUserProjection = "-password -googleId";

const asNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const isExpertRecord = (user) => user && (user.role === "expert" || user.isExpert || user.isSeller);

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

const computeProfileCompleteness = (expert, portfolio, services) => {
  const checks = [
    { key: "headline", done: Boolean(expert.headline?.trim()) },
    { key: "bio", done: Boolean(expert.desc?.trim()) },
    { key: "skills", done: Array.isArray(expert.skills) && expert.skills.length > 0 },
    { key: "hourlyRate", done: Number(expert.hourlyRate || 0) > 0 },
    { key: "availability", done: Boolean(expert.availability) },
    { key: "yearsExperience", done: typeof expert.yearsExperience === "number" && expert.yearsExperience > 0 },
    { key: "languages", done: Array.isArray(expert.languages) && expert.languages.length > 0 },
    { key: "timezone", done: Boolean(expert.timezone?.trim()) },
    { key: "industries", done: Array.isArray(expert.industries) && expert.industries.length > 0 },
    { key: "certifications", done: Array.isArray(expert.certifications) && expert.certifications.length > 0 },
    {
      key: "preferredEngagements",
      done: Array.isArray(expert.preferredEngagements) && expert.preferredEngagements.length > 0,
    },
    {
      key: "availabilityHoursPerWeek",
      done: typeof expert.availabilityHoursPerWeek === "number" && expert.availabilityHoursPerWeek > 0,
    },
    { key: "responseSLAHours", done: typeof expert.responseSLAHours === "number" && expert.responseSLAHours > 0 },
    { key: "portfolio", done: portfolio.length > 0 },
    { key: "services", done: services.length > 0 },
  ];

  const completed = checks.filter((item) => item.done);
  const score = checks.length > 0 ? Math.round((completed.length / checks.length) * 100) : 0;
  return {
    score,
    completed: completed.length,
    total: checks.length,
    missing: checks.filter((item) => !item.done).map((item) => item.key),
  };
};

export const getExperts = async (req, res, next) => {
  try {
    const page = Math.max(1, asNumber(req.query.page, 1));
    const limit = Math.min(50, Math.max(1, asNumber(req.query.limit, 12)));
    const skip = (page - 1) * limit;

    const minRate = req.query.minRate ? asNumber(req.query.minRate, 0) : null;
    const maxRate = req.query.maxRate ? asNumber(req.query.maxRate, Number.MAX_SAFE_INTEGER) : null;
    const search = (req.query.search || "").trim();
    const skills = (req.query.skills || "")
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    const filters = {
      $or: [{ role: "expert" }, { isExpert: true }, { isSeller: true }],
      ...(search && {
        $and: [
          {
            $or: [
              { username: { $regex: search, $options: "i" } },
              { headline: { $regex: search, $options: "i" } },
              { desc: { $regex: search, $options: "i" } },
              { specialties: { $in: [new RegExp(search, "i")] } },
              { skills: { $in: [new RegExp(search, "i")] } },
            ],
          },
        ],
      }),
      ...(skills.length > 0 && { skills: { $all: skills } }),
      ...((minRate !== null || maxRate !== null) && {
        hourlyRate: {
          ...(minRate !== null && { $gte: minRate }),
          ...(maxRate !== null && { $lte: maxRate }),
        },
      }),
    };

    const sortMap = {
      newest: { createdAt: -1 },
      rateAsc: { hourlyRate: 1 },
      rateDesc: { hourlyRate: -1 },
      projects: { completedProjects: -1 },
      earnings: { totalEarnings: -1 },
    };
    const sort = sortMap[req.query.sort] || sortMap.newest;

    const [experts, total] = await Promise.all([
      User.find(filters).select(safeUserProjection).skip(skip).limit(limit).sort(sort),
      User.countDocuments(filters),
    ]);

    res.status(200).json({
      experts,
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

export const getExpertProfile = async (req, res, next) => {
  try {
    const expert = await User.findById(req.params.expertId).select(safeUserProjection);
    if (!isExpertRecord(expert)) {
      return next(createError(404, "Expert not found!"));
    }

    const [portfolio, services] = await Promise.all([
      PortfolioItem.find({ expertId: expert._id, isPublished: true }).sort({ createdAt: -1 }),
      Service.find({ userId: expert._id.toString(), isActive: true }).sort({ createdAt: -1 }),
    ]);

    const isOwner = Boolean(req.userId) && req.userId === expert._id.toString();
    const profileCompleteness = isOwner ? computeProfileCompleteness(expert, portfolio, services) : null;

    res.status(200).json({
      expert,
      portfolio,
      services,
      ...(profileCompleteness && { profileCompleteness }),
    });
  } catch (err) {
    next(err);
  }
};

export const updateMyExpertProfile = async (req, res, next) => {
  if (!req.isExpert && req.role !== "expert") {
    return next(createError(403, "Only experts can update expert profile details."));
  }

  try {
    const allowedFields = [
      "username",
      "headline",
      "desc",
      "country",
      "phone",
      "hourlyRate",
      "skills",
      "specialties",
      "portfolioLinks",
      "githubProfile",
      "linkedinProfile",
      "availability",
      "img",
      "n8nExperienceLevel",
      "yearsExperience",
      "languages",
      "timezone",
      "industries",
      "certifications",
      "preferredEngagements",
      "minimumProjectBudget",
      "availabilityHoursPerWeek",
      "responseSLAHours",
      "calendarLink",
    ];

    const arrayFields = [
      "skills",
      "specialties",
      "portfolioLinks",
      "languages",
      "industries",
      "certifications",
      "preferredEngagements",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (arrayFields.includes(field)) {
          updates[field] = parseArray(req.body[field]);
          return;
        }
        updates[field] = req.body[field];
      }
    });

    if (updates.preferredEngagements) {
      updates.preferredEngagements = updates.preferredEngagements.filter((value) =>
        ["fixed", "hourly", "consulting"].includes(value)
      );
    }

    updates.role = "expert";
    updates.isExpert = true;
    updates.isClient = false;
    updates.isSeller = true;

    const updated = await User.findByIdAndUpdate(req.userId, { $set: updates }, { new: true }).select(safeUserProjection);
    if (!updated) {
      return next(createError(404, "User not found!"));
    }

    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

export const createPortfolioItem = async (req, res, next) => {
  if (!req.isExpert && req.role !== "expert") {
    return next(createError(403, "Only experts can add portfolio items."));
  }

  try {
    const { title, summary, link, imageUrl, tags, isPublished } = req.body;
    const newItem = new PortfolioItem({
      expertId: req.userId,
      title,
      summary,
      link,
      imageUrl,
      tags: Array.isArray(tags) ? tags : [],
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
    });

    const saved = await newItem.save();
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
};

export const updatePortfolioItem = async (req, res, next) => {
  if (!req.isExpert && req.role !== "expert") {
    return next(createError(403, "Only experts can edit portfolio items."));
  }

  try {
    const item = await PortfolioItem.findById(req.params.itemId);
    if (!item) {
      return next(createError(404, "Portfolio item not found!"));
    }
    if (item.expertId.toString() !== req.userId) {
      return next(createError(403, "You can edit only your portfolio items."));
    }

    const allowed = ["title", "summary", "link", "imageUrl", "tags", "isPublished"];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updated = await PortfolioItem.findByIdAndUpdate(item._id, { $set: updates }, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};

export const deletePortfolioItem = async (req, res, next) => {
  if (!req.isExpert && req.role !== "expert") {
    return next(createError(403, "Only experts can delete portfolio items."));
  }

  try {
    const item = await PortfolioItem.findById(req.params.itemId);
    if (!item) {
      return next(createError(404, "Portfolio item not found!"));
    }
    if (item.expertId.toString() !== req.userId) {
      return next(createError(403, "You can delete only your portfolio items."));
    }

    await PortfolioItem.findByIdAndDelete(item._id);
    res.status(200).json({ message: "Portfolio item deleted." });
  } catch (err) {
    next(err);
  }
};
