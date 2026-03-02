import app, { connectDb } from "./app.js";

const PORT = process.env.PORT;

app.listen(PORT, async () => {
  try {
    await connectDb();
    console.log("MongoDB connection successful");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }

  console.log(`n8nExperts API running on port ${PORT}`);
});
