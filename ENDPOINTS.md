# Clinic Backend API Endpoints

This reference reflects the route handlers and Zod schemas currently implemented in the backend.

## Error response format

Errors handled by the shared error handler use this JSON shape:

```json
{
  "error": "error message"
}
```

In code, the response format is:

```ts
res.status(statusCode).json({ error: "error message" })
```

The status code and message depend on the error. Unexpected server errors use status `500` and the same JSON shape. A doctor schedule conflict is a current exception: that endpoint returns a `409` plain-text attachment with conflict details, not the JSON error shape.

## Authentication

### User Signup (`createUser`)
- **Method:** `POST`
- **Path:** `/api/v1/auth/signup`
- **Authentication:** Not required
- **Expected data:** JSON body validated by `userSignupSchema`:
  - `email` (string, valid email)
  - `password` (string, at least 6 characters)
- **Success:** `201 Created`
- **Success response:** Plain text: `user created`
- **Error responses:** Invalid body: `422`; email already in use: `409`. JSON error shape shown above.

### User Signin (`loginUser`)
- **Method:** `POST`
- **Path:** `/api/v1/auth/signin`
- **Authentication:** Not required
- **Expected data:** JSON body validated by `userSigninSchema`:
  - `email` (string, valid email)
  - `password` (string, at least 6 characters)
- **Success:** `200 OK`
- **Success response:**
  ```json
  {
    "accessToken": "JWT string",
    "refreshToken": "JWT string"
  }
  ```
- **Error responses:** Invalid body: `422`; invalid credentials: `409`. JSON error shape shown above.

### User Signout (`logoutUser`)
- **Method:** `POST`
- **Path:** `/api/v1/auth/signout`
- **Authentication:** Not required by the current route
- **Expected data:** No request body is read.
- **Success:** `200 OK`
- **Success response:** Plain text: `logged out`

## Clinics

### Create Clinic (`createClinic`)
- **Method:** `POST`
- **Path:** `/api/v1/clinic/create`
- **Authentication:** Required — `Authorization: Bearer <token>`
- **Expected data:** JSON body validated by `clinicCreateSchema`:
  - `name` (string)
  - `location` (string)
- **Success:** `201 Created`
- **Success response:** Plain text, for example: `Clinic: Central Clinic created successfully`
- **Error responses:** Missing/invalid authentication: `401`; invalid body: `422`; duplicate clinic: `409`. JSON error shape shown above.

### Get Clinics for Logged-in User (`getUserClinics`)
- **Method:** `GET`
- **Path:** `/api/v1/clinic/get-info`
- **Authentication:** Required — `Authorization: Bearer <token>`
- **Expected data:** No request body or query parameters.
- **Success:** `200 OK`
- **Success response:** Array of objects:
  ```json
  [
    {
      "role": "OWNER",
      "clinic": {
        "id": 1,
        "name": "Central Clinic",
        "location": "Downtown"
      }
    }
  ]
  ```
- **Error responses:** Missing/invalid authentication: `401`. JSON error shape shown above.

## Clinic Members

### Create Clinic Member (`createClinicMember`)
- **Method:** `POST`
- **Path:** `/api/v1/member/create`
- **Authentication:** Required — `Authorization: Bearer <token>`
- **Expected data:** JSON body validated by `memberCreateSchema`:
  - `email` (string, valid email)
  - `password` (string, at least 6 characters)
  - `role` (enum: `OWNER`, `STAFF`, `RECEPTIONIST`, `DOCTOR`, or `MANAGER`; assigning `OWNER` is rejected)
  - `clinicId` (number)
- **Success:** `201 Created`
- **Success response:** Plain text: `member created`
- **Error responses:** Missing/invalid authentication: `401`; invalid body: `422`; forbidden role or clinic access: `403`; duplicate record: `409`. JSON error shape shown above.

## Doctors

### Create Doctor (`createDoctor`)
- **Method:** `POST`
- **Path:** `/api/v1/doctor/create`
- **Authentication:** Required — `Authorization: Bearer <token>`
- **Expected data:** JSON body validated by `createDoctorSchema`:
  - Required: `email` (string), `password` (string, at least 6 characters), `firstName` (string), `registrationNo` (string)
  - Optional: `middleName`, `lastName`, `qualification`, `additionalQualification`, `experience`, `specialization` (strings)
- **Success:** `201 Created`
- **Success response:** Plain text containing the created doctor ID, for example: `Doctor Created: 12`
- **Error responses:** Missing/invalid authentication: `401`; invalid body: `422`; insufficient permission: `403`; email already in use: `409`. JSON error shape shown above.

### Get Created Doctors List (`listCreatedDoctors`)
- **Method:** `GET`
- **Path:** `/api/v1/doctor/get-list`
- **Authentication:** Required — `Authorization: Bearer <token>`
- **Expected data:** No request body or query parameters.
- **Success:** `200 OK`
- **Success response:** Array of objects:
  ```json
  [
    {
      "doctorId": 12,
      "fullName": "Avery Smith",
      "clinics": [
        {
          "clinicId": 1,
          "clinicName": "Central Clinic",
          "clinicLocation": "Downtown"
        }
      ]
    }
  ]
  ```
- **Error responses:** Missing/invalid authentication: `401`; insufficient permission: `403`. JSON error shape shown above.

## Doctor Schedules

### Create Doctor Schedule (`createDoctorSchedule`)
- **Method:** `POST`
- **Path:** `/api/v1/schedule/create`
- **Authentication:** Required — `Authorization: Bearer <token>`
- **Expected data:** JSON body validated by `createScheduleSchema`:
  - `doctorClinicId` (number)
  - `dayOfWeek` (enum: `SUNDAY`, `MONDAY`, `TUESDAY`, `WEDNESDAY`, `THURSDAY`, `FRIDAY`, `SATURDAY`)
  - `startTime` (number of minutes after midnight; 480–1319)
  - `endTime` (number of minutes after midnight; 481–1320)
- **Success:** `201 Created`
- **Success response:** Plain text: `schedule created successfully`
- **Error responses:** Missing/invalid authentication: `401`; invalid body: `422`; insufficient permission: `403`; invalid doctor-clinic ID: `409`. Scheduling conflict: `409` with a plain-text attachment listing conflicts (not the JSON error shape). Other handled errors use the JSON error shape shown above.

## Doctor-Clinic Assignment

### Assign Doctor to Clinic (`assignDoctorToClinic`)
- **Method:** `POST`
- **Path:** `/api/v1/doctor-clinic/assign`
- **Authentication:** Required — `Authorization: Bearer <token>`
- **Expected data:** JSON body validated by `assignDoctorToClinicSchema`:
  - `doctorId` (number)
  - `clinicId` (number)
  - `fees` (number)
- **Success:** `200 OK`
- **Success response:** Plain text naming the doctor and clinic.
- **Error responses:** Missing/invalid authentication: `401`; invalid body: `422`; clinic not found: `400`; insufficient permission: `403`; duplicate assignment: `409`. JSON error shape shown above.

## Public Corner

### View Doctors (`viewDoctors`)
- **Method:** `GET`
- **Path:** `/api/v1/public-corner/view-doctors`
- **Authentication:** Not required
- **Expected data:** Query parameters validated by `publicDoctorSearchSchema`:
  - Optional string filters: `clinicName`, `doctorName`, `location`, `specialization` (if provided, non-empty after trimming)
  - `page` (integer, minimum 1; defaults to `1`)
  - `limit` (integer, 1–100; defaults to `20`)
- **Success:** `200 OK`
- **Success response:** Array of doctor objects:
  ```json
  [
    {
      "id": 12,
      "name": "Dr. Avery Smith",
      "qualification": "MD",
      "additionalQualification": null,
      "specialization": "Cardiology",
      "clinics": [
        {
          "doctorClinicId": 3,
          "clinicId": 1,
          "clinicName": "Central Clinic",
          "clinicLocation": "Downtown",
          "fees": 100
        }
      ]
    }
  ]
  ```
- **Error responses:** Invalid query parameters: `422`. JSON error shape shown above.

### View Doctor Schedule (`viewDoctorSchedule`)
- **Method:** `GET`
- **Path:** `/api/v1/public-corner/:doctorClinicId/schedule`
- **Authentication:** Not required
- **Expected data:** Path parameter `doctorClinicId` (numeric doctor-clinic assignment ID).
- **Success:** `200 OK`
- **Success response:** Array of schedule objects. Times are formatted strings:
  ```json
  [
    {
      "id": 5,
      "doctorClinicId": 3,
      "dayOfWeek": "MONDAY",
      "startTime": "09:00 AM",
      "endTime": "05:00 PM"
    }
  ]
  ```
- **Error responses:** The endpoint intends to reject an invalid path parameter with `400` and the JSON error shape shown above. Current handler validation checks `Number.isNaN` against the raw string, so malformed IDs may not be rejected as `400`.

### View Available Slots (`viewDoctorSlots`)
- **Method:** `GET`
- **Path:** `/api/v1/public-corner/:doctorClinicId/slots`
- **Authentication:** Not required
- **Expected data:**
  - Path parameter `doctorClinicId` (positive number)
  - Query parameter `date` (date value accepted by JavaScript `Date`, for example `2026-10-27`)
- **Success:** `200 OK`
- **Success response:** Array of available schedule slots:
  ```json
  [
    {
      "scheduleId": 5,
      "availableTime": 540
    }
  ]
  ```
  `availableTime` is minutes after midnight.
- **Error responses:** Invalid path or date: `400`. JSON error shape shown above.

### Book Appointment Slot (`bookAppointmentSlot`)
- **Method:** `POST`
- **Path:** `/api/v1/public-corner/book-slot`
- **Authentication:** Not required
- **Expected data:** JSON body validated by `bookSlotSchema`:
  - `scheduleId` (positive integer)
  - `appointmentDate` (ISO date, `YYYY-MM-DD`)
  - `patientName` (non-empty string after trimming)
  - `patientEmail` (valid email)
  - `patientPhone` (10–20 characters; digits, `+`, spaces, and hyphens only)
  - `idempotencyKey` (UUID)
- **Success:** `201 Created`
- **Success response:** Appointment object with `id`, `doctorScheduleId`, `patientName`, `patientEmail`, `patientPhone`, `appointmentDate`, `startTime`, `endTime`, `status`, `idempotencyKey`, `createdAt`, and `updatedAt`. Times are minutes after midnight. On an idempotent retry, the current implementation returns a reduced object containing `id`, `doctorScheduleId`, `appointmentDate`, `startTime`, `endTime`, and `status`.
- **Error responses:** Invalid body: `422`; schedule not found: `404`; no slot available: `400`; duplicate constraint: `409`. JSON error shape shown above.

## API Documentation

### Swagger UI (`apiSwaggerDocs`)
- **Method:** `GET`
- **Path:** `/api-docs`
- **Authentication:** Not required
- **Expected data:** No request body or query parameters.
- **Success:** `200 OK`
- **Success response:** Swagger UI HTML page.
