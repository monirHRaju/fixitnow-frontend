"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  Loader2,
  AlertCircle,
  XCircle,
  DollarSign,
  Star,
  Plus,
} from "lucide-react";
import { useBookings, useCancelBooking, useCreatePayment } from "@/lib/hooks";
import type { BookingStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  formatDateTime,
  formatCurrency,
} from "@/lib/utils";

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "REQUESTED", label: "Requested" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "PAID", label: "Paid" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [payingId, setPayingId] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useBookings();
  const cancelMutation = useCancelBooking();
  const payMutation = useCreatePayment();

  const allBookings = data?.bookings ?? [];

  const filteredBookings =
    activeTab === "ALL"
      ? allBookings
      : allBookings.filter((b) => b.status === activeTab);

  const sortedBookings = [...filteredBookings].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleCancel = (id: string) => {
    cancelMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Booking cancelled successfully");
      },
      onError: (err: unknown) => {
        const errorObj = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        toast.error(
          errorObj?.response?.data?.message ||
            errorObj?.message ||
            "Failed to cancel booking"
        );
      },
    });
  };

  const handlePayNow = async (bookingId: string) => {
    setPayingId(bookingId);
    payMutation.mutate(bookingId, {
      onSuccess: (result) => {
        if (result.gatewayUrl) {
          window.location.href = result.gatewayUrl;
        } else {
          toast.success("Payment initiated successfully");
        }
      },
      onError: (err: unknown) => {
        const errorObj = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        toast.error(
          errorObj?.response?.data?.message ||
            errorObj?.message ||
            "Failed to initiate payment"
        );
      },
      onSettled: () => {
        setPayingId(null);
      },
    });
  };

  const canCancel = (status: BookingStatus) =>
    ["REQUESTED", "ACCEPTED"].includes(status);
  const canPay = (status: BookingStatus) => status === "ACCEPTED";
  const canReview = (status: BookingStatus, paymentStatus?: string) =>
    status === "COMPLETED" && paymentStatus === "COMPLETED";

  const isCancelling = (id: string) =>
    cancelMutation.isPending && cancelMutation.variables === id;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
          <p className="mt-1 text-muted-foreground">
            Manage all your service bookings
          </p>
        </div>
        <Button asChild>
          <Link href="/bookings/new">
            <Plus className="mr-2 h-4 w-4" />
            Book a Service
          </Link>
        </Button>
      </motion.div>

      {/* Status Filter Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="flex-wrap h-auto">
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Bookings List */}
      <motion.div variants={itemVariants} className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="mt-4 text-sm text-muted-foreground">
                {error.message}
              </p>
              <Button variant="outline" className="mt-4" onClick={() => refetch()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : sortedBookings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CalendarCheck className="h-16 w-16 text-muted-foreground/30" />
              <h3 className="mt-4 text-lg font-medium">No bookings found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {activeTab === "ALL"
                  ? "You haven't made any bookings yet."
                  : `No bookings with status "${activeTab}".`}
              </p>
              <Button asChild className="mt-6">
                <Link href="/bookings/new">Book a Service</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          sortedBookings.map((booking) => (
            <motion.div key={booking.id} layout>
              <Link href={`/bookings/${booking.id}`}>
                <Card className="transition-colors hover:bg-accent/50">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-base font-semibold">
                            {booking.service?.title || "Service"}
                          </h3>
                          <BookingStatusBadge status={booking.status} />
                          {booking.payment && (
                            <BookingStatusBadge
                              status={booking.payment.status}
                              className="border-transparent bg-transparent text-xs"
                            />
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Technician:{" "}
                          {booking.technician?.user?.name || "N/A"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateTime(booking.scheduledAt)}
                        </p>
                        {booking.service && (
                          <p className="mt-1 text-sm font-medium text-primary">
                            {formatCurrency(booking.service.price)}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      {!booking.id.startsWith("_") && (
                        <div
                          className="flex shrink-0 gap-2"
                          onClick={(e) => e.preventDefault()}
                        >
                          {canPay(booking.status) && (
                            <Button
                              size="sm"
                              disabled={payingId === booking.id}
                              onClick={() => handlePayNow(booking.id)}
                            >
                              {payingId === booking.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <DollarSign className="h-3 w-3" />
                              )}
                              Pay Now
                            </Button>
                          )}
                          {canReview(
                            booking.status,
                            booking.payment?.status
                          ) && (
                            <Button
                              size="sm"
                              variant="secondary"
                              asChild
                            >
                              <Link href={`/reviews`}>
                                <Star className="h-3 w-3" />
                                Review
                              </Link>
                            </Button>
                          )}
                          {canCancel(booking.status) && (
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={isCancelling(booking.id)}
                              onClick={() => handleCancel(booking.id)}
                            >
                              {isCancelling(booking.id) ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <XCircle className="h-3 w-3" />
                              )}
                              Cancel
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  );
}