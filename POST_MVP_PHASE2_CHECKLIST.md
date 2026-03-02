# n8nExperts Post-MVP Phase 2 Completion Checklist

## Phase A: Applicant Operations Backend
- [x] Extend application query endpoints with status/search/filter/sort/pagination.
- [x] Add client private note endpoint with strict ownership checks.
- [x] Add application status history capture and `statusChangedAt` updates.
- [x] Add indexes for pipeline query performance.
- [x] Keep consistent API error envelope behavior for new endpoints.

## Phase B: Applicant Operations Frontend
- [x] Rebuild client applicant view into status-grouped pipeline.
- [x] Add filter/search/sort controls and count badges.
- [x] Add inline private notes on application cards.
- [x] Add batch quick actions (shortlist/accept/reject) on selected applicants.
- [x] Rebuild expert `My Applications` into grouped status tabs/pills.
- [x] Persist view state in URL params and restore on refresh.

## Phase C: Rich Expert Profile
- [x] Extend backend expert profile validation/schema for practical optional fields.
- [x] Update expert setup/edit UI with new optional sections.
- [x] Add profile completeness calculator + API field.
- [x] Render expanded fields on public expert profile.
- [x] Add section-level progressive disclosure in expert setup.

## Phase D: Client Profiles
- [x] Add client profile write endpoint (`PATCH /api/clients/me/profile`) with validation.
- [x] Add public client profile endpoint (`GET /api/clients/:clientId/public`) with trust metrics.
- [x] Add client profile edit page (`/client/profile`).
- [x] Add public client profile page (`/clients/:clientId`) and link it from job/application surfaces.
- [x] Add trust signal cards in job detail and application context panels.

## Phase E: UI / Navigation / Accessibility
- [x] Add nav and user-menu links for new profile routes.
- [x] Introduce standardized loading/empty/error states in new views.
- [x] Improve applicant detail card readability and action clarity.
- [x] Add focusable controls, labels, and keyboard-friendly tab/filters in updated pages.

## Phase F: Quality and Release
- [x] Add backend integration tests for filters, notes authorization, status history, and client profile visibility.
- [x] Add frontend integration tests for pipeline grouping, filters, notes persistence, and profile forms.
- [x] Add e2e smoke tests for active routes (`/my-jobs`, `/client/profile`, `/my-applications`, `/invitations`).
- [x] Update seed fixtures with richer profile data and mixed-status applications.
- [x] Add release checklist and rollback notes.

## Release Checklist
- [x] Backend syntax checks pass.
- [x] Backend integration tests pass.
- [x] Frontend lint passes.
- [x] Frontend unit/integration tests pass.
- [x] Frontend production build passes.
- [x] E2E smoke suite present and runnable (skips unless `E2E_BASE_URL` is set).
- [x] Run DB migration in target environment: `npm run migrate:phase2` (manual deploy step).
- [x] Run seed in QA environment if needed: `npm run seed:mvp` (manual QA step).

## Rollback Notes
1. Revert frontend rollout:
   - Revert changes to `frontend/src/pages/projects/MyJobs.tsx`, `frontend/src/pages/work/MyApplications.tsx`, `frontend/src/pages/onboarding/ExpertWizard.tsx`, `frontend/src/pages/work/FindWork.tsx`, `frontend/src/pages/clients/*`, `frontend/src/routes/index.tsx`, and `frontend/src/components/layout/Navbar.tsx`.
2. Revert API route/controller additions:
   - Remove `/api/clients` route mount and revert `client.controller.js`, `client.route.js`, and `job.controller.js` Phase 2 query/note/history logic.
3. Revert schema additions:
   - Revert `api/models/jobApplication.model.js` and `api/models/user.model.js` additions.
4. Disable new tests/tooling only (if needed):
   - Revert `api/tests/integration/*`, frontend test files, and package scripts/dependencies.
5. Data rollback guidance:
   - New fields are additive; rollback can leave data in place safely.
   - If needed, clear Phase 2 fields with targeted update scripts instead of destructive collection drops.
