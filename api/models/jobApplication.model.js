import mongoose from "mongoose";

const { Schema } = mongoose;

const ApplicationStatusValues = ["submitted", "shortlisted", "accepted", "rejected"];

const ApplicationStatusHistorySchema = new Schema(
  {
    from: {
      type: String,
      enum: [...ApplicationStatusValues, null],
      default: null,
    },
    to: {
      type: String,
      enum: ApplicationStatusValues,
      required: true,
    },
    byUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    at: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

const JobApplicationSchema = new Schema(
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
    coverLetter: {
      type: String,
      required: true,
      trim: true,
      minlength: 30,
      maxlength: 3000,
    },
    bidAmount: {
      type: Number,
      required: false,
      min: 1,
    },
    estimatedDuration: {
      type: String,
      required: false,
      trim: true,
      maxlength: 120,
    },
    status: {
      type: String,
      enum: ApplicationStatusValues,
      default: "submitted",
      index: true,
    },
    clientNote: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
      select: false,
    },
    statusChangedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    statusHistory: {
      type: [ApplicationStatusHistorySchema],
      default: [],
    },
    source: {
      type: String,
      enum: ["direct", "invitation"],
      default: "direct",
      index: true,
    },
    invitationId: {
      type: Schema.Types.ObjectId,
      ref: "Invitation",
      required: false,
      default: null,
      index: true,
    },
    withdrawnAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

JobApplicationSchema.pre("save", function ensureInitialStatusHistory(next) {
  if (this.isNew) {
    const at = this.statusChangedAt || new Date();
    this.statusChangedAt = at;
    if (!Array.isArray(this.statusHistory) || this.statusHistory.length === 0) {
      this.statusHistory = [
        {
          from: null,
          to: this.status,
          byUserId: this.expertId || this.clientId || null,
          at,
        },
      ];
    }
  }
  next();
});

JobApplicationSchema.index({ jobId: 1, expertId: 1 }, { unique: true });
JobApplicationSchema.index({ jobId: 1, status: 1, createdAt: -1 });
JobApplicationSchema.index({ expertId: 1, status: 1, createdAt: -1 });
JobApplicationSchema.index({ clientId: 1, status: 1, createdAt: -1 });
JobApplicationSchema.index({ invitationId: 1 }, { sparse: true });

export default mongoose.model("JobApplication", JobApplicationSchema);
