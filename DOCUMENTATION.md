<div align="center">

# Clinic Management API

### A clinic operations backend for clinic teams, doctors, schedules, and patient appointments

![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-7-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Service-DC382D?logo=redis&logoColor=white)

**API version:** `v1` &nbsp;·&nbsp; **Status:** Core MVP

</div>

---

## Contents

- [Overview](#overview)
- [Core workflow](#core-workflow)
- [Technology and architecture](#technology-and-architecture)
- [Domain model](#domain-model)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Database setup](#database-setup)
- [Run and verify](#run-and-verify)
- [API conventions](#api-conventions)
- [Authentication](#authentication)
- [Endpoint reference](#endpoint-reference)
- [Errors and status codes](#errors-and-status-codes)
- [Project structure](#project-structure)
- [Current scope and follow-up](#current-scope-and-follow-up)

## Overview

Clinic Management API is a TypeScript and Express backend for a multi-clinic management workflow. Clinic owners can create clinics, manage clinic members, create doctor records, associate doctors with clinics, and configure weekly schedules. Patients can browse doctors and schedules and request appointments through the public booking endpoints.

This repository currently represents the **core MVP flow**. It provides API handlers, validation, persistence, authentication, and a Swagger UI entry point. The endpoint list in [ENDPOINTS.md](./ENDPOINTS.md) is the detailed, handler-oriented reference for request data, success responses, and known exceptions.

## Core workflow

```mermaid
flowchart LR
    U[User signs up and signs in] --> C[Owner creates a clinic]
    C --> M[Owner adds clinic members]
    C --> D[Owner or manager creates a doctor]
    D --> A[Doctor is assigned to a clinic]
    A --> S[Weekly schedule is configured]
    S --> P[Patient browses doctors and schedules]
    P --> B[Patient books an appointment]
```

The public patient journey does not require a patient account in the current implementation.

## Technology and architecture

| Area | Technology | Purpose |
|---|---|---|
| Runtime | Node.js | Runs the API service |
| HTTP API | Express 5 | Routes and middleware |
| Language | TypeScript | Application code and type checking |
| Input validation | Zod | Request validation in feature handlers |
| Persistence | PostgreSQL | Clinic, user, doctor, schedule, and appointment data |
| Data access | Prisma ORM | Database schema, migrations, and queries |
| Authentication | JSON Web Tokens | Access and refresh token issuance and access-token verification |
| Password security | bcrypt | Password hashing and verification |
| Runtime service | Redis | Redis client is connected during server startup |
| API UI | Swagger UI | Served at `/api-docs` from `openapi.yaml` |

The code is organized by feature. Route modules connect handlers; handlers validate input and shape HTTP responses; services implement business rules; repositories perform Prisma queries. Shared utilities provide JWT, password, validation, and error-handling behavior.

## Domain model

| Entity | Purpose | Key relationships |
|---|---|---|
| `User` | Login identity and clinic ownership | Can own clinics, belong to clinics, and have a doctor profile |
| `Clinic` | A clinic location managed by an owner | Has members and doctor assignments |
| `ClinicMember` | A user's role within a clinic | Joins one user to one clinic; unique per clinic/user |
| `Doctor` | A doctor profile and associated user identity | Created by a user and linked to clinics through `DoctorClinic` |
| `DoctorClinic` | A doctor’s association with a clinic and clinic-specific fee | Has schedules; unique per doctor/clinic |
| `DoctorSchedule` | A recurring weekly day and time range | Belongs to a doctor-clinic assignment |
| `Appointment` | Patient booking for a schedule and date | Stores patient contact data, time range, and status |

Clinic member roles are `OWNER`, `STAFF`, `RECEPTIONIST`, `DOCTOR`, and `MANAGER`. Appointment statuses are `PENDING`, `CONFIRMED`, and `CANCELLED`. Weekly schedules use weekday names. Schedule and appointment times are represented as minutes after midnight in the database and in the available-slots response.

## Getting started

### Prerequisites

- Node.js 20 or newer
- npm
- PostgreSQL
- Redis

### Install dependencies

```bash
npm install
```

### Configure environment

Create a `.env` file in the repository root. See [Configuration](#configuration) for the required variables.

## Configuration

The application reads configuration from environment variables (normally loaded from the project-root `.env` file).

| Variable | Required | Description | Example |
|---|---:|---|---|
| `PORT` | Yes | HTTP port | `5000` |
| `HOST` | Yes | Host label used in the startup message | `localhost` |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:password@localhost:5432/clinic` |
| `ACCESS_TOKEN_SECRET` | Yes | Secret used to sign access tokens | Use a long, unique random value |
| `REFRESH_TOKEN_SECRET` | Yes | Separate secret used to sign refresh tokens | Use a different long, unique random value |
| `REDIS_URL` | Yes | Redis connection URL | `redis://localhost:6379` |
| `ALLOWED_ORIGIN` | In sample configuration | Intended frontend origin; verify CORS wiring before relying on it | `http://localhost:3000` |

Example template:

```env
PORT=5000
HOST=localhost
DATABASE_URL=postgresql://user:password@localhost:5432/clinic
ACCESS_TOKEN_SECRET=replace_with_a_long_random_secret
REFRESH_TOKEN_SECRET=replace_with_a_different_long_random_secret
REDIS_URL=redis://localhost:6379
ALLOWED_ORIGIN=http://localhost:3000
```

Do not commit real credentials or secret values. Generate separate high-entropy secrets for each environment. `ALLOWED_ORIGIN` appears in the project configuration sample, but the current Express app does not register CORS middleware; configure and verify CORS before connecting a browser-based frontend.

## Database setup

Prisma is configured with `prisma/schema.prisma` and migrations in `prisma/migrations/`. With PostgreSQL running and `DATABASE_URL` set, apply the existing migrations and generate the Prisma client:

```bash
npx prisma migrate deploy
npx prisma generate
```

For local schema development, Prisma's development migration workflow is:

```bash
npx prisma migrate dev
```

The server uses the generated client from `src/generated/prisma`.

## Run and verify

Start the development server with file watching:

```bash
npm run dev
```

Available project scripts:

| Command | Purpose |
|---|---|
| `npm run dev` | Run the server using `tsx watch` |
| `npm run typecheck` | Type-check without emitting build output |
| `npm run build` | Compile TypeScript into `dist/` |
| `npm start` | Run the compiled server |

The server connects to Redis before starting its HTTP listener. Ensure Redis and PostgreSQL are reachable. The configured local base URL is typically `http://localhost:5000`; the server logs the configured host and port at startup.

## API conventions

- API routes use the `/api/v1` prefix.
- Send JSON request bodies with `Content-Type: application/json`.
- Protected routes expect `Authorization: Bearer <access-token>`.
- Request payloads and query parameters are validated with feature-specific Zod schemas.
- Success bodies are not uniform: some handlers return JSON, others return plain text.
- Shared errors are returned as JSON:

  ```json
  {
    "error": "error message"
  }
  ```

- Most success status codes and shapes are documented per endpoint in [ENDPOINTS.md](./ENDPOINTS.md).
- Swagger UI is exposed at `/api-docs`. Its current `openapi.yaml` is only a partial specification; use the route handlers and [ENDPOINTS.md](./ENDPOINTS.md) as the current implementation reference.

## Authentication

Signup creates a user account. Signin validates the credentials and returns `accessToken` and `refreshToken`. The access-token middleware verifies bearer tokens on protected routes. The current signin flow configures access-token expiry at one hour and refresh-token expiry at seven days.

The signout handler currently returns a success message but does not revoke tokens or maintain a server-side session. Clients should not treat signout as token invalidation; discard stored tokens on the client. A refresh-token exchange endpoint is not currently present in the route set.

## Endpoint reference

The following table gives a quick route index. For request fields, response examples, and error details, see [ENDPOINTS.md](./ENDPOINTS.md).

| Area | Method | Path | Access |
|---|---|---|---|
| Authentication | `POST` | `/api/v1/auth/signup` | Public |
| Authentication | `POST` | `/api/v1/auth/signin` | Public |
| Authentication | `POST` | `/api/v1/auth/signout` | Public in current routing |
| Clinics | `POST` | `/api/v1/clinic/create` | Bearer token |
| Clinics | `GET` | `/api/v1/clinic/get-info` | Bearer token |
| Clinic members | `POST` | `/api/v1/member/create` | Bearer token |
| Doctors | `POST` | `/api/v1/doctor/create` | Bearer token |
| Doctors | `GET` | `/api/v1/doctor/get-list` | Bearer token |
| Doctor schedules | `POST` | `/api/v1/schedule/create` | Bearer token |
| Doctor-clinic assignments | `POST` | `/api/v1/doctor-clinic/assign` | Bearer token |
| Public directory | `GET` | `/api/v1/public-corner/view-doctors` | Public |
| Public schedules | `GET` | `/api/v1/public-corner/:doctorClinicId/schedule` | Public |
| Slot availability | `GET` | `/api/v1/public-corner/:doctorClinicId/slots` | Public |
| Appointment booking | `POST` | `/api/v1/public-corner/book-slot` | Public |
| Swagger UI | `GET` | `/api-docs` | Public |

### Example: browse doctors

```http
GET /api/v1/public-corner/view-doctors?doctorName=avery&location=downtown&page=1&limit=20
```

### Example: book an appointment

```http
POST /api/v1/public-corner/book-slot
Content-Type: application/json
```

```json
{
  "scheduleId": 5,
  "appointmentDate": "2026-10-27",
  "patientName": "Avery Patient",
  "patientEmail": "avery@example.com",
  "patientPhone": "+1 555 010 1234",
  "idempotencyKey": "7ef4ea43-f72a-46ec-934b-acdfc92db064"
}
```

The booking endpoint accepts an idempotency key to make retries safe from creating a second appointment for the same key. On a repeated key, the current implementation returns the existing appointment in a reduced response shape.

## Errors and status codes

The shared error handler returns `{ "error": "error message" }` for application errors, common Prisma conflicts/not-found errors, JWT verification failures, and server errors. Common status codes include:

| Status | Meaning |
|---:|---|
| `400` | Invalid request or unavailable booking slot |
| `401` | Missing/invalid authentication or token |
| `403` | Authenticated user lacks permission |
| `404` | Requested record was not found |
| `409` | Duplicate record or schedule conflict |
| `422` | Request data failed validation |
| `500` | Unexpected server error |

There is a documented response exception: when creating a doctor schedule results in a detected schedule conflict, the handler returns `409` as a plain-text attachment containing the conflict report. It does not use the normal JSON error body.

## Project structure

```text
src/
├── features/
│   ├── auth/
│   ├── admins-staffs-corner/
│   │   ├── clinics/
│   │   ├── clinicMembers/
│   │   ├── clinic-doctor/
│   │   ├── doctor/
│   │   └── doctorSchedule/
│   ├── public-corner/
│   └── slot-booking/
├── server/
│   ├── app.ts
│   └── server.ts
└── shared/
    ├── clients/
    ├── config/
    ├── middlewares/
    ├── repository/
    ├── types/
    └── utilities/

prisma/
├── migrations/
└── schema.prisma
```

Feature directories generally contain route wiring, handlers, validation schemas, services, and repositories as appropriate. Shared clients initialize Prisma/PostgreSQL and Redis connections.

## Current scope and follow-up

This is an actively evolving MVP, not a fully hardened production service. Before production use, review and add:

- automated tests for auth, clinic permissions, schedule conflicts, booking concurrency, and idempotent retries;
- consistent CORS configuration and production HTTP security middleware;
- rate limiting and anti-abuse controls for public appointment endpoints;
- a token refresh/revocation strategy and documented signout behavior;
- consistent JSON success/error response contracts and complete OpenAPI coverage;
- operational logging, health checks, deployment configuration, and database backup/retention policies.

These are recommended follow-up areas, not claims that the current implementation already provides those controls.

---

<div align="center">

For endpoint-by-endpoint schemas and response examples, continue to **[ENDPOINTS.md](./ENDPOINTS.md)**.

</div>
