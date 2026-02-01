# Droply

Droply is a lightweight file-sharing app that lets you upload files or folders, generate a single share link, and automatically expire everything after 24 hours. It uses Appwrite for storage and Postgres via Prisma for session metadata.

## Features

- Upload files or folders with drag-and-drop
- Share a single link for all files
- Automatic 24-hour expiration and cleanup
- Download individual files or a full ZIP
- QR code for quick mobile sharing
- 1GB total upload limit per session

## Tech Stack

- Next.js (App Router) + React 19
- Appwrite Storage
- Prisma + Postgres
- orpc + TanStack Query
- Zod for validation
- Tailwind CSS + shadcn/ui
- Motion for animations
- Vitest for tests

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create a `.env` file in the project root with the following variables:

```bash
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_APPWRITE_PROJECT_ID="..."
NEXT_PUBLIC_APPWRITE_PROJECT_NAME="droply"
NEXT_PUBLIC_APPWRITE_ENDPOINT="https://<region>.cloud.appwrite.io/v1"
NEXT_PUBLIC_APPWRITE_BUCKET_ID="temp-files"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="https://your-domain.example"
CRON_SECRET="your-secret"
```

### 3) Set up the database

```bash
npx prisma migrate dev
```

### 4) Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` - start the dev server
- `npm run build` - build for production
- `npm run start` - run the production server
- `npm run lint` - run Biome checks
- `npm run format` - format with Biome
- `npm run test` - run Vitest (watch)
- `npm run test:run` - run Vitest once
- `npm run test:coverage` - run tests with coverage
- `npm run type-check` - TypeScript type check

## API Routes

- `GET /api/download/[fileId]` - download a single file
- `GET /api/download/session/[token]` - download a ZIP of all files
- `GET /api/cron/cleanup` - delete expired sessions (requires `Authorization: Bearer <CRON_SECRET>`)

## How Expiration Works

Each upload session is valid for 24 hours. A cleanup job can be triggered by hitting the cron endpoint which removes expired files from Appwrite and deletes their metadata from Postgres.

## Deployment Notes

- Ensure the Appwrite bucket exists and is accessible from your deployment.
- Schedule a cron job to call `/api/cron/cleanup` at your preferred interval.
