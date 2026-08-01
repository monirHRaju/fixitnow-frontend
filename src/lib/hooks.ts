import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./query-keys";
import {
  authApi,
  categoryApi,
  serviceApi,
  technicianApi,
  bookingApi,
  paymentApi,
  reviewApi,
  adminApi,
} from "./api";
import type {
  Category,
  ServiceItem,
  TechnicianListItem,
  TechnicianDetail,
  Booking,
  Payment,
  Review,
  DashboardData,
  AdminUser,
} from "./types";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: () => authApi.getMe().then((r) => r.data.user),
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// ─── Categories ───────────────────────────────────────────────────────────────

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: () => categoryApi.list().then((r) => r.data.categories),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string; iconUrl?: string }) =>
      categoryApi.create(data).then((r) => r.data.category),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() });
    },
  });
}

// ─── Services ─────────────────────────────────────────────────────────────────

export function useServices(params?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.services.list(params),
    queryFn: () =>
      serviceApi.list(params).then((r) => ({
        services: r.data.services,
        pagination: r.data.pagination,
      })),
  });
}

export function useServiceDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.services.detail(id),
    queryFn: () => serviceApi.getById(id).then((r) => r.data.service),
    enabled: !!id,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      categoryId: string;
      title: string;
      description?: string;
      price: number;
      durationMins?: number;
    }) => serviceApi.create(data).then((r) => r.data.service),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all() });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<{
        categoryId: string;
        title: string;
        description: string;
        price: number;
        durationMins: number;
        isActive: boolean;
      }>;
    }) => serviceApi.update(id, data).then((r) => r.data.service),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all() });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => serviceApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.services.all() });
    },
  });
}

export function useMyServices(includeInactive?: boolean) {
  return useQuery({
    queryKey: queryKeys.technicians.profile(),
    queryFn: () =>
      serviceApi.listMyServices(includeInactive).then((r) => r.data.services),
  });
}

// ─── Technicians ──────────────────────────────────────────────────────────────

export function useTechnicians(params?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.technicians.list(params),
    queryFn: () =>
      technicianApi.list(params).then((r) => ({
        technicians: r.data.technicians,
        pagination: r.data.pagination,
      })),
  });
}

export function useTechnicianDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.technicians.detail(id),
    queryFn: () =>
      technicianApi.getById(id).then((r) => r.data.technician),
    enabled: !!id,
  });
}

export function useUpdateTechnicianProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      bio?: string;
      skills?: string[];
      experience?: number;
      hourlyRate?: number;
      location?: string;
    }) => technicianApi.updateProfile(data).then((r) => r.data.technician),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.technicians.profile(),
      });
    },
  });
}

export function useUpdateAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      slots: { dayOfWeek: number; startTime: string; endTime: string }[]
    ) => technicianApi.updateAvailability(slots).then((r) => r.data.slots),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.technicians.availability(),
      });
    },
  });
}

export function useTechnicianBookings(params?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.technicians.bookings(params),
    queryFn: () =>
      technicianApi.getBookings(params).then((r) => ({
        bookings: r.data.bookings,
        pagination: r.data.pagination,
      })),
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      technicianApi.updateBookingStatus(id, status).then((r) => r.data.booking),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.technicians.bookings(),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() });
    },
  });
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export function useBookings(params?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.bookings.list(params),
    queryFn: () =>
      bookingApi.list(params).then((r) => ({
        bookings: r.data.bookings,
        pagination: r.data.pagination,
      })),
  });
}

export function useBookingDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.bookings.detail(id),
    queryFn: () => bookingApi.getById(id).then((r) => r.data.booking),
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      serviceId: string;
      technicianId: string;
      scheduledAt: string;
      address: string;
      notes?: string;
    }) => bookingApi.create(data).then((r) => r.data.booking),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bookingApi.cancel(id).then((r) => r.data.booking),
    onMutate: async (id: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.bookings.all() });

      // Snapshot previous value
      const previousQueries = queryClient.getQueriesData<{
        bookings: Booking[];
        pagination?: any;
      }>({ queryKey: queryKeys.bookings.all() });

      // Optimistically update the booking status to CANCELLED
      queryClient.setQueriesData<{ bookings: Booking[]; pagination?: any }>(
        { queryKey: queryKeys.bookings.all() },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            bookings: old.bookings.map((b) =>
              b.id === id ? { ...b, status: "CANCELLED" as const } : b
            ),
          };
        }
      );

      return { previousQueries };
    },
    onError: (_err, _id, context) => {
      // Rollback on error
      if (context?.previousQueries) {
        for (const [key, data] of context.previousQueries) {
          queryClient.setQueryData(key, data);
        }
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() });
    },
  });
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export function usePayments(params?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.payments.list(params),
    queryFn: () =>
      paymentApi.list(params).then((r) => ({
        payments: r.data.payments,
        pagination: r.data.pagination,
      })),
  });
}

export function usePaymentDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.payments.detail(id),
    queryFn: () => paymentApi.getById(id).then((r) => r.data.payment),
    enabled: !!id,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) =>
      paymentApi.create(bookingId).then((r) => ({
        payment: r.data.payment,
        gatewayUrl: r.data.gatewayUrl,
        sessionKey: r.data.sessionKey,
      })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all() });
    },
  });
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export function useReviews() {
  return useQuery({
    queryKey: queryKeys.reviews.list(),
    queryFn: () => reviewApi.list().then((r) => r.data.reviews),
  });
}

export function useReviewsByTechnician(id: string) {
  return useQuery({
    queryKey: queryKeys.reviews.byTechnician(id),
    queryFn: () =>
      reviewApi.listByTechnician(id).then((r) => ({
        technician: r.data.technician,
        stats: r.data.stats,
        reviews: r.data.reviews,
      })),
    enabled: !!id,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { bookingId: string; rating: number; comment?: string }) =>
      reviewApi.create(data).then((r) => r.data.review),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all() });
    },
  });
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export function useAdminDashboard() {
  return useQuery({
    queryKey: queryKeys.admin.dashboard(),
    queryFn: () => adminApi.dashboard().then((r) => r.data as DashboardData),
  });
}

export function useAdminUsers(params?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: () =>
      adminApi.listUsers(params).then((r) => ({
        users: r.data.users,
        pagination: r.data.pagination,
      })),
  });
}

export function useToggleBanUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      adminApi.toggleBan(id).then((r) => r.data.user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.users() });
    },
  });
}

export function useAdminBookings(params?: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.admin.bookings(params),
    queryFn: () =>
      adminApi.listBookings(params).then((r) => ({
        bookings: r.data.bookings,
        pagination: r.data.pagination,
      })),
  });
}