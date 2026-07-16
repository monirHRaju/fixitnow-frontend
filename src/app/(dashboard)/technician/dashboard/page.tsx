"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  Clock,
  Star,
  Wrench,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { technicianApi, bookingApi } from "@/lib/api";
import type { Booking } from "@/lib/types";
import { formatDateTime, getStatusColor, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface TechnicianStats {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  avgRating: number | null;
}

export default function TechnicianDashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<TechnicianStats | null>(null);
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [bookingsRes] = await Promise.all([
          technicianApi.getBookings({ limit: "20" }),
        ]);

        const allBookings = bookingsRes.data.bookings || [];
        const total = allBookings.length;
        const pending = allBookings.filter(
          (b) => b.status === "REQUESTED" || b.status === "ACCEPTED" || b.status === "PAID"
        ).length;
        const completed = allBookings.filter(
          (b) => b.status === "COMPLETED"
        ).length;

        const now = new Date();
        const upcoming = allBookings
          .filter(
            (b) =>
              b.status !== "CANCELLED" &&
              b.status !== "DECLINED" &&
              b.status !== "COMPLETED" &&
              new Date(b.scheduledAt) >= now
          )
          .sort(
            (a, b) =>
              new Date(a.scheduledAt).getTime() -
              new Date(b.scheduledAt).getTime()
          )
          .slice(0, 5);

        setStats({
          totalBookings: total,
          pendingBookings: pending,
          completedBookings: completed,
          avgRating: null,
        });
        setUpcomingBookings(upcoming);
      } catch {
        // Silently handle
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const quickActions = [
    {
      label: "Manage Services",
      href: "/technician/services",
      icon: Wrench,
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Set Availability",
      href: "/technician/availability",
      icon: Calendar,
      color: "text-green-600 bg-green-100 dark:bg-green-900/30",
    },
    {
      label: "View Bookings",
      href: "/technician/bookings",
      icon: CalendarCheck,
      color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
    },
  ];

  const statCards = [
    {
      label: "Total Bookings",
      value: stats?.totalBookings ?? 0,
      icon: CalendarCheck,
      color: "text-blue-600",
    },
    {
      label: "Pending",
      value: stats?.pendingBookings ?? 0,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      label: "Completed",
      value: stats?.completedBookings ?? 0,
      icon: CalendarCheck,
      color: "text-green-600",
    },
    {
      label: "Avg Rating",
      value: stats?.avgRating ? stats.avgRating.toFixed(1) : "—",
      icon: Star,
      color: "text-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user?.name?.split(" ")[0] || "Technician"}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here&apos;s an overview of your activity
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-4 sm:p-6">
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {stat.label}
                      </p>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href}>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-3 h-auto py-3"
                  >
                    <div className={cn("rounded-lg p-2", action.color)}>
                      <action.icon className="h-4 w-4" />
                    </div>
                    <span>{action.label}</span>
                    <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground" />
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Today's Upcoming Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : upcomingBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No upcoming bookings. When you receive new bookings, they will
                appear here.
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.map((booking, i) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">
                        {booking.service.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{booking.customer?.name}</span>
                        <span>•</span>
                        <span>{formatDateTime(booking.scheduledAt)}</span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status.replace("_", " ")}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
