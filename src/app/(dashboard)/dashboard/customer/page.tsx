"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  CreditCard,
  ArrowRight,
  Star,
  Wrench,
  Clock,
  CheckCircle2,
  DollarSign,
  AlertCircle,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { useBookings, usePayments } from "@/lib/hooks";
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
import { Separator } from "@/components/ui/separator";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { getStatusMeta } from "@/components/booking/BookingStatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

// "Active" statuses — booking is still in progress (not terminal).
const ACTIVE_STATUSES = ["REQUESTED", "ACCEPTED", "PAID", "IN_PROGRESS"];

// Status → next actionable step for the active-booking card.
function nextActionFor(status: string): { label: string; href?: string } {
  switch (status) {
    case "REQUESTED":
      return { label: "Waiting for the technician to accept", href: undefined };
    case "ACCEPTED":
      return { label: "Pay now to confirm your booking" };
    case "PAID":
      return { label: "Waiting for the technician to start" };
    case "IN_PROGRESS":
      return { label: "Your service is in progress" };
    default:
      return { label: getStatusMeta(status).hint || "View details" };
  }
}

export default function CustomerDashboardPage() {
  const user = useAuthStore((state) => state.user);

  const bookingsQuery = useBookings({ limit: "100" });
  const paymentsQuery = usePayments({ limit: "20" });

  const bookings: Booking[] = bookingsQuery.data?.bookings ?? [];
  const payments = paymentsQuery.data?.payments ?? [];
  const isLoading = bookingsQuery.isLoading || paymentsQuery.isLoading;

  // Sort bookings newest first
  const sorted = [...bookings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // ── Summaries ──────────────────────────────────────────────────────────────
  const counts: Record<string, number> = {};
  for (const b of bookings) counts[b.status] = (counts[b.status] || 0) + 1;

  // Active booking = most recent non-terminal booking
  const activeBooking = sorted.find((b) => ACTIVE_STATUSES.includes(b.status)) || null;

  // Upcoming jobs = future scheduledAt, not terminal
  const upcomingJobs = sorted.filter(
    (b) =>
      !["COMPLETED", "CANCELLED", "DECLINED"].includes(b.status) &&
      new Date(b.scheduledAt).getTime() >= Date.now()
  );

  // Pending payments = bookings with ACCEPTED status (needs pay) or pending payment
  const pendingPayments = sorted.filter(
    (b) =>
      b.status === "ACCEPTED" ||
      (b.payment && b.payment.status === "PENDING")
  );

  // Review-eligible = completed bookings
  const reviewEligible = sorted.filter((b) => b.status === "COMPLETED");

  const statCards = [
    {
      label: "Active",
      value: bookings.filter((b) => ACTIVE_STATUSES.includes(b.status)).length,
      icon: Clock,
      color: "text-blue-500",
    },
    {
      label: "Upcoming",
      value: upcomingJobs.length,
      icon: CalendarCheck,
      color: "text-yellow-500",
    },
    {
      label: "Completed",
      value: counts["COMPLETED"] || 0,
      icon: CheckCircle2,
      color: "text-emerald-500",
    },
    {
      label: "Pending Payments",
      value: pendingPayments.length,
      icon: DollarSign,
      color: "text-red-500",
    },
  ];

  const quickAccess = [
    {
      title: "Pending Payments",
      description: `${pendingPayments.length} booking${pendingPayments.length === 1 ? "" : "s"} need payment`,
      href: pendingPayments.length ? `/payments` : "/bookings",
      icon: CreditCard,
      available: pendingPayments.length > 0,
    },
    {
      title: "Upcoming Jobs",
      description: `${upcomingJobs.length} upcoming job${upcomingJobs.length === 1 ? "" : "s"} scheduled`,
      href: "/bookings",
      icon: CalendarCheck,
      available: upcomingJobs.length > 0,
    },
    {
      title: "Leave a Review",
      description: `${reviewEligible.length} completed booking${reviewEligible.length === 1 ? "" : "s"} to review`,
      href: "/reviews",
      icon: Star,
      available: reviewEligible.length > 0,
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
          Here&apos;s the current status of your bookings
        </p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        variants={itemVariants}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          : statCards.map((s) => (
              <Card key={s.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {s.label}
                  </CardTitle>
                  <s.icon className={cn("h-4 w-4", s.color)} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{s.value}</div>
                </CardContent>
              </Card>
            ))}
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Active booking + lifecycle */}
        <motion.div variants={itemVariants} className="space-y-6 lg:col-span-2">
          {/* Active Booking Highlight */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                </span>
                Active Booking
              </CardTitle>
              <CardDescription>
                Your most recent in-progress booking
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ) : activeBooking ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold">
                        {activeBooking.service?.title || "Service"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activeBooking.technician?.user?.name || "Technician"} —{" "}
                        {formatDate(activeBooking.scheduledAt)}
                      </p>
                    </div>
                    <BookingStatusBadge status={activeBooking.status} />
                  </div>
                  <div className="rounded-lg bg-background/60 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Next Step
                    </p>
                    <p className="mt-1 text-sm font-medium">
                      {nextActionFor(activeBooking.status).label}
                    </p>
                    <div className="mt-3">
                      <Button size="sm" asChild variant="outline">
                        <Link href={`/bookings/${activeBooking.id}`}>
                          View Details <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Wrench className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    No active booking right now
                  </p>
                  <Button asChild className="mt-4" size="sm">
                    <Link href="/services">Browse Services</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking Summary by status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Booking Summary</CardTitle>
                <CardDescription>
                  Distribution of your bookings by status
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/bookings">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : bookings.length === 0 ? (
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
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {Object.entries(counts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([status, count]) => {
                      const meta = getStatusMeta(status);
                      return (
                        <div
                          key={status}
                          className="rounded-lg border border-border p-4"
                        >
                          <div className="flex items-center gap-2">
                            <span className={cn("h-2.5 w-2.5 rounded-full", meta.dot)} />
                            <span className="text-sm font-medium">{meta.label}</span>
                          </div>
                          <div className="mt-2 text-2xl font-bold">{count}</div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment History mini-table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>Your recent transactions</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/payments">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {paymentsQuery.isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : payments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CreditCard className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    No payments yet
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                        <th className="pb-2 pr-2 font-medium">Booking</th>
                        <th className="pb-2 pr-2 font-medium">Date</th>
                        <th className="pb-2 pr-2 font-medium">Method</th>
                        <th className="pb-2 pr-2 font-medium">Status</th>
                        <th className="pb-2 text-right font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.slice(0, 6).map((p) => (
                        <tr key={p.id} className="border-b last:border-0">
                          <td className="py-3 pr-2">
                            <Link
                              href={`/bookings/${p.bookingId}`}
                              className="font-medium text-foreground hover:text-primary"
                            >
                              View Booking
                            </Link>
                          </td>
                          <td className="py-3 pr-2 text-muted-foreground">
                            {formatDate(p.paidAt || p.createdAt)}
                          </td>
                          <td className="py-3 pr-2 text-muted-foreground">
                            {p.method || p.provider || "N/A"}
                          </td>
                          <td className="py-3 pr-2">
                            <BookingStatusBadge status={p.status} />
                          </td>
                          <td className="py-3 text-right font-semibold">
                            {formatCurrency(p.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right: Quick access */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Quick Access</CardTitle>
              <CardDescription>Shortcuts to what matters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickAccess.map((action) => (
                <Button
                  key={action.title}
                  variant="outline"
                  className="w-full justify-start gap-3"
                  asChild
                >
                  <Link href={action.href}>
                    <action.icon
                      className={cn(
                        "h-5 w-5 shrink-0",
                        action.available ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <div className="text-left">
                      <p className="text-sm font-medium">{action.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                  </Link>
                </Button>
              ))}

              <Separator className="my-2" />

              <Button
                variant="default"
                className="w-full justify-start gap-3"
                asChild
              >
                <Link href="/bookings/new">
                  <Wrench className="h-5 w-5 shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Book a New Service</p>
                    <p className="text-xs text-muted-foreground">
                      Find a technician
                    </p>
                  </div>
                  <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
