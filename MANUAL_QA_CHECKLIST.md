# Manual QA Checklist

Use this checklist after `npm run validate:all` and before release. The goal is to verify the highest-signal client and expert journeys without trying to exhaustively click every route.

## Setup

- [ ] Start the API with production-like env vars or a seeded local database.
- [ ] Start the frontend with the API origin configured.
- [ ] Confirm `npm run validate:all` passes from the repo root.
- [ ] Confirm `npm run smoke:e2e` passes from the repo root.

## Public And Auth

- [ ] Home loads on desktop and mobile widths without layout overlap.
- [ ] Public nav routes open: Browse Experts, Find Jobs, How It Works, For Clients, For Experts.
- [ ] Role selection keeps the continue CTA disabled until a role is selected.
- [ ] Client role selection routes to client registration with the correct copy.
- [ ] Expert role selection routes to expert registration with the correct copy.
- [ ] Login shows inline errors for invalid credentials and preserves the intended destination when redirected from a protected page.

## Client Flow

- [ ] A client can register or log in and land on the next useful client step.
- [ ] A client can post a project with structured brief fields, budget, skills, and timeline.
- [ ] The project appears in My Jobs with clear status and applicant context.
- [ ] Client profile can save company basics and hiring context.
- [ ] Saved experts, applicant pipeline, and inbox routes show useful empty or loaded states.

## Expert Flow

- [ ] An expert can register or log in and land on expert setup.
- [ ] Expert setup saves basics and shows profile progress/success messaging.
- [ ] Expert services can be created without a cover image and display a branded fallback visual.
- [ ] Find Work search, sort, and brief-signal cards are readable.
- [ ] An expert can submit a proposal and see it listed under My Applications.
- [ ] Invitations, saved jobs, and inbox routes show job-scoped context.

## Release Sanity

- [ ] API root or `/healthz` returns a healthy JSON response.
- [ ] Auth/workspace routes include `noindex,nofollow`.
- [ ] Public routes include useful page titles and descriptions.
- [ ] Mobile bottom navigation does not cover primary form actions.
- [ ] Browser console has no user-visible runtime errors on the main public and auth routes.
