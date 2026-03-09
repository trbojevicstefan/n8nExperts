# Render Deploy

This repo is set up for `render.com` with one Render service:

- `n8nexperts-api`: Node web service from `api/`

The Render blueprint lives in `render.yaml`.

## Render setup

1. Push this repo to GitHub.
2. In Render, create a new Blueprint and point it at the repo.
3. Render will create the API web service from `api/`.

## Required environment variables

Set these on `n8nexperts-api`:

- `MONGO_URI`
- `JWT_KEY`
- `FRONTEND_URL`

## Important behavior

- `FRONTEND_URL` must be the exact Cloudflare Pages URL or your custom frontend domain so CORS allows the browser origin.
- Auth cookies are sent cross-origin with `withCredentials: true`.
- The API service is set to `free` in the blueprint. If you do not want sleeping, change the plan in Render.
- The frontend deployment is documented separately in `CLOUDFLARE_PAGES_DEPLOY.md`.

## Local development

- Frontend dev still defaults to `http://localhost:8800/api`
- API still reads from `api/.env`
