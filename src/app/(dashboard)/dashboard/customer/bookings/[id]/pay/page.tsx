"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CreditCard,
  ShieldCheck,
  Wrench,
  User,
  Calendar,
  MapPin,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Landmark,
  Smartphone,
} from "lucide-react";
import { paymentApi, bookingApi } from "@/lib/api";
import { useBookingDetail } from "@/lib/hooks";
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
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatCurrency, formatDate } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

interface ProviderOption {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
}

const PROVIDERS: ProviderOption[] = [
  {
    id: "sslcommerz",
    name: "SSLCommerz",
    description: "Cards, bKash, Nagad, Rocket & more — trusted local gateway",
    icon: Landmark,
  },
  {
    id: "mobile",
    name: "Mobile Banking",
    description: "Complete on the SSLCommerz page via bKash / Nagad / Rocket",
    icon: Smartphone,
  },
];

export default function BookingPaymentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const bookingId = params?.id || "";

  const { data: booking, isLoading, error } = useBookingDetail(bookingId);

  const [selectedProvider, setSelectedProvider] = useState(PROVIDERS[0].id);
  const [paying, setPaying] = useState(false);
  const [paymentState, setPaymentState] = useState<
    "idle" | "redirecting" | "checking" | "completed" | "failed"
  >("idle");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [checkedCount, setCheckedCount] = useState(0);

  const isEligible = booking?.status === "ACCEPTED";
  const alreadyCompleted = booking?.payment?.status === "COMPLETED";
  const amount = booking?.service?.price ?? 0;

  // If booking is already paid, show success immediately.
  useEffect(() => {
    if (booking && alreadyCompleted) {
      setPaymentState("completed");
    }
  }, [booking, alreadyCompleted]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handlePay = async () => {
    if (!booking || !isEligible) return;
    setPaying(true);
    setPaymentState("redirecting");
    try {
      const response = await paymentApi.create(booking.id);
      const gatewayUrl = response.data?.gatewayUrl;
      if (gatewayUrl) {
        // Show a brief redirecting state then go to the gateway.
        setTimeout(() => {
          window.location.href = gatewayUrl;
        }, 1200);
      } else {
        setPaymentState("checking");
        startPolling();
      }
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      setPaymentState("failed");
      toast.error(
        errorObj?.response?.data?.message ||
          errorObj?.message ||
          "Failed to initiate payment"
      );
    } finally {
      setPaying(false);
    }
  };

  // Poll the booking payment status to detect completion (e.g. after redirect).
  const startPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await bookingApi.getById(bookingId);
        const completed = res.data?.booking?.payment?.status === "COMPLETED";
        setCheckedCount((c) => c + 1);
        if (completed) {
          if (pollRef.current) clearInterval(pollRef.current);
          setPaymentState("completed");
        }
      } catch {
        setCheckedCount((c) => c + 1);
      }
    }, 3000);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="h-16 w-16 text-destructive" />
        <h2 className="mt-4 text-xl font-bold">Booking Not Found</h2>
        <p className="mt-2 text-muted-foreground">
          We couldn't find this booking. It may have been removed.
        </p>
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
      className="mx-auto max-w-2xl space-y-6"
    >
      <motion.div variants={itemVariants}>
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight">Payment</h1>
        <p className="mt-1 text-muted-foreground">
          Complete your payment to confirm this booking
        </p>
      </motion.div>

      {/* Success state */}
      {paymentState === "completed" || alreadyCompleted ? (
        <motion.div variants={itemVariants}>
          <Card className="border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-900/10">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="h-16 w-16 text-emerald-500" />
              <h2 className="mt-4 text-2xl font-bold">Payment Successful!</h2>
              <p className="mt-2 text-muted-foreground max-w-sm">
                Your booking has been confirmed. The technician will contact you
                shortly.
              </p>
              <div className="mt-6 flex gap-3">
                <Button asChild>
                  <Link href={`/bookings/${booking.id}`}>View Booking</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/customer">Go to Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          {/* Booking summary */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
                <CardDescription>Review your booking details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Wrench className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {booking.service?.title || "Service"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.technician?.user?.name || "Technician"}
                      </p>
                    </div>
                  </div>
                  <BookingStatusBadge status={booking.status} />
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Scheduled</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(booking.scheduledAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.address || "N/A"}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Amount Due</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(amount)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Provider selection */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Choose how you'd like to pay</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {PROVIDERS.map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => setSelectedProvider(provider.id)}
                    disabled={!isEligible}
                    className={cn(
                      "flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-colors",
                      selectedProvider === provider.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/40",
                      !isEligible && "cursor-not-allowed opacity-50"
                    )}
                  >
                    <provider.icon className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{provider.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {provider.description}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0 rounded-full border-2",
                        selectedProvider === provider.id
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/30"
                      )}
                    />
                  </button>
                ))}

                {!isEligible && booking.status !== "ACCEPTED" && (
                  <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    This booking is not ready for payment. Only &quot;Accepted&quot;
                    bookings can be paid.
                  </div>
                )}

                {/* Pay Button */}
                <Button
                  size="lg"
                  className="w-full gap-2"
                  disabled={!isEligible || paying || paymentState === "redirecting" || paymentState === "checking"}
                  onClick={handlePay}
                >
                  {paymentState === "redirecting" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Redirecting to
                      secure payment...
                    </>
                  ) : paymentState === "checking" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Checking
                      payment status...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" /> Pay{" "}
                      {formatCurrency(amount)}
                    </>
                  )}
                </Button>

                {paymentState === "checking" && (
                  <p className="text-center text-xs text-muted-foreground">
                    Checked {checkedCount} time{checkedCount === 1 ? "" : "s"}…
                    still waiting for confirmation.
                  </p>
                )}

                {paymentState === "failed" && (
                  <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    Payment initiation failed. Please try again.
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Secured by SSLCommerz. Your payment info is encrypted.
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
