# Release Prep Runbook

This runbook is for final checks before shipping updates across `frontend/` and `api/`.

## 1) Preconditions

- Node version matches project requirement: `>=20.19.0`
- Required API env vars are configured in deployment target:
  - `MONGO_URI`
  - `JWT_KEY`
  - `FRONTEND_URL`
- Local dependencies installed:
  - `npm install`
  - `npm --prefix frontend install`
  - `npm --prefix api install`
- API health check is available at `/healthz` and should return `status: "ok"` when MongoDB is connected.

## 2) Full Validation (Required)

Run from repo root:

```bash
npm run validate:all
```

This executes:
- Frontend unit tests
- Frontend lint
- Frontend production build
- API integration tests

## 3) Optional Browser Smoke

Run when validating UI behavior quickly:

```bash
npm run smoke:e2e
```

With no `E2E_BASE_URL`, this starts the local Vite dev server and verifies public pages. With `E2E_BASE_URL` set, it targets that URL and also runs the seeded auth/API smoke specs when the backend and demo users are available.

Focused smoke commands:

```bash
npm run smoke:e2e:public
npm run smoke:e2e:seeded
```

- `smoke:e2e:public` only runs the public-route smoke file.
- `smoke:e2e:seeded` only runs seeded authenticated smoke files (MVP core, phase 2, workspace).

## 4) CI Smoke Gating

- CI workflow: `.github/workflows/ci.yml`
- `Smoke (Public)` runs on every PR/push after validation.
- `Smoke (Seeded)` runs only when these secrets are present:
  - `E2E_BASE_URL`
  - `E2E_CLIENT_USER`
  - `E2E_CLIENT_PASS`
  - `E2E_EXPERT_USER`
  - `E2E_EXPERT_PASS`

## 5) Branch Protection Recommendation

Set protected-branch required status checks to:

- `Required Checks`

Why this is preferred:

- It is stable even if underlying CI job names evolve.
- It enforces `Validate` and `Smoke (Public)` success.
- It allows `Smoke (Seeded)` to be either `success` (when secrets exist) or `skipped` (when they do not).

CI failure artifacts:

- On smoke-job failures, CI uploads Playwright artifacts from:
  - `frontend/test-results`
  - `frontend/playwright-report`
- Artifact retention: 7 days.

## 6) Manual QA Checklist (High-Signal Paths)

Use `MANUAL_QA_CHECKLIST.md` and complete:
- Auth + role selection flows
- Client post-project + profile flows
- Expert setup + apply flows
- Workspace context/status cues
- Route/meta/indexing sanity checks

## 7) Deploy Order

1. Deploy API.
2. Verify `/healthz` and CORS behavior from deployed frontend origin.
3. Deploy frontend.
4. Run focused smoke checks on production URLs.

## 8) Rollback Notes

- If API regressions appear: roll back API first.
- If only UI regressions appear: roll back frontend build only.
- Re-run `npm run validate:all` on rollback candidate branch before redeploy.
