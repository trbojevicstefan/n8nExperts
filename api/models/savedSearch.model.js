import mongoose from "mongoose";

const { Schema } = mongoose;

const SavedSearchSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    scope: {
      type: String,
      enum: ["jobs", "experts"],
      required: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      required: true,
      minlength: 2,
      maxlength: 80,
    },
    filters: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    lastUsedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

SavedSearchSchema.index({ userId: 1, scope: 1, createdAt: -1 });

export default mongoose.model("SavedSearch", SavedSearchSchema);
