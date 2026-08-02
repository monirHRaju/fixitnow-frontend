"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  Clock,
  Star,
  Wrench,
  Calendar,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Banknote,
  Bell,
  Sun,
  SunDim,
  MoonStar,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { technicianApi } from "@/lib/api";
import type { Booking } from "@/lib/types";
import { formatDateTime, formatCurrency, getStatusColor, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface TechnicianStats {
  totalBookings: number;
  pendingBookings: number;
  requestedBookings: number;
  completedBookings: number;
  avgRating: number | null;
  totalEarnings: number;
  totalEarningsLastWeek: number;
  completedThisWeek: number;
  completedLastWeek: number;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function startOfWeek(d: Date): Date {
  const copy = new Date(d);
  const day = (copy.getDay() + 6) % 7; // Monday = 0
  copy.setHours(0, 0, 0, 0);
  copy.setDate(copy.getDate() - day);
  return copy;
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export default function TechnicianDashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<TechnicianStats | null>(null);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await technicianApi.getBookings({ limit: "100" });
        const bookings = res.data.bookings || [];
        setAllBookings(bookings);

        const total = bookings.length;
        const pending = bookings.filter(
          (b) => b.status === "REQUESTED" || b.status === "ACCEPTED" || b.status === "PAID"
        ).length;
        const requested = bookings.filter((b) => b.status === "REQUESTED").length;
        const completed = bookings.filter((b) => b.status === "COMPLETED");
        const completedCount = completed.length;

        const totalEarnings = completed.reduce(
          (sum, b) => sum + (b.payment?.amount ?? b.service.price ?? 0),
          0
        );

        const thisWeekStart = startOfWeek(new Date());
        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);

        const completedThisWeek = completed.filter(
          (b) => new Date(b.updatedAt) >= thisWeekStart
        ).length;
        const completedLastWeek = completed.filter(
          (b) => {
            const t = new Date(b.updatedAt);
            return t >= lastWeekStart && t < thisWeekStart;
          }
        ).length;

        const totalEarningsLastWeek = bookings
          .filter((b) => {
            const t = new Date(b.updatedAt);
            return t >= lastWeekStart && t < thisWeekStart;
          })
          .reduce(
            (sum, b) =>
              sum + (b.status === "COMPLETED" ? b.payment?.amount ?? b.service.price ?? 0 : 0),
            0
          );

        setStats({
          totalBookings: total,
          pendingBookings: pending,
          requestedBookings: requested,
          completedBookings: completedCount,
          avgRating: null,
          totalEarnings,
          totalEarningsLastWeek,
          completedThisWeek,
          completedLastWeek,
        });
      } catch {
        // Silently handle
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Weekly completion chart data (last 7 days)
  const weeklyData = useMemo(() => {
    const now = new Date();
    const days: { label: string; count: number; isToday: boolean }[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(now.getDate() - i);
      const dayStart = startOfDay(day);
      const nextDay = new Date(dayStart);
      nextDay.setDate(nextDay.getDate() + 1);
      const count = allBookings.filter(
        (b) =>
          b.status === "COMPLETED" &&
          new Date(b.updatedAt) >= dayStart &&
          new Date(b.updatedAt) < nextDay
      ).length;
      days.push({
        label: DAY_LABELS[(day.getDay() + 6) % 7],
        count,
        isToday: i === 0,
      });
    }
    const max = Math.max(1, ...days.map((d) => d.count));
    return { days, max };
  }, [allBookings]);

  // Today's schedule grouped by time of day
  const todaySchedule = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const tomorrow = new Date(todayStart);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todays = allBookings
      .filter((b) => {
        const t = new Date(b.scheduledAt);
        return (
          b.status !== "CANCELLED" &&
          b.status !== "DECLINED" &&
          t >= todayStart &&
          t < tomorrow
        );
      })
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

    const groups: Record<string, Booking[]> = {
      morning: [],
      afternoon: [],
      evening: [],
    };
    todays.forEach((b) => {
      const hour = new Date(b.scheduledAt).getHours();
      if (hour < 12) groups.morning.push(b);
      else if (hour < 17) groups.afternoon.push(b);
      else groups.evening.push(b);
    });

    const groupMeta = [
      { key: "morning", label: "Morning", icon: Sun, hint: "Before 12 PM" },
      { key: "afternoon", label: "Afternoon", icon: SunDim, hint: "12 PM – 5 PM" },
      { key: "evening", label: "Evening", icon: MoonStar, hint: "After 5 PM" },
    ];
    return { groups, groupMeta, isEmpty: todays.length === 0 };
  }, [allBookings]);

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

  const earningsDelta =
    stats && stats.totalEarningsLastWeek > 0
      ? ((stats.totalEarnings - stats.totalEarningsLastWeek) / stats.totalEarningsLastWeek) * 100
      : stats && stats.totalEarnings > 0
      ? 100
      : 0;
  const jobsDelta =
    stats && stats.completedLastWeek > 0
      ? ((stats.completedThisWeek - stats.completedLastWeek) / stats.completedLastWeek) * 100
      : stats && stats.completedThisWeek > 0
      ? 100
      : 0;

  const statCards = [
    {
      label: "Total Earnings",
      value: stats ? formatCurrency(stats.totalEarnings) : "৳0",
      icon: Banknote,
      color: "text-emerald-600",
      sub: (
        <span className="mt-1 flex items-center gap-1 text-xs font-medium">
          {earningsDelta >= 0 ? (
            <TrendingUp className="h-3 w-3 text-emerald-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
          <span className={earningsDelta >= 0 ? "text-emerald-500" : "text-red-500"}>
            {earningsDelta.toFixed(0)}%
          </span>
          <span className="text-muted-foreground font-normal">vs last week</span>
        </span>
      ),
    },
    {
      label: "Jobs Completed",
      value: stats?.completedBookings ?? 0,
      icon: CalendarCheck,
      color: "text-green-600",
      sub: (
        <span className="mt-1 flex items-center gap-1 text-xs font-medium">
          {jobsDelta >= 0 ? (
            <TrendingUp className="h-3 w-3 text-emerald-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
          <span className={jobsDelta >= 0 ? "text-emerald-500" : "text-red-500"}>
            {jobsDelta.toFixed(0)}%
          </span>
          <span className="text-muted-foreground font-normal">this week</span>
        </span>
      ),
    },
    {
      label: "Pending Requests",
      value: stats?.pendingBookings ?? 0,
      icon: Bell,
      color: "text-yellow-600",
      badge: stats && stats.requestedBookings > 0 ? stats.requestedBookings : undefined,
      sub: (
        <span className="mt-1 text-xs text-muted-foreground font-normal">
          {stats?.requestedBookings ?? 0} awaiting your response
        </span>
      ),
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome back, {user?.name?.split(" ")[0] || "Technician"}
            </h1>
            <p className="text-muted-foreground mt-1">
              Here&apos;s an overview of your activity
            </p>
          </div>
          {stats && stats.requestedBookings > 0 && (
            <Link href="/technician/bookings">
              <Button
                variant="outline"
                className="gap-2 border-yellow-300 bg-yellow-50 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300"
              >
                <Bell className="h-4 w-4" />
                {stats.requestedBookings} New Request
                {stats.requestedBookings > 1 ? "s" : ""}
              </Button>
            </Link>
          )}
        </div>
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
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <div className="flex items-center gap-1.5">
                        {stat.badge && (
                          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-yellow-500 px-1.5 text-xs font-bold text-white">
                            {stat.badge}
                          </span>
                        )}
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                    </div>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>
                    {stat.sub}
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Weekly Chart + Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Weekly Job Completion Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.3 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Jobs Completed — Last 7 Days</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-6 w-full" />
                  ))}
                </div>
              ) : (
                <div className="flex items-end justify-between gap-2 sm:gap-4 h-40">
                  {weeklyData.days.map((day, i) => (
                    <div
                      key={i}
                      className="flex flex-1 flex-col items-center gap-2"
                      title={`${day.count} job${day.count === 1 ? "" : "s"}`}
                    >
                      <span className="text-xs font-semibold text-muted-foreground">
                        {day.count}
                      </span>
                      <div
                        className={cn(
                          "w-full max-w-10 rounded-t-md transition-all",
                          day.isToday
                            ? "bg-gradient-to-t from-emerald-500 to-emerald-400"
                            : "bg-blue-500/70 dark:bg-blue-600/60"
                        )}
                        style={{
                          height: `${Math.max(day.count > 0 ? 12 : 4, (day.count / weeklyData.max) * 100)}%`,
                        }}
                      />
                      <span
                        className={cn(
                          "text-xs",
                          day.isToday
                            ? "font-bold text-emerald-600"
                            : "text-muted-foreground"
                        )}
                      >
                        {day.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

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
              <div className="grid grid-cols-1 gap-3">
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
      </div>

      {/* Today's Schedule */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Today&apos;s Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : todaySchedule.isEmpty ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                You have no bookings scheduled for today.
              </p>
            ) : (
              <div className="space-y-5">
                {todaySchedule.groupMeta.map((group) => {
                  const items = todaySchedule.groups[group.key];
                  if (!items || items.length === 0) return null;
                  return (
                    <div key={group.key}>
                      <div className="flex items-center gap-2 mb-2">
                        <group.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-semibold">{group.label}</span>
                        <span className="text-xs text-muted-foreground">{group.hint}</span>
                      </div>
                      <div className="space-y-3">
                        {items.map((booking, i) => (
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
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
