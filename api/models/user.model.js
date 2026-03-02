import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId; // Password not required for Google OAuth users
    },
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  img: {
    type: String,
    required: false,
  },
  country: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: false,
  },
  desc: {
    type: String,
    required: false,
  },

  role: {
    type: String,
    enum: ["client", "expert"],
    default: "client",
    index: true,
  },
  headline: {
    type: String,
    required: false,
    trim: true,
    maxlength: 120,
  },
  skills: [{
    type: String,
    trim: true,
    maxlength: 64,
  }],
  availability: {
    type: String,
    enum: ["available", "busy", "unavailable"],
    default: "available",
  },

  // Role flags
  isClient: {
    type: Boolean,
    default: true,
  },
  isExpert: {
    type: Boolean,
    default: false,
  },
  isSeller: {
    type: Boolean,
    default: false,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },

  // Expert Verification
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifiedAt: {
    type: Date,
  },

  // n8n Expert Specific Fields
  n8nExperienceLevel: {
    type: String,
    enum: ['Junior', 'Senior', 'Architect'],
    default: 'Junior',
  },
  specialties: [{
    type: String,
    enum: [
      'API Integration',
      'AI Agents',
      'Self-Hosting',
      'Custom Nodes',
      'Workflow Architecture',
      'Database Integration',
      'CRM Automation',
      'E-commerce Automation',
      'DevOps & CI/CD',
      'Data Processing'
    ],
  }],
  portfolioLinks: [{
    type: String,
  }],
  workflowJsons: [{
    type: String, // URLs to uploaded workflow JSON files
  }],
  githubProfile: {
    type: String,
  },
  linkedinProfile: {
    type: String,
  },
  yearsExperience: {
    type: Number,
    min: 0,
    max: 60,
    default: null,
  },
  languages: [{
    type: String,
    trim: true,
    maxlength: 40,
  }],
  timezone: {
    type: String,
    trim: true,
    maxlength: 80,
  },
  industries: [{
    type: String,
    trim: true,
    maxlength: 80,
  }],
  certifications: [{
    type: String,
    trim: true,
    maxlength: 120,
  }],
  preferredEngagements: [{
    type: String,
    enum: ["fixed", "hourly", "consulting"],
  }],
  minimumProjectBudget: {
    type: Number,
    min: 0,
    default: null,
  },
  availabilityHoursPerWeek: {
    type: Number,
    min: 0,
    max: 168,
    default: null,
  },
  responseSLAHours: {
    type: Number,
    min: 0,
    max: 336,
    default: null,
  },
  calendarLink: {
    type: String,
    trim: true,
    maxlength: 500,
  },

  // Client Profile Fields
  companyName: {
    type: String,
    trim: true,
    maxlength: 120,
  },
  companyWebsite: {
    type: String,
    trim: true,
    maxlength: 300,
  },
  companySize: {
    type: String,
    trim: true,
    maxlength: 80,
  },
  industry: {
    type: String,
    trim: true,
    maxlength: 80,
  },
  foundedYear: {
    type: Number,
    min: 1900,
    max: 2100,
    default: null,
  },
  location: {
    type: String,
    trim: true,
    maxlength: 120,
  },
  teamDescription: {
    type: String,
    trim: true,
    maxlength: 2000,
  },
  logoUrl: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  projectPreferences: [{
    type: String,
    trim: true,
    maxlength: 120,
  }],

  // Pricing
  hourlyRate: {
    type: Number,
    default: 0,
  },

  // Stripe Connect
  stripeConnectAccountId: {
    type: String,
  },
  stripeConnectOnboarded: {
    type: Boolean,
    default: false,
  },

  // Stats
  totalEarnings: {
    type: Number,
    default: 0,
  },
  completedProjects: {
    type: Number,
    default: 0,
  },
  responseTime: {
    type: Number, // Average response time in hours
    default: 24,
  },
  ratingTotal: {
    type: Number,
    default: 0,
  },
  ratingCount: {
    type: Number,
    default: 0,
  },
  ratingAvg: {
    type: Number,
    default: 0,
  },
  jobsPostedCount: {
    type: Number,
    default: 0,
  },
  jobsCompletedCount: {
    type: Number,
    default: 0,
  },
  hiresCount: {
    type: Number,
    default: 0,
  },
  avgClientResponseHours: {
    type: Number,
    default: 0,
  },
  clientRatingAvg: {
    type: Number,
    default: null,
  },
}, {
  timestamps: true
});

// Keep legacy role flags consistent with role for backwards compatibility.
userSchema.pre("save", function syncRoleFlags(next) {
  if (this.role === "expert") {
    this.isExpert = true;
    this.isClient = false;
    this.isSeller = true;
  } else {
    this.isExpert = false;
    this.isClient = true;
    this.isSeller = false;
  }
  next();
});

userSchema.virtual("avgRating").get(function () {
  if (this.ratingCount > 0) {
    return Number((this.ratingTotal / this.ratingCount).toFixed(2));
  }
  return 0;
});

export default mongoose.model("User", userSchema);
