"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CreditCard,
  Loader2,
  AlertCircle,
  ArrowRight,
  Receipt,
} from "lucide-react";
import { paymentApi } from "@/lib/api";
import type { Payment } from "@/lib/types";
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
import { formatDate, getStatusColor, formatCurrency } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await paymentApi.list();
        setPayments(response.data?.payments ?? []);
      } catch (err: unknown) {
        const errorObj = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        setError(
          errorObj?.response?.data?.message ||
            errorObj?.message ||
            "Failed to load payments"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const sortedPayments = [...payments].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
        <p className="mt-1 text-muted-foreground">
          View your payment history
        </p>
      </motion.div>

      {/* Payments List */}
      <motion.div variants={itemVariants} className="space-y-4">
        {loading ? (
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
              <p className="mt-4 text-sm text-muted-foreground">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : sortedPayments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Receipt className="h-16 w-16 text-muted-foreground/30" />
              <h3 className="mt-4 text-lg font-medium">No payments yet</h3>
              <p className="mt-1 text-sm text-muted-foreground text-center max-w-sm">
                You haven&apos;t made any payments yet. Payments appear here
                once you book and pay for a service.
              </p>
              <Button asChild className="mt-6">
                <Link href="/bookings">
                  View My Bookings
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Booking
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Method
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                    Transaction ID
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedPayments.map((payment) => (
                  <motion.tr
                    key={payment.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="transition-colors hover:bg-accent/50"
                  >
                    <td className="px-4 py-4">
                      <Link
                        href={`/bookings/${payment.bookingId}`}
                        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                      >
                        {payment.booking?.service?.title || `Booking #${payment.bookingId.slice(0, 8)}`}
                      </Link>
                      {payment.booking?.technician?.user?.name && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {payment.booking.technician.user.name}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground capitalize">
                      {payment.method || payment.provider || "N/A"}
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        className={getStatusColor(payment.status)}
                        variant={
                          payment.status === "COMPLETED"
                            ? "default"
                            : payment.status === "FAILED"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="px-4 py-4 text-xs text-muted-foreground font-mono">
                      {payment.transactionId || "—"}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
