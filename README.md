# Clinic Management Backend

This is the backend service for a clinic management platform. It handles authentication, clinic ownership, staff membership, doctor records, schedules, and patient appointment booking.

## Tech stack
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis

## Prerequisites
- Node.js 20+
- PostgreSQL running locally or in a remote environment
- Redis running locally or in a remote environment

## Environment setup
Create a `.env` file in the project root with the following values:

```env
PORT=5000
HOST=localhost
ALLOWED_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/clinic
ACCESS_TOKEN_SECRET=replace_with_a_long_random_string
REFRESH_TOKEN_SECRET=replace_with_a_different_long_random_string
REDIS_URL=redis://localhost:6379
```

## Install dependencies

```bash
npm install
```

## Run locally

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Type-check

```bash
npm run typecheck
```

## Project flow
- Users sign up and sign in
- Users create clinics they own
- Clinic members are assigned roles
- Doctors are created and linked to clinics
- Doctor schedules are created per clinic assignment
- Public users can view doctor/schedule details and book appointments
