# TrainSMART Frontend

React + Vite frontend for **TrainSMART** — the NASCOP healthcare training registry for [nhcsc.nascop.org](https://nhcsc.nascop.org).

Backend API: [trainsmart-backend](https://github.com/ray100-art/trainsmart-backend)

## Stack

- React 19 + TypeScript
- Vite
- TanStack Query
- React Router
- Tailwind CSS
- Axios (httpOnly cookie auth)

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Set `VITE_API_URL` in `.env` to your backend API base URL (e.g. `http://localhost:8000/api/v1`).

## Production build

```bash
npm run build
npm run preview
```

For production at `nhcsc.nascop.org`, set:

```
VITE_API_URL=https://your-api-host/api/v1
```

Ensure the backend `ALLOWED_ORIGINS` includes your frontend URL and `COOKIE_SECURE=True` when using HTTPS.

## Features

- Role-based dashboards (trainer, county officer, national admin, system admin)
- Training session workflow (create → approve → participants → report → certificates)
- Public certificate verification
- User administration (system admin)
- Account setup via secure email link
