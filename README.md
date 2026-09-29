# TrainSMART Frontend

React + TypeScript dashboard for **TrainSMART**, a national registry for healthcare-worker training in
Kenya. Staff use it to run training sessions, record attendance and scores, move certificates through
approval, and verify certificates publicly.

> **Status:** independently designed and built by [Brian Ndung'u](https://github.com/ray100-art) as a
> proposed replacement for NASCOP's legacy TrainSMART registry. It is **not** an official Ministry of
> Health deployment. The live instance is a demo.

**Live demo:** [trainsmart-fronted.vercel.app](https://trainsmart-fronted.vercel.app) ·
**Backend API:** [ray100-art/trainsmart-backend](https://github.com/ray100-art/trainsmart-backend)

`React 19` `TypeScript` `Vite` `TanStack Query` `React Hook Form` `Zod` `Tailwind CSS v4` `Radix UI` `Vercel`

---

## Features

- **Dashboard:** national and county overview of sessions, participants and certificates
- **Sessions:** create a session, register participants, record attendance and pre/post-test scores,
  submit the post-training report, then approve or reject it
- **People registry:** searchable, paginated person records, plus facility and sponsor catalogues and CSV import
- **Certificates:** issue → sign pipeline with a printable certificate layout, plus legacy certificate import
- **Public verification:** anyone can check a certificate serial, including pre-2018 legacy certificates,
  without signing in
- **Reports:** analytics and CSV exports
- **Administration:** invitation-based user onboarding, activation and deactivation, audit log viewer
- **Role-aware UI:** navigation and actions adapt to six roles, from trainer to system admin
- Responsive layout with a mobile navigation menu and phone-friendly score entry

## How it talks to the API

- Auth uses **httpOnly cookies set by the backend**, plus a CSRF token header. No JWT is kept in `localStorage`.
- Server state lives in **TanStack Query** (caching, background refetch, invalidation after mutations).
- Every form is validated on the client with **React Hook Form + Zod** before it is sent.

## Run locally

```bash
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:8000/api/v1
npm run dev               # http://localhost:5173
```

The [backend](https://github.com/ray100-art/trainsmart-backend) must be running.

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Type-check and build for production (`dist/`) |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |

CI type-checks and builds the app on every push.

## Deployment

- **Vercel** (current demo): set `VITE_API_URL` to the hosted API. `vercel.json` handles SPA routing.
- **Same-origin behind Nginx:** build with `VITE_API_URL=/api/v1` and serve `dist/`. See the backend's `deploy/` folder.

## License

[MIT](LICENSE)
