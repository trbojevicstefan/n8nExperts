import mongoose from "mongoose";
const { Schema } = mongoose;

const ServiceSchema = new Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 140,
        },
        desc: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000,
        },
        totalStars: {
            type: Number,
            default: 0,
        },
        starNumber: {
            type: Number,
            default: 0,
        },
        // Hardcoded to n8n Automation - no category selection in UI
        category: {
            type: String,
            default: "n8n Automation",
            immutable: true,
        },
        // Service type: Fixed Price for projects, Consultation for hourly calls
        serviceType: {
            type: String,
            enum: ['Fixed Price', 'Consultation'],
            required: true,
            default: 'Fixed Price',
        },
        // Price in USD (for fixed price or per hour for consultation)
        price: {
            type: Number,
            required: true,
        },
        // Consultation specific
        consultationDuration: {
            type: Number, // Duration in minutes
            default: 60,
        },
        cover: {
            type: String,
            required: false,
            trim: true,
            maxlength: 500,
        },
        images: {
            type: [String],
            required: false,
        },
        bestFor: {
            type: String,
            required: false,
            trim: true,
            maxlength: 300,
        },
        shortTitle: {
            type: String,
            required: false,
            trim: true,
            maxlength: 120,
        },
        shortDesc: {
            type: String,
            required: false,
            trim: true,
            maxlength: 300,
        },
        deliveryTime: {
            type: Number, // Days for fixed price projects
            required: true,
        },
        revisionNumber: {
            type: Number,
            required: true,
            default: 2,
        },
        features: {
            type: [{
                type: String,
                trim: true,
                maxlength: 160,
            }],
            required: false,
        },
        sales: {
            type: Number,
            default: 0,
        },
        // n8n Specific Fields
        workflowComplexity: {
            type: String,
            enum: ['Simple', 'Moderate', 'Complex', 'Enterprise'],
            default: 'Moderate',
        },
        integrationsIncluded: [{
            type: String,
        }],
        sampleWorkflowJson: {
            type: String, // URL to sample workflow JSON
        },
        // Tags for searchability
        tags: [{
            type: String,
        }],
        // Active status
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Virtual for average rating
ServiceSchema.virtual('avgRating').get(function () {
    if (this.starNumber > 0) {
        return (this.totalStars / this.starNumber).toFixed(1);
    }
    return 0;
});

// Ensure virtuals are included in JSON output
ServiceSchema.set('toJSON', { virtuals: true });
ServiceSchema.set('toObject', { virtuals: true });

export default mongoose.model("Service", ServiceSchema);
