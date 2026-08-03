"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  CreditCard,
  ArrowRight,
  Star,
  Wrench,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { useBookings } from "@/lib/hooks";
import type { Booking } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared";
import { formatDate } from "@/lib/utils";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

interface BookingCount {
  total: number;
  requested: number;
  accepted: number;
  completed: number;
  cancelled: number;
}

function computeCounts(bookings: Booking[]): BookingCount {
  return {
    total: bookings.length,
    requested: bookings.filter((b) => b.status === "REQUESTED").length,
    accepted: bookings.filter((b) => b.status === "ACCEPTED").length,
    completed: bookings.filter((b) => b.status === "COMPLETED").length,
    cancelled: bookings.filter((b) => b.status === "CANCELLED").length,
  };
}

export default function CustomerDashboardPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { data, isLoading, error } = useBookings({ limit: "10" });
  const bookings = data?.bookings ?? [];

  // Role-based redirect: /dashboard is for CUSTOMER only
  useEffect(() => {
    if (!user) return;
    if (user.role === "ADMIN") {
      router.replace("/admin/dashboard");
    } else if (user.role === "TECHNICIAN") {
      router.replace("/technician/dashboard");
    }
  }, [user, router]);

  const counts = computeCounts(bookings);

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const quickActions = [
    {
      title: "Book a Service",
      description: "Find a technician and book a service",
      href: "/bookings/new",
      icon: Wrench,
      variant: "default" as const,
    },
    {
      title: "View My Bookings",
      description: "Check all your booking requests",
      href: "/bookings",
      icon: CalendarCheck,
      variant: "outline" as const,
    },
    {
      title: "Make a Payment",
      description: "Complete pending payments",
      href: "/payments",
      icon: CreditCard,
      variant: "outline" as const,
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Greeting */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight">
          Hello, {user?.name?.split(" ")[0] || "there"}! 👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s your service overview
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {isLoading ? (
          <>
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Bookings
                </CardTitle>
                <CalendarCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{counts.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Requested
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{counts.requested}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Accepted
                </CardTitle>
                <Star className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{counts.accepted}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completed
                </CardTitle>
                <Star className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{counts.completed}</div>
              </CardContent>
            </Card>
          </>
        )}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Bookings */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Bookings</CardTitle>
                <CardDescription>Your latest booking requests</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/bookings">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <AlertCircle className="mr-2 h-5 w-5 text-destructive" />
                  <p className="text-sm">{error.message}</p>
                </div>
              ) : recentBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CalendarCheck className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    No bookings yet
                  </p>
                  <Button asChild className="mt-4" size="sm">
                    <Link href="/bookings/new">Book Your First Service</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentBookings.map((booking) => (
                    <Link
                      key={booking.id}
                      href={`/bookings/${booking.id}`}
                      className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-accent/50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {booking.service?.title || "Service"}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {booking.technician?.user?.name || "Technician"} —{" "}
                          {formatDate(booking.scheduledAt)}
                        </p>
                      </div>
                      <StatusBadge status={booking.status} />
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Things you can do</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action) => (
                <Button
                  key={action.title}
                  variant={action.variant}
                  className="w-full justify-start gap-3"
                  asChild
                >
                  <Link href={action.href}>
                    <action.icon className="h-5 w-5 shrink-0" />
                    <div className="text-left">
                      <p className="text-sm font-medium">{action.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}