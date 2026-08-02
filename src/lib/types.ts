// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errorDetails?: Array<{ field: string; message: string; code: string }>;
}

export interface PaginatedResponse<T> {
  data: T;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// User types
export type UserRole = "CUSTOMER" | "TECHNICIAN" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  address?: string;
  avatarUrl?: string;
  isBanned: boolean;
  createdAt: string;
  technicianProfile?: TechnicianProfile;
}

export interface UserBrief {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface AuthData {
  user: User;
  token: string;
}

// Technician types
export interface TechnicianProfile {
  id: string;
  userId: string;
  bio?: string;
  skills: string[];
  experience?: number;
  hourlyRate?: number;
  location?: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TechnicianListItem {
  id: string;
  userId: string;
  bio?: string;
  skills: string[];
  experience?: number;
  hourlyRate?: number;
  location?: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  user: UserBrief;
  _count: { services: number; bookings: number };
  avgRating: number | null;
  reviewCount: number;
}

export interface TechnicianDetail extends TechnicianListItem {
  availability: AvailabilitySlot[];
  services: ServiceItem[];
  avgRating: number | null;
  reviewCount: number;
  reviews: Review[];
}

// Availability
export interface AvailabilitySlot {
  id: string;
  technicianId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

// Day-level availability for the time-slot picker
export interface DayAvailability {
  date: string;
  dayOfWeek: number;
  slots: AvailabilitySlot[];
  bookedTimes: string[];
}

// Category
export interface Category {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string;
  _count?: { services: number };
}

// Service
export interface ServiceItem {
  id: string;
  technicianId: string;
  categoryId: string;
  title: string;
  description?: string;
  price: number;
  durationMins?: number;
  isActive: boolean;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  category: { id: string; name: string };
  technician: {
    id: string;
    location?: string;
    hourlyRate?: number;
    isAvailable: boolean;
    user: UserBrief;
  };
  _count: { bookings: number };
  avgRating: number | null;
  reviewCount: number;
}

// Booking
export type BookingStatus =
  | "REQUESTED"
  | "ACCEPTED"
  | "DECLINED"
  | "PAID"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface Booking {
  id: string;
  customerId: string;
  technicianId: string;
  serviceId: string;
  scheduledAt: string;
  address: string;
  notes?: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
  customer?: { id: string; name: string; phone?: string; email?: string };
  technician?: {
    id: string;
    location?: string;
    bio?: string;
    skills?: string[];
    user: UserBrief;
  };
  service: {
    id: string;
    title: string;
    description?: string;
    price: number;
    durationMins?: number;
  };
  payment?: {
    status: string;
    amount: number;
    method?: string;
    transactionId?: string;
    paidAt?: string;
  };
}

// Payment
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";

export interface Payment {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  method?: string;
  provider: string;
  transactionId?: string;
  status: PaymentStatus;
  paidAt?: string;
  createdAt: string;
  booking?: {
    id: string;
    status: string;
    scheduledAt: string;
    address?: string;
    service: { title: string; price: number };
    technician?: { user: { name: string } };
  };
}

// Review
export interface Review {
  id: string;
  bookingId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: UserBrief;
  booking?: {
    id: string;
    service: { title: string };
    technician?: { user: { name: string } };
  };
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number | null;
  distribution: Record<number, number>;
}

// Admin
export interface DashboardStats {
  totalUsers: number;
  totalTechnicians: number;
  totalAdmins: number;
  totalBookings: number;
  totalRevenue: number;
  pendingBookings: number;
  activeTechnicians: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentBookings: Booking[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isBanned: boolean;
  createdAt: string;
  _count: { customerBookings: number; payments: number };
}
