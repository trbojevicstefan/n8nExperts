import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "../models/user.model.js";
import Job from "../models/job.model.js";
import Service from "../models/service.model.js";
import PortfolioItem from "../models/portfolioItem.model.js";
import JobApplication from "../models/jobApplication.model.js";
import Invitation from "../models/invitation.model.js";
import WorkspaceThread from "../models/workspaceThread.model.js";
import WorkspaceMessage from "../models/workspaceMessage.model.js";
import Notification from "../models/notification.model.js";
import JobReview from "../models/jobReview.model.js";
import SavedItem from "../models/savedItem.model.js";
import SavedSearch from "../models/savedSearch.model.js";
import { refreshClientMetrics } from "../services/clientMetrics.service.js";

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || process.env.MONGO;

const EMAILS = [
  "client.demo@n8nexperts.com",
  "client.ops@n8nexperts.com",
  "client.scale@n8nexperts.com",
  "expert.demo@n8nexperts.com",
  "expert.second@n8nexperts.com",
  "expert.third@n8nexperts.com",
  "expert.fourth@n8nexperts.com",
  "expert.fifth@n8nexperts.com",
  "expert.sixth@n8nexperts.com",
];

const day = 24 * 60 * 60 * 1000;
const ago = (days) => new Date(Date.now() - days * day);

const toRoleFlags = (role) =>
  role === "expert"
    ? { role: "expert", isExpert: true, isClient: false, isSeller: true }
    : { role: "client", isExpert: false, isClient: true, isSeller: false };

const createAppHistory = (expertId, clientId, status, now = new Date()) => {
  if (status === "submitted") {
    return [{ from: null, to: "submitted", byUserId: expertId, at: ago(2) }];
  }
  if (status === "shortlisted") {
    return [
      { from: null, to: "submitted", byUserId: expertId, at: ago(5) },
      { from: "submitted", to: "shortlisted", byUserId: clientId, at: ago(2) },
    ];
  }
  if (status === "accepted") {
    return [
      { from: null, to: "submitted", byUserId: expertId, at: ago(10) },
      { from: "submitted", to: "shortlisted", byUserId: clientId, at: ago(8) },
      { from: "shortlisted", to: "accepted", byUserId: clientId, at: now },
    ];
  }
  return [
    { from: null, to: "submitted", byUserId: expertId, at: ago(7) },
    { from: "submitted", to: "rejected", byUserId: clientId, at: now },
  ];
};

const seed = async () => {
  if (!MONGO_URI) {
    throw new Error("Missing MONGO_URI/MONGO environment variable.");
  }

  await mongoose.connect(MONGO_URI);

  await Promise.all([
    Notification.deleteMany({}),
    WorkspaceMessage.deleteMany({}),
    WorkspaceThread.deleteMany({}),
    JobReview.deleteMany({}),
    SavedItem.deleteMany({}),
    SavedSearch.deleteMany({}),
    Invitation.deleteMany({}),
    JobApplication.deleteMany({}),
    Job.deleteMany({}),
    Service.deleteMany({}),
    PortfolioItem.deleteMany({}),
    User.deleteMany({
      email: { $in: EMAILS },
    }),
  ]);

  const passwordHash = bcrypt.hashSync("Password123!", 10);

  const users = await User.insertMany([
    {
      username: "client_demo",
      email: "client.demo@n8nexperts.com",
      password: passwordHash,
      country: "US",
      companyName: "Acme Automation Labs",
      companyWebsite: "https://acme.example.com",
      companySize: "11-50",
      industry: "SaaS",
      foundedYear: 2020,
      location: "Austin, TX",
      teamDescription: "Product-led SaaS team automating internal ops and customer workflows.",
      projectPreferences: ["AI workflows", "CRM automation", "Incident management"],
      ...toRoleFlags("client"),
    },
    {
      username: "client_ops",
      email: "client.ops@n8nexperts.com",
      password: passwordHash,
      country: "US",
      companyName: "Northstar Operations",
      companyWebsite: "https://northstar.example.com",
      companySize: "51-200",
      industry: "E-commerce",
      foundedYear: 2018,
      location: "Denver, CO",
      teamDescription: "Ops-heavy ecommerce team focused on logistics and CX automation.",
      projectPreferences: ["Fulfillment", "Support automations", "ERP sync"],
      ...toRoleFlags("client"),
    },
    {
      username: "client_scale",
      email: "client.scale@n8nexperts.com",
      password: passwordHash,
      country: "US",
      companyName: "Scale Forge Inc.",
      companyWebsite: "https://scaleforge.example.com",
      companySize: "201-500",
      industry: "Fintech",
      foundedYear: 2016,
      location: "New York, NY",
      teamDescription: "Growth and platform teams automating onboarding, risk, and finance workflows.",
      projectPreferences: ["Risk automation", "Data quality", "Compliance ops"],
      ...toRoleFlags("client"),
    },
    {
      username: "expert_demo",
      email: "expert.demo@n8nexperts.com",
      password: passwordHash,
      headline: "Senior n8n Automation Engineer",
      desc: "I build reliable n8n workflows for CRM, support, and data pipelines.",
      hourlyRate: 95,
      skills: ["n8n", "API Integration", "HubSpot", "Webhooks", "Slack"],
      availability: "available",
      country: "US",
      yearsExperience: 6,
      languages: ["English"],
      timezone: "America/Chicago",
      industries: ["SaaS", "E-commerce"],
      certifications: ["AWS Cloud Practitioner"],
      preferredEngagements: ["fixed", "hourly"],
      minimumProjectBudget: 500,
      availabilityHoursPerWeek: 30,
      responseSLAHours: 4,
      ...toRoleFlags("expert"),
    },
    {
      username: "expert_second",
      email: "expert.second@n8nexperts.com",
      password: passwordHash,
      headline: "n8n Integration Consultant",
      desc: "Specialized in migration and operational automation with production monitoring.",
      hourlyRate: 75,
      skills: ["n8n", "Zapier migration", "Slack", "Notion", "Airtable"],
      availability: "busy",
      country: "US",
      yearsExperience: 4,
      languages: ["English", "Spanish"],
      timezone: "America/Los_Angeles",
      industries: ["E-commerce", "Education"],
      preferredEngagements: ["consulting", "fixed"],
      availabilityHoursPerWeek: 18,
      responseSLAHours: 8,
      ...toRoleFlags("expert"),
    },
    {
      username: "expert_third",
      email: "expert.third@n8nexperts.com",
      password: passwordHash,
      headline: "Workflow Reliability Engineer",
      desc: "Focused on retries, queues, observability, and resiliency for n8n deployments.",
      hourlyRate: 88,
      skills: ["n8n", "SRE", "Postgres", "Queueing", "Redis"],
      availability: "available",
      country: "US",
      yearsExperience: 5,
      languages: ["English"],
      timezone: "America/New_York",
      industries: ["Fintech", "Healthtech"],
      preferredEngagements: ["hourly"],
      responseSLAHours: 6,
      ...toRoleFlags("expert"),
    },
    {
      username: "expert_fourth",
      email: "expert.fourth@n8nexperts.com",
      password: passwordHash,
      headline: "CRM + Revenue Ops Automator",
      desc: "I design n8n automations for lead routing, lifecycle scoring, and sales ops.",
      hourlyRate: 82,
      skills: ["n8n", "Salesforce", "HubSpot", "Pipedrive", "Webhook APIs"],
      availability: "available",
      country: "Canada",
      yearsExperience: 7,
      languages: ["English", "French"],
      timezone: "America/Toronto",
      industries: ["SaaS", "Agencies"],
      preferredEngagements: ["fixed", "consulting"],
      availabilityHoursPerWeek: 22,
      responseSLAHours: 12,
      ...toRoleFlags("expert"),
    },
    {
      username: "expert_fifth",
      email: "expert.fifth@n8nexperts.com",
      password: passwordHash,
      headline: "AI Ops + Support Automation Specialist",
      desc: "Builds AI-enhanced triage and support automations in n8n and vector workflows.",
      hourlyRate: 105,
      skills: ["n8n", "OpenAI", "Zendesk", "Intercom", "Pinecone"],
      availability: "unavailable",
      country: "US",
      yearsExperience: 8,
      languages: ["English"],
      timezone: "America/Los_Angeles",
      industries: ["SaaS", "Marketplace"],
      preferredEngagements: ["hourly", "consulting"],
      minimumProjectBudget: 1000,
      responseSLAHours: 24,
      ...toRoleFlags("expert"),
    },
    {
      username: "expert_sixth",
      email: "expert.sixth@n8nexperts.com",
      password: passwordHash,
      headline: "Enterprise Automation Architect",
      desc: "Enterprise-grade integrations, data governance, and secure workflow orchestration.",
      hourlyRate: 120,
      skills: ["n8n", "SAP", "Workday", "ServiceNow", "OAuth2"],
      availability: "busy",
      country: "UK",
      yearsExperience: 10,
      languages: ["English", "German"],
      timezone: "Europe/London",
      industries: ["Enterprise", "Manufacturing"],
      preferredEngagements: ["fixed"],
      minimumProjectBudget: 2500,
      availabilityHoursPerWeek: 15,
      responseSLAHours: 10,
      ...toRoleFlags("expert"),
    },
  ]);

  const userByUsername = Object.fromEntries(users.map((user) => [user.username, user]));
  const clients = ["client_demo", "client_ops", "client_scale"].map((username) => userByUsername[username]);
  const experts = [
    "expert_demo",
    "expert_second",
    "expert_third",
    "expert_fourth",
    "expert_fifth",
    "expert_sixth",
  ].map((username) => userByUsername[username]);

  await Promise.all(
    experts.map((expert, index) =>
      Service.create({
        userId: expert._id.toString(),
        title: `I will deliver ${expert.headline?.toLowerCase() || "n8n automation services"}`,
        desc: `${expert.desc || "End-to-end automation"} Includes planning, delivery, and documentation.`,
        shortTitle: expert.headline?.slice(0, 60) || "n8n expert service",
        shortDesc: "Practical n8n automation implementation with quality safeguards.",
        serviceType: "Fixed Price",
        price: 700 + index * 150,
        cover: "https://placehold.co/800x480/png",
        deliveryTime: 5 + index,
        revisionNumber: 2,
        features: ["Architecture", "Implementation", "Handover"],
        tags: expert.skills?.slice(0, 4) || ["n8n"],
        isActive: true,
      })
    )
  );

  await Promise.all(
    experts.map((expert, index) =>
      PortfolioItem.create({
        expertId: expert._id,
        title: `${expert.username} case study #${index + 1}`,
        summary: `A practical automation project for ${(expert.industries || ["general"])[0]} workflows.`,
        link: "https://example.com/case-study",
        tags: expert.skills?.slice(0, 3) || ["n8n"],
        isPublished: true,
      })
    )
  );

  const jobs = await Job.insertMany([
    {
      clientId: userByUsername.client_demo._id,
      title: "Build n8n workflow for inbound lead routing",
      description: "Parse inbound leads, enrich contacts, route ownership, and notify Slack with retries.",
      budgetType: "fixed",
      budgetAmount: 1200,
      skills: ["n8n", "HubSpot", "Slack", "Webhooks"],
      visibility: "public",
      status: "open",
      createdAt: ago(3),
    },
    {
      clientId: userByUsername.client_demo._id,
      title: "Create n8n incident escalation workflow",
      description: "Escalate incidents from Zendesk to Slack with PagerDuty fallback and audit logs.",
      budgetType: "fixed",
      budgetAmount: 900,
      skills: ["n8n", "Slack", "Zendesk", "PagerDuty"],
      visibility: "public",
      status: "completed",
      createdAt: ago(16),
    },
    {
      clientId: userByUsername.client_demo._id,
      title: "Sync Shopify returns with finance tools",
      description: "Automate returns and refund sync from Shopify to NetSuite and internal alerts.",
      budgetType: "hourly",
      budgetAmount: 85,
      skills: ["n8n", "Shopify", "NetSuite", "Webhooks"],
      visibility: "public",
      status: "open",
      createdAt: ago(5),
    },
    {
      clientId: userByUsername.client_demo._id,
      title: "Billing reconciliation automation for Stripe events",
      description: "Build resilient reconciliation jobs with delayed retries and discrepancy dashboarding.",
      budgetType: "hourly",
      budgetAmount: 95,
      skills: ["n8n", "Stripe", "Postgres", "Slack"],
      visibility: "public",
      status: "in_progress",
      createdAt: ago(9),
    },
    {
      clientId: userByUsername.client_ops._id,
      title: "Automate employee onboarding checklist",
      description: "Connect HRIS, email, Slack, and ticketing to automate onboarding handoff.",
      budgetType: "fixed",
      budgetAmount: 1400,
      skills: ["n8n", "Slack", "Notion", "Google Workspace"],
      visibility: "public",
      status: "open",
      createdAt: ago(2),
    },
    {
      clientId: userByUsername.client_ops._id,
      title: "Invoice approval workflow with OCR + validation",
      description: "Extract invoice metadata and route approvals based on custom policy rules.",
      budgetType: "fixed",
      budgetAmount: 2000,
      skills: ["n8n", "OCR", "Airtable", "Email"],
      visibility: "public",
      status: "open",
      createdAt: ago(6),
    },
    {
      clientId: userByUsername.client_ops._id,
      title: "Support triage and escalation automation",
      description: "Classify tickets and route urgent issues into Slack channels and ops boards.",
      budgetType: "hourly",
      budgetAmount: 78,
      skills: ["n8n", "Zendesk", "Slack", "OpenAI"],
      visibility: "public",
      status: "completed",
      createdAt: ago(20),
    },
    {
      clientId: userByUsername.client_scale._id,
      title: "Fraud signal routing to risk systems",
      description: "Stream fraud signals into case management tools with policy-driven branching.",
      budgetType: "hourly",
      budgetAmount: 120,
      skills: ["n8n", "Risk", "Postgres", "Webhook APIs"],
      visibility: "public",
      status: "open",
      createdAt: ago(4),
    },
    {
      clientId: userByUsername.client_scale._id,
      title: "Warehouse + ERP sync for inventory anomalies",
      description: "Detect inventory mismatches and trigger reconciliation workflows.",
      budgetType: "fixed",
      budgetAmount: 2600,
      skills: ["n8n", "ERP", "Slack", "Postgres"],
      visibility: "public",
      status: "in_progress",
      createdAt: ago(11),
    },
    {
      clientId: userByUsername.client_scale._id,
      title: "Contract renewal reminder automation",
      description: "Automate renewal timeline reminders and CRM updates with fail-safe retries.",
      budgetType: "fixed",
      budgetAmount: 1500,
      skills: ["n8n", "HubSpot", "Email", "Webhooks"],
      visibility: "public",
      status: "completed",
      createdAt: ago(25),
    },
    {
      clientId: userByUsername.client_scale._id,
      title: "Healthcare intake data validation workflow",
      description: "Validate patient intake payloads and notify teams when mandatory fields are missing.",
      budgetType: "fixed",
      budgetAmount: 1800,
      skills: ["n8n", "Validation", "Webhook APIs", "Slack"],
      visibility: "invite_only",
      status: "open",
      createdAt: ago(1),
    },
    {
      clientId: userByUsername.client_ops._id,
      title: "Returns portal to WMS synchronization",
      description: "Automate return status updates and warehouse updates with event deduplication.",
      budgetType: "fixed",
      budgetAmount: 1700,
      skills: ["n8n", "Warehouse", "Webhooks", "Slack"],
      visibility: "public",
      status: "open",
      createdAt: ago(7),
    },
  ]);

  const jobByTitle = Object.fromEntries(jobs.map((job) => [job.title, job]));

  const openLeadJob = jobByTitle["Build n8n workflow for inbound lead routing"];
  const completedIncidentJob = jobByTitle["Create n8n incident escalation workflow"];
  const supportTriageJob = jobByTitle["Support triage and escalation automation"];
  const contractRenewalJob = jobByTitle["Contract renewal reminder automation"];
  const inProgressBillingJob = jobByTitle["Billing reconciliation automation for Stripe events"];

  const applications = [];

  applications.push(
    await JobApplication.create({
      jobId: openLeadJob._id,
      clientId: openLeadJob.clientId,
      expertId: userByUsername.expert_demo._id,
      coverLetter: "I can deliver a resilient lead-routing workflow with retries, observability, and handover docs.",
      bidAmount: 1150,
      estimatedDuration: "7 days",
      source: "direct",
      status: "submitted",
      statusChangedAt: ago(1),
      statusHistory: createAppHistory(userByUsername.expert_demo._id, openLeadJob.clientId, "submitted", ago(1)),
    })
  );

  applications.push(
    await JobApplication.create({
      jobId: openLeadJob._id,
      clientId: openLeadJob.clientId,
      expertId: userByUsername.expert_second._id,
      coverLetter: "Strong fit on integration mapping and production runbooks. Can ship quickly.",
      bidAmount: 990,
      estimatedDuration: "8 days",
      source: "direct",
      status: "shortlisted",
      statusChangedAt: ago(0.6),
      statusHistory: createAppHistory(userByUsername.expert_second._id, openLeadJob.clientId, "shortlisted", ago(0.6)),
      clientNote: "Top candidate for this phase.",
    })
  );

  applications.push(
    await JobApplication.create({
      jobId: openLeadJob._id,
      clientId: openLeadJob.clientId,
      expertId: userByUsername.expert_third._id,
      coverLetter: "Reliability-focused implementation, but timeline is longer than requested.",
      bidAmount: 1300,
      estimatedDuration: "11 days",
      source: "invitation",
      status: "rejected",
      statusChangedAt: ago(0.5),
      statusHistory: createAppHistory(userByUsername.expert_third._id, openLeadJob.clientId, "rejected", ago(0.5)),
      clientNote: "Over budget for current sprint.",
    })
  );

  const acceptedIncidentApp = await JobApplication.create({
    jobId: completedIncidentJob._id,
    clientId: completedIncidentJob.clientId,
    expertId: userByUsername.expert_demo._id,
    coverLetter: "Delivered full escalation workflow with alerting and operational runbook.",
    bidAmount: 880,
    estimatedDuration: "5 days",
    source: "invitation",
    status: "accepted",
    statusChangedAt: ago(12),
    statusHistory: createAppHistory(userByUsername.expert_demo._id, completedIncidentJob.clientId, "accepted", ago(12)),
  });
  applications.push(acceptedIncidentApp);

  const acceptedSupportApp = await JobApplication.create({
    jobId: supportTriageJob._id,
    clientId: supportTriageJob.clientId,
    expertId: userByUsername.expert_fifth._id,
    coverLetter: "Implemented model-assisted triage and escalation pipeline with manual override controls.",
    bidAmount: 1450,
    estimatedDuration: "6 days",
    source: "direct",
    status: "accepted",
    statusChangedAt: ago(14),
    statusHistory: createAppHistory(userByUsername.expert_fifth._id, supportTriageJob.clientId, "accepted", ago(14)),
  });
  applications.push(acceptedSupportApp);

  const acceptedContractApp = await JobApplication.create({
    jobId: contractRenewalJob._id,
    clientId: contractRenewalJob.clientId,
    expertId: userByUsername.expert_fourth._id,
    coverLetter: "Built renewal reminders and CRM updates with retry and stale event prevention.",
    bidAmount: 1550,
    estimatedDuration: "7 days",
    source: "direct",
    status: "accepted",
    statusChangedAt: ago(19),
    statusHistory: createAppHistory(userByUsername.expert_fourth._id, contractRenewalJob.clientId, "accepted", ago(19)),
  });
  applications.push(acceptedContractApp);

  const acceptedBillingApp = await JobApplication.create({
    jobId: inProgressBillingJob._id,
    clientId: inProgressBillingJob.clientId,
    expertId: userByUsername.expert_sixth._id,
    coverLetter: "Delivery includes audit trails, retries, and discrepancy dashboards.",
    bidAmount: 120,
    estimatedDuration: "3 weeks",
    source: "invitation",
    status: "accepted",
    statusChangedAt: ago(7),
    statusHistory: createAppHistory(userByUsername.expert_sixth._id, inProgressBillingJob.clientId, "accepted", ago(7)),
  });
  applications.push(acceptedBillingApp);

  completedIncidentJob.acceptedApplicationId = acceptedIncidentApp._id;
  supportTriageJob.acceptedApplicationId = acceptedSupportApp._id;
  contractRenewalJob.acceptedApplicationId = acceptedContractApp._id;
  inProgressBillingJob.acceptedApplicationId = acceptedBillingApp._id;
  await Promise.all([completedIncidentJob.save(), supportTriageJob.save(), contractRenewalJob.save(), inProgressBillingJob.save()]);

  const inviteOpenLead = await Invitation.create({
    jobId: openLeadJob._id,
    clientId: openLeadJob.clientId,
    expertId: userByUsername.expert_demo._id,
    message: "We need webhook reliability and clear handover docs.",
    status: "sent",
  });

  const inviteHealthcare = await Invitation.create({
    jobId: jobByTitle["Healthcare intake data validation workflow"]._id,
    clientId: jobByTitle["Healthcare intake data validation workflow"].clientId,
    expertId: userByUsername.expert_third._id,
    message: "Invite-only workflow for healthcare intake validation.",
    status: "accepted",
    respondedAt: ago(0.4),
    respondedBy: userByUsername.expert_third._id,
  });

  const acceptedHealthcareApp = await JobApplication.create({
    jobId: jobByTitle["Healthcare intake data validation workflow"]._id,
    clientId: jobByTitle["Healthcare intake data validation workflow"].clientId,
    expertId: userByUsername.expert_third._id,
    coverLetter: "Happy to start with schema validation and escalation alerts as phase one.",
    bidAmount: 1720,
    estimatedDuration: "9 days",
    source: "invitation",
    invitationId: inviteHealthcare._id,
    status: "submitted",
    statusChangedAt: ago(0.4),
    statusHistory: createAppHistory(
      userByUsername.expert_third._id,
      jobByTitle["Healthcare intake data validation workflow"].clientId,
      "submitted",
      ago(0.4)
    ),
  });
  applications.push(acceptedHealthcareApp);

  const inviteReturns = await Invitation.create({
    jobId: jobByTitle["Returns portal to WMS synchronization"]._id,
    clientId: jobByTitle["Returns portal to WMS synchronization"].clientId,
    expertId: userByUsername.expert_second._id,
    message: "Can you propose a phased rollout?",
    status: "declined",
    respondedAt: ago(1.5),
    respondedBy: userByUsername.expert_second._id,
  });

  const primaryThread = await WorkspaceThread.create({
    jobId: openLeadJob._id,
    clientId: openLeadJob.clientId,
    expertId: userByUsername.expert_demo._id,
    invitationId: inviteOpenLead._id,
    applicationId: applications[0]._id,
    lastMessage: "Can you include a dashboard of failed runs?",
    lastMessageAt: ago(0.2),
    lastMessageSenderId: openLeadJob.clientId,
    unreadByExpert: 1,
    unreadByClient: 0,
  });

  await WorkspaceMessage.insertMany([
    {
      threadId: primaryThread._id,
      jobId: openLeadJob._id,
      senderId: openLeadJob.clientId,
      body: "Can you include a dashboard of failed runs?",
      createdAt: ago(0.3),
      updatedAt: ago(0.3),
    },
    {
      threadId: primaryThread._id,
      jobId: openLeadJob._id,
      senderId: userByUsername.expert_demo._id,
      body: "Yes, I can add an error dashboard and response runbook.",
      createdAt: ago(0.2),
      updatedAt: ago(0.2),
    },
  ]);

  await WorkspaceThread.create({
    jobId: jobByTitle["Healthcare intake data validation workflow"]._id,
    clientId: jobByTitle["Healthcare intake data validation workflow"].clientId,
    expertId: userByUsername.expert_third._id,
    invitationId: inviteHealthcare._id,
    applicationId: acceptedHealthcareApp._id,
    lastMessage: "Accepted. I can start with schema validation and alerting.",
    lastMessageAt: ago(0.4),
    lastMessageSenderId: userByUsername.expert_third._id,
    unreadByClient: 1,
    unreadByExpert: 0,
  });

  await Notification.insertMany([
    {
      userId: userByUsername.expert_demo._id,
      actorId: openLeadJob.clientId,
      type: "invitation_received",
      title: "New invitation",
      message: "You were invited to apply for a job.",
      entityType: "invitation",
      entityId: inviteOpenLead._id.toString(),
      metadata: { jobId: openLeadJob._id.toString() },
    },
    {
      userId: openLeadJob.clientId,
      actorId: userByUsername.expert_demo._id,
      type: "application_submitted",
      title: "New job application",
      message: "An expert submitted a proposal to your job.",
      entityType: "application",
      entityId: applications[0]._id.toString(),
      metadata: { jobId: openLeadJob._id.toString() },
    },
    {
      userId: userByUsername.expert_second._id,
      actorId: jobByTitle["Returns portal to WMS synchronization"].clientId,
      type: "invitation_responded",
      title: "Invitation update",
      message: "Your invitation response was recorded.",
      entityType: "invitation",
      entityId: inviteReturns._id.toString(),
      metadata: { status: "declined" },
    },
  ]);

  const reviews = await JobReview.insertMany([
    {
      jobId: completedIncidentJob._id,
      clientId: completedIncidentJob.clientId,
      expertId: userByUsername.expert_demo._id,
      rating: 5,
      comment: "Strong communication and clean n8n architecture.",
    },
    {
      jobId: supportTriageJob._id,
      clientId: supportTriageJob.clientId,
      expertId: userByUsername.expert_fifth._id,
      rating: 4,
      comment: "Great solution quality. Slight handoff delay but overall excellent.",
    },
    {
      jobId: contractRenewalJob._id,
      clientId: contractRenewalJob.clientId,
      expertId: userByUsername.expert_fourth._id,
      rating: 5,
      comment: "Delivered on time with very practical documentation.",
    },
  ]);

  const expertRatings = new Map();
  for (const review of reviews) {
    const key = review.expertId.toString();
    const current = expertRatings.get(key) || { total: 0, count: 0 };
    current.total += review.rating;
    current.count += 1;
    expertRatings.set(key, current);
  }

  await Promise.all(
    experts.map(async (expert) => {
      const stats = expertRatings.get(expert._id.toString());
      if (!stats) {
        expert.ratingTotal = 0;
        expert.ratingCount = 0;
        expert.ratingAvg = 0;
        expert.completedProjects = expert.completedProjects || 0;
      } else {
        expert.ratingTotal = stats.total;
        expert.ratingCount = stats.count;
        expert.ratingAvg = Number((stats.total / stats.count).toFixed(2));
        expert.completedProjects = stats.count;
      }
      await expert.save();
    })
  );

  await SavedItem.insertMany([
    { userId: userByUsername.expert_demo._id, entityType: "job", entityId: openLeadJob._id },
    { userId: userByUsername.expert_second._id, entityType: "job", entityId: jobByTitle["Invoice approval workflow with OCR + validation"]._id },
    { userId: userByUsername.expert_third._id, entityType: "job", entityId: jobByTitle["Fraud signal routing to risk systems"]._id },
    { userId: userByUsername.client_demo._id, entityType: "expert", entityId: userByUsername.expert_demo._id },
    { userId: userByUsername.client_demo._id, entityType: "expert", entityId: userByUsername.expert_fourth._id },
    { userId: userByUsername.client_ops._id, entityType: "expert", entityId: userByUsername.expert_second._id },
    { userId: userByUsername.client_scale._id, entityType: "expert", entityId: userByUsername.expert_sixth._id },
  ]);

  await SavedSearch.insertMany([
    {
      userId: userByUsername.expert_demo._id,
      scope: "jobs",
      name: "Open n8n + HubSpot jobs",
      filters: { status: "open", skills: "n8n,HubSpot", sort: "newest" },
      isPinned: true,
      lastUsedAt: ago(0.5),
    },
    {
      userId: userByUsername.expert_second._id,
      scope: "jobs",
      name: "Short fixed-budget jobs",
      filters: { status: "open", max: "1800", sort: "budgetAsc" },
      isPinned: false,
    },
    {
      userId: userByUsername.client_demo._id,
      scope: "experts",
      name: "Senior automation experts",
      filters: { minRate: "70", skills: "n8n,Slack", sort: "newest" },
      isPinned: true,
      lastUsedAt: ago(1.2),
    },
    {
      userId: userByUsername.client_ops._id,
      scope: "experts",
      name: "Ops-focused experts",
      filters: { skills: "n8n,Notion,Airtable", maxRate: "100" },
      isPinned: false,
    },
    {
      userId: userByUsername.client_scale._id,
      scope: "experts",
      name: "Enterprise profile experts",
      filters: { minRate: "90", skills: "n8n,Postgres,OAuth2" },
      isPinned: false,
    },
  ]);

  await Promise.all(clients.map((client) => refreshClientMetrics(client._id)));

  console.log("MVP seed complete.");
  console.log("Client logins:");
  console.log("- client.demo@n8nexperts.com / Password123!");
  console.log("- client.ops@n8nexperts.com / Password123!");
  console.log("- client.scale@n8nexperts.com / Password123!");
  console.log("Expert logins:");
  console.log("- expert.demo@n8nexperts.com / Password123!");
  console.log("- expert.second@n8nexperts.com / Password123!");
  console.log("- expert.third@n8nexperts.com / Password123!");
  console.log("- expert.fourth@n8nexperts.com / Password123!");
  console.log("- expert.fifth@n8nexperts.com / Password123!");
  console.log("- expert.sixth@n8nexperts.com / Password123!");

  await mongoose.disconnect();
};

seed().catch(async (err) => {
  console.error("Seed failed:", err.message);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore disconnect errors
  }
  process.exit(1);
});
