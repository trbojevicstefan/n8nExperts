import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import app, { connectDb, disconnectDb } from "../../app.js";
import User from "../../models/user.model.js";
import Job from "../../models/job.model.js";
import JobApplication from "../../models/jobApplication.model.js";
import Invitation from "../../models/invitation.model.js";
import Notification from "../../models/notification.model.js";
import WorkspaceThread from "../../models/workspaceThread.model.js";
import WorkspaceMessage from "../../models/workspaceMessage.model.js";
import JobReview from "../../models/jobReview.model.js";
import Service from "../../models/service.model.js";
import PortfolioItem from "../../models/portfolioItem.model.js";
import SavedItem from "../../models/savedItem.model.js";
import SavedSearch from "../../models/savedSearch.model.js";

process.env.NODE_ENV = "test";
process.env.JWT_KEY = process.env.JWT_KEY || "test-jwt-secret";

let mongoServer;

const registerAndGetCookie = async ({ username, email, role = "client" }) => {
  const response = await request(app).post("/api/auth/register").send({
    username,
    email,
    password: "Password123!",
    role,
  });

  assert.equal(response.status, 201);
  const cookieHeader = response.headers["set-cookie"];
  assert.ok(Array.isArray(cookieHeader) && cookieHeader.length > 0);
  return cookieHeader[0].split(";")[0];
};

const createJobAsClient = async (cookie, overrides = {}) => {
  const response = await request(app)
    .post("/api/jobs")
    .set("Cookie", cookie)
    .send({
      title: "Build resilient n8n lead routing workflow",
      description:
        "Need robust workflow with retries, error handling, queue fallback, and Slack alerting for failed events.",
      budgetType: "fixed",
      budgetAmount: 1200,
      visibility: "public",
      skills: ["n8n", "webhooks", "slack"],
      ...overrides,
    });

  assert.equal(response.status, 201);
  return response.body;
};

const applyToJobAsExpert = async (cookie, jobId, overrides = {}) => {
  const response = await request(app)
    .post(`/api/jobs/${jobId}/applications`)
    .set("Cookie", cookie)
    .send({
      coverLetter:
        "I have delivered similar n8n automations with retry queues, observability, and clean handover docs for client teams.",
      bidAmount: 1100,
      estimatedDuration: "7 days",
      ...overrides,
    });

  assert.equal(response.status, 201);
  return response.body;
};

test.before(async () => {
  mongoServer = await MongoMemoryServer.create();
  await connectDb(mongoServer.getUri());
});

test.after(async () => {
  await disconnectDb();
  await mongoServer.stop();
});

test.beforeEach(async () => {
  await Promise.all([
    Notification.deleteMany({}),
    WorkspaceMessage.deleteMany({}),
    WorkspaceThread.deleteMany({}),
    JobReview.deleteMany({}),
    Invitation.deleteMany({}),
    JobApplication.deleteMany({}),
    Job.deleteMany({}),
    Service.deleteMany({}),
    PortfolioItem.deleteMany({}),
    SavedItem.deleteMany({}),
    SavedSearch.deleteMany({}),
    User.deleteMany({}),
  ]);
});

test("application filters, note permissions, and status history are enforced", async () => {
  const clientCookie = await registerAndGetCookie({
    username: "client_ops",
    email: "client.ops@example.com",
    role: "client",
  });
  const expertCookie = await registerAndGetCookie({
    username: "expert_ops",
    email: "expert.ops@example.com",
    role: "expert",
  });
  const secondExpertCookie = await registerAndGetCookie({
    username: "expert_second",
    email: "expert.second@example.com",
    role: "expert",
  });

  const job = await createJobAsClient(clientCookie);
  const applicationA = await applyToJobAsExpert(expertCookie, job._id, { bidAmount: 1100 });
  await applyToJobAsExpert(secondExpertCookie, job._id, { bidAmount: 850 });

  const shortlistResponse = await request(app)
    .patch(`/api/applications/${applicationA._id}/status`)
    .set("Cookie", clientCookie)
    .send({ status: "shortlisted" });

  assert.equal(shortlistResponse.status, 200);
  assert.equal(shortlistResponse.body.status, "shortlisted");
  assert.ok(Array.isArray(shortlistResponse.body.statusHistory));
  assert.equal(shortlistResponse.body.statusHistory.at(-1).from, "submitted");
  assert.equal(shortlistResponse.body.statusHistory.at(-1).to, "shortlisted");

  const filteredResponse = await request(app)
    .get(`/api/jobs/${job._id}/applications`)
    .query({ status: "shortlisted", sort: "highestBid" })
    .set("Cookie", clientCookie);

  assert.equal(filteredResponse.status, 200);
  assert.equal(filteredResponse.body.applications.length, 1);
  assert.equal(filteredResponse.body.applications[0]._id, applicationA._id);
  assert.equal(filteredResponse.body.countsByStatus.submitted, 1);
  assert.equal(filteredResponse.body.countsByStatus.shortlisted, 1);

  const noteUpdateResponse = await request(app)
    .patch(`/api/applications/${applicationA._id}/note`)
    .set("Cookie", clientCookie)
    .send({ clientNote: "Priority candidate with relevant webhook scaling experience." });

  assert.equal(noteUpdateResponse.status, 200);
  assert.equal(noteUpdateResponse.body.clientNote, "Priority candidate with relevant webhook scaling experience.");

  const rogueClientCookie = await registerAndGetCookie({
    username: "rogue_client",
    email: "rogue.client@example.com",
    role: "client",
  });

  const forbiddenNoteUpdate = await request(app)
    .patch(`/api/applications/${applicationA._id}/note`)
    .set("Cookie", rogueClientCookie)
    .send({ clientNote: "Should not work" });

  assert.equal(forbiddenNoteUpdate.status, 403);
});

test("client public profile exposes trust metrics and hides private fields", async () => {
  const clientCookie = await registerAndGetCookie({
    username: "client_public",
    email: "client.public@example.com",
    role: "client",
  });
  const expertCookie = await registerAndGetCookie({
    username: "expert_public",
    email: "expert.public@example.com",
    role: "expert",
  });

  const job = await createJobAsClient(clientCookie, {
    title: "Deploy n8n ops workflow with incident escalation",
    description:
      "Need job routing, incident escalation path, and reliable API integrations with detailed runbooks.",
  });

  const application = await applyToJobAsExpert(expertCookie, job._id);

  const acceptResponse = await request(app)
    .patch(`/api/applications/${application._id}/status`)
    .set("Cookie", clientCookie)
    .send({ status: "accepted" });

  assert.equal(acceptResponse.status, 200);

  const clientDoc = await User.findOne({ username: "client_public" }).lean();
  assert.ok(clientDoc?._id);

  const profileResponse = await request(app).get(`/api/clients/${clientDoc._id}/public`);

  assert.equal(profileResponse.status, 200);
  assert.ok(profileResponse.body.client);
  assert.ok(profileResponse.body.trustMetrics);
  assert.equal(profileResponse.body.client.email, undefined);
  assert.equal(profileResponse.body.trustMetrics.jobsPosted, 1);
  assert.equal(profileResponse.body.trustMetrics.hireRate, 100);
  assert.ok(profileResponse.body.trustMetrics.avgResponseHours >= 0);

  const meResponse = await request(app).get("/api/auth/me").set("Cookie", clientCookie);
  assert.equal(meResponse.status, 200);
  assert.equal(meResponse.body.email, "client.public@example.com");
});

test("saved items and recommendation endpoints work for client/expert roles", async () => {
  const clientCookie = await registerAndGetCookie({
    username: "client_saved",
    email: "client.saved@example.com",
    role: "client",
  });
  const expertCookie = await registerAndGetCookie({
    username: "expert_saved",
    email: "expert.saved@example.com",
    role: "expert",
  });

  const job = await createJobAsClient(clientCookie, {
    title: "Automate lead enrichment with n8n",
    description:
      "Create a resilient enrichment pipeline with retries, deduping, and CRM sync for inbound lead operations and reporting.",
    skills: ["n8n", "crm", "webhooks"],
  });

  const expertDoc = await User.findOne({ username: "expert_saved" }).lean();
  assert.ok(expertDoc?._id);

  const saveJobResponse = await request(app).post(`/api/saved/jobs/${job._id}`).set("Cookie", expertCookie);
  assert.equal(saveJobResponse.status, 201);

  const savedJobsResponse = await request(app).get("/api/saved/jobs").set("Cookie", expertCookie);
  assert.equal(savedJobsResponse.status, 200);
  assert.equal(savedJobsResponse.body.items.length, 1);
  assert.equal(savedJobsResponse.body.items[0].job._id, job._id);

  const expertRecommendations = await request(app).get("/api/recommendations/jobs").set("Cookie", expertCookie);
  assert.equal(expertRecommendations.status, 200);
  assert.ok(Array.isArray(expertRecommendations.body.recommendations));
  assert.ok(expertRecommendations.body.recommendations.length >= 0);

  const saveExpertResponse = await request(app).post(`/api/saved/experts/${expertDoc._id}`).set("Cookie", clientCookie);
  assert.equal(saveExpertResponse.status, 201);

  const savedExpertsResponse = await request(app).get("/api/saved/experts").set("Cookie", clientCookie);
  assert.equal(savedExpertsResponse.status, 200);
  assert.equal(savedExpertsResponse.body.items.length, 1);

  const createSearchResponse = await request(app)
    .post("/api/saved/searches")
    .set("Cookie", clientCookie)
    .send({
      name: "Top n8n experts",
      scope: "experts",
      filters: { minRate: 60, skill: "n8n" },
      isPinned: true,
    });

  assert.equal(createSearchResponse.status, 201);
  assert.equal(createSearchResponse.body.name, "Top n8n experts");

  const listSearchesResponse = await request(app).get("/api/saved/searches").set("Cookie", clientCookie);
  assert.equal(listSearchesResponse.status, 200);
  assert.equal(listSearchesResponse.body.length, 1);

  const clientRecommendations = await request(app).get("/api/recommendations/experts").set("Cookie", clientCookie);
  assert.equal(clientRecommendations.status, 200);
  assert.ok(Array.isArray(clientRecommendations.body.recommendations));
  assert.ok(clientRecommendations.body.recommendations.length >= 1);
});

test("client global pipeline and bulk shortlist/reject flows work with permissions", async () => {
  const clientCookie = await registerAndGetCookie({
    username: "client_pipeline",
    email: "client.pipeline@example.com",
    role: "client",
  });
  const expertACookie = await registerAndGetCookie({
    username: "expert_pipeline_a",
    email: "expert.pipeline.a@example.com",
    role: "expert",
  });
  const expertBCookie = await registerAndGetCookie({
    username: "expert_pipeline_b",
    email: "expert.pipeline.b@example.com",
    role: "expert",
  });

  const firstJob = await createJobAsClient(clientCookie, {
    title: "Pipeline job A",
    description:
      "Client pipeline testing job A with robust n8n requirements, retries, and integration safeguards for production.",
  });
  const secondJob = await createJobAsClient(clientCookie, {
    title: "Pipeline job B",
    description:
      "Client pipeline testing job B focused on webhook orchestration and clear handoff documentation requirements.",
  });

  const firstApplication = await applyToJobAsExpert(expertACookie, firstJob._id, { bidAmount: 900 });
  const secondApplication = await applyToJobAsExpert(expertBCookie, secondJob._id, { bidAmount: 1100 });

  const pipelineResponse = await request(app)
    .get("/api/applications/client")
    .query({ sort: "updated", status: "submitted" })
    .set("Cookie", clientCookie);

  assert.equal(pipelineResponse.status, 200);
  assert.equal(pipelineResponse.body.applications.length, 2);
  assert.equal(pipelineResponse.body.countsByStatus.submitted, 2);
  assert.ok(Array.isArray(pipelineResponse.body.countsByJob));
  assert.ok(pipelineResponse.body.countsByJob.length >= 2);

  const bulkShortlistResponse = await request(app)
    .patch("/api/applications/bulk-status")
    .set("Cookie", clientCookie)
    .send({
      status: "shortlisted",
      applicationIds: [firstApplication._id, secondApplication._id],
    });

  assert.equal(bulkShortlistResponse.status, 200);
  assert.equal(bulkShortlistResponse.body.updatedCount, 2);
  assert.equal(bulkShortlistResponse.body.skipped.length, 0);

  const bulkRejectResponse = await request(app)
    .patch("/api/applications/bulk-status")
    .set("Cookie", clientCookie)
    .send({
      status: "accepted",
      applicationIds: [secondApplication._id],
    });

  assert.equal(bulkRejectResponse.status, 200);
  assert.equal(bulkRejectResponse.body.updatedCount, 1);

  const acceptedApplicationResponse = await request(app)
    .get(`/api/jobs/${secondJob._id}/applications`)
    .set("Cookie", clientCookie);
  assert.equal(acceptedApplicationResponse.status, 200);
  assert.equal(
    acceptedApplicationResponse.body.applications.find((item) => item._id === secondApplication._id)?.status,
    "accepted"
  );

  const bulkRejectAfterAcceptResponse = await request(app)
    .patch("/api/applications/bulk-status")
    .set("Cookie", clientCookie)
    .send({
      status: "rejected",
      applicationIds: [firstApplication._id],
    });

  assert.equal(bulkRejectAfterAcceptResponse.status, 200);
  assert.equal(bulkRejectAfterAcceptResponse.body.updatedCount, 1);

  const expertForbiddenResponse = await request(app).get("/api/applications/client").set("Cookie", expertACookie);
  assert.equal(expertForbiddenResponse.status, 403);
});

test("chat supports thread/message search and attachment links", async () => {
  const clientCookie = await registerAndGetCookie({
    username: "client_chat",
    email: "client.chat@example.com",
    role: "client",
  });
  const expertCookie = await registerAndGetCookie({
    username: "expert_chat",
    email: "expert.chat@example.com",
    role: "expert",
  });

  const job = await createJobAsClient(clientCookie, {
    title: "Chat searchable workflow",
    description:
      "Need searchable chat trail with practical file link support for handoff docs and runbooks in active workspace flow.",
  });

  await applyToJobAsExpert(expertCookie, job._id, {
    coverLetter:
      "I can deliver this with robust communication checkpoints and workflow documentation attached in each phase.",
  });

  const thread = await WorkspaceThread.findOne({ jobId: job._id });
  assert.ok(thread?._id);

  const sendMessageResponse = await request(app)
    .post(`/api/chat/threads/${thread._id}/messages`)
    .set("Cookie", clientCookie)
    .send({
      body: "Please review this report attachment.",
      attachments: [{ name: "report.pdf", url: "https://example.com/files/report.pdf" }],
    });

  assert.equal(sendMessageResponse.status, 201);
  assert.equal(sendMessageResponse.body.attachments.length, 1);
  assert.equal(sendMessageResponse.body.attachments[0].name, "report.pdf");

  const threadSearchResponse = await request(app)
    .get("/api/chat/threads")
    .set("Cookie", expertCookie)
    .query({ q: "searchable", limit: 20 });

  assert.equal(threadSearchResponse.status, 200);
  assert.ok(Array.isArray(threadSearchResponse.body.threads));
  assert.ok(threadSearchResponse.body.threads.length >= 1);

  const messageSearchResponse = await request(app)
    .get(`/api/chat/threads/${thread._id}/messages`)
    .set("Cookie", expertCookie)
    .query({ q: "report", limit: 20 });

  assert.equal(messageSearchResponse.status, 200);
  assert.ok(Array.isArray(messageSearchResponse.body.messages));
  assert.equal(messageSearchResponse.body.messages.length, 1);
  assert.equal(messageSearchResponse.body.messages[0].attachments[0].url, "https://example.com/files/report.pdf");
});

test("mvp core flow covers auth, profile, services, jobs, applications, and invitations", async () => {
  const clientCookie = await registerAndGetCookie({
    username: "client_mvp_core",
    email: "client.mvp.core@example.com",
    role: "client",
  });
  const expertCookie = await registerAndGetCookie({
    username: "expert_mvp_core",
    email: "expert.mvp.core@example.com",
    role: "expert",
  });
  const invitedExpertCookie = await registerAndGetCookie({
    username: "expert_mvp_invited",
    email: "expert.mvp.invited@example.com",
    role: "expert",
  });

  const expertAuthResponse = await request(app).get("/api/auth/me").set("Cookie", expertCookie);
  assert.equal(expertAuthResponse.status, 200);
  assert.equal(expertAuthResponse.body.role, "expert");

  const profileResponse = await request(app)
    .patch("/api/experts/me/profile")
    .set("Cookie", expertCookie)
    .send({
      headline: "Senior n8n automation architect",
      desc: "I design resilient automation systems across CRM, support, and incident response workflows.",
      hourlyRate: 95,
      skills: ["n8n", "webhooks", "hubspot"],
      availability: "available",
      yearsExperience: 6,
      timezone: "America/New_York",
      languages: ["English"],
    });

  assert.equal(profileResponse.status, 200);
  assert.equal(profileResponse.body.headline, "Senior n8n automation architect");
  assert.equal(profileResponse.body.role, "expert");

  const serviceResponse = await request(app)
    .post("/api/services")
    .set("Cookie", expertCookie)
    .send({
      title: "Build robust n8n automation with retries and alerting",
      desc: "Production-ready n8n workflow engineering with observability, retries, dead-letter patterns, and clean handoff docs.",
      serviceType: "Fixed Price",
      price: 1200,
      cover: "https://example.com/images/n8n-service-cover.png",
      shortTitle: "Reliable n8n workflow build",
      shortDesc: "I deliver resilient n8n automations with monitoring.",
      deliveryTime: 7,
    });

  assert.equal(serviceResponse.status, 201);
  assert.equal(serviceResponse.body.userId, profileResponse.body._id);

  const job = await createJobAsClient(clientCookie, {
    title: "MVP core flow n8n orchestration project",
    description:
      "Need end-to-end n8n orchestration for lead routing and support triage with retries, error escalation, and clear runbook documentation.",
  });

  const jobsResponse = await request(app).get("/api/jobs").query({ status: "open", search: "MVP core flow" });
  assert.equal(jobsResponse.status, 200);
  assert.ok(jobsResponse.body.jobs.some((item) => item._id === job._id));

  const directApplication = await applyToJobAsExpert(expertCookie, job._id, {
    coverLetter:
      "I will implement this with resilient workflow design, structured logging, and operational playbooks for your team.",
    bidAmount: 1150,
    estimatedDuration: "6 days",
  });
  assert.equal(directApplication.source, "direct");

  const invitedExpertUser = await User.findOne({ email: "expert.mvp.invited@example.com" }).select("_id");
  assert.ok(invitedExpertUser?._id);

  const invitationResponse = await request(app)
    .post(`/api/jobs/${job._id}/invitations`)
    .set("Cookie", clientCookie)
    .send({
      expertId: invitedExpertUser._id.toString(),
      message: "Please review this project and share your approach.",
    });

  assert.equal(invitationResponse.status, 201);
  assert.equal(invitationResponse.body.status, "sent");

  const invitationInboxResponse = await request(app)
    .get("/api/invitations/mine")
    .set("Cookie", invitedExpertCookie)
    .query({ role: "expert", status: "sent" });

  assert.equal(invitationInboxResponse.status, 200);
  assert.equal(invitationInboxResponse.body.invitations.length, 1);
  assert.equal(invitationInboxResponse.body.invitations[0]._id, invitationResponse.body._id);

  const invitationAcceptResponse = await request(app)
    .patch(`/api/invitations/${invitationResponse.body._id}/respond`)
    .set("Cookie", invitedExpertCookie)
    .send({
      status: "accepted",
      coverLetter:
        "Happy to support this engagement with a phased delivery plan, testing strategy, and deployment handover.",
      estimatedDuration: "8 days",
    });

  assert.equal(invitationAcceptResponse.status, 200);
  assert.equal(invitationAcceptResponse.body.invitation.status, "accepted");
  assert.equal(invitationAcceptResponse.body.application.source, "invitation");
  assert.equal(invitationAcceptResponse.body.application.bidAmount, undefined);

  const applicationsResponse = await request(app).get(`/api/jobs/${job._id}/applications`).set("Cookie", clientCookie);
  assert.equal(applicationsResponse.status, 200);
  assert.equal(applicationsResponse.body.applications.length, 2);

  const sources = applicationsResponse.body.applications.map((item) => item.source);
  assert.ok(sources.includes("direct"));
  assert.ok(sources.includes("invitation"));
});
