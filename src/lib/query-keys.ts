/**
 * Centralized query key factory for TanStack Query.
 *
 * Usage: queryKeys.services.list(params) => ['services', 'list', params]
 *        queryKeys.bookings.detail(id)   => ['bookings', 'detail', id]
 *
 * This ensures cache invalidation is predictable across the app.
 */

export const queryKeys = {
  auth: {
    me: () => ["auth", "me"] as const,
  },
  categories: {
    all: () => ["categories"] as const,
    list: (params?: Record<string, string>) => ["categories", "list", params] as const,
  },
  services: {
    all: () => ["services"] as const,
    list: (params?: Record<string, string>) => ["services", "list", params] as const,
    detail: (id: string) => ["services", "detail", id] as const,
  },
  technicians: {
    all: () => ["technicians"] as const,
    list: (params?: Record<string, string>) => ["technicians", "list", params] as const,
    detail: (id: string) => ["technicians", "detail", id] as const,
    profile: () => ["technicians", "profile"] as const,
    availability: (userId?: string) =>
      ["technicians", "availability", userId] as const,
    dayAvailability: (id: string, date: string) =>
      ["technicians", "availability", "day", id, date] as const,
    bookings: (params?: Record<string, string>) =>
      ["technicians", "bookings", params] as const,
  },
  bookings: {
    all: () => ["bookings"] as const,
    list: (params?: Record<string, string>) => ["bookings", "list", params] as const,
    detail: (id: string) => ["bookings", "detail", id] as const,
  },
  payments: {
    all: () => ["payments"] as const,
    list: (params?: Record<string, string>) => ["payments", "list", params] as const,
    detail: (id: string) => ["payments", "detail", id] as const,
  },
  reviews: {
    all: () => ["reviews"] as const,
    list: () => ["reviews", "list"] as const,
    byTechnician: (id: string) => ["reviews", "byTechnician", id] as const,
  },
  admin: {
    dashboard: () => ["admin", "dashboard"] as const,
    users: (params?: Record<string, string>) => ["admin", "users", params] as const,
    bookings: (params?: Record<string, string>) =>
      ["admin", "bookings", params] as const,
  },
} as const;