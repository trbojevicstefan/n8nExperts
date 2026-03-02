import mongoose from "mongoose";

const { Schema } = mongoose;

const WorkspaceThreadSchema = new Schema(
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
    invitationId: {
      type: Schema.Types.ObjectId,
      ref: "Invitation",
      required: false,
      default: null,
    },
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "JobApplication",
      required: false,
      default: null,
    },
    lastMessage: {
      type: String,
      required: false,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    lastMessageSenderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    unreadByClient: {
      type: Number,
      default: 0,
      min: 0,
    },
    unreadByExpert: {
      type: Number,
      default: 0,
      min: 0,
    },
    archivedByClient: {
      type: Boolean,
      default: false,
      index: true,
    },
    archivedByExpert: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

WorkspaceThreadSchema.index({ jobId: 1, clientId: 1, expertId: 1 }, { unique: true });
WorkspaceThreadSchema.index({ clientId: 1, lastMessageAt: -1 });
WorkspaceThreadSchema.index({ expertId: 1, lastMessageAt: -1 });

export default mongoose.model("WorkspaceThread", WorkspaceThreadSchema);
