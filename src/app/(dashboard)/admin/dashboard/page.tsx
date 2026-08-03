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
} from "lucide-react";
import { adminApi } from "@/lib/api";
import type { DashboardData, Booking } from "@/lib/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSkeleton, PageHeader, StatusBadge } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await adminApi.dashboard();
        setData(res.data);
      } catch {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const statCards = [
    {
      label: "Total Users",
      value: data?.stats.totalUsers ?? 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      label: "Total Technicians",
      value: data?.stats.totalTechnicians ?? 0,
      icon: Wrench,
      color: "text-green-600",
      bg: "bg-green-100 dark:bg-green-900/30",
    },
    {
      label: "Total Bookings",
      value: data?.stats.totalBookings ?? 0,
      icon: CalendarCheck,
      color: "text-purple-600",
      bg: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      label: "Total Revenue",
      value: formatCurrency(data?.stats.totalRevenue ?? 0),
      icon: DollarSign,
      color: "text-amber-600",
      bg: "bg-amber-100 dark:bg-amber-900/30",
    },
    {
      label: "Pending Bookings",
      value: data?.stats.pendingBookings ?? 0,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-100 dark:bg-yellow-900/30",
    },
    {
      label: "Active Technicians",
      value: data?.stats.activeTechnicians ?? 0,
      icon: UserCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-100 dark:bg-emerald-900/30",
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <PageHeader title="Admin Dashboard" description="Overview of the platform" />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
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
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
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
                        Date
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
                          {formatDateTime(booking.scheduledAt)}
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
