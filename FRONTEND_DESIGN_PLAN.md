# Clinic Frontend Design Plan

## 1. Purpose

Build a modular clinic-management and appointment-booking frontend that integrates with the existing clinic backend. The frontend must use real backend responses; it must not contain fabricated clinics, users, doctors, schedules, appointments, or success responses.

This document describes the intended architecture, user flows, and backend integration boundaries. It is a design plan, not an implementation of the frontend.

## 2. Technology stack

- **Next.js with App Router** for pages, layouts, server actions, and route handlers.
- **TypeScript** for strict request, response, and UI types.
- **Tailwind CSS** for responsive styling and theme variants.
- **Zustand** for small, client-side UI/session state that needs to be shared.
- **TanStack Query** for server data fetching, caching, invalidation, and mutations.
- **Zod** for runtime validation and form schemas.
- **React Hook Form with `@hookform/resolvers/zod`** for every form.
- **Analytics** for approved, privacy-conscious product events. Do not send patient names, emails, phone numbers, tokens, or other sensitive data to analytics.
- **Lucide React** for consistent interface icons.

Use the existing generic API function where applicable. Do not introduce a second API abstraction that duplicates its behavior.

## 3. Backend integration contract

The current backend is an Express API mounted under `/api/v1`. Its protected endpoints require:

```text
Authorization: Bearer <accessToken>
```

The backend does not use browser credentials/cookies for this authentication contract. If the frontend uses an HTTP-only cookie to store a token for its own Next.js server, that cookie is only between the browser and the frontend. A server action or route handler must read the session and attach the bearer header when calling the backend. Do not forward the browser cookie as a substitute for the backend authorization header.

The backend base URL will be supplied through an environment variable, for example `BACKEND_API_URL`. Keep it server-only (do not use a `NEXT_PUBLIC_` variable) and do not expose it in browser bundles.

### 3.1 API contracts and approval requirement

Before implementing **each API request or API-derived type**, ask the user to provide or approve the request schema and response type. This applies to new endpoint integrations and to any backend contract that is unclear or has changed.

The repository already contains backend schemas, endpoint definitions, and documentation. Use those as the initial source of truth for this design, but do not silently invent frontend request/response fields. When implementation begins:

1. Identify the endpoint and inspect its current backend route, handler, and Zod schema.
2. Present the request and response contract for user confirmation, or ask the user to provide their preferred schema/type.
3. Implement the frontend types and validation only after confirmation.
4. If backend code, OpenAPI, and documentation disagree, stop and ask which contract to follow; do not guess.

Frontend form schemas may add user-friendly constraints, but must not claim the backend supports fields or validation it does not support. Backend validation errors are currently generic, so show frontend field errors for locally detected invalid values and a form-level message for generic backend validation failures.

## 4. Architecture principles

- Keep all backend requests in Next.js server actions or route handlers. Choose the mechanism per operation: use server actions for suitable form submissions/mutations; use route handlers for HTTP endpoints, proxying, or cases that need a stable request URL.
- Keep secrets, backend origin, and bearer tokens on the server. Never include a token in a client-side Zustand store, local storage, URL, analytics event, or rendered page data.
- Use TanStack Query for client-visible server data and mutation state. Route handlers/server actions may perform the backend call, while client components use the corresponding frontend boundary.
- Use Zustand only for shared client/UI state such as the active clinic selection, theme preference, and transient public-booking selection when appropriate. Do not duplicate the query cache in Zustand.
- Persist only non-sensitive preferences/selections where appropriate. Do not persist access or refresh tokens through Zustand persistence.
- Use centralized URL constants for every frontend page and centralized endpoint constants for backend paths. Do not scatter route strings or backend paths throughout components.
- Reuse shared components, form patterns, query helpers, error handling, and loading/empty states instead of duplicating them.
- Show loading or pending feedback for all network work. Disable mutation controls while a request is pending, prevent accidental duplicate submissions, and never present a failed request as successful.
- Use real API data. If a necessary API URL, schema/type, or test data is unavailable, ask the user; never insert dummy data to make a screen appear populated.

## 5. Proposed source structure

```text
src/
  app/
    (public)/
      page.tsx
      signup/
        page.tsx
      signin/
        page.tsx
      appointments/
        page.tsx
        book/
          page.tsx
    (authenticated)/
      layout.tsx
      owner/
        ...
      staff/
        ...
    api/
      ...                 # Route handlers only where an HTTP boundary is appropriate
  actions/
    ...                   # Server actions for suitable form submissions/mutations
  components/
    ui/
      button.tsx
      input.tsx
      toaster.tsx
      ...
    public/
      ...
    owners/
      ...
    staff/
      ...
    layout/
      navbar.tsx
      sidebar.tsx
      ...
  shared/
    config/
      constants/
        urls.ts           # Frontend page URLs
        endpoints.ts      # Backend endpoint paths
        sidebar-options.ts
    lib/
      api/                # Adapter around the provided generic API function
      query-client.ts
    schemas/
      ...
    types/
      ...
    utility/
      ...
  stores/
    active-clinic-store.ts
    theme-store.ts
    ...                   # Add only when shared client state is needed
```

The exact route groups and feature folders can be adjusted to match the initial Next.js scaffold. Keep feature-specific code close to its route or component when it is not genuinely shared.

## 6. Shared configuration and state

### 6.1 Frontend URL constants

Create one typed constants module for every frontend route, including the landing page, sign-up, sign-in, appointment search/booking, clinic onboarding/selection, and each administrative section. All navigation links and redirects must use these constants.

### 6.2 Backend endpoint constants

Create a separate endpoint constants module for backend paths. Include dynamic-path helpers where needed so path parameter substitution is consistent. Keep the API origin in server-only environment configuration, not in this constants file.

### 6.3 Centralized types and schemas

Keep API request/response types and Zod schemas in shared feature-oriented modules. Avoid one oversized global type file. Types must reflect user-approved backend contracts, including nullable fields, text responses, and array responses.

### 6.4 Role-based sidebar configuration

Define centralized sidebar entries with the shape:

```ts
{
  label: string;
  url: string;
  icon: LucideIcon;
}
```

Map entries to roles using the roles returned by the selected clinic membership. The backend roles include `OWNER`, `STAFF`, `RECEPTIONIST`, `DOCTOR`, and `MANAGER`. Do not infer permissions solely from the label or hide the need for backend authorization; the backend remains authoritative.

### 6.5 Zustand stores

- **Active clinic:** selected clinic/membership for the current authenticated session. Clear it on sign-out and reconcile it against the latest clinic-membership response.
- **Theme:** light/dark preference, persisted as a non-sensitive preference.
- **Booking selection:** selected `scheduleId` and appointment date only if needed across the public booking navigation. Validate the selection before showing/submitting the booking form; do not treat client state as authorization or availability confirmation.
- **Authentication:** do not put tokens in a persisted Zustand auth store. Prefer a server-managed session with HTTP-only cookies between the browser and Next.js.

## 7. User experience and page plan

### 7.1 Public landing page

- Create a polished landing page with a clear action to view and book appointments.
- Provide sign-up/sign-in navigation where appropriate.
- Use the centralized URL constants for every navigation action.
- Do not show invented clinic counts, doctor cards, testimonials, or other data presented as real.

### 7.2 Sign-up

- Collect email and password.
- Use React Hook Form and a Zod resolver; show errors beside their fields.
- Submit through the appropriate server action/backend-for-frontend boundary to `POST /api/v1/auth/signup`.
- The current backend returns a text success response, not a user profile. Handle that response accurately and direct the user to sign-in unless the confirmed product flow says otherwise.

### 7.3 Sign-in and post-authentication routing

- Collect email and password with field-level client validation.
- Submit to `POST /api/v1/auth/signin`; the current implementation returns access and refresh tokens.
- Establish the frontend's secure server-managed session without exposing tokens to client-side state.
- Fetch clinic memberships from `GET /api/v1/clinic/get-info`.
- Route based on the actual membership response:
  - No memberships: show the appropriate onboarding path only when the user's role/intent is known. The backend does not return a standalone user role from sign-in, so do not assume every empty result means an owner.
  - One membership: select it or request explicit selection according to the agreed UX.
  - Multiple memberships: show a clinic picker.
- The backend currently has no refresh-token exchange endpoint. Until one is implemented, handle expired access tokens by ending/re-establishing the session through sign-in rather than attempting an unsupported refresh call.

### 7.4 Authenticated application shell

- Use the same top navbar for authenticated users.
- Keep the navbar fixed at the top and the sidebar fixed from the navbar to the viewport bottom. Offset the main content for both so it remains fully visible.
- Navbar layout:
  - Left: app mark/favicon; the user can replace the asset later.
  - Middle: current-page search control. Its value must be passed to the active feature, and it should only trigger filters supported by that feature/backend.
  - Right: round profile/menu control. Profile imagery is optional until the backend provides profile-image data.
- Profile menu: theme toggle and sign-out.
- Sidebar: render centralized role-appropriate options and highlight the current route using Next.js pathname/router state. Do not use `useRef` as the source of truth for route matching.
- Main area: render the active page in the space remaining after navbar and sidebar offsets.
- Include responsive navigation, keyboard accessibility, visible focus states, and appropriate dialog/menu semantics.
- Provide a “Back to home” action on pages where it is useful, using the URL constants.

### 7.5 Clinic onboarding, selection, and switching

- Use `GET /api/v1/clinic/get-info` for the memberships available to the signed-in user. The current response contains each membership's role and basic clinic information (`id`, `name`, `location`).
- For an authorized owner onboarding flow, collect clinic name and location and submit to `POST /api/v1/clinic/create`.
- Display the actual clinics returned by the backend; an empty array is an empty state, not a reason to create sample data.
- Allow users with multiple memberships to select a clinic and retain the active selection as appropriate.
- Allow owners to switch between their clinics when multiple clinics are returned.
- Refetch or invalidate clinic-scoped queries when the selected clinic changes.
- Do not promise a detailed clinic dashboard: there is currently no clinic-detail or dashboard-statistics endpoint.
- Because sign-in does not return a profile/role and the clinic list only reveals roles for existing memberships, clarify onboarding behavior for a user with no memberships before implementing automatic owner routing.

### 7.6 Administrative pages supported by existing endpoints

Build these features when their required schemas/types have been provided or approved:

- **Clinic members:** create a member through `POST /api/v1/member/create` with its confirmed fields. The current backend rejects assigning the `OWNER` role. Confirm whether staff receive credentials directly or need a later invitation/password setup flow.
- **Doctors:** create doctors through `POST /api/v1/doctor/create` and show the created-doctor list from `GET /api/v1/doctor/get-list`. The current list is scoped to doctors created by the signed-in user and is permission-restricted.
- **Doctor-clinic assignment:** assign a doctor to a clinic through `POST /api/v1/doctor-clinic/assign`, including the clinic-specific fee.
- **Doctor schedules:** create schedules through `POST /api/v1/schedule/create` using the assigned doctor-clinic ID, weekday, and minutes-after-midnight time values. Surface schedule conflicts as errors, not success.
- **Dashboard:** initially use only data available from implemented endpoints. Add richer statistics only after the backend endpoints and response contracts exist.

The backend does not currently document general administrative search. The global navbar search should not imply that every administrative list can be searched unless an endpoint supports it.

### 7.7 Public doctor search and booking

1. **Open the public directory.** The landing page's view/book action navigates to the public appointment search page.
2. **Filter doctors.** Provide doctor name, location, and specialization filters. The backend also supports clinic name. Send `page` and `limit` with filters to `GET /api/v1/public-corner/view-doctors`.
3. **Render search results.** Show only fields returned by the API: doctor name, qualification, additional qualification, specialization, and each associated clinic's name, location, and fee.
4. **Show registration number only when available.** The current public doctor response does not include registration number. Do not render a fabricated value; omit the field until the backend contract is extended.
5. **Paginate honestly.** The endpoint returns an array for the requested page, with defaults of page `1` and limit `20` (limit maximum `100`), but no total count or total-pages metadata. Use next/previous or load-more semantics that do not claim an exact total, or request a backend change if exact page counts are required.
6. **View schedules for a clinic assignment.** Use the clinic's `doctorClinicId` with `GET /api/v1/public-corner/:doctorClinicId/schedule`. Render the returned schedule array and its weekday/time values.
7. **Select an appointment date and load available slots.** Call `GET /api/v1/public-corner/:doctorClinicId/slots?date=YYYY-MM-DD`. Each returned item contains `scheduleId` and `availableTime`; display the time in a human-readable format.
8. **Choose a slot.** Keep the chosen `scheduleId` and `appointmentDate` while navigating to the booking form. Re-check the booking result and handle a slot becoming unavailable.
9. **Collect patient information.** Collect patient name, email, and phone with React Hook Form and Zod. Show individual local validation errors.
10. **Book the appointment.** Submit `scheduleId`, `appointmentDate`, patient fields, and a newly generated UUID `idempotencyKey` to `POST /api/v1/public-corner/book-slot`.
11. **Confirm from the actual response.** Show the returned booking confirmation only after a successful backend response. Handle validation, conflict, and network failures explicitly; disable the submit button while pending.

## 8. Backend capabilities and known gaps

The design must match the implemented API, not assume future behavior:

| Requirement | Current backend support | Frontend consequence / follow-up |
|---|---|---|
| Sign-up and sign-in | Supported. Sign-in returns access and refresh tokens; sign-up returns text. | No profile or role is returned by sign-in. |
| Protected API calls | Bearer access token in the `Authorization` header. | Next.js server boundary attaches the header; browser credentials are not the backend auth mechanism. |
| Token renewal | No refresh-token exchange endpoint. | Re-authentication is needed at access-token expiry unless the backend adds refresh support. |
| Clinic membership list | Supported, including membership role and basic clinic data. | Use this for clinic selection; it is not a detailed clinic dashboard API. |
| Clinic creation | Supported. | Use only for the confirmed owner onboarding flow. |
| Public doctor filters | Doctor name, location, specialization, clinic name, page, and limit are supported. | URL state/query keys should match the backend schema. |
| Doctor registration number in public results | Not included in the public directory response. | Omit until backend response is extended. |
| Pagination result count | Not returned. | No exact total-page UI without a backend change. |
| Schedules and slots | Supported by doctor-clinic assignment ID and appointment date. | Keep the distinction between `doctorClinicId` and `scheduleId` clear. |
| Public appointment booking | Supported; requires patient fields and UUID idempotency key. | Use a real UUID per booking attempt and honor backend outcomes. |
| Field-specific backend validation details | Backend validation is generic. | Show local field errors plus a form-level server validation message. |
| User profile details | No dedicated profile endpoint is currently available. | Do not assume profile name, image, or global role exists. |
| API docs/OpenAPI consistency | Some documented paths/behavior differ from implemented routes. | Confirm against route/handler/schema and user-approved types before implementing an integration. |

Potential backend enhancements should be treated as separate, explicit work: refresh-token exchange, registration number in public search, pagination metadata, clinic dashboard/details, profile details, and field-specific validation errors. The basic frontend can be built without these if it clearly handles the current limitations.

## 9. Loading, errors, empty states, and optimistic UI

- Show a visible loader or skeleton while initial data is being fetched.
- For mutations, show pending feedback and disable the relevant submit/action control.
- Only use optimistic updates when the resulting state is reversible and can be reconciled with the backend response. For clinic creation, assignment, schedule creation, and booking, prefer pending UI followed by authoritative server data unless a safe optimistic pattern is explicitly designed.
- Show empty states when the backend returns empty arrays; never fill them with sample records.
- Parse and display backend error status/messages in a useful way. Keep generic backend validation failures at form level.
- Provide retry controls for recoverable fetch failures without creating fake success states.

## 10. Privacy and analytics

- Do not include patient details, authentication tokens, raw form contents, or other sensitive data in analytics.
- Limit analytics to approved interaction events such as page views and non-sensitive feature usage.
- Do not add analytics until the provider, consent requirements, and tracked events are confirmed.

## 11. Implementation sequence

Build and verify in small, selectable feature increments:

1. Confirm the frontend repository/app location, environment variable name, provided generic API function, and Next.js setup.
2. Establish the app shell, URL constants, endpoint constants, API server boundary, shared UI primitives, and theme.
3. Implement sign-up/sign-in and secure server-managed session handling after the user approves request/response types.
4. Implement clinic membership loading, clinic onboarding, and clinic selection using the confirmed membership contract.
5. Build the public landing and doctor search pages using real backend data.
6. Add schedule lookup, slot availability, patient booking form, and confirmation.
7. Add owner/staff administrative features supported by the backend, one feature at a time.
8. Add backend-dependent enhancements only when their API contracts are implemented and approved.

For each increment, agree on the relevant request schema and response types first, implement only that feature, and validate it against the actual backend. If the backend URL or real data needed for verification is unavailable, ask the user rather than creating dummy data.

## 12. Acceptance criteria

- Every frontend navigation and redirect uses a centralized frontend URL constant.
- Every backend request uses a centralized endpoint constant and the existing generic API function through a Next.js server boundary.
- Protected backend calls use `Authorization: Bearer <accessToken>`; tokens and backend origin are not exposed to browser code.
- Every form uses React Hook Form with a Zod resolver and shows individual frontend field errors.
- Every API request/response type is user-provided or explicitly user-approved before implementation.
- Empty results remain empty; no dummy domain data or fabricated API responses are introduced.
- Network operations show loading/pending state, mutation controls prevent duplicate submissions, and failures are surfaced honestly.
- Role-aware navigation is based on actual clinic membership data and does not replace backend permission checks.
- Public booking retains the selected schedule/date and submits the required idempotency key.
- Unsupported backend capabilities (profile, dashboard metrics, exact pagination totals, registration number in public search, token refresh) are not represented as implemented features.
