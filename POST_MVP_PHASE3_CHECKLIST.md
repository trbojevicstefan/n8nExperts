# n8nExperts Post-MVP Phase 3 Checklist

## Discovery and Saved Workflows
- [x] Add in-app saved searches management page (`/saved-searches`) for authenticated users.
- [x] Add save-current-search actions to job discovery (`/jobs`) and expert discovery (`/find-experts`).
- [x] Add saved-search navigation links for both client and expert roles.
- [x] Add support to open saved searches back into active discovery routes.

## Recommendation Tuning
- [x] Add recommendation ranking weight query params for job recommendations.
- [x] Add recommendation ranking weight query params for expert recommendations.
- [x] Expose and use ranking controls in `Saved Jobs` and `Saved Experts` pages.

## Data Quality for Local QA
- [x] Expand seed fixtures to include multiple clients, experts, and jobs.
- [x] Add richer mixed-status applications/invitations/threads/notifications/reviews fixtures.
- [x] Add multiple saved items and saved search fixtures across roles.

## Quality Gate
- [x] Backend integration tests pass.
- [x] Frontend lint passes.
- [x] Frontend tests pass.
- [x] Frontend production build passes.
- [x] Seed script executes successfully against configured Mongo URI.
