import mongoose from "mongoose";

const { Schema } = mongoose;

const JobSchema = new Schema(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 140,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 30,
      maxlength: 5000,
    },
    budgetType: {
      type: String,
      enum: ["hourly", "fixed"],
      default: "fixed",
      required: true,
    },
    budgetAmount: {
      type: Number,
      required: true,
      min: 1,
    },
    skills: [
      {
        type: String,
        trim: true,
        maxlength: 64,
      },
    ],
    attachments: [
      {
        type: String,
      },
    ],
    visibility: {
      type: String,
      enum: ["public", "invite_only"],
      default: "public",
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "completed", "closed", "cancelled"],
      default: "open",
      required: true,
      index: true,
    },
    acceptedApplicationId: {
      type: Schema.Types.ObjectId,
      ref: "JobApplication",
      required: false,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

JobSchema.index({ createdAt: -1 });
JobSchema.index({ title: "text", description: "text", skills: "text" });

export default mongoose.model("Job", JobSchema);
