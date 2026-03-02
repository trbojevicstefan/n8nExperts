import mongoose from "mongoose";

const { Schema } = mongoose;

const AttachmentSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 180,
      required: true,
    },
    url: {
      type: String,
      trim: true,
      maxlength: 2000,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const WorkspaceMessageSchema = new Schema(
  {
    threadId: {
      type: Schema.Types.ObjectId,
      ref: "WorkspaceThread",
      required: true,
      index: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    body: {
      type: String,
      required: false,
      trim: true,
      default: "",
      maxlength: 4000,
    },
    attachments: {
      type: [AttachmentSchema],
      default: [],
      validate: {
        validator: (value) => Array.isArray(value) && value.length <= 5,
        message: "A message supports up to 5 attachments.",
      },
    },
  },
  {
    timestamps: true,
  }
);

WorkspaceMessageSchema.index({ threadId: 1, createdAt: 1 });

export default mongoose.model("WorkspaceMessage", WorkspaceMessageSchema);
