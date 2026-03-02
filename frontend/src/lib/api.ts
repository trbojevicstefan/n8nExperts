import axios from "axios";
import type {
  ClientPipelineResponse,
  ClientProfilePrivate,
  ClientProfilePublic,
  ExpertRecommendationWeights,
  ExpertRecommendation,
  ExpertProfile,
  Invitation,
  JobReview,
  Job,
  JobApplication,
  JobRecommendationWeights,
  JobRecommendation,
  JobApplicationsResponse,
  MyApplicationsResponse,
  Notification,
  PaginatedResponse,
  ProfileCompleteness,
  PortfolioItem,
  Role,
  SavedExpertItem,
  SavedJobItem,
  SavedSearch,
  Service,
  User,
  WorkspaceMessage,
  WorkspaceThread,
} from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:8800/api" : "/api");

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export type AuthRegisterPayload = {
  username: string;
  email: string;
  password: string;
  country?: string;
  role: Role;
};

export const authApi = {
  register: (payload: AuthRegisterPayload) => api.post<{ message: string; user: User }>("/auth/register", payload),
  login: (payload: { username: string; password: string }) => api.post<User>("/auth/login", payload),
  me: () => api.get<User>("/auth/me"),
  logout: () => api.post<{ message: string }>("/auth/logout"),
};

export const expertApi = {
  getExperts: (params?: Record<string, string | number>) =>
    api.get<{ experts: ExpertProfile[] } & PaginatedResponse>("/experts", { params }),
  getExpertProfile: (expertId: string) =>
    api.get<{ expert: ExpertProfile; portfolio: PortfolioItem[]; services: Service[]; profileCompleteness?: ProfileCompleteness }>(
      `/experts/${expertId}`
    ),
  getExpertReviews: (expertId: string, params?: Record<string, string | number>) =>
    api.get<{ reviews: JobReview[] } & PaginatedResponse>(`/experts/${expertId}/reviews`, { params }),
  updateMyProfile: (payload: Partial<ExpertProfile>) => api.patch<ExpertProfile>("/experts/me/profile", payload),
  createPortfolioItem: (payload: Pick<PortfolioItem, "title" | "summary" | "link" | "imageUrl" | "tags">) =>
    api.post<PortfolioItem>("/experts/me/portfolio", payload),
  updatePortfolioItem: (itemId: string, payload: Partial<PortfolioItem>) =>
    api.patch<PortfolioItem>(`/experts/me/portfolio/${itemId}`, payload),
  deletePortfolioItem: (itemId: string) => api.delete<{ message: string }>(`/experts/me/portfolio/${itemId}`),
};

export const serviceApi = {
  getServices: (params?: Record<string, string | number>) =>
    api.get<{ services: Service[] } & PaginatedResponse>("/services", { params }),
  getService: (serviceId: string) => api.get<Service>(`/services/single/${serviceId}`),
  getExpertServices: (expertId: string) => api.get<Service[]>(`/services/expert/${expertId}`),
  createService: (payload: Partial<Service>) => api.post<Service>("/services", payload),
  updateService: (serviceId: string, payload: Partial<Service>) => api.put<Service>(`/services/${serviceId}`, payload),
  deleteService: (serviceId: string) => api.delete<{ message: string }>(`/services/${serviceId}`),
};

export const jobApi = {
  getJobs: (params?: Record<string, string | number>) =>
    api.get<{ jobs: Job[] } & PaginatedResponse>("/jobs", { params }),
  getMyJobs: () => api.get<Job[]>("/jobs/mine"),
  getJob: (jobId: string) => api.get<Job>(`/jobs/${jobId}`),
  createJob: (payload: Partial<Job>) => api.post<Job>("/jobs", payload),
  updateJob: (jobId: string, payload: Partial<Job>) => api.patch<Job>(`/jobs/${jobId}`, payload),
  updateJobStatus: (jobId: string, status: Job["status"]) => api.patch<Job>(`/jobs/${jobId}/status`, { status }),
  applyToJob: (jobId: string, payload: Pick<JobApplication, "coverLetter" | "bidAmount" | "estimatedDuration">) =>
    api.post<JobApplication>(`/jobs/${jobId}/applications`, payload),
  getJobApplications: (jobId: string, params?: Record<string, string | number>) =>
    api.get<JobApplicationsResponse>(`/jobs/${jobId}/applications`, { params }),
  inviteExpert: (jobId: string, payload: { expertId: string; message?: string }) =>
    api.post<Invitation>(`/jobs/${jobId}/invitations`, payload),
  createReview: (jobId: string, payload: { rating: number; comment?: string }) => api.post<JobReview>(`/jobs/${jobId}/reviews`, payload),
};

export const applicationApi = {
  getMyApplications: (params?: Record<string, string | number>) =>
    api.get<MyApplicationsResponse>("/applications/mine", { params }),
  getClientPipeline: (params?: Record<string, string | number>) =>
    api.get<ClientPipelineResponse>("/applications/client", { params }),
  updateStatus: (applicationId: string, status: JobApplication["status"]) =>
    api.patch<JobApplication>(`/applications/${applicationId}/status`, { status }),
  bulkUpdateStatus: (payload: { applicationIds: string[]; status: "shortlisted" | "accepted" | "rejected" }) =>
    api.patch<{
      requested: number;
      updatedCount: number;
      updatedIds: string[];
      skipped: Array<{ applicationId: string; reason: string }>;
      notFoundIds: string[];
    }>("/applications/bulk-status", payload),
  updateNote: (applicationId: string, clientNote: string) =>
    api.patch<{ _id: string; clientNote: string; updatedAt: string }>(`/applications/${applicationId}/note`, { clientNote }),
  withdraw: (applicationId: string) => api.delete<{ message: string }>(`/applications/${applicationId}`),
};

export const clientApi = {
  updateMyProfile: (payload: Partial<ClientProfilePrivate>) =>
    api.patch<ClientProfilePrivate & { trustMetrics?: ClientProfilePublic["trustMetrics"] }>("/clients/me/profile", payload),
  getPublicProfile: (clientId: string) => api.get<ClientProfilePublic>(`/clients/${clientId}/public`),
};

export const savedApi = {
  getSavedJobs: (params?: Record<string, string | number>) =>
    api.get<{ items: SavedJobItem[] } & PaginatedResponse>("/saved/jobs", { params }),
  saveJob: (jobId: string) => api.post<{ _id: string; entityId: string }>(`/saved/jobs/${jobId}`),
  unsaveJob: (jobId: string) => api.delete<{ message: string }>(`/saved/jobs/${jobId}`),
  getSavedExperts: (params?: Record<string, string | number>) =>
    api.get<{ items: SavedExpertItem[] } & PaginatedResponse>("/saved/experts", { params }),
  saveExpert: (expertId: string) => api.post<{ _id: string; entityId: string }>(`/saved/experts/${expertId}`),
  unsaveExpert: (expertId: string) => api.delete<{ message: string }>(`/saved/experts/${expertId}`),
  listSearches: (params?: Record<string, string | number>) => api.get<SavedSearch[]>("/saved/searches", { params }),
  createSearch: (payload: Pick<SavedSearch, "name" | "scope" | "filters" | "isPinned">) => api.post<SavedSearch>("/saved/searches", payload),
  updateSearch: (searchId: string, payload: Partial<Pick<SavedSearch, "name" | "scope" | "filters" | "isPinned">>) =>
    api.patch<SavedSearch>(`/saved/searches/${searchId}`, payload),
  markSearchUsed: (searchId: string) => api.patch<SavedSearch>(`/saved/searches/${searchId}/use`),
  deleteSearch: (searchId: string) => api.delete<{ message: string }>(`/saved/searches/${searchId}`),
};

export const recommendationApi = {
  getJobs: (params?: Record<string, string | number>) =>
    api.get<{ recommendations: JobRecommendation[]; basedOnSkills: string[]; weights: JobRecommendationWeights } & PaginatedResponse>(
      "/recommendations/jobs",
      { params }
    ),
  getExperts: (params?: Record<string, string | number>) =>
    api.get<{ recommendations: ExpertRecommendation[]; basedOnSkills: string[]; weights: ExpertRecommendationWeights } & PaginatedResponse>(
      "/recommendations/experts",
      { params }
    ),
};

export const invitationApi = {
  getMine: (params?: Record<string, string | number>) =>
    api.get<{ invitations: Invitation[] } & PaginatedResponse>("/invitations/mine", { params }),
  respond: (
    invitationId: string,
    payload: { status: "accepted" | "declined"; coverLetter?: string; estimatedDuration?: string }
  ) =>
    api.patch<{ invitation: Invitation; application?: JobApplication; thread?: WorkspaceThread; idempotent?: boolean }>(
      `/invitations/${invitationId}/respond`,
      payload
    ),
};

export const notificationApi = {
  getAll: (params?: Record<string, string | number>) =>
    api.get<{ notifications: Notification[]; unreadCount: number } & PaginatedResponse>("/notifications", { params }),
  getUnreadCount: () => api.get<{ unreadCount: number }>("/notifications/unread-count"),
  markRead: (notificationId: string) => api.patch<Notification>(`/notifications/${notificationId}/read`),
  markAllRead: () => api.patch<{ updated: number }>("/notifications/read-all"),
};

export const chatApi = {
  openThread: (payload: { jobId: string; peerId: string }) => api.post<WorkspaceThread>("/chat/threads/open", payload),
  getThreads: (params?: Record<string, string | number>) =>
    api.get<{ threads: WorkspaceThread[] } & PaginatedResponse>("/chat/threads", { params }),
  getThreadMessages: (threadId: string, params?: Record<string, string | number>) =>
    api.get<{ messages: WorkspaceMessage[] } & PaginatedResponse>(`/chat/threads/${threadId}/messages`, { params }),
  sendMessage: (
    threadId: string,
    payload:
      | string
      | {
          body?: string;
          attachments?: Array<{ name: string; url: string }>;
        }
  ) =>
    api.post<WorkspaceMessage>(
      `/chat/threads/${threadId}/messages`,
      typeof payload === "string" ? { body: payload } : payload
    ),
  markThreadRead: (threadId: string) => api.patch<WorkspaceThread>(`/chat/threads/${threadId}/read`),
};

export const reviewApi = {
  getMine: () => api.get<{ asClient: JobReview[]; asExpert: JobReview[] }>("/reviews/mine"),
};

export default api;
