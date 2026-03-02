import mongoose from "mongoose";

const { Schema } = mongoose;

const InvitationSchema = new Schema(
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
    message: {
      type: String,
      required: false,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["sent", "accepted", "declined"],
      default: "sent",
      index: true,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
    respondedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

InvitationSchema.index({ jobId: 1, expertId: 1 }, { unique: true });

export default mongoose.model("Invitation", InvitationSchema);
