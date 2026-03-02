import Job from "../models/job.model.js";
import JobApplication from "../models/jobApplication.model.js";
import User from "../models/user.model.js";

export const computeClientMetrics = async (clientId) => {
  const [jobsPostedCount, jobsCompletedCount, activeJobs, hiresCount, applicationsForResponse] = await Promise.all([
    Job.countDocuments({ clientId }),
    Job.countDocuments({ clientId, status: "completed" }),
    Job.countDocuments({ clientId, status: { $in: ["open", "in_progress"] } }),
    Job.countDocuments({ clientId, acceptedApplicationId: { $ne: null } }),
    JobApplication.find({ clientId })
      .select("createdAt statusHistory")
      .limit(1200)
      .lean(),
  ]);

  let totalResponseHours = 0;
  let responseSamples = 0;

  for (const application of applicationsForResponse) {
    const firstClientTransition = (application.statusHistory || []).find((entry) => {
      const actorId = entry?.byUserId ? String(entry.byUserId) : "";
      return actorId === String(clientId) && entry?.from !== null;
    });

    if (!firstClientTransition?.at) continue;

    const diffMs = new Date(firstClientTransition.at).getTime() - new Date(application.createdAt).getTime();
    if (Number.isFinite(diffMs) && diffMs >= 0) {
      totalResponseHours += diffMs / (1000 * 60 * 60);
      responseSamples += 1;
    }
  }

  const avgResponseHours = responseSamples > 0 ? Number((totalResponseHours / responseSamples).toFixed(1)) : 0;
  const hireRate = jobsPostedCount > 0 ? Number(((hiresCount / jobsPostedCount) * 100).toFixed(1)) : 0;

  return {
    jobsPosted: jobsPostedCount,
    jobsCompleted: jobsCompletedCount,
    activeJobs,
    hiresCount,
    hireRate,
    avgResponseHours,
  };
};

export const refreshClientMetrics = async (clientId) => {
  const metrics = await computeClientMetrics(clientId);

  await User.findByIdAndUpdate(clientId, {
    $set: {
      jobsPostedCount: metrics.jobsPosted,
      jobsCompletedCount: metrics.jobsCompleted,
      hiresCount: metrics.hiresCount,
      avgClientResponseHours: metrics.avgResponseHours,
    },
  });

  return metrics;
};
