import mongoose from "mongoose";

const { Schema } = mongoose;

const SavedItemSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    entityType: {
      type: String,
      enum: ["job", "expert"],
      required: true,
      index: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

SavedItemSchema.index({ userId: 1, entityType: 1, entityId: 1 }, { unique: true });
SavedItemSchema.index({ userId: 1, entityType: 1, createdAt: -1 });

export default mongoose.model("SavedItem", SavedItemSchema);
