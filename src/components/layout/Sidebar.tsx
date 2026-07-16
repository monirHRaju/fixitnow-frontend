"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Wrench,
  CalendarCheck,
  CreditCard,
  Star,
  Settings,
  Shield,
  Menu,
  X,
  BarChart3,
  Clock,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import type { UserRole } from "@/lib/types";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const customerNavItems: NavItem[] = [
  { href: "/customer/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/customer/bookings", label: "My Bookings", icon: <CalendarCheck className="h-4 w-4" /> },
  { href: "/customer/payments", label: "Payments", icon: <CreditCard className="h-4 w-4" /> },
  { href: "/customer/reviews", label: "My Reviews", icon: <Star className="h-4 w-4" /> },
  { href: "/profile", label: "Profile", icon: <Settings className="h-4 w-4" /> },
];

const technicianNavItems: NavItem[] = [
  { href: "/technician/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/technician/bookings", label: "Bookings", icon: <CalendarCheck className="h-4 w-4" /> },
  { href: "/technician/services", label: "My Services", icon: <Wrench className="h-4 w-4" /> },
  { href: "/technician/schedule", label: "Schedule", icon: <Clock className="h-4 w-4" /> },
  { href: "/technician/reviews", label: "Reviews", icon: <Star className="h-4 w-4" /> },
  { href: "/profile", label: "Profile", icon: <Settings className="h-4 w-4" /> },
];

const adminNavItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/admin/users", label: "Users", icon: <Users className="h-4 w-4" /> },
  { href: "/admin/technicians", label: "Technicians", icon: <Wrench className="h-4 w-4" /> },
  { href: "/admin/bookings", label: "Bookings", icon: <CalendarCheck className="h-4 w-4" /> },
  { href: "/admin/services", label: "Services", icon: <Package className="h-4 w-4" /> },
  { href: "/admin/payments", label: "Payments", icon: <CreditCard className="h-4 w-4" /> },
  { href: "/admin/reports", label: "Reports", icon: <BarChart3 className="h-4 w-4" /> },
  { href: "/admin/categories", label: "Categories", icon: <Shield className="h-4 w-4" /> },
  { href: "/profile", label: "Profile", icon: <Settings className="h-4 w-4" /> },
];

const navItemsByRole: Record<UserRole, NavItem[]> = {
  CUSTOMER: customerNavItems,
  TECHNICIAN: technicianNavItems,
  ADMIN: adminNavItems,
};

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const role = user?.role || "CUSTOMER";
  const navItems = navItemsByRole[role] || customerNavItems;

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setCollapsed(true)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 z-50 flex h-[calc(100vh-4rem)] flex-col border-r border-border bg-card transition-all duration-300 md:static md:z-0",
          collapsed ? "-translate-x-full md:translate-x-0 md:w-16" : "translate-x-0 w-64",
          className
        )}
      >
        {/* Toggle button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-end border-b border-border p-3 transition-colors hover:bg-accent"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <Menu className="h-4 w-4 text-muted-foreground" />
          ) : (
            <X className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                title={collapsed ? item.label : undefined}
              >
                <span className="shrink-0">{item.icon}</span>
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
