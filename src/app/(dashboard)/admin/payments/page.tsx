"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { paymentApi } from "@/lib/api";
import type { Payment } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton, PageHeader, StatusBadge } from "@/components/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "PENDING", label: "Pending" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
];

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const fetchPayments = useCallback(
    async (page: number = 1) => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string> = {
          page: String(page),
          limit: "10",
        };
        if (statusFilter !== "all") {
          params.status = statusFilter;
        }
        const res = await paymentApi.list(params);
        setPayments(res.data.payments || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        } else {
          setPagination((prev) => ({
            ...prev,
            total: res.data.payments?.length || 0,
            totalPages: 1,
          }));
        }
      } catch (err: unknown) {
        const errorObj = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        const message =
          errorObj?.response?.data?.message ||
          errorObj?.message ||
          "Failed to load payments";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [statusFilter]
  );

  useEffect(() => {
    fetchPayments(1);
  }, [fetchPayments]);

  function handlePageChange(page: number) {
    if (page < 1 || page > pagination.totalPages) return;
    fetchPayments(page);
  }

  function truncateId(id: string): string {
    if (!id) return "—";
    return id.length > 12 ? `${id.slice(0, 8)}...` : id;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description="View all payment transactions across the platform" />

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <LoadingSkeleton count={5} />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-3" />
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => fetchPayments(1)}
              >
                Try Again
              </Button>
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                No payments found
              </p>
              {statusFilter !== "all" && (
                <p className="text-xs text-muted-foreground mt-1">
                  Try clearing the status filter
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left font-medium text-muted-foreground py-3 px-4">
                      Booking ID
                    </th>
                    <th className="text-right font-medium text-muted-foreground py-3 px-4">
                      Amount
                    </th>
                    <th className="text-left font-medium text-muted-foreground py-3 px-4 hidden sm:table-cell">
                      Method
                    </th>
                    <th className="text-left font-medium text-muted-foreground py-3 px-4 hidden md:table-cell">
                      Provider
                    </th>
                    <th className="text-left font-medium text-muted-foreground py-3 px-4">
                      Status
                    </th>
                    <th className="text-left font-medium text-muted-foreground py-3 px-4 hidden lg:table-cell">
                      Transaction ID
                    </th>
                    <th className="text-left font-medium text-muted-foreground py-3 px-4 hidden xl:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment, i) => (
                    <motion.tr
                      key={payment.id}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono text-xs">
                          {truncateId(payment.bookingId)}
                        </span>
                        {payment.booking?.service?.title && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {payment.booking.service.title}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground capitalize hidden sm:table-cell">
                        {payment.method || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">
                        {payment.provider || "N/A"}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge
                          status={payment.status}
                          variant={
                            payment.status === "COMPLETED"
                              ? "default"
                              : payment.status === "FAILED"
                              ? "destructive"
                              : "secondary"
                          }
                        />
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground font-mono hidden lg:table-cell">
                        {payment.transactionId || "—"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground hidden xl:table-cell">
                        {formatDate(payment.createdAt)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total}{" "}
            total)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
