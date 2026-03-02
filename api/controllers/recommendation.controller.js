import Job from "../models/job.model.js";
import JobApplication from "../models/jobApplication.model.js";
import User from "../models/user.model.js";
import createError from "../utils/createError.js";

const asNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const asWeight = (value, fallback, min = 0, max = 20) => {
  const parsed = asNumber(value, fallback);
  return Math.min(max, Math.max(min, parsed));
};

const scoreJobsForExpert = (jobs, skills, weights) => {
  const normalizedSkills = skills.map((skill) => String(skill).toLowerCase());
  const now = Date.now();

  return jobs
    .map((job) => {
      const jobSkills = (job.skills || []).map((skill) => String(skill).toLowerCase());
      const overlapSkills = jobSkills.filter((skill) => normalizedSkills.includes(skill));
      const overlapCount = overlapSkills.length;
      const recencyDays = Math.max(0, (now - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      const recencyScore = Math.max(0, 20 - recencyDays);
      const skillScore = overlapCount * 10 * (weights.skillWeight / 10);
      const freshnessScore = recencyScore * (weights.recencyWeight / 10);
      const baseScore = skillScore + freshnessScore;

      return {
        job,
        overlapSkills,
        matchScore: Number(baseScore.toFixed(2)),
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore || new Date(b.job.createdAt).getTime() - new Date(a.job.createdAt).getTime());
};

const scoreExpertsForClient = (experts, neededSkills, weights) => {
  const normalizedSkills = neededSkills.map((skill) => String(skill).toLowerCase());

  return experts
    .map((expert) => {
      const expertSkills = (expert.skills || []).map((skill) => String(skill).toLowerCase());
      const overlapSkills = expertSkills.filter((skill) => normalizedSkills.includes(skill));
      const overlapCount = overlapSkills.length;
      const skillScore = overlapCount * 10 * (weights.skillWeight / 10);
      const ratingScore = Number(expert.ratingAvg || 0) * 5 * (weights.ratingWeight / 10);
      const completedProjectsScore = Math.min(Number(expert.completedProjects || 0), 20) * (weights.completedWeight / 10);
      const availabilityBonus =
        (expert.availability === "available" ? 5 : expert.availability === "busy" ? 2 : 0) * (weights.availabilityWeight / 10);
      const score = skillScore + ratingScore + completedProjectsScore + availabilityBonus;

      return {
        expert,
        overlapSkills,
        matchScore: Number(score.toFixed(2)),
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore || Number(b.expert.ratingAvg || 0) - Number(a.expert.ratingAvg || 0));
};

export const getRecommendedJobs = async (req, res, next) => {
  try {
    if (req.role !== "expert" && !req.isExpert) {
      return next(createError(403, "Only experts can access job recommendations."));
    }

    const page = Math.max(1, asNumber(req.query.page, 1));
    const limit = Math.min(40, Math.max(1, asNumber(req.query.limit, 12)));
    const skip = (page - 1) * limit;

    const expert = await User.findById(req.userId).select("skills");
    const expertSkills = Array.isArray(expert?.skills) ? expert.skills : [];
    const weights = {
      skillWeight: asWeight(req.query.skillWeight, 8, 0, 10),
      recencyWeight: asWeight(req.query.recencyWeight, 4, 0, 10),
    };

    const appliedJobIds = await JobApplication.find({ expertId: req.userId }).distinct("jobId");

    const candidateJobs = await Job.find({
      status: "open",
      clientId: { $ne: req.userId },
      _id: { $nin: appliedJobIds },
    })
      .populate(
        "clientId",
        "username img country companyName industry jobsPostedCount jobsCompletedCount hiresCount avgClientResponseHours"
      )
      .sort({ createdAt: -1 })
      .limit(200);

    const scored = scoreJobsForExpert(candidateJobs, expertSkills, weights);
    const paginated = scored.slice(skip, skip + limit);

    res.status(200).json({
      recommendations: paginated,
      basedOnSkills: expertSkills,
      weights,
      pagination: {
        page,
        limit,
        total: scored.length,
        pages: Math.ceil(scored.length / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getRecommendedExperts = async (req, res, next) => {
  try {
    if (req.role !== "client" || req.isExpert) {
      return next(createError(403, "Only clients can access expert recommendations."));
    }

    const page = Math.max(1, asNumber(req.query.page, 1));
    const limit = Math.min(40, Math.max(1, asNumber(req.query.limit, 12)));
    const skip = (page - 1) * limit;

    const clientJobs = await Job.find({
      clientId: req.userId,
      status: { $in: ["open", "in_progress"] },
    })
      .sort({ updatedAt: -1 })
      .limit(12)
      .select("skills");

    const neededSkills = Array.from(new Set(clientJobs.flatMap((job) => job.skills || []))).slice(0, 30);
    const weights = {
      skillWeight: asWeight(req.query.skillWeight, 7, 0, 10),
      ratingWeight: asWeight(req.query.ratingWeight, 5, 0, 10),
      completedWeight: asWeight(req.query.completedWeight, 3, 0, 10),
      availabilityWeight: asWeight(req.query.availabilityWeight, 2, 0, 10),
    };

    const experts = await User.find({
      _id: { $ne: req.userId },
      $or: [{ role: "expert" }, { isExpert: true }, { isSeller: true }],
    })
      .select(
        "username img headline desc country skills hourlyRate availability ratingAvg ratingCount completedProjects yearsExperience languages timezone industries"
      )
      .limit(200);

    const scored = scoreExpertsForClient(experts, neededSkills, weights);
    const paginated = scored.slice(skip, skip + limit);

    res.status(200).json({
      recommendations: paginated,
      basedOnSkills: neededSkills,
      weights,
      pagination: {
        page,
        limit,
        total: scored.length,
        pages: Math.ceil(scored.length / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};
