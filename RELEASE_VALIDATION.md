# Release Validation Summary

Date: 2026-05-22

## Automated Checks

- [x] `npm run validate:all`
  - Frontend unit tests: 12 files passed, 21 tests passed.
  - Frontend lint: passed.
  - Frontend production build: passed.
  - API integration tests: 11 tests passed.
- [x] `npm run smoke:e2e`
  - Public UI smoke: 2 tests passed.
  - Seeded full-flow smoke specs: 7 skipped unless `E2E_BASE_URL` and demo users are configured.
  - Added workspace smoke coverage for authenticated client/expert sessions and role-toggle/notifications behavior.
- [x] `npm run smoke:e2e:public`
  - Public UI smoke: 2 tests passed.
- [x] `npm run smoke:e2e:seeded`
  - Seeded smoke files: 7 skipped without `E2E_BASE_URL` and demo user secrets.

## Browser Verification

- [x] `http://localhost:5173/auth/role-select`
  - Title: `Choose Your Role | n8nExperts`
  - Main heading: `Join n8nExperts`
  - Runtime console errors: none with the QA API running.
- [x] `http://localhost:5173/auth/login`
  - Title: `Log In | n8nExperts`
  - Main heading: `Welcome back`
  - Runtime console errors: none with the QA API running.
- [x] `http://localhost:5173/` at mobile viewport `390x844`
  - Title: `n8nExperts | Hire n8n experts with clearer trust and workflow context`
  - Main heading: `Hire n8n experts with less guessing.`
  - Runtime console errors: none with the QA API running.
- [x] `http://localhost:5173/find-experts` with seeded marketplace data
  - Title: `Find n8n Experts | n8nExperts`
  - Main heading: `Hire n8n experts with proof, rates, and fit in view.`
  - Runtime console errors: none with the QA API running.
  - Screenshot: `temp/screenshots/upwork-find-experts.png`
- [x] `http://localhost:5173/jobs` with seeded marketplace data
  - Title: `Find n8n Jobs | n8nExperts`
  - Main heading: `Jobs you might like`
  - Runtime console errors: none with the QA API running.
  - Screenshot: `temp/screenshots/upwork-jobs.png`

## Notes

- Playwright Chromium was installed locally with `npm --prefix frontend exec playwright install chromium` so browser smoke tests can run on this machine.
- API health check is available at `/healthz`.
- Guest session checks now use `/api/auth/session`, which returns `{ "user": null }` with `200` instead of producing unauthenticated console noise on public pages.
- The Upwork-style UX pass is intentionally structural and interaction-focused: marketplace list rows, filters, proof signals, budget/rate visibility, save actions, and detail CTAs. It does not copy Upwork branding.
- Workspace dashboard now includes role-aware expert/client view toggles, spending/earnings context, and a notifications action panel.
- CI workflow now includes:
  - `Validate` (always)
  - `Smoke (Public)` (always)
  - `Smoke (Seeded)` (only when `E2E_BASE_URL`, `E2E_CLIENT_USER`, `E2E_CLIENT_PASS`, `E2E_EXPERT_USER`, and `E2E_EXPERT_PASS` secrets are configured).
- `Required Checks` aggregator job now provides a single stable branch-protection gate.
- CI workflow also listens to `merge_group` events for merge queue compatibility.
- On CI smoke failure, Playwright artifacts are uploaded (`frontend/test-results`, `frontend/playwright-report`) with 7-day retention.
