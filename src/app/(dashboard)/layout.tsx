"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import Header from "@/components/layout/Header";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Auth guard: redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  // Role-based redirect: if user is on wrong role section, redirect to their dashboard
  const isAdminRoute = pathname.startsWith("/admin");
  const isTechnicianRoute = pathname.startsWith("/technician");
  const isCustomerRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/bookings") || pathname.startsWith("/payments") || pathname.startsWith("/reviews") || pathname.startsWith("/profile");

  useEffect(() => {
    if (!user || isLoading) return;
    if (isAdminRoute && user.role !== "ADMIN") {
      router.push("/dashboard");
    } else if (isTechnicianRoute && user.role !== "TECHNICIAN") {
      router.push("/dashboard");
    } else if (isCustomerRoute && !isAdminRoute && !isTechnicianRoute && user.role !== "CUSTOMER") {
      router.push("/dashboard");
    }
  }, [isAdminRoute, isTechnicianRoute, isCustomerRoute, user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden p-4 pb-20 md:p-6 md:pb-6 lg:p-8">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}