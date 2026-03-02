import mongoose from "mongoose";

const { Schema } = mongoose;

const JobReviewSchema = new Schema(
  {
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    expertId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: false,
      trim: true,
      maxlength: 1200,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

JobReviewSchema.index({ jobId: 1, clientId: 1 }, { unique: true });
JobReviewSchema.index({ expertId: 1, createdAt: -1 });

export default mongoose.model("JobReview", JobReviewSchema);
