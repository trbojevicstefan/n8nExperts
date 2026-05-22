## Batch 7 - Manual QA Sweep And Release Prep

### Goals
- Convert the "next focus" note into an executable cycle with clear done criteria.
- Standardize pre-release validation into one root command.
- Add a repeatable manual QA checklist for high-signal user journeys.

### Tasks
- [x] Add root scripts for full validation and smoke checks.
- [x] Add a release prep runbook with environment checks, deploy order, and rollback notes.
- [x] Add a manual QA checklist focused on client and expert core flows.
- [x] Make the smoke check self-contained for public UI verification.
- [x] Add a backend health endpoint for release checks.
- [x] Polish high-impact auth entry UX and accessibility.
- [x] Run full validation locally and capture pass/fail summary.
- [x] Retire legacy tracker dependency and keep Batch 7 status in this plan/release docs.

### Done Criteria
- One command exists at repo root for full release validation.
- QA/release docs are present, clear, and reference real repo commands.
- `plan.md` reflects completed Batch 7 items without depending on retired legacy docs.

## UX Follow-up - Upwork-style Marketplace Pass

### Goals
- Make marketplace discovery feel closer to Upwork-style talent and job browsing without copying Upwork branding.
- Prioritize filtering, proof, budget/rate clarity, and high-signal list rows over generic card grids.

### Tasks
- [x] Convert expert discovery into a list-first talent marketplace with search, rate filters, skill filters, proof signals, save actions, and profile CTAs.
- [x] Convert the job feed into a marketplace view with a desktop filter rail, budget cards, client signals, brief quality badges, and clear detail actions.
- [x] Keep mobile-friendly filter controls for the job feed and preserve public-page navigation behavior.
- [x] Run seeded browser verification for the Upwork-style marketplace pages and capture screenshots.
- [x] Run React UX/accessibility sweep on the edited TSX surfaces.

### Done Criteria
- Expert and job marketplace pages expose the key decision data before users open details.
- Browser verification passes with seeded experts/jobs and no runtime console errors.
- Keyboard users can open job details from the new marketplace rows.

## Batch 8 - Workspace Dashboard Pro Pass

### Goals
- Deliver a role-aware workspace control center with high-signal metrics and clear next actions.
- Keep the dashboard aligned with the dark premium visual system while improving readability and keyboard flow.

### Tasks
- [x] Rebuild `DashboardOverview` into the requested structure: header/status, metrics row, active projects, message panel, and quick actions.
- [x] Replace icon placeholders with `lucide-react` icons for action and status controls.
- [x] Add workspace page metadata (`title`, description, canonical path, and `noindex`) for route hygiene.
- [x] Add a focused unit test for dashboard rendering and key action links.
- [x] Run frontend validation and smoke tests after the dashboard refactor.

### Done Criteria
- Dashboard page exposes earnings, active jobs, completion rate, active projects, and message context on first view.
- Quick actions are keyboard-focusable links with clear labels.
- Validation stays green after the dashboard implementation.

## Batch 9 - Workspace Role Toggle And Alert Context

### Goals
- Make the dashboard truly role-aware with mode-specific metric framing and actions.
- Surface notifications beside communications so users can act without scanning multiple routes.

### Tasks
- [x] Add a client/expert mode toggle in `DashboardOverview` with clear active state semantics.
- [x] Add role-aware top metric framing (earnings vs spending) and mode-specific quick actions.
- [x] Add a notifications panel with severity badges and direct action links.
- [x] Extend workspace mock data for spending and notification items.
- [x] Update dashboard tests for role toggle and notification rendering.
- [x] Re-run frontend and full root validation after the role-aware dashboard pass.

### Done Criteria
- Dashboard supports switching between expert and client context without leaving the page.
- Users can see recent messages and notifications together with direct navigation actions.
- Validation remains green after the update.

## Batch 10 - Workspace Auth Smoke Coverage

### Goals
- Add authenticated smoke coverage for the workspace control center in both expert and client sessions.
- Verify role-toggle and notification navigation behavior in a seeded environment.

### Tasks
- [x] Add Playwright workspace smoke tests for expert and client sessions.
- [x] Keep workspace smoke tests skip-safe when `E2E_BASE_URL` is not configured.
- [x] Run root smoke and full validation after adding workspace smoke coverage.
- [x] Update release validation notes with the new smoke-test scope.

### Done Criteria
- Workspace smoke covers expert/client login, workspace rendering, role context toggle, and notifications routing.
- Root smoke command still passes locally with seeded suites skipped when env is absent.

## Batch 11 - CI Seeded Smoke Gating

### Goals
- Add CI automation that always runs validation and public smoke checks.
- Gate seeded smoke checks behind required repository secrets.

### Tasks
- [x] Add GitHub Actions workflow with validate + public smoke jobs.
- [x] Add seeded smoke CI job gated by `E2E_*` secrets.
- [x] Split smoke scripts into `public` and `seeded` command variants.
- [x] Update release prep docs with CI smoke gating and required secrets.
- [x] Run local smoke command variants to verify behavior without seeded env vars.

### Done Criteria
- CI workflow can run on PR/push without seeded secrets.
- Seeded smoke job auto-enables when all required secrets are configured.

## Batch 12 - Branch Protection Gate Stabilization

### Goals
- Expose one stable CI status check name for branch protection rules.
- Ensure CI-required checks also run for merge queue workflows.

### Tasks
- [x] Add `merge_group` trigger to the CI workflow.
- [x] Add a `Required Checks` aggregator job that enforces validate/public success and allows seeded smoke to be `success` or `skipped`.
- [x] Update release docs to recommend `Required Checks` as the protected-branch required status.
- [x] Re-run local validation after CI workflow hardening.

### Done Criteria
- Branch protection can key off a single status check (`Required Checks`) instead of multiple job names.
- Merge queue executions include the same CI workflow entry points.

## Batch 13 - CI Failure Artifact Capture

### Goals
- Reduce triage time when Playwright smoke checks fail in CI.
- Preserve traces/results directly in GitHub Actions artifacts.

### Tasks
- [x] Upload public smoke Playwright artifacts on CI failure.
- [x] Upload seeded smoke Playwright artifacts on CI failure.
- [x] Update release docs to note artifact availability and retention.
- [x] Re-run local validation after CI workflow update.

### Done Criteria
- CI smoke jobs publish downloadable artifacts on failure without affecting pass paths.
