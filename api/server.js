import app, { connectDb } from "./app.js";

const PORT = process.env.PORT;

const startServer = async () => {
  try {
    await connectDb();
    console.log("MongoDB connection successful");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`n8nExperts API running on port ${PORT}`);
  });
};

startServer();
