import mongoose from "mongoose";
import dotenv from "dotenv";
import JobApplication from "../models/jobApplication.model.js";
import User from "../models/user.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGO;

const connect = async () => {
  if (!MONGO_URI) {
    throw new Error("Missing MONGO_URI (or MONGO) in environment.");
  }

  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 8000,
  });
};

const ensureUserDefaults = async () => {
  const result = await User.updateMany(
    {},
    {
      $set: {
        jobsPostedCount: 0,
        jobsCompletedCount: 0,
        hiresCount: 0,
        avgClientResponseHours: 0,
      },
    }
  );

  return result.modifiedCount || 0;
};

const backfillApplications = async () => {
  const cursor = JobApplication.find({
    $or: [
      { statusChangedAt: { $exists: false } },
      { statusChangedAt: null },
      { statusHistory: { $exists: false } },
      { statusHistory: { $size: 0 } },
    ],
  }).cursor();

  const operations = [];
  let scanned = 0;

  for await (const application of cursor) {
    scanned += 1;

    const fallbackAt = application.updatedAt || application.createdAt || new Date();
    const statusChangedAt = application.statusChangedAt || fallbackAt;
    const history =
      Array.isArray(application.statusHistory) && application.statusHistory.length > 0
        ? application.statusHistory
        : [
            {
              from: null,
              to: application.status,
              byUserId: application.expertId || application.clientId || null,
              at: fallbackAt,
            },
          ];

    operations.push({
      updateOne: {
        filter: { _id: application._id },
        update: {
          $set: {
            statusChangedAt,
            statusHistory: history,
          },
        },
      },
    });

    if (operations.length >= 500) {
      await JobApplication.bulkWrite(operations, { ordered: false });
      operations.length = 0;
    }
  }

  if (operations.length > 0) {
    await JobApplication.bulkWrite(operations, { ordered: false });
  }

  return scanned;
};

const run = async () => {
  try {
    await connect();

    const [userUpdates, applicationBackfills] = await Promise.all([ensureUserDefaults(), backfillApplications()]);

    console.log(`Phase 2 migration completed. Users touched: ${userUpdates}. Applications backfilled: ${applicationBackfills}.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Phase 2 migration failed:", error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

run();
