import mongoose from "mongoose";

const { Schema } = mongoose;

const PortfolioItemSchema = new Schema(
  {
    expertId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    summary: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
      maxlength: 2000,
    },
    link: {
      type: String,
      required: false,
      trim: true,
      maxlength: 500,
    },
    imageUrl: {
      type: String,
      required: false,
      trim: true,
      maxlength: 500,
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 40,
      },
    ],
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

PortfolioItemSchema.index({ expertId: 1, createdAt: -1 });

export default mongoose.model("PortfolioItem", PortfolioItemSchema);
