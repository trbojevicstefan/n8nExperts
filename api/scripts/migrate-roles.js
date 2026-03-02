import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || process.env.MONGO;

const run = async () => {
  if (!MONGO_URI) {
    throw new Error("Missing MONGO_URI/MONGO environment variable.");
  }

  await mongoose.connect(MONGO_URI);

  const users = await User.find({});
  let updated = 0;

  for (const user of users) {
    const role = user.role || (user.isExpert || user.isSeller ? "expert" : "client");
    const shouldBeExpert = role === "expert";

    const needsUpdate =
      user.role !== role ||
      user.isExpert !== shouldBeExpert ||
      user.isSeller !== shouldBeExpert ||
      user.isClient === shouldBeExpert;

    if (!needsUpdate) {
      continue;
    }

    user.role = role;
    user.isExpert = shouldBeExpert;
    user.isSeller = shouldBeExpert;
    user.isClient = !shouldBeExpert;
    await user.save();
    updated += 1;
  }

  console.log(`Role migration finished. Updated ${updated} users.`);
  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error("Role migration failed:", err.message);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore disconnect errors
  }
  process.exit(1);
});
