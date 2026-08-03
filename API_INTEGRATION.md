# API Integration & Documentation — FixItNow

Base URL: `NEXT_PUBLIC_API_URL` (default `http://localhost:3000/api`).
Auth: `Authorization: Bearer <JWT>` header, attached automatically by the axios interceptor in `src/lib/api.ts`.
All endpoints return `{ success, data, message }`-style `ApiResponse`. Errors are normalized via `ApiError.fromAxiosError` and a 401 auto-clears the stored token and redirects to `/login`.

Frontend API client: `src/lib/api.ts` (objects `authApi`, `categoryApi`, `serviceApi`, `technicianApi`, `bookingApi`, `paymentApi`, `reviewApi`, `adminApi`). Shared types live in `src/lib/types.ts`.

---

## Auth (`/api/auth`)
| Method | Endpoint | Client | Used by (page/component) |
|---|---|---|---|
| POST | `/auth/register` | `authApi.register` | `(auth)/register` |
| POST | `/auth/login` | `authApi.login` | `(auth)/login` |
| GET | `/auth/me` (auth) | `authApi.getMe` | `(dashboard)/profile`, auth-state hydration |

---

## Categories (`/api/categories`)
| Method | Endpoint | Client | Used by (page/component) |
|---|---|---|---|
| GET | `/categories` (public) | `categoryApi.list` | Home `/`, `/services`, `/technicians`, `(dashboard)/admin/categories`, booking form dropdowns |
| POST | `/admin/categories` (admin) | `categoryApi.create` | `(dashboard)/admin/categories` (create form) |

---

## Services (`/api/services`)
| Method | Endpoint | Client | Used by (page/component) |
|---|---|---|---|
| GET | `/services` (public, filterable) | `serviceApi.list` | Home `/`, `/services`, `(dashboard)/bookings/new`, `(dashboard)/admin/services` |
| GET | `/services/:id` (public) | `serviceApi.getById` | `(public)/services/[id]` |
| POST | `/technician/services` (tech) | `serviceApi.create` | `(dashboard)/technician/services` |
| PUT | `/technician/services/:id` (tech) | `serviceApi.update` | `(dashboard)/technician/services` (edit) |
| DELETE | `/technician/services/:id` (tech) | `serviceApi.remove` | `(dashboard)/technician/services` (soft-delete) |
| GET | `/technician/services` (tech) | `serviceApi.listMyServices` | `(dashboard)/technician/services` |

---

## Technicians (`/api/technicians`)
| Method | Endpoint | Client | Used by (page/component) |
|---|---|---|---|
| GET | `/technicians` (public) | `technicianApi.list` | `/technicians`, `(dashboard)/bookings/new`, `(dashboard)/admin/technicians` |
| GET | `/technicians/:id` (public) | `technicianApi.getById` | `(public)/technicians/[id]` |
| GET | `/technicians/:id/availability` (public) | `technicianApi.getAvailability` | `(public)/technicians/[id]`, booking time-slot picker |
| PUT | `/technician/profile` (tech) | `technicianApi.updateProfile` | `(dashboard)/technician/profile` |
| PUT | `/technician/availability` (tech) | `technicianApi.updateAvailability` | `(dashboard)/technician/availability` |
| GET | `/technician/bookings` (tech) | `technicianApi.getBookings` | `(dashboard)/technician/bookings`, `(dashboard)/technician/dashboard` |
| PATCH | `/technician/bookings/:id` (tech) | `technicianApi.updateBookingStatus` | `(dashboard)/technician/bookings` (accept/decline/complete) |

---

## Bookings (`/api/bookings` — all require auth)
| Method | Endpoint | Client | Used by (page/component) |
|---|---|---|---|
| POST | `/bookings` | `bookingApi.create` | `(dashboard)/bookings/new` |
| GET | `/bookings` | `bookingApi.list` | `(dashboard)/bookings`, `(dashboard)/customer`, `(dashboard)/dashboard` |
| GET | `/bookings/:id` | `bookingApi.getById` | `(dashboard)/bookings/[id]` |
| PATCH | `/bookings/:id/cancel` | `bookingApi.cancel` | `(dashboard)/bookings/[id]` (cancel action) |

---

## Payments (`/api/payments` — SSLCommerz)
| Method | Endpoint | Client | Used by (page/component) |
|---|---|---|---|
| POST | `/payments/create` (auth) | `paymentApi.create` | `(dashboard)/customer/bookings/[id]/pay` (init payment → `gatewayUrl` redirect) |
| POST | `/payments/confirm` (IPN, no auth) | — (server-to-server) | SSLCommerz IPN callback; vets & marks Payment `COMPLETED` + Booking `PAID` |
| GET | `/payments/success` | — (302 redirect) | Bounce handler → `FRONTEND_URL/payment/success` |
| GET | `/payments/fail` | — (302 redirect) | Bounce handler → `FRONTEND_URL/payment/fail` |
| GET | `/payments/cancel` | — (302 redirect) | Bounce handler → `FRONTEND_URL/payment/cancel` |
| GET | `/payments` (auth) | `paymentApi.list` | `(dashboard)/payments`, `(dashboard)/admin/payments` |
| GET | `/payments/:id` (auth) | `paymentApi.getById` | Payment detail / status polling |

> Note: prices are stored in **paisa** (smallest BDT unit). SSLCommerz `total_amount` expects **taka** — divide by 100 before sending. The `success`/`fail`/`cancel` routes ONLY redirect the browser; the authoritative confirmation is the IPN `confirm`.

---

## Reviews (`/api/reviews`)
| Method | Endpoint | Client | Used by (page/component) |
|---|---|---|---|
| POST | `/reviews` (auth) | `reviewApi.create` | `(dashboard)/bookings/[id]` (review form after completed booking) |
| GET | `/reviews` (auth) | `reviewApi.list` | `(dashboard)/reviews` |
| GET | `/reviews/technician/:id` (public) | `reviewApi.listByTechnician` | `(public)/technicians/[id]`, `(dashboard)/technician/reviews` |

---

## Admin (`/api/admin` — all require `ADMIN` role)
| Method | Endpoint | Client | Used by (page/component) |
|---|---|---|---|
| GET | `/admin/dashboard` | `adminApi.dashboard` | `(dashboard)/admin/dashboard` |
| GET | `/admin/users` | `adminApi.listUsers` | `(dashboard)/admin/users` |
| PATCH | `/admin/users/:id` | `adminApi.toggleBan` | `(dashboard)/admin/users` (ban/unban) |
| GET | `/admin/bookings` | `adminApi.listBookings` | `(dashboard)/admin/bookings` |
| GET | `/admin/bookings/:id` | `adminApi.getBookingById` | `(dashboard)/admin/bookings/[id]` |
| PATCH | `/admin/bookings/:id/status` | `adminApi.updateBookingStatus` | `(dashboard)/admin/bookings/[id]` (status override/cancel) |
| PATCH | `/admin/bookings/:id/payment` | `adminApi.overridePaymentStatus` | `(dashboard)/admin/bookings/[id]` (payment override) |
| PATCH | `/admin/bookings/:id/notes` | `adminApi.updateBookingNotes` | `(dashboard)/admin/bookings/[id]` (edit admin notes) |

> Admin categories use `GET /categories` (shared with public `categoryApi.list`) for read + `POST /admin/categories` (`categoryApi.create`) for write.

---

## Key conventions & gotchas
- **Auth guard**: customer/technician/admin routes are protected on the backend; the frontend sends the token from `localStorage["fixitnow_token"]`.
- **Role scoping**: technician routes enforce `TECHNICIAN`, admin routes enforce `ADMIN` via `restrictTo`. Client objects don't branch on role — pages gate UI by the logged-in user's role.
- **Pagination**: list endpoints accept `page`/`limit` (admin max 100) and return a `pagination` object.
- **Booking timeline fields** (`_count`, relations) must match between list and detail endpoints — see the detail-relation include pattern in commit notes if a detail page reads a field that only the list/or other endpoint populates.
- **Type sync**: when a backend endpoint returns new fields, widen the matching interface in `src/lib/types.ts` rather than casting.
