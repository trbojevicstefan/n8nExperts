# QA Remediation Tracker

## Batch Budget
- Context window assumption: `128,000` tokens
- Hard ceiling per batch: `102,400` tokens
- Soft stop per batch: `90,000` tokens
- Reserved buffer: `12,400` tokens
- Estimation formula: `carry-forward summary (<=6k) + reopened file context (15k-25k) + implementation discussion (10k-15k) + diff review (10k-20k) + test output summary (5k-10k) + close-out (2k-4k)`
- Batch rule: stop once projected work approaches `90k`, update this tracker, and continue in a fresh prompt with only the carry-forward summary.

## Current Batch
- Active batch: `Batch 6`
- Working estimate: `~196k tokens completed across Batches 1-5`

## Carry-Forward Summary
- Batches 0, 1, 2, 3, 4, 5, and 6 are complete.
- The foundation is in place: disabled role-selection CTA, access-required screen, preserved auth intent, role-aware signup landing, branded favicon assets, dynamic public profile meta, and workspace `noindex` coverage.
- Public IA and copy are updated across shared site content, navbar/footer, landing, explainer pages, trust page, and auth screens.
- Structured client hiring context is now live across the stack: additive `job.brief`, additive client `hiringContext`, nested validation, and backward-compatible controller storage/reads.
- The client funnel is reworked: post-project now uses structured sections, concrete examples, live completion feedback, reusable brief scoring, and matching brief signals in job discovery cards.
- Client profiles now use company basics, hiring context, and working style sections with a lightweight preview/checklist for clearer hiring expectations.
- Expert setup is now a three-step flow with a client-facing preview, step-specific save messaging, and a usable-profile milestone unlocked by basics plus one proof item.
- Services now support optional cover images and optional short copy at the API boundary, with derived short title/description defaults, branded fallback visuals, starter templates, and a live service-card preview.
- Public expert profiles are reorganized around fit, proof, availability, services, and reviews, with empty low-signal fields removed from the main hierarchy.
- Batch 5 is now complete: jobs browsing uses stronger brief/client signals with `most detailed` and `best fit` client-side sorts, the apply flow has reusable job-specific proposal templates plus live quality/preview feedback, and workspace surfaces now carry clearer status/context cues across applications, invitations, saved jobs, setup/services, and inbox threads.
- Batch 6 is now complete: backend validation responses expose structured `errors[]`, frontend forms share one error-mapping utility with inline field states and readable banners, success messaging is clearer across auth/profile/service/job/proposal flows, and a final route/meta sanity pass confirmed the touched pages still use the expected canonicals and `noindex` flags.
- Validation passed with `npm --prefix frontend run test`, `npm --prefix frontend run lint`, `npm --prefix frontend run build`, and `npm --prefix api run test:integration`.
- Next focus: optional manual QA sweep and release prep.

## Batch 0 - Tracking Setup
- [x] Create the master implementation checklist and keep batch numbers stable.
- [x] Record the hard ceiling, soft stop, reserve buffer, and estimation formula in the working tracker.
- [x] After each batch, replace completed items with `[x]`.
- [x] After each batch, keep only a short carry-forward summary instead of dragging full history forward.

## Batch 1 - Foundation, Guards, And Quick Wins
- [x] Rework role selection so no CTA looks active before a role is chosen.
- [x] Disable the continue action until selection is made.
- [x] Change the CTA label to `Continue as client` or `Continue as expert` after selection.
- [x] Add visible helper feedback under the CTA before selection.
- [x] Add a reusable protected-entry guard screen for guests and wrong-role users.
- [x] Show clear route-specific copy such as `You need a client account to post a project`.
- [x] Save intended route and required role before redirecting into auth.
- [x] Restore the saved intent after login/register when the user has the right role.
- [x] Change default post-signup routing to the next useful step: client to post-project, expert to expert-setup, unless a saved intent overrides it.
- [x] Fix the sticky-header overlap on public expert profiles by standardizing navbar offset, page top spacing, and sticky aside offsets across breakpoints.
- [x] Replace `/vite.svg` with branded favicon assets.
- [x] Wire unique page titles, descriptions, and canonicals across all public routes.
- [x] Apply `noindex` to auth and workspace routes.
- [x] Add dynamic meta for expert and client public profile pages.

## Batch 2 - Public IA, Marketing Copy, And Page Identity
- [x] Simplify public primary navigation to `Browse Experts`, `Find Jobs`, `How It Works`, `For Clients`, `For Experts`, plus auth CTAs.
- [x] Remove workspace-only links from the public footer.
- [x] Keep app-only links inside authenticated navigation only.
- [x] Keep `/trust` as a secondary route instead of a primary nav item.
- [x] Fold trust proof earlier into landing and explainer pages.
- [x] Rewrite landing hero copy into direct product language.
- [x] Rewrite `How It Works` copy into concrete steps and outcomes.
- [x] Rewrite `For Clients` copy into hiring-focused language.
- [x] Rewrite `For Experts` copy into proof/work/get-hired language.
- [x] Rewrite `Trust` copy so it shows proof and standards instead of abstract positioning.
- [x] Rewrite auth page headings, helper text, and CTAs for role clarity and next-step clarity.
- [x] Replace repeated abstract terms like `trust`, `clarity`, `signal`, and `judgment` with concrete terms like `proof`, `fit`, `systems`, `rates`, and `delivery plan`.
- [x] Align page headings, meta descriptions, and CTA labels after the copy pass.

## Batch 3 - Client Funnel And Structured Job Brief
- [x] Extend the job model and frontend types with an additive `brief` object.
- [x] Include `outcome`, `systems`, `integrations`, `constraints`, `deliverables`, `timeline`, and `successCriteria` in that object.
- [x] Add only the minimum hiring-preference fields needed for builder/consultant/maintainer and handoff/training expectations.
- [x] Keep existing `title`, `description`, `budgetType`, `budgetAmount`, `visibility`, and `skills` for backward compatibility.
- [x] Treat `description` as overview/additional context instead of the only source of scope.
- [x] Update job create/update validation for the new brief shape.
- [x] Update job controllers to store and return the new fields without breaking old records.
- [x] Rebuild the post-project form into sections for goal, systems, constraints, timing, and hiring preferences.
- [x] Add concrete helper examples to each section.
- [x] Add progress/completeness feedback while the brief is being filled out.
- [x] Add a frontend brief-quality helper that outputs completion signals and score.
- [x] Surface `has outcome`, `has systems`, `has budget`, and `has urgency` signals in the posting flow.
- [x] Surface those same signals in jobs listing cards.
- [x] Rework the client profile form into company basics, hiring context, and working style sections.
- [x] Extend the user model and frontend types with an additive client `hiringContext` object.
- [x] Include automation goal, current pain points, expert type needed, success definition, communication preference, timezone overlap, documentation expectation, and engagement preference in that object.
- [x] Add helper copy and a lightweight preview/checklist so client profiles produce better hiring signals.

## Batch 4 - Expert Funnel, Services, And Public Profile
- [x] Reframe expert setup into three steps: basics, proof, finish profile.
- [x] Keep step one minimal: headline, core value, skills, rate, and availability.
- [x] Add stronger examples for headline and bio fields.
- [x] Add client-reading guidance so experts can preview how their profile will sound.
- [x] Add clear progress messaging after each save.
- [x] Make one work sample enough to reach a usable-profile milestone.
- [x] Rework service creation so `cover` is optional in UI, validation, and model storage.
- [x] Use a branded/generated fallback visual when `cover` is absent.
- [x] Make `shortTitle` optional at the API boundary.
- [x] Make `shortDesc` optional at the API boundary.
- [x] Auto-derive short title and short description when omitted.
- [x] Simplify the visible service form to title, what is included, best for, price, delivery time, revisions, and optional cover.
- [x] Add starter templates for audit, build, rescue, and consulting services.
- [x] Add a live service card preview.
- [x] Rework the public expert profile hierarchy around fit, proof, availability, services, and reviews.
- [x] Reduce low-signal field dumps on the public expert profile.

## Batch 5 - Marketplace Browsing, Apply Flow, And Workspace Context
- [x] Upgrade jobs list cards with quality/completeness badges.
- [x] Strengthen visual hierarchy between strong and weak briefs.
- [x] Show clearer client seriousness signals on job cards.
- [x] Add client-side sorting for `most detailed`.
- [x] Add client-side sorting for `best fit`.
- [x] Base those sorts on the structured brief signals instead of new backend ranking logic.
- [x] Rewrite apply-flow copy into direct, job-specific guidance.
- [x] Add proposal templates for implementation-first, audit-first, and consulting-led applications.
- [x] Add live quality hints while the expert writes the proposal.
- [x] Add a proposal preview block that matches what the client will read.
- [x] Improve empty states across jobs, applications, setup, and services.
- [x] Improve post-action success states after signup, save, publish, and apply actions.
- [x] Make inbox threads feel job-scoped by adding job title and application context in the thread header where data already exists.
- [x] Add stronger status cues in workspace surfaces without changing the core messaging backend.

## Batch 6 - Validation UX, Error Handling, And Final Polish
- [x] Extend backend validation responses with a structured `errors[]` array.
- [x] Keep a top-level human-readable `message` for compatibility.
- [x] Put `field` and `message` on each validation detail item.
- [x] Add a shared frontend error-mapping utility.
- [x] Render inline field errors instead of one long raw sentence.
- [x] Render a single readable summary banner above each form when needed.
- [x] Apply the new error handling to register and login.
- [x] Apply the new error handling to client profile and expert setup.
- [x] Apply the new error handling to service create/edit.
- [x] Apply the new error handling to post-project and apply flow.
- [x] Normalize success messaging so users always know what happened and what to do next.
- [x] Run a final copy/SEO/route sanity pass after all feature work lands.
