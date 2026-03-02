import mongoose from "mongoose";
const { Schema } = mongoose;

const OrderSchema = new Schema(
  {
    serviceId: {
      type: String,
      required: true,
    },
    img: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    // Expert who provides the service
    expertId: {
      type: String,
      required: true,
    },
    // Client who made the purchase
    clientId: {
      type: String,
      required: true,
    },
    // Legacy field for backwards compatibility
    sellerId: {
      type: String,
    },
    buyerId: {
      type: String,
    },

    // Order Status
    status: {
      type: String,
      enum: ['pending', 'accepted', 'in_progress', 'delivered', 'completed', 'disputed', 'cancelled'],
      default: 'pending',
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },

    // Stripe Payment
    payment_intent: {
      type: String,
      required: true,
    },

    // Platform Fee Calculation (15% default)
    platformFeePercent: {
      type: Number,
      default: 15,
    },
    platformFee: {
      type: Number,
      default: 0,
    },
    expertPayout: {
      type: Number,
      default: 0,
    },

    // Stripe Connect Transfer
    stripeTransferId: {
      type: String,
    },
    payoutStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },

    // Service Type specific
    serviceType: {
      type: String,
      enum: ['Fixed Price', 'Consultation'],
      default: 'Fixed Price',
    },
    consultationDate: {
      type: Date, // For consultation bookings
    },
    consultationDuration: {
      type: Number, // Minutes
    },

    // Deliverables
    deliverables: [{
      type: String, // URLs to delivered files
    }],
    workflowJsonDelivered: {
      type: String, // URL to delivered workflow JSON
    },

    // Communication
    requirements: {
      type: String, // Client's project requirements
    },
    notes: {
      type: String, // Expert's notes
    },

    // Timeline
    expectedDeliveryDate: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to calculate fees
OrderSchema.pre('save', function (next) {
  if (this.price && this.platformFeePercent) {
    this.platformFee = (this.price * this.platformFeePercent) / 100;
    this.expertPayout = this.price - this.platformFee;
  }
  // Set legacy fields for backwards compatibility
  this.sellerId = this.expertId;
  this.buyerId = this.clientId;
  next();
});

export default mongoose.model("Order", OrderSchema);