"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, Eye } from "lucide-react";
import { adminApi } from "@/lib/api";
import type { Booking } from "@/lib/types";
import {
  formatCurrency,
  formatDateTime,
} from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState, LoadingSkeleton, PageHeader, StatusBadge } from "@/components/shared";
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
  { value: "REQUESTED", label: "Requested" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "DECLINED", label: "Declined" },
  { value: "PAID", label: "Paid" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const fetchBookings = useCallback(
    async (page: number = 1) => {
      setLoading(true);
      try {
        const params: Record<string, string> = {
          page: String(page),
          limit: "10",
        };
        if (statusFilter !== "all") {
          params.status = statusFilter;
        }
        const res = await adminApi.listBookings(params);
        setBookings(res.data.bookings || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      } catch {
        toast.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    },
    [statusFilter]
  );

  useEffect(() => {
    fetchBookings(1);
  }, [fetchBookings]);

  function handlePageChange(page: number) {
    if (page < 1 || page > pagination.totalPages) return;
    fetchBookings(page);
  }

  function handleExport() {
    if (bookings.length === 0) {
      toast.info("No bookings to export");
      return;
    }
    const headers = [
      "ID",
      "Customer",
      "Customer Email",
      "Technician",
      "Service",
      "Price",
      "Status",
      "Payment Status",
      "Scheduled At",
      "Address",
    ];
    const rows = bookings.map((b) => [
      b.id,
      b.customer?.name || "",
      b.customer?.email || "",
      b.technician?.user?.name || "",
      b.service.title,
      (b.service.price / 100).toFixed(2),
      b.status,
      b.payment?.status || "",
      new Date(b.scheduledAt).toISOString(),
      b.address,
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Exported ${bookings.length} bookings`);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Bookings" description="View all bookings across the platform" />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
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
        <Button variant="outline" className="gap-2 ml-auto" onClick={handleExport}>
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <LoadingSkeleton count={5} />
          ) : bookings.length === 0 ? (
            <EmptyState compact title="No bookings found" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left font-medium text-muted-foreground py-3 px-4">
                      Customer
                    </th>
                    <th className="text-left font-medium text-muted-foreground py-3 px-4 hidden sm:table-cell">
                      Technician
                    </th>
                    <th className="text-left font-medium text-muted-foreground py-3 px-4">
                      Service
                    </th>
                    <th className="text-right font-medium text-muted-foreground py-3 px-4">
                      Price
                    </th>
                    <th className="text-left font-medium text-muted-foreground py-3 px-4">
                      Status
                    </th>
                    <th className="text-left font-medium text-muted-foreground py-3 px-4 hidden md:table-cell">
                      Date
                    </th>
                    <th className="text-left font-medium text-muted-foreground py-3 px-4 hidden lg:table-cell">
                      Payment
                    </th>
                    <th className="text-right font-medium text-muted-foreground py-3 px-4">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking, i) => (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium">
                          {booking.customer?.name || "N/A"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">
                        {booking.technician?.user?.name || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {booking.service.title}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(booking.service.price)}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">
                        {formatDateTime(booking.scheduledAt)}
                      </td>
                      <td className="py-3 px-4 hidden lg:table-cell">
                        {booking.payment ? (
                          <StatusBadge status={booking.payment.status} />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/admin/bookings/${booking.id}`}
                          className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </Link>
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
