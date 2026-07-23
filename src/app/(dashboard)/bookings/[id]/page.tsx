"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  FileText,
  User,
  Wrench,
  DollarSign,
  CreditCard,
  Star,
  XCircle,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { bookingApi, paymentApi, reviewApi } from "@/lib/api";
import type { Booking } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  formatDate,
  formatDateTime,
  getStatusColor,
  formatCurrency,
} from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const STATUS_ORDER: string[] = [
  "REQUESTED",
  "ACCEPTED",
  "PAID",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [paying, setPaying] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await bookingApi.getById(id);
        setBooking(response.data?.booking ?? null);
      } catch (err: unknown) {
        const errorObj = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        setError(
          errorObj?.response?.data?.message ||
            errorObj?.message ||
            "Failed to load booking details"
        );
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBooking();
  }, [id]);

  const handleCancel = async () => {
    if (!booking) return;
    setCancelling(true);
    try {
      await bookingApi.cancel(booking.id);
      toast.success("Booking cancelled successfully");
      const response = await bookingApi.getById(id);
      setBooking(response.data?.booking ?? null);
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        errorObj?.response?.data?.message ||
          errorObj?.message ||
          "Failed to cancel booking"
      );
    } finally {
      setCancelling(false);
    }
  };

  const handlePayNow = async () => {
    if (!booking) return;
    setPaying(true);
    try {
      const response = await paymentApi.create(booking.id);
      if (response.data?.gatewayUrl) {
        window.location.href = response.data.gatewayUrl;
      } else {
        toast.success("Payment initiated");
        const refresh = await bookingApi.getById(id);
        setBooking(refresh.data?.booking ?? null);
      }
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        errorObj?.response?.data?.message ||
          errorObj?.message ||
          "Failed to initiate payment"
      );
    } finally {
      setPaying(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!booking || reviewRating === 0) return;
    setReviewSubmitting(true);
    try {
      await reviewApi.create({
        bookingId: booking.id,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      toast.success("Review submitted successfully");
      setReviewDialogOpen(false);
      setReviewRating(0);
      setReviewComment("");
      const response = await bookingApi.getById(id);
      setBooking(response.data?.booking ?? null);
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        errorObj?.response?.data?.message ||
          errorObj?.message ||
          "Failed to submit review"
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const canCancel = booking && ["REQUESTED", "ACCEPTED"].includes(booking.status);
  const canPay = booking?.status === "ACCEPTED";
  const isCompleted = booking?.status === "COMPLETED";
  const paymentStatus = booking?.payment?.status;

  // Build timeline events
  const timelineEvents: { status: string; date: string; label: string }[] = [];
  if (booking) {
    timelineEvents.push({
      status: "REQUESTED",
      date: booking.createdAt,
      label: "Booking Requested",
    });
    if (
      ["ACCEPTED", "PAID", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(
        booking.status
      )
    ) {
      timelineEvents.push({
        status: booking.status === "CANCELLED" ? "CANCELLED" : "ACCEPTED",
        date: booking.updatedAt,
        label:
          booking.status === "CANCELLED" ? "Booking Cancelled" : "Booking Accepted",
      });
    }
    if (booking.payment?.paidAt) {
      timelineEvents.push({
        status: "PAID",
        date: booking.payment.paidAt,
        label: "Payment Completed",
      });
    }
    if (booking.status === "COMPLETED") {
      timelineEvents.push({
        status: "COMPLETED",
        date: booking.updatedAt,
        label: "Service Completed",
      });
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="h-16 w-16 text-destructive" />
        <h2 className="mt-4 text-xl font-bold">Booking Not Found</h2>
        <p className="mt-2 text-muted-foreground">{error || "This booking doesn't exist."}</p>
        <Button asChild className="mt-6">
          <Link href="/bookings">Back to Bookings</Link>
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Back Button */}
      <motion.div variants={itemVariants}>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/bookings">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bookings
          </Link>
        </Button>
      </motion.div>

      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {booking.service?.title || "Service Booking"}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge className={getStatusColor(booking.status)}>
              {booking.status}
            </Badge>
            {booking.payment && (
              <Badge className={getStatusColor(booking.payment.status)} variant="outline">
                Payment: {booking.payment.status}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {canPay && (
            <Button disabled={paying} onClick={handlePayNow}>
              {paying ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <DollarSign className="mr-2 h-4 w-4" />
              )}
              Pay Now
            </Button>
          )}
          {canCancel && (
            <Button
              variant="destructive"
              disabled={cancelling}
              onClick={handleCancel}
            >
              {cancelling ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              Cancel Booking
            </Button>
          )}
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <motion.div variants={itemVariants} className="space-y-6 lg:col-span-2">
          {/* Service & Technician Info */}
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Wrench className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Service</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.service?.title || "N/A"}
                  </p>
                  {booking.service?.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {booking.service.description}
                    </p>
                  )}
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <User className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Technician</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.technician?.user?.name || "N/A"}
                  </p>
                  {booking.technician?.location && (
                    <p className="text-sm text-muted-foreground">
                      {booking.technician.location}
                    </p>
                  )}
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Scheduled At</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(booking.scheduledAt)}
                  </p>
                  {booking.service?.durationMins && (
                    <p className="text-sm text-muted-foreground">
                      Duration: ~{booking.service.durationMins} mins
                    </p>
                  )}
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.address || "N/A"}
                  </p>
                </div>
              </div>
              {booking.notes && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Notes</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.notes}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payment Section */}
          {booking.payment && (
            <Card>
              <CardHeader>
                <CardTitle>Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <DollarSign className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Amount</p>
                    <p className="text-lg font-semibold text-primary">
                      {formatCurrency(booking.payment.amount)}
                    </p>
                  </div>
                </div>
                {booking.payment.method && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <CreditCard className="mt-0.5 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Payment Method</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.payment.method}
                        </p>
                      </div>
                    </div>
                  </>
                )}
                {booking.payment.transactionId && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Transaction ID</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.payment.transactionId}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Review Section */}
          {isCompleted && (
            <Card>
              <CardHeader>
                <CardTitle>Leave a Review</CardTitle>
                <CardDescription>
                  Share your experience with this service
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setReviewDialogOpen(true)}>
                  <Star className="mr-2 h-4 w-4" />
                  Write a Review
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Timeline Sidebar */}
        <motion.div variants={itemVariants} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {timelineEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No timeline events yet.
                </p>
              ) : (
                <div className="relative space-y-0">
                  {timelineEvents.map((event, idx) => (
                    <div key={idx} className="flex gap-3 pb-6 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-3 w-3 rounded-full border-2 ${
                            idx === timelineEvents.length - 1
                              ? "border-primary bg-primary"
                              : "border-muted-foreground/30 bg-background"
                          }`}
                        />
                        {idx < timelineEvents.length - 1 && (
                          <div className="mt-1 h-full w-px bg-border" />
                        )}
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className="text-sm font-medium">{event.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(event.date)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <DialogHeader>
              <DialogTitle>Write a Review</DialogTitle>
              <DialogDescription>
                Share your experience with this service
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Star Rating */}
              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="transition-colors hover:text-yellow-500"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= reviewRating
                            ? "fill-yellow-500 text-yellow-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              {/* Comment */}
              <div className="space-y-2">
                <Label htmlFor="comment">Comment (optional)</Label>
                <Textarea
                  id="comment"
                  placeholder="Tell us about your experience..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setReviewDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={reviewRating === 0 || reviewSubmitting}
                onClick={handleSubmitReview}
              >
                {reviewSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Review"
                )}
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>
  );
}
