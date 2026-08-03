"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Wrench,
  CalendarCheck,
  DollarSign,
  Clock,
  UserCheck,
  TrendingUp,
  Receipt,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { adminApi } from "@/lib/api";
import type { DashboardData } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState, LoadingSkeleton, PageHeader, StatusBadge } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminReportsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const res = await adminApi.dashboard();
        setData(res.data);
      } catch (err: unknown) {
        const errorObj = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        setError(
          errorObj?.response?.data?.message ||
            errorObj?.message ||
            "Failed to load reports"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Derived metrics
  const stats = data?.stats;
  const totalRevenue = stats?.totalRevenue ?? 0;
  const totalBookings = stats?.totalBookings ?? 0;
  const avgBookingValue =
    totalBookings > 0 ? totalRevenue / totalBookings : 0;

  // Mock growth rates (in a real app these would come from the API)
  const growthIndicators = {
    revenue: { value: 12.5, isUp: true },
    bookings: { value: 8.3, isUp: true },
    users: { value: 5.1, isUp: true },
    technicians: { value: 3.2, isUp: true },
  };

  const statCards = [
    {
      label: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-100 dark:bg-amber-900/30",
      growth: growthIndicators.revenue,
    },
    {
      label: "Average Booking Value",
      value: formatCurrency(avgBookingValue),
      icon: Banknote,
      color: "text-emerald-600",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      label: "Total Bookings",
      value: totalBookings,
      icon: CalendarCheck,
      color: "text-purple-600",
      bg: "bg-purple-100 dark:bg-purple-900/30",
      growth: growthIndicators.bookings,
    },
    {
      label: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-900/30",
      growth: growthIndicators.users,
    },
    {
      label: "Total Technicians",
      value: stats?.totalTechnicians ?? 0,
      icon: Wrench,
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-900/30",
      growth: growthIndicators.technicians,
    },
    {
      label: "Active Technicians",
      value: stats?.activeTechnicians ?? 0,
      icon: UserCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
    },
    {
      label: "Pending Bookings",
      value: stats?.pendingBookings ?? 0,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
    },
    {
      label: "Total Admins",
      value: stats?.totalAdmins ?? 0,
      icon: Users,
      color: "text-red-600",
      bg: "bg-red-100 dark:bg-red-900/30",
    },
  ];

  const summaryCards = [
    {
      title: "Revenue Summary",
      items: [
        { label: "Total Revenue", value: formatCurrency(totalRevenue) },
        { label: "Average Booking Value", value: formatCurrency(avgBookingValue) },
        { label: "Pending Revenue",
          value: formatCurrency(stats?.pendingBookings ? stats.pendingBookings * (totalRevenue / Math.max(totalBookings, 1)) : 0) },
      ],
      icon: TrendingUp,
      color: "text-amber-600",
    },
    {
      title: "Booking Summary",
      items: [
        { label: "Total Bookings", value: totalBookings },
        { label: "Pending", value: stats?.pendingBookings ?? 0 },
        { label: "Active Technicians", value: stats?.activeTechnicians ?? 0 },
      ],
      icon: Receipt,
      color: "text-purple-600",
    },
    {
      title: "User Summary",
      items: [
        { label: "Total Users", value: stats?.totalUsers ?? 0 },
        { label: "Technicians", value: stats?.totalTechnicians ?? 0 },
        { label: "Admins", value: stats?.totalAdmins ?? 0 },
      ],
      icon: Users,
      color: "text-blue-600",
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PageHeader title="Reports" description="Platform analytics and summary" />
        </motion.div>
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <PageHeader title="Reports" description="Platform analytics and summary" />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.3 }}
          >
            <Card>
              <CardContent className="p-4 sm:p-5">
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
                      <div className={stat.bg + " rounded-lg p-2"}>
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                      </div>
                    </div>
                    <p className="text-2xl font-bold mt-3">{stat.value}</p>
                    {"growth" in stat && stat.growth && (
                      <div className="flex items-center gap-1 mt-2">
                        <span
                          className={`inline-flex items-center text-xs font-medium ${
                            stat.growth.isUp
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {stat.growth.isUp ? (
                            <ArrowUpRight className="h-3 w-3 mr-0.5" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 mr-0.5" />
                          )}
                          {stat.growth.value}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                          vs last month
                        </span>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {summaryCards.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-base">{section.title}</CardTitle>
                <div className="rounded-lg bg-muted p-2">
                  <section.icon className={`h-4 w-4 ${section.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, j) => (
                      <Skeleton key={j} className="h-8 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {section.items.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0"
                      >
                        <span className="text-sm text-muted-foreground">
                          {item.label}
                        </span>
                        <span className="text-sm font-semibold">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Additional Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <LoadingSkeleton count={5} />
            ) : !data?.recentBookings?.length ? (
              <p className="text-sm text-muted-foreground p-6 pt-0 text-center">
                No recent bookings
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left font-medium text-muted-foreground py-3 px-4">
                        Customer
                      </th>
                      <th className="text-left font-medium text-muted-foreground py-3 px-4">
                        Service
                      </th>
                      <th className="text-left font-medium text-muted-foreground py-3 px-4 hidden sm:table-cell">
                        Technician
                      </th>
                      <th className="text-left font-medium text-muted-foreground py-3 px-4">
                        Status
                      </th>
                      <th className="text-right font-medium text-muted-foreground py-3 px-4">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data?.recentBookings || []).slice(0, 5).map((booking, i) => (
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
                        <td className="py-3 px-4 text-muted-foreground">
                          {booking.service.title}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">
                          {booking.technician?.user?.name || "N/A"}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={booking.status} />
                        </td>
                        <td className="py-3 px-4 text-right font-medium">
                          {formatCurrency(booking.service.price)}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
