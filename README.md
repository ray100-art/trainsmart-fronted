# TrainSMART Frontend

**Canonical repository** for the NASCOP/MOH Kenya TrainSMART national training platform.

> Do not use `C:\Users\ADMIN\transmart-frontend` — that folder is kept in sync automatically but this path is the source of truth.

## Stack

- React 19 + TypeScript + Vite
- TanStack Query, React Hook Form, Zod
- Tailwind CSS v4

## Quick start

```powershell
cd C:\trainsmart-frontend
npm install
copy .env.example .env
npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:8000/api/v1 (see `C:\transmart-backend`)

## Environment

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL (e.g. `http://localhost:8000/api/v1`) |

Production: set to `https://nhcsc.nascop.org/api/v1` (or `/api/v1` for same-origin nginx).

### Production build

```powershell
copy .env.production.example .env.production
# Edit VITE_API_URL — use /api/v1 when nginx serves API on same host
npm run build
```

Deploy the `dist/` folder to the web server. See `C:\transmart-backend\deploy\` for nginx and systemd configs.

### Free staging (Neon + Render + Vercel)

No server needed. Full guide: `transmart-backend/deploy/FREE-DEPLOY.md`

## Related projects

| Component | Path |
|-----------|------|
| **Frontend (this)** | `C:\trainsmart-frontend` |
| **Backend** | `C:\transmart-backend` |

Backend uses **PostgreSQL** in production. Set `DATABASE_URL=postgresql://...` in the backend `.env`.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |
