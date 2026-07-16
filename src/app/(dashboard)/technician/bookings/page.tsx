"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Check,
  X,
  Play,
  CheckCircle2,
  Phone,
  MapPin,
  Calendar,
} from "lucide-react";
import { technicianApi } from "@/lib/api";
import type { Booking } from "@/lib/types";
import { formatDateTime, formatCurrency, getStatusColor } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "REQUESTED", label: "Requested" },
  { value: "ACCEPTED", label: "Accepted" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
];

export default function TechnicianBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (activeTab !== "all") {
        params.status = activeTab;
      }
      const res = await technicianApi.getBookings(params);
      setBookings(res.data.bookings || []);
    } catch {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  async function handleStatusUpdate(
    bookingId: string,
    status: string
  ) {
    setActionLoading(bookingId);
    try {
      await technicianApi.updateBookingStatus(bookingId, status);
      toast.success(`Booking ${status.toLowerCase().replace("_", " ")}`);
      fetchBookings();
    } catch {
      toast.error("Failed to update booking status");
    } finally {
      setActionLoading(null);
    }
  }

  function renderActions(booking: Booking) {
    const actions: React.ReactNode[] = [];

    if (booking.status === "REQUESTED") {
      actions.push(
        <Button
          key="accept"
          size="sm"
          onClick={() => handleStatusUpdate(booking.id, "ACCEPTED")}
          disabled={actionLoading === booking.id}
        >
          <Check className="h-3.5 w-3.5 mr-1" />
          Accept
        </Button>,
        <Button
          key="decline"
          size="sm"
          variant="outline"
          className="text-destructive border-destructive hover:bg-destructive/10"
          onClick={() => handleStatusUpdate(booking.id, "DECLINED")}
          disabled={actionLoading === booking.id}
        >
          <X className="h-3.5 w-3.5 mr-1" />
          Decline
        </Button>
      );
    }

    if (
      booking.status === "ACCEPTED" ||
      booking.status === "PAID"
    ) {
      actions.push(
        <Button
          key="start"
          size="sm"
          onClick={() => handleStatusUpdate(booking.id, "IN_PROGRESS")}
          disabled={actionLoading === booking.id}
        >
          <Play className="h-3.5 w-3.5 mr-1" />
          Start
        </Button>
      );
    }

    if (booking.status === "IN_PROGRESS") {
      actions.push(
        <Button
          key="complete"
          size="sm"
          onClick={() => handleStatusUpdate(booking.id, "COMPLETED")}
          disabled={actionLoading === booking.id}
        >
          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
          Complete
        </Button>
      );
    }

    return actions.length > 0 ? (
      <div className="flex items-center gap-2 mt-3">{actions}</div>
    ) : null;
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          View and manage incoming booking requests
        </p>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto">
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-28 w-full" />
              ))}
            </div>
          ) : bookings.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">
                  No bookings found
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking, i) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card>
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-base truncate">
                              {booking.service.title}
                            </h3>
                            <Badge
                              className={getStatusColor(booking.status)}
                            >
                              {booking.status.replace("_", " ")}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <span className="font-medium text-foreground">
                                {booking.customer?.name || "Customer"}
                              </span>
                            </span>
                            {booking.customer?.phone && (
                              <span className="flex items-center gap-1.5">
                                <Phone className="h-3.5 w-3.5" />
                                {booking.customer.phone}
                              </span>
                            )}
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDateTime(booking.scheduledAt)}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5" />
                              {booking.address}
                            </span>
                          </div>

                          {booking.notes && (
                            <p className="text-sm text-muted-foreground italic mt-1">
                              Note: {booking.notes}
                            </p>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold">
                            {formatCurrency(booking.service.price)}
                          </p>
                        </div>
                      </div>

                      {renderActions(booking)}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
