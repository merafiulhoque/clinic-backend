# Clinic Management API

Clinic Management API is a TypeScript and Express backend for a multi-clinic management workflow. Clinic owners can create clinics, manage clinic members, create doctor records, associate doctors with clinics, and configure weekly schedules. Patients can browse doctors and schedules and book appointments without a patient account.

This document describes the API as currently implemented by the route modules, handlers, and Zod schemas. The API is an evolving MVP; where the implementation has limitations or unusual behavior, those are called out explicitly.

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
| Runtime service | Redis | Token revocation and startup connectivity |
| API UI | Swagger UI | Served at `/api-docs` from `openapi.yaml` |

The code is organized by feature. Route modules connect handlers; handlers validate input and shape HTTP responses; services implement business rules; repositories perform Prisma queries. Shared utilities provide JWT, password, validation, and error-handling behavior.

## Domain model

| Entity | Purpose | Key relationships |
|---|---|---|
| `User` | Login identity and clinic ownership | Can own clinics, belong to clinics, and have a doctor profile |
| `Clinic` | A clinic location managed by an owner | Has members and doctor assignments |
| `ClinicMember` | A user's role within a clinic | Joins one user to one clinic |
| `Doctor` | A doctor profile and associated user identity | Created by a user and linked to clinics through `DoctorClinic` |
| `DoctorClinic` | A doctor's association with a clinic and clinic-specific fee | Has schedules |
| `DoctorSchedule` | A recurring weekly day and time range | Belongs to a doctor-clinic assignment |
| `Appointment` | Patient booking for a schedule and date | Stores patient contact data, time range, and status |

Clinic member roles are `OWNER`, `STAFF`, `RECEPTIONIST`, `DOCTOR`, and `MANAGER`. Appointment statuses are `PENDING`, `CONFIRMED`, and `CANCELLED`. Weekly schedules use weekday names. Schedule and appointment times are represented as minutes after midnight in the database; schedule lookup formats times as 12-hour strings, while available-slot results return minutes.

## Getting started

### Prerequisites

- Node.js 20 or newer
- npm
- PostgreSQL
- Redis

Install dependencies:

```bash
npm install
```

Create a `.env` file in the repository root with the required settings:

| Variable | Required | Description | Example |
|---|---:|---|---|
| `PORT` | Yes | HTTP port | `5000` |
| `HOST` | Yes | Host label used in the startup message | `localhost` |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:password@localhost:5432/clinic` |
| `ACCESS_TOKEN_SECRET` | Yes | Secret used to sign access tokens | Use a long, unique random value |
| `REFRESH_TOKEN_SECRET` | Yes | Separate secret used to sign refresh tokens | Use a different long, unique random value |
| `REDIS_URL` | Yes | Redis connection URL | `redis://localhost:6379` |
| `ALLOWED_ORIGIN` | Yes | Allowed browser frontend origin for CORS | `http://localhost:3000` |

Do not commit real credentials or secret values. Generate separate high-entropy secrets for each environment. The Express app registers CORS middleware using `ALLOWED_ORIGIN`.

Prisma is configured with `prisma/schema.prisma` and migrations in `prisma/migrations/`. With PostgreSQL running and `DATABASE_URL` set, apply migrations and generate the Prisma client:

```bash
npx prisma migrate deploy
npx prisma generate
```

For local schema development:

```bash
npx prisma migrate dev
```

## Run and verify

The server connects to Redis before starting its HTTP listener. Ensure Redis and PostgreSQL are reachable.

| Command | Purpose |
|---|---|
| `npm run dev` | Run the server using `tsx watch` |
| `npm run typecheck` | Type-check without emitting build output |
| `npm run build` | Compile TypeScript into `dist/` |
| `npm start` | Run the compiled server |

The local server address is typically `http://localhost:5000`, based on `HOST` and `PORT`.

## API URL and request conventions

All application API routes are mounted under `/api/v1`. Set a client-side `API_URL` to the server origin, without the API prefix:

```text
API_URL=http://localhost:5000
```

Append each documented route path to form the request URL:

```text
{API_URL}/api/v1/auth/signin
{API_URL}/api/v1/public-corner/view-doctors?page=1&limit=20
```

For production, `API_URL` should be the deployed HTTPS origin (for example, `https://api.example.com`). Swagger UI is mounted separately at `{API_URL}/api-docs`.

- Send request bodies as JSON with `Content-Type: application/json`. Numeric body fields must be JSON numbers, not quoted strings.
- Express also parses URL-encoded bodies, but use JSON for the documented requests and especially for numeric fields.
- Encode query values with standard URL encoding. Put path identifiers in the path exactly where `:parameter` appears in a route template.
- Protected routes require `Authorization: Bearer <accessToken>`.
- Success payloads vary by endpoint: a string sent through Express `send` is a text response; object and array payloads are JSON. Examples show the body, excluding HTTP headers.
- Every error response follows `{ "error": "error message" }`, including validation, authorization, conflicts, and server errors.
- Request validation is performed by Zod schemas in the corresponding feature module. Some schemas coerce query values into numbers/dates; body numeric values are generally not coerced.

## Authentication

Signup creates a user account. Signin returns an access token (one-hour lifetime) and refresh token (seven-day lifetime). Use the access token as a bearer token on protected routes. Signout requires both the access token header and the matching user's refresh token in its JSON body; it revokes both tokens using Redis. There is no refresh-token exchange endpoint in the current routes.

## Complete endpoint reference

All paths below are relative to `{API_URL}`. Unless marked protected, a route is public and does not require an access token.

| Area | Method | Path | Access |
|---|---|---|---|
| Authentication | `POST` | `/api/v1/auth/signup` | Public |
| Authentication | `POST` | `/api/v1/auth/signin` | Public |
| Authentication | `POST` | `/api/v1/auth/signout` | Protected |
| Clinics | `POST` | `/api/v1/clinic/create` | Protected |
| Clinics | `GET` | `/api/v1/clinic/get-info` | Protected |
| Clinic members | `POST` | `/api/v1/member/create` | Protected |
| Doctors | `POST` | `/api/v1/doctor/create` | Protected; owner/manager permission |
| Doctors | `GET` | `/api/v1/doctor/get-list` | Protected; owner/manager permission |
| Doctor schedules | `POST` | `/api/v1/schedule/create` | Protected; clinic owner permission |
| Doctor-clinic assignments | `POST` | `/api/v1/doctor-clinic/assign` | Protected; clinic owner permission |
| Public directory | `GET` | `/api/v1/public-corner/view-doctors` | Public |
| Public schedules | `GET` | `/api/v1/public-corner/:doctorClinicId/schedule` | Public |
| Slot availability | `GET` | `/api/v1/public-corner/:doctorClinicId/slots` | Public |
| Appointment booking | `POST` | `/api/v1/public-corner/book-slot` | Public |
| Swagger UI | `GET` | `/api-docs` | Public |

### Authentication endpoints

#### Create an account

`POST {API_URL}/api/v1/auth/signup`

Schema: [`src/features/auth/schema.ts`](./src/features/auth/schema.ts), `userSignupSchema`.

JSON body:

```json
{
  "email": "owner@example.com",
  "password": "secure-password"
}
```

Both fields are required; `email` must be a valid email address and `password` must contain at least six characters.

Success: `201 Created`, text body:

```text
user created
```

Invalid input returns `422`; an existing email returns `409`.

#### Sign in

`POST {API_URL}/api/v1/auth/signin`

Schema: [`src/features/auth/schema.ts`](./src/features/auth/schema.ts), `userSigninSchema`. JSON body has the same `email` and `password` fields and constraints as signup.

Success: `200 OK`, JSON body:

```json
{
  "accessToken": "<JWT>",
  "refreshToken": "<JWT>"
}
```

Invalid input returns `422`. Invalid email/password credentials currently return `409` with an `error` message.

#### Sign out

`POST {API_URL}/api/v1/auth/signout`

Requires `Authorization: Bearer <accessToken>`.

Schema: [`src/features/auth/schema.ts`](./src/features/auth/schema.ts), `userSignoutSchema`.

JSON body:

```json
{
  "refreshToken": "<refresh JWT returned by signin>"
}
```

Success: `200 OK`, text body `logged out`. The refresh token must belong to the same user as the access token. Both supplied tokens are revoked; invalid or revoked tokens return an error response.

### Clinic and staff endpoints

#### Create a clinic

`POST {API_URL}/api/v1/clinic/create`

Requires an access token. Schema: [`src/features/admins-staffs-corner/clinics/schemas.ts`](./src/features/admins-staffs-corner/clinics/schemas.ts), `clinicCreateSchema`.

JSON body:

```json
{
  "name": "Downtown Clinic",
  "location": "42 Main Street"
}
```

Both values must be strings. The authenticated user becomes the clinic owner and is added as an `OWNER` member.

Success: `201 Created`, text body such as `Clinic: Downtown Clinic created successfully`. Creating the same clinic name and location for the same owner returns `409`.

#### Get clinics for the signed-in user

`GET {API_URL}/api/v1/clinic/get-info`

Requires an access token. No body, path parameter, or query parameter is used. Response types are declared in `src/features/admins-staffs-corner/clinics/schemas.ts` (`UserClinics` and `Clinic`).

Success: `200 OK`, JSON array:

```json
[
  {
    "role": "OWNER",
    "clinic": {
      "id": 1,
      "name": "Downtown Clinic",
      "location": "42 Main Street"
    }
  }
]
```

An empty array means the user has no clinic memberships.

#### Create a clinic member

`POST {API_URL}/api/v1/member/create`

Requires an access token. The authenticated user must own the clinic identified by `clinicId`; the `OWNER` role cannot be assigned through this route.

Schema: [`src/features/admins-staffs-corner/clinicMembers/schemas.ts`](./src/features/admins-staffs-corner/clinicMembers/schemas.ts), `memberCreateSchema`.

JSON body (all fields required):

```json
{
  "email": "staff@example.com",
  "password": "secure-password",
  "role": "STAFF",
  "clinicId": 1
}
```

`email` must be valid; `password` must be at least six characters; `role` must be one of `STAFF`, `RECEPTIONIST`, `DOCTOR`, or `MANAGER`; `clinicId` must be a JSON number.

Success: `201 Created`, text body `member created`. Invalid input returns `422`; a forbidden role or non-owned clinic returns `403`.

### Doctor and schedule endpoints

#### Create a doctor

`POST {API_URL}/api/v1/doctor/create`

Requires an access token and owner-or-manager permissions. Schema: [`src/features/admins-staffs-corner/doctor/schemas.ts`](./src/features/admins-staffs-corner/doctor/schemas.ts), `createDoctorSchema`.

JSON body:

```json
{
  "email": "doctor@example.com",
  "password": "secure-password",
  "firstName": "Avery",
  "middleName": "R",
  "lastName": "Doctor",
  "qualification": "MD",
  "additionalQualification": "FACC",
  "experience": "10 years",
  "registrationNo": "REG-12345",
  "specialization": "Cardiology"
}
```

Required string fields: `email`, `password`, `firstName`, and `registrationNo`. `password` must be at least six characters. `middleName`, `lastName`, `qualification`, `additionalQualification`, `experience`, and `specialization` are optional strings. This schema currently checks `email` is a string but does not apply email-format validation.

Success: `201 Created`, text body such as `Doctor Created: 12`. Invalid input returns `422`; insufficient permission returns `403`; an email already in use returns `409`.

#### List doctors created by the signed-in owner

`GET {API_URL}/api/v1/doctor/get-list`

Requires an access token and owner-or-manager permissions. No request body or query parameters are used. The result includes doctors created by the signed-in user.

Success: `200 OK`, JSON array:

```json
[
  {
    "doctorId": 12,
    "fullName": "Avery R Doctor",
    "clinics": [
      {
        "clinicId": 1,
        "clinicName": "Downtown Clinic",
        "clinicLocation": "42 Main Street"
      }
    ]
  }
]
```

The list is empty when the signed-in user has not created doctors. A user without owner or manager permission receives `403`.

#### Create a doctor schedule

`POST {API_URL}/api/v1/schedule/create`

Requires an access token; the clinic attached to `doctorClinicId` must be owned by the authenticated user. Schema: [`src/features/admins-staffs-corner/doctorSchedule/schemas.ts`](./src/features/admins-staffs-corner/doctorSchedule/schemas.ts), `createScheduleSchema`.

JSON body:

```json
{
  "doctorClinicId": 3,
  "dayOfWeek": "MONDAY",
  "startTime": 540,
  "endTime": 1020
}
```

All fields are required. `doctorClinicId` is a positive integer; `dayOfWeek` is one of `SUNDAY`, `MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY`, or `SATURDAY`. Times are integer minutes after midnight: `540` is 9:00 AM. Start must be from 8:00 AM (`480`) through 9:59 PM (`1319`); end must be from 8:01 AM (`481`) through 10:00 PM (`1320`) and later than start.

Success: `201 Created`, text body `schedule created successfully`. Invalid input returns `422`; an unknown doctor-clinic assignment returns `409`; lack of clinic ownership returns `403`. If the doctor has an overlapping schedule for the same weekday at another clinic, the endpoint returns `409` using the standard JSON error format.

#### Assign a doctor to a clinic

`POST {API_URL}/api/v1/doctor-clinic/assign`

Requires an access token; the authenticated user must own the clinic. Schema: [`src/features/admins-staffs-corner/clinic-doctor/schemas.ts`](./src/features/admins-staffs-corner/clinic-doctor/schemas.ts), `assignDoctorToClinicSchema`.

JSON body:

```json
{
  "doctorId": 12,
  "clinicId": 1,
  "fees": 150
}
```

All fields must be JSON numbers. The schema requires numbers but does not constrain them to integers or positive values; database IDs and the integer `fees` column should be supplied as positive integers.

Success: `200 OK`, text body such as `Dr. Avery added to Clinic : Downtown Clinic`. Invalid input returns `422`; an unknown clinic returns `400`; lack of clinic ownership returns `403`. An existing doctor/clinic assignment returns `409`.

### Public directory and appointment endpoints

#### Search public doctors

`GET {API_URL}/api/v1/public-corner/view-doctors`

Public endpoint. All inputs are query parameters; there is no request body. Schema: [`src/features/public-corner/schemas.ts`](./src/features/public-corner/schemas.ts), `publicDoctorSearchSchema`.

Example:

```text
{API_URL}/api/v1/public-corner/view-doctors?doctorName=avery&location=downtown&page=1&limit=20
```

| Query key | Type | Required | Behavior |
|---|---|---:|---|
| `clinicName` | string | No | Case-insensitive partial match on clinic name |
| `doctorName` | string | No | Case-insensitive partial match against first, middle, or last name |
| `location` | string | No | Case-insensitive partial match on clinic location |
| `specialization` | string | No | Case-insensitive partial match on specialization |
| `page` | integer | No | Defaults to `1`; must be at least `1` |
| `limit` | integer | No | Defaults to `20`; range `1`–`100` |

Search strings are trimmed and cannot be empty when provided. `page` and `limit` are coerced from query-string values to integers.

Success: `200 OK`, JSON array (page limited to `limit` results):

```json
[
  {
    "id": 12,
    "name": "Dr. Avery R Doctor",
    "qualification": "MD",
    "additionalQualification": "FACC",
    "specialization": "Cardiology",
    "clinics": [
      {
        "doctorClinicId": 3,
        "clinicId": 1,
        "clinicName": "Downtown Clinic",
        "clinicLocation": "42 Main Street",
        "fees": 150
      }
    ]
  }
]
```

Qualification and specialization values may be `null`; doctors without a clinic assignment are excluded.

#### Get schedules for a doctor-clinic assignment

`GET {API_URL}/api/v1/public-corner/:doctorClinicId/schedule`

Public endpoint. Replace `:doctorClinicId` in the path with the numeric doctor-clinic assignment ID, for example `/api/v1/public-corner/3/schedule`. There is no body or query string.

Success: `200 OK`, JSON array:

```json
[
  {
    "id": 7,
    "doctorClinicId": 3,
    "dayOfWeek": "MONDAY",
    "startTime": "9:00 AM",
    "endTime": "5:00 PM"
  }
]
```

Schedule times are returned as 12-hour strings. No matching schedules returns an empty array.

#### View available appointment slots

`GET {API_URL}/api/v1/public-corner/:doctorClinicId/slots?date=YYYY-MM-DD`

Public endpoint. The doctor-clinic ID is a path parameter and `date` is a required query parameter; there is no body. Example:

```text
{API_URL}/api/v1/public-corner/3/slots?date=2026-10-27
```

Schema: [`src/features/slot-booking/schemas.ts`](./src/features/slot-booking/schemas.ts), `viewSlotSchema`. Both values are coerced by Zod; the ID must be at least `1` and `date` must parse as a date.

Success: `200 OK`, JSON array:

```json
[
  {
    "scheduleId": 7,
    "availableTime": 540
  }
]
```

`availableTime` is minutes after midnight (here, 9:00 AM). The result contains the next available start time for each schedule on that weekday, based on pending and confirmed appointments. No matching or available sessions returns an empty array. Invalid input returns `400`.

#### Book an appointment

`POST {API_URL}/api/v1/public-corner/book-slot`

Public endpoint. Schema: [`src/features/slot-booking/schemas.ts`](./src/features/slot-booking/schemas.ts), `bookSlotSchema`.

JSON body:

```json
{
  "scheduleId": 7,
  "appointmentDate": "2026-10-27",
  "patientName": "Avery Patient",
  "patientEmail": "avery@example.com",
  "patientPhone": "+1 555 010 1234",
  "idempotencyKey": "7ef4ea43-f72a-46ec-934b-acdfc92db064"
}
```

All fields are required. `scheduleId` must be a positive integer. `appointmentDate` must be an ISO date (`YYYY-MM-DD`). `patientName` is trimmed and cannot be empty; `patientEmail` must be a valid email; `patientPhone` must be 10–20 characters containing only `+`, digits, spaces, or hyphens; `idempotencyKey` must be a UUID.

Success: `201 Created`, JSON appointment object. A newly created booking includes the persisted appointment fields, for example:

```json
{
  "id": 21,
  "doctorScheduleId": 7,
  "patientName": "Avery Patient",
  "patientEmail": "avery@example.com",
  "patientPhone": "+1 555 010 1234",
  "appointmentDate": "2026-10-27T00:00:00.000Z",
  "startTime": 540,
  "endTime": 550,
  "status": "PENDING",
  "idempotencyKey": "7ef4ea43-f72a-46ec-934b-acdfc92db064",
  "createdAt": "2026-10-27T00:00:00.000Z",
  "updatedAt": "2026-10-27T00:00:00.000Z"
}
```

Appointment duration is currently 10 minutes. A repeated idempotency key returns the existing appointment with a reduced shape (`id`, `doctorScheduleId`, `appointmentDate`, `startTime`, `endTime`, and `status`); clients should reuse a key only when retrying the same logical booking. Invalid input returns `422`; a missing schedule returns `404`; a schedule unavailable on that date or a fully booked session returns `400`; duplicate database constraints may return `409`.

### API documentation UI

`GET {API_URL}/api-docs` serves Swagger UI. The UI loads `openapi.yaml`, which may not describe every implementation detail in this reference; use the route modules and schemas as the implementation source of truth.

## Error contract and status codes

Every error response is JSON with exactly this top-level shape:

```json
{
  "error": "error message"
}
```

The message text varies by failure. Common status codes used by the current handlers and shared error middleware:

| Status | Meaning |
|---:|---|
| `400` | Bad request, malformed bearer header, invalid slot query, or unavailable booking time |
| `401` | Missing/invalid/revoked access token or unauthorized user |
| `403` | Authenticated user lacks the required role or clinic ownership |
| `404` | Requested schedule or database record was not found |
| `409` | Duplicate/conflicting record, duplicate email, invalid credentials, or schedule overlap |
| `422` | Request body or search query failed validation |
| `500` | Unexpected server error |

The shared error handler maps known Prisma unique-constraint errors to `409`, missing Prisma records to `404`, JWT failures to `401`, and otherwise returns a generic `500` error. Endpoint sections above note known route-specific status behavior; exact error text should not be treated as a stable client API beyond the `error` field.

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

Feature directories generally contain route wiring, handlers, validation schemas, services, and repositories as appropriate. Feature-specific Zod schemas define accepted request payloads and TypeScript types inferred from those schemas.

## Current scope and follow-up

This is an actively evolving MVP, not a fully hardened production service. Before production use, review and add:

- automated tests for auth, clinic permissions, schedule conflicts, booking concurrency, and idempotent retries;
- rate limiting and anti-abuse controls for public appointment endpoints;
- a refresh-token exchange/rotation strategy and a review of token revocation behavior;
- complete OpenAPI coverage matching the route handlers;
- operational logging, health checks, deployment configuration, and database backup/retention policies.

These are recommended follow-up areas, not claims that the current implementation already provides those controls.
