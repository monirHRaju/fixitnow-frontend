import axios from "axios";
import { ApiError } from "./errors";
import type {
  ApiResponse,
  AuthData,
  User,
  TechnicianListItem,
  TechnicianDetail,
  DayAvailability,
  Category,
  ServiceItem,
  Booking,
  Payment,
  Review,
  DashboardData,
  AdminUser,
  PaginatedResponse,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("fixitnow_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 - clear token
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const apiError = ApiError.fromAxiosError(err);

    if (apiError.isUnauthorized && typeof window !== "undefined") {
      localStorage.removeItem("fixitnow_token");
      localStorage.removeItem("fixitnow_user");
      if (
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/register")
      ) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(apiError);
  }
);

// === Auth ===
export const authApi = {
  register: (data: { name: string; email: string; password: string; phone?: string; role?: string }) =>
    api.post<ApiResponse<AuthData>>("/auth/register", data).then((r) => r.data),
  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<AuthData>>("/auth/login", data).then((r) => r.data),
  getMe: () => api.get<ApiResponse<{ user: User }>>("/auth/me").then((r) => r.data),
};

// === Categories ===
export const categoryApi = {
  list: () =>
    api.get<ApiResponse<{ categories: Category[] }>>("/categories").then((r) => r.data),
  create: (data: { name: string; description?: string; iconUrl?: string }) =>
    api.post<ApiResponse<{ category: Category }>>("/admin/categories", data).then((r) => r.data),
};

// === Services ===
export const serviceApi = {
  list: (params?: Record<string, string>) =>
    api.get<ApiResponse<{ services: ServiceItem[]; pagination?: any }>>("/services", { params }).then((r) => r.data),
  getById: (id: string) =>
    api.get<ApiResponse<{ service: ServiceItem }>>(`/services/${id}`).then((r) => r.data),
  create: (data: { categoryId: string; title: string; description?: string; price: number; durationMins?: number }) =>
    api.post<ApiResponse<{ service: ServiceItem }>>("/technician/services", data).then((r) => r.data),
  update: (id: string, data: Partial<{ categoryId: string; title: string; description: string; price: number; durationMins: number; isActive: boolean }>) =>
    api.put<ApiResponse<{ service: ServiceItem }>>(`/technician/services/${id}`, data).then((r) => r.data),
  remove: (id: string) =>
    api.delete<ApiResponse<null>>(`/technician/services/${id}`).then((r) => r.data),
  listMyServices: (includeInactive?: boolean) =>
    api.get<ApiResponse<{ services: ServiceItem[] }>>("/technician/services", { params: { includeInactive: includeInactive ? "true" : undefined } }).then((r) => r.data),
};

// === Technicians ===
export const technicianApi = {
  list: (params?: Record<string, string>) =>
    api.get<ApiResponse<{ technicians: TechnicianListItem[]; pagination?: any }>>("/technicians", { params }).then((r) => r.data),
  getById: (id: string) =>
    api.get<ApiResponse<{ technician: TechnicianDetail }>>(`/technicians/${id}`).then((r) => r.data),
  getAvailability: (id: string, date: string) =>
    api.get<ApiResponse<DayAvailability>>(`/technicians/${id}/availability`, { params: { date } }).then((r) => r.data),
  updateProfile: (data: { bio?: string; skills?: string[]; experience?: number; hourlyRate?: number; location?: string }) =>
    api.put<ApiResponse<{ technician: any }>>("/technician/profile", data).then((r) => r.data),
  updateAvailability: (slots: { dayOfWeek: number; startTime: string; endTime: string }[]) =>
    api.put<ApiResponse<{ slots: any[] }>>("/technician/availability", { slots }).then((r) => r.data),
  getBookings: (params?: Record<string, string>) =>
    api.get<ApiResponse<{ bookings: Booking[]; pagination?: any }>>("/technician/bookings", { params }).then((r) => r.data),
  updateBookingStatus: (id: string, status: string) =>
    api.patch<ApiResponse<{ booking: Booking }>>(`/technician/bookings/${id}`, { status }).then((r) => r.data),
};

// === Bookings ===
export const bookingApi = {
  create: (data: { serviceId: string; technicianId: string; scheduledAt: string; address: string; notes?: string }) =>
    api.post<ApiResponse<{ booking: Booking }>>("/bookings", data).then((r) => r.data),
  list: (params?: Record<string, string>) =>
    api.get<ApiResponse<{ bookings: Booking[]; pagination?: any }>>("/bookings", { params }).then((r) => r.data),
  getById: (id: string) =>
    api.get<ApiResponse<{ booking: Booking }>>(`/bookings/${id}`).then((r) => r.data),
  cancel: (id: string) =>
    api.patch<ApiResponse<{ booking: Booking }>>(`/bookings/${id}/cancel`).then((r) => r.data),
};

// === Payments ===
export const paymentApi = {
  create: (bookingId: string) =>
    api.post<ApiResponse<{ payment: any; gatewayUrl: string; sessionKey: string }>>("/payments/create", { bookingId }).then((r) => r.data),
  list: (params?: Record<string, string>) =>
    api.get<ApiResponse<{ payments: Payment[]; pagination?: any }>>("/payments", { params }).then((r) => r.data),
  getById: (id: string) =>
    api.get<ApiResponse<{ payment: Payment }>>(`/payments/${id}`).then((r) => r.data),
};

// === Reviews ===
export const reviewApi = {
  create: (data: { bookingId: string; rating: number; comment?: string }) =>
    api.post<ApiResponse<{ review: Review }>>("/reviews", data).then((r) => r.data),
  list: () =>
    api.get<ApiResponse<{ reviews: Review[]; pagination?: any }>>("/reviews").then((r) => r.data),
  listByTechnician: (id: string) =>
    api.get<ApiResponse<{ technician: { id: string; name: string }; stats: any; reviews: Review[] }>>(`/reviews/technician/${id}`).then((r) => r.data),
};

// === Admin ===
export const adminApi = {
  dashboard: () =>
    api.get<ApiResponse<DashboardData>>("/admin/dashboard").then((r) => r.data),
  listUsers: (params?: Record<string, string>) =>
    api.get<ApiResponse<{ users: AdminUser[]; pagination: any }>>("/admin/users", { params }).then((r) => r.data),
  toggleBan: (id: string) =>
    api.patch<ApiResponse<{ user: AdminUser }>>(`/admin/users/${id}`).then((r) => r.data),
  listBookings: (params?: Record<string, string>) =>
    api.get<ApiResponse<{ bookings: Booking[]; pagination: any }>>("/admin/bookings", { params }).then((r) => r.data),
  getBookingById: (id: string) =>
    api.get<ApiResponse<{ booking: Booking }>>(`/admin/bookings/${id}`).then((r) => r.data),
  updateBookingStatus: (id: string, data: { status: string; reason?: string }) =>
    api.patch<ApiResponse<{ booking: Booking }>>(`/admin/bookings/${id}/status`, data).then((r) => r.data),
  overridePaymentStatus: (id: string, status: string) =>
    api.patch<ApiResponse<{ payment: any }>>(`/admin/bookings/${id}/payment`, { status }).then((r) => r.data),
  updateBookingNotes: (id: string, notes: string) =>
    api.patch<ApiResponse<{ booking: Booking }>>(`/admin/bookings/${id}/notes`, { notes }).then((r) => r.data),
};

export default api;
