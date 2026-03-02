# n8nExperts Core Marketplace MVP - Implementation Checklist

## Phase 0: Foundation Alignment
- [x] Audit current backend/frontend implementation and identify real vs mock features.
- [x] Fix baseline compile/lint blockers in frontend (`Home.tsx` unused imports and strict TS fallout).
- [x] Clean navigation/routes so all visible links resolve to real pages.
- [x] Standardize product naming/copy to `n8nExperts` across active pages.

## Phase 1: Data Model Stabilization
- [x] Add `Job` model with ownership, budget, skills, visibility, status, timestamps.
- [x] Add `JobApplication` model with unique `(jobId, expertId)` and status lifecycle.
- [x] Add `PortfolioItem` model for published work.
- [x] Update `User` schema to normalize role handling (`role`, `isExpert`, `isClient` compatibility).
- [x] Add migration script to normalize existing users (`isSeller -> isExpert`) and repair role flags.

## Phase 2: Backend API Implementation
- [x] Refactor register/login/auth-me flows to enforce normalized roles and compatibility.
- [x] Add expert public listing/profile endpoints with search/filter/pagination.
- [x] Add expert self-profile update endpoint.
- [x] Implement portfolio CRUD endpoints with ownership checks.
- [x] Harden service CRUD/list validation for publishable expert services.
- [x] Implement jobs CRUD/list/status endpoints with client-only mutation permissions.
- [x] Implement application create/list/status/withdraw endpoints with permissions.
- [x] Implement invitation endpoint (`client job -> expert`) for profile/service CTA.
- [x] Add centralized request validation middleware and keep consistent error envelopes.
- [x] De-scope payment/order from active MVP frontend flows.

## Phase 3: Frontend Data Layer and Auth/Routing
- [x] Rebuild `frontend/src/lib/api.ts` to match backend contracts.
- [x] Update auth context/types to normalized role + robust `/auth/me` session restore.
- [x] Add route guards for authenticated and role-based routing.
- [x] Add loading/empty/error handling across active MVP pages.

## Phase 4: Client Experience (Real Flows)
- [x] Replace mock `PostProject.tsx` with real job creation.
- [x] Build client `My Jobs` dashboard (job list, status controls, applicant review).
- [x] Build application review actions per job (`submitted -> shortlisted -> accepted/rejected`).
- [x] Implement invite flow from expert profile to selected client job.

## Phase 5: Expert Experience (Real Flows)
- [x] Replace mock `FindWork` with live jobs + apply action.
- [x] Replace mock `Expert Marketplace` with live experts listing/filtering.
- [x] Replace mock `Expert Profile` with live profile + portfolio + services.
- [x] Convert `ExpertWizard` into persisted profile/portfolio setup.
- [x] Add expert service management page.
- [x] Add expert `My Applications` dashboard with withdraw support.

## Phase 6: Scope Lock + De-scoping Non-MVP Areas
- [x] Remove/hide non-MVP pages from primary navigation.
- [x] Keep non-MVP routes out of active router.
- [x] Ensure no payment UX exists in active MVP routes.

## Phase 7: Quality and Release Readiness
- [x] Add backend integration tests (auth, profile, services, jobs, applications, invitations).
- [x] Add frontend integration tests for critical forms and role-protected routing.
- [x] Add end-to-end smoke tests for the 3 core journeys.
- [x] Add seed data script for local QA (`api/scripts/seed-mvp.js`).
- [x] Pass quality gate for frontend lint/build and backend syntax checks.
