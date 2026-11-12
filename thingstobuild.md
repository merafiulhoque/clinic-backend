# Things to Build

This is the feature backlog for the clinic frontend. Each checkbox is a buildable item that can be picked up separately. Items marked **Backend needed** require an API change or a decision before the frontend can fully support them.

## Project foundation

- [ ] **Create the Next.js application foundation.** Set up Next.js, TypeScript, Tailwind CSS, and the agreed app-router structure under `src/`. Keep public, owner, staff, and shared UI code in their appropriate folders.
- [ ] **Add shared frontend configuration.** Read the backend origin from an environment variable, add a centralized API endpoint map, and add URL constants for every frontend page. Use those page constants for links and redirects rather than repeating route strings.
- [ ] **Build the shared backend API client.** Add a typed wrapper around the provided generic API function. It should build requests from the configured backend URL, attach `Authorization: Bearer <accessToken>` to protected backend calls, parse JSON and text responses, and surface backend errors rather than silently hiding them.
- [ ] **Keep backend requests behind the Next.js server.** Use server actions for suitable form submissions and mutations, and route handlers where a request needs an HTTP endpoint or proxy. Avoid calling the backend directly from browser components so the backend URL and tokens are not unnecessarily exposed.
- [ ] **Centralize shared types and schemas.** Put API response/request types and frontend Zod schemas in shared locations. Keep them aligned with the actual backend contract; do not assume undocumented fields or responses.
- [ ] **Set up shared UI components.** Create reusable buttons, inputs, form-field error display, dialogs/modals, loading indicators, empty states, and a custom toaster under the shared UI components.
- [ ] **Add an application-wide theme.** Implement light and dark themes, persist the user's preference appropriately, and make the setting available from the user menu.
- [ ] **Establish query and mutation conventions.** Configure TanStack Query for fetching, caching, invalidation, and mutations. Show pending states and disable duplicate submissions while a mutation is in progress.
- [ ] **Enforce the no-dummy-data rule.** Do not add mock doctors, clinics, users, appointments, or placeholder API responses. Test with a real backend/API URL and real data; if those are unavailable, ask for them instead of inventing records.

## Authentication and access

- [ ] **Build the sign-up page.** Collect email and password, validate with React Hook Form and Zod, show field-level errors, and submit to `POST /api/v1/auth/signup`. The backend currently returns text on success.
- [ ] **Build the sign-in page.** Collect email and password, validate locally, submit to `POST /api/v1/auth/signin`, and handle the returned access and refresh tokens. On success, fetch the user's clinic memberships to determine the next screen.
- [ ] **Choose and implement secure token storage.** Keep tokens out of Zustand persistence and browser local storage. Use a server-managed, HTTP-only cookie/session approach and attach the access token on server-to-backend requests.
- [ ] **Handle sign-out.** Call the protected sign-out endpoint with the access token and refresh token, clear the frontend session even if the request fails, and redirect using the centralized URL constants. The backend currently requires both tokens for sign-out.
- [ ] **Handle expired access tokens.** The current backend has no refresh-token exchange endpoint. Until one is added, show an appropriate signed-out/session-expired state and return the user to sign-in instead of pretending the refresh token can renew access.
- [ ] **Add protected-route and role-aware access checks.** Prevent unauthenticated users from entering administrative pages and ensure navigation/actions match the role in the selected clinic membership.
- [ ] **Add a sign-in redirect/resume flow.** Preserve the intended destination when a user is asked to sign in, then send them there after successful authentication where appropriate.

## Shared administrative layout

- [ ] **Build the authenticated top navbar.** Keep it fixed at the top, show the app mark/favicon on the left, a working current-page search control in the middle, and the signed-in user's profile/menu control on the right.
- [ ] **Build the profile menu.** Include the theme toggle and sign-out action. Keep profile imagery optional until real profile-image data is supported.
- [ ] **Build the fixed sidebar and main content layout.** Keep the sidebar between the navbar and viewport bottom, reserve its width in the main content area, and render the selected page in the remaining space.
- [ ] **Create centralized role-based sidebar options.** Store each item's label, centralized URL, and Lucide icon in one shared configuration. Build the visible items from the user's role in the active clinic.
- [ ] **Highlight the active navigation item.** Use Next.js route state/path matching for the active item; avoid using `useRef` as the source of truth for route state.
- [ ] **Define current-page search behavior.** Pass the navbar search value to the active page and implement only the filters that page supports. The backend currently supports the doctor-directory filters, not a universal search across administrative pages.
- [ ] **Add shared loading, error, and empty states.** Use consistent loaders while data is fetched or mutations are pending, show useful error messages, and provide clear empty states without inserting fake records.
- [ ] **Add responsive behavior and accessibility.** Ensure the navbar, sidebar, menus, forms, dialogs, keyboard navigation, and focus states work on mobile and desktop.
- [ ] **Add “Back to home” navigation where appropriate.** Use the centralized page URL constants and avoid showing redundant back buttons where normal navigation is clearer.

## Clinic and staff administration

- [ ] **Build the clinic-membership loading and routing flow.** After sign-in, call `GET /api/v1/clinic/get-info`. Use the real response to decide whether to show onboarding, a clinic picker, or the selected clinic's administrative area.
- [ ] **Build owner clinic onboarding.** When the user has no clinic memberships and is an owner, provide a form for clinic name and location and submit to `POST /api/v1/clinic/create`.
- [ ] **Build the clinic picker.** For users with multiple memberships, list the returned clinics and roles, let the user select one, and persist the active clinic as session/UI state. Do not invent a clinic when the response is empty.
- [ ] **Build clinic switching for owners.** Make the active clinic easy to change and refresh clinic-scoped queries when the selection changes.
- [ ] **Build the administrative landing/dashboard page.** Show only data available from implemented endpoints. The backend currently provides basic clinic membership information, not dashboard statistics or a dedicated clinic-details endpoint.
- [ ] **Build clinic-member management.** Provide an owner-facing form to create clinic members using `POST /api/v1/member/create`, with email, password, role, and clinic ID. Do not offer `OWNER` as an assignable role because the backend rejects it.
- [ ] **Clarify staff account invitation/onboarding.** The backend member-creation endpoint takes a password and creates the member; it does not currently describe an invitation or password-setup flow. Confirm the desired user experience before building that workflow.
- [ ] **Build doctor creation and list views.** Support the implemented doctor create and list endpoints, displaying only fields returned by the API. Doctor creation/list permissions are owner/manager restricted by the backend.
- [ ] **Build doctor-to-clinic assignment.** Let authorized users assign a doctor to an owned clinic with the clinic-specific fee, using `POST /api/v1/doctor-clinic/assign`.
- [ ] **Build doctor schedule management.** Let clinic owners configure a schedule for a doctor-clinic assignment using the weekday and minutes-after-midnight fields required by `POST /api/v1/schedule/create`. Display conflicts returned by the backend.

## Public doctor discovery and appointment booking

- [ ] **Build the public landing page.** Create the public-facing landing experience and a clear “View/book appointments” action that navigates using the centralized URL constants.
- [ ] **Build the public doctor search page.** Provide doctor name, location, and specialization filters, and optionally clinic name. Send `page` and `limit` with the filters to `GET /api/v1/public-corner/view-doctors`.
- [ ] **Render doctor and clinic results.** Show the returned doctor name, qualification, additional qualification, specialization, clinic locations, and fees. A doctor may have multiple clinic assignments; render each returned clinic.
- [ ] **Resolve registration-number display.** The requested doctor card includes a registration number, but the public directory response currently does not include it. Either omit that field until available or add it to the backend response before implementing it.
- [ ] **Choose a pagination experience compatible with the API.** The search endpoint returns an array but no total count or total-pages metadata. Implement next/previous or load-more behavior without claiming an exact total, or add pagination metadata to the backend.
- [ ] **Build schedule viewing per clinic assignment.** For a selected clinic, fetch schedules using its `doctorClinicId` from `GET /api/v1/public-corner/:doctorClinicId/schedule` and render the returned days and times.
- [ ] **Build date-based slot availability.** Let the user select a date, fetch `GET /api/v1/public-corner/:doctorClinicId/slots?date=YYYY-MM-DD`, and display each returned `scheduleId` and `availableTime` as an available booking option.
- [ ] **Build the patient booking form.** Collect patient name, email, and phone with React Hook Form and Zod. Retain the selected `scheduleId` and `appointmentDate` while navigating to the form.
- [ ] **Submit appointment bookings with idempotency.** Send the selected schedule/date, patient details, and a newly generated UUID `idempotencyKey` to `POST /api/v1/public-corner/book-slot`. Prevent duplicate submissions and show the backend result or an actionable error.
- [ ] **Build booking confirmation and failure states.** Show confirmation from the actual booking response and provide a safe retry path for failures; do not display a success-shaped fallback when the API call fails.

## Backend/API work needed for the complete experience

- [ ] **Add a token refresh endpoint or agree on re-authentication.** Access tokens last one hour and there is no refresh endpoint, even though sign-in issues a refresh token. Decide and implement the desired expiry behavior before relying on long-lived sessions.
- [ ] **Add registration number to public doctor results if required.** The public response currently omits this field, so the planned public doctor card cannot show it yet.
- [ ] **Add pagination metadata if exact page counts are required.** The current endpoint returns a page array only, with no total result count.
- [ ] **Add clinic details/dashboard endpoints if the dashboard needs richer data.** The current clinic endpoint returns membership role and basic clinic name/location only.
- [ ] **Decide whether a user profile endpoint is needed.** Sign-in returns tokens but no profile or role; current role discovery comes from clinic memberships. Add a profile endpoint only if the UI needs user details not available there.
- [ ] **Return field-specific validation errors if backend errors should highlight individual fields.** Frontend Zod can show local field errors, but current backend validation errors are generic and cannot identify which field failed.
- [ ] **Reconcile API documentation with implemented routes and behavior.** The OpenAPI document currently differs from the implementation (including the sign-in path), and sign-out documentation has differed about authentication/body requirements. Update the contract before generating frontend types from OpenAPI.

## Quality and delivery

- [ ] **Add frontend tests for shared API and form behavior.** Cover request headers, response/error parsing, Zod field validation, disabled pending buttons, and error states without relying on fabricated domain data.
- [ ] **Add flow tests using a real backend or explicitly provided test environment.** Verify sign-up/sign-in, clinic selection/onboarding, doctor search, schedule/availability, and booking against actual API responses.
- [ ] **Document environment and run instructions.** Explain how to configure the backend origin, run the frontend, and connect it to a real backend. Do not put secret tokens or credentials in committed files.
