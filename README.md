# odin-wheres-waldo


This is a project submission for The Odin Project NodeJS Course, Project: Where's Waldo (A Photo Tagging App).

This is a full-stack **Where's Waldo** game built as a pnpm monorepo, where players find characters on the map, submit their time, and view the leaderboard; all scores are validated on the backend using JWT without states stored in DB.

## Tech Stack

- **Frontend:** React 19, Vite 7, React Router, Tailwind CSS 4
- **Backend:** Node.js, Express 5, TypeScript, JWT
- **Database:** PostgreSQL via Prisma ORM
- **Tooling:** pnpm workspaces, ESLint, Prettier

## Monorepo Structure

```text
apps/
	backend/    # API server
	frontend/   # game UI
```

## Prerequisites

- Node.js
- pnpm

## Installation

From the repo root:

```bash
pnpm install
```

## Environment Variables

### Backend (`apps/backend/.env`)

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME
JWT_SECRET=replace-with-a-long-random-secret
```

### Frontend (`apps/frontend/.env`)

`VITE_API_URL` should include the backend `/api/` prefix and a trailing slash, for example:

```env
VITE_API_URL=http://localhost:5000/api/
```

## Database Setup (Prisma)

```bash
pnpm --filter backend exec prisma migrate dev
```

This applies migrations and generates the Prisma client used by the backend.

## Run Locally

From the repo root:

```bash
pnpm dev
```

This starts both frontend and backend in watch mode.

Useful alternatives:

```bash
pnpm dev:frontend
pnpm dev:backend
```

## Available Scripts (root)

- `pnpm dev` run all workspace dev scripts
- `pnpm build` build all workspaces
- `pnpm lint` lint all workspaces
- `pnpm format` format all workspaces
- `pnpm test` run workspace tests (not implemented yet)
- `pnpm start` start backend production build
- `pnpm preview` preview frontend production build

## API Overview

Base URL: `${VITE_API_URL}` in frontend should resolve to backend `/api/`.

- `GET /api/` health check
- `GET /api/game-start` start a game session and return JWT session token
- `POST /api/game-guess` validate a character guess
- `POST /api/game-end` submit completed game score
- `GET /api/scores` leaderboard scores, sorted by best time
