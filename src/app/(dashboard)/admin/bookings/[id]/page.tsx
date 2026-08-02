"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Clock,
  User,
  Wrench,
  CreditCard,
  StickyNote,
  Save,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { adminApi } from "@/lib/api";
import type { Booking } from "@/lib/types";
import { formatCurrency, formatDateTime, getStatusColor, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const BOOKING_STATUSES = [
  "REQUESTED",
  "ACCEPTED",
  "DECLINED",
  "PAID",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];
const PAYMENT_STATUSES = ["PENDING", "COMPLETED", "FAILED"];

export default function AdminBookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [notesDirty, setNotesDirty] = useState(false);

  async function loadBooking() {
    try {
      const res = await adminApi.getBookingById(id);
      const b = res.data.booking;
      setBooking(b);
      setNotes(b.notes ?? "");
      setNotesDirty(false);
    } catch {
      toast.error("Failed to load booking");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleStatusChange(status: string) {
    if (!booking) return;
    setUpdatingStatus(true);
    try {
      const res = await adminApi.updateBookingStatus(booking.id, { status });
      setBooking(res.data.booking);
      toast.success(`Status updated to ${status.replace("_", " ")}`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handlePaymentOverride(status: string) {
    if (!booking) return;
    setUpdatingPayment(true);
    try {
      const res = await adminApi.overridePaymentStatus(booking.id, status);
      await loadBooking();
      toast.success(`Payment set to ${status}`);
    } catch {
      toast.error("Failed to override payment");
    } finally {
      setUpdatingPayment(false);
    }
  }

  async function handleSaveNotes() {
    if (!booking) return;
    setSavingNotes(true);
    try {
      const res = await adminApi.updateBookingNotes(booking.id, notes);
      setBooking(res.data.booking);
      setNotesDirty(false);
      toast.success("Notes saved");
    } catch {
      toast.error("Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 w-full lg:col-span-2" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Booking not found.</p>
        <Link href="/admin/bookings">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Bookings
          </Button>
        </Link>
      </div>
    );
  }

  const payment = booking.payment;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Bookings
          </Link>
          <h1 className="text-2xl font-bold tracking-tight mt-1">
            Booking #{booking.id.slice(-6).toUpperCase()}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={getStatusColor(booking.status)}>
              {booking.status.replace("_", " ")}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formatDateTime(booking.scheduledAt)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={booking.status}
            onValueChange={(v) => handleStatusChange(v)}
            disabled={updatingStatus}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Override status" />
            </SelectTrigger>
            <SelectContent>
              {BOOKING_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "CANCELLED" ? "Cancel Booking" : `Set: ${s.replace("_", " ")}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {booking.status !== "CANCELLED" && (
            <Button
              variant="outline"
              className="gap-2 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/40"
              onClick={() => handleStatusChange("CANCELLED")}
              disabled={updatingStatus}
            >
              <XCircle className="h-4 w-4" /> Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: summary + parties */}
        <div className="space-y-6 lg:col-span-2">
          {/* Booking Summary */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-blue-600" /> Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{booking.service.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {booking.service.description || "No description"}
                    </p>
                  </div>
                  <p className="text-xl font-bold text-emerald-600">
                    {formatCurrency(booking.service.price)}
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>
                      Scheduled: {formatDateTime(booking.scheduledAt)}
                      {booking.service.durationMins
                        ? ` · ${booking.service.durationMins} min`
                        : ""}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{booking.address}</span>
                  </div>
                  {booking.notes && booking.notes.length > 0 && (
                    <div className="flex items-start gap-2 text-muted-foreground sm:col-span-2">
                      <StickyNote className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>Customer note: {booking.notes}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Customer + Technician */}
          <div className="grid gap-6 sm:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" /> Customer
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p className="font-semibold">{booking.customer?.name || "N/A"}</p>
                  {booking.customer?.email && (
                    <p className="text-muted-foreground">{booking.customer.email}</p>
                  )}
                  {booking.customer?.phone && (
                    <p className="text-muted-foreground">{booking.customer.phone}</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-green-600" /> Technician
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p className="font-semibold">
                    {booking.technician?.user?.name || "N/A"}
                  </p>
                  {booking.technician?.location && (
                    <p className="text-muted-foreground">
                      {booking.technician.location}
                    </p>
                  )}
                  {booking.technician?.user?.email && (
                    <p className="text-muted-foreground">
                      {booking.technician.user.email}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Right column: payment + notes */}
        <div className="space-y-6">
          {/* Payment */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-purple-600" /> Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {payment ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Amount</span>
                      <span className="font-semibold">
                        {formatCurrency(payment.amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Provider</span>
                      <span className="capitalize">{payment.provider || "—"}</span>
                    </div>
                    {payment.transactionId && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Txn ID</span>
                        <span className="truncate ml-2">{payment.transactionId}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No payment record yet.
                  </p>
                )}
                <div className="pt-2 border-t border-border">
                  <p className="text-xs font-semibold mb-2 text-muted-foreground">
                    Override payment status (troubleshooting)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PAYMENT_STATUSES.map((s) => (
                      <Button
                        key={s}
                        size="sm"
                        variant="outline"
                        className={cn(
                          "gap-1.5",
                          payment?.status === s
                            ? "border-primary bg-primary/10 text-primary"
                            : ""
                        )}
                        onClick={() => handlePaymentOverride(s)}
                        disabled={updatingPayment}
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Admin Notes */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <StickyNote className="h-5 w-5 text-amber-600" /> Admin Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    setNotesDirty(true);
                  }}
                  placeholder="Add internal notes about this booking..."
                  rows={4}
                />
                <Button
                  onClick={handleSaveNotes}
                  disabled={!notesDirty || savingNotes}
                  className="gap-2 w-full"
                >
                  <Save className="h-4 w-4" />
                  {savingNotes ? "Saving..." : "Save Notes"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
