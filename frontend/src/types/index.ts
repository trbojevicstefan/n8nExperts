export type Role = "client" | "expert";

export interface User {
  _id: string;
  username: string;
  email: string;
  img?: string;
  country?: string;
  phone?: string;
  desc?: string;
  role: Role;
  isClient: boolean;
  isExpert: boolean;
  isSeller: boolean;
  isAdmin?: boolean;
  ratingTotal?: number;
  ratingCount?: number;
  ratingAvg?: number;
  companyName?: string;
  companyWebsite?: string;
  companySize?: string;
  industry?: string;
  foundedYear?: number | null;
  location?: string;
  teamDescription?: string;
  logoUrl?: string;
  projectPreferences?: string[];
  jobsPostedCount?: number;
  jobsCompletedCount?: number;
  hiresCount?: number;
  avgClientResponseHours?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileCompleteness {
  score: number;
  completed: number;
  total: number;
  missing: string[];
}

export interface ExpertProfile extends User {
  headline?: string;
  skills?: string[];
  hourlyRate?: number;
  availability?: "available" | "busy" | "unavailable";
  githubProfile?: string;
  linkedinProfile?: string;
  completedProjects?: number;
  totalEarnings?: number;
  yearsExperience?: number | null;
  languages?: string[];
  timezone?: string;
  industries?: string[];
  certifications?: string[];
  preferredEngagements?: Array<"fixed" | "hourly" | "consulting">;
  minimumProjectBudget?: number | null;
  availabilityHoursPerWeek?: number | null;
  responseSLAHours?: number | null;
  calendarLink?: string;
}

export interface PortfolioItem {
  _id: string;
  expertId: string;
  title: string;
  summary: string;
  link?: string;
  imageUrl?: string;
  tags: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  _id: string;
  userId: string;
  title: string;
  desc: string;
  serviceType: "Fixed Price" | "Consultation";
  price: number;
  cover: string;
  images?: string[];
  shortTitle: string;
  shortDesc: string;
  deliveryTime: number;
  revisionNumber: number;
  features?: string[];
  workflowComplexity?: "Simple" | "Moderate" | "Complex" | "Enterprise";
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  _id: string;
  clientId:
    | string
    | {
        _id: string;
        username: string;
        img?: string;
        country?: string;
        companyName?: string;
        industry?: string;
        jobsPostedCount?: number;
        jobsCompletedCount?: number;
        hiresCount?: number;
        avgClientResponseHours?: number;
      };
  title: string;
  description: string;
  budgetType: "hourly" | "fixed";
  budgetAmount: number;
  skills: string[];
  attachments: string[];
  visibility: "public" | "invite_only";
  status: "open" | "in_progress" | "completed" | "closed" | "cancelled";
  acceptedApplicationId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationStatusHistoryItem {
  from: "submitted" | "shortlisted" | "accepted" | "rejected" | null;
  to: "submitted" | "shortlisted" | "accepted" | "rejected";
  byUserId?: string | null;
  at: string;
}

export interface JobApplication {
  _id: string;
  jobId:
    | string
    | {
        _id: string;
        title: string;
        budgetType: "hourly" | "fixed";
        budgetAmount: number;
        status: Job["status"];
        createdAt: string;
        clientId?: string;
      };
  clientId:
    | string
    | {
        _id: string;
        username: string;
        img?: string;
        companyName?: string;
        industry?: string;
        jobsPostedCount?: number;
        jobsCompletedCount?: number;
        hiresCount?: number;
        avgClientResponseHours?: number;
      };
  expertId:
    | string
    | {
        _id: string;
        username: string;
        img?: string;
        headline?: string;
        hourlyRate?: number;
        skills?: string[];
        country?: string;
      };
  coverLetter: string;
  bidAmount?: number;
  estimatedDuration?: string;
  status: "submitted" | "shortlisted" | "accepted" | "rejected";
  source?: "direct" | "invitation";
  invitationId?: string | null;
  clientNote?: string;
  statusChangedAt?: string;
  statusHistory?: ApplicationStatusHistoryItem[];
  withdrawnAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Invitation {
  _id: string;
  jobId:
    | string
    | {
        _id: string;
        title: string;
        status: Job["status"];
        budgetType: Job["budgetType"];
        budgetAmount: number;
      };
  clientId:
    | string
    | {
        _id: string;
        username: string;
        img?: string;
      };
  expertId:
    | string
    | {
        _id: string;
        username: string;
        img?: string;
        headline?: string;
      };
  message?: string;
  status: "sent" | "accepted" | "declined";
  respondedAt?: string | null;
  respondedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  actorId?: string | { _id: string; username: string; img?: string } | null;
  type: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  isRead: boolean;
  readAt?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceThread {
  _id: string;
  jobId:
    | string
    | {
        _id: string;
        title: string;
        status: Job["status"];
      };
  clientId:
    | string
    | {
        _id: string;
        username: string;
        img?: string;
      };
  expertId:
    | string
    | {
        _id: string;
        username: string;
        img?: string;
        headline?: string;
      };
  invitationId?: string | null;
  applicationId?: string | null;
  lastMessage?: string;
  lastMessageAt: string;
  lastMessageSenderId?: string | null;
  unreadByClient: number;
  unreadByExpert: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceMessage {
  _id: string;
  threadId: string;
  jobId: string;
  senderId:
    | string
    | {
        _id: string;
        username: string;
        img?: string;
      };
  body: string;
  attachments?: Array<{
    name: string;
    url: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface JobReview {
  _id: string;
  jobId:
    | string
    | {
        _id: string;
        title: string;
      };
  clientId:
    | string
    | {
        _id: string;
        username: string;
        img?: string;
      };
  expertId:
    | string
    | {
        _id: string;
        username: string;
        img?: string;
        headline?: string;
        ratingAvg?: number;
        ratingCount?: number;
      };
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientTrustMetrics {
  jobsPosted: number;
  jobsCompleted: number;
  hireRate: number;
  avgResponseHours: number;
  activeJobs: number;
}

export interface ClientProfilePrivate extends User {
  role: "client";
  trustMetrics?: ClientTrustMetrics;
}

export interface ClientProfilePublic {
  client: Pick<
    User,
    | "_id"
    | "username"
    | "img"
    | "desc"
    | "country"
    | "companyName"
    | "companyWebsite"
    | "companySize"
    | "industry"
    | "foundedYear"
    | "location"
    | "teamDescription"
    | "logoUrl"
    | "projectPreferences"
    | "createdAt"
    | "updatedAt"
  >;
  trustMetrics: ClientTrustMetrics;
}

export interface PaginatedResponse {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface JobApplicationsResponse extends PaginatedResponse {
  applications: JobApplication[];
  countsByStatus: Record<"submitted" | "shortlisted" | "accepted" | "rejected", number>;
}

export interface MyApplicationsResponse extends PaginatedResponse {
  applications: JobApplication[];
}

export interface ClientPipelineJobCount {
  jobId: string;
  title: string;
  count: number;
}

export interface ClientPipelineResponse extends PaginatedResponse {
  applications: JobApplication[];
  countsByStatus: Record<"submitted" | "shortlisted" | "accepted" | "rejected", number>;
  countsByJob: ClientPipelineJobCount[];
}

export interface SavedJobItem {
  _id: string;
  job: Job;
  createdAt: string;
  updatedAt: string;
}

export interface SavedExpertItem {
  _id: string;
  expert: ExpertProfile;
  createdAt: string;
  updatedAt: string;
}

export interface SavedSearch {
  _id: string;
  userId: string;
  scope: "jobs" | "experts";
  name: string;
  filters: Record<string, unknown>;
  isPinned: boolean;
  lastUsedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JobRecommendation {
  job: Job;
  overlapSkills: string[];
  matchScore: number;
}

export interface ExpertRecommendation {
  expert: ExpertProfile;
  overlapSkills: string[];
  matchScore: number;
}

export interface JobRecommendationWeights {
  skillWeight: number;
  recencyWeight: number;
}

export interface ExpertRecommendationWeights {
  skillWeight: number;
  ratingWeight: number;
  completedWeight: number;
  availabilityWeight: number;
}
