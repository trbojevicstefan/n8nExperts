# Firebase Deploy (Frontend + API)

This repository can stay monorepo (`frontend/` + `api/`).

- `frontend/` deploys to Firebase Hosting.
- `api/` deploys to Cloud Run.
- Hosting rewrites `/api/**` to Cloud Run (`n8nexperts-api`, `us-central1`).

## 1) Install CLIs (one time)

```powershell
npm install -g firebase-tools
```

Install Google Cloud CLI:
- https://cloud.google.com/sdk/docs/install

## 2) Authenticate

```powershell
firebase login
gcloud auth login
gcloud config set project n8nexperts
```

## 3) Deploy API to Cloud Run

```powershell
npm run firebase:deploy:api
```

Set required runtime env vars after first deploy (or during deploy), for example:
- `MONGO_URI`
- `JWT_KEY`
- `FRONTEND_URL` (can be comma-separated if needed)

Example:

```powershell
gcloud run services update n8nexperts-api `
  --region us-central1 `
  --set-env-vars "MONGO_URI=<your-mongo-uri>,JWT_KEY=<your-jwt-key>,FRONTEND_URL=https://<your-hosting-domain>"
```

## 4) Deploy frontend hosting

```powershell
npm run firebase:deploy:hosting
```

## Notes

- Frontend production API base URL defaults to `/api`, so Hosting rewrite handles backend calls.
- Firebase Hosting forwards only the `__session` cookie to rewritten backends; auth session cookies must use this name for server-side auth to work.
- If your Firebase project ID is not `n8nexperts`, update `.firebaserc`.
