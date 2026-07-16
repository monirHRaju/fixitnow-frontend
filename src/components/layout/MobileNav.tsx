"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wrench, Users, User, CalendarCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";

interface MobileNavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const publicNavItems: MobileNavItem[] = [
  { href: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
  { href: "/services", label: "Services", icon: <Wrench className="h-5 w-5" /> },
  { href: "/technicians", label: "Technicians", icon: <Users className="h-5 w-5" /> },
  { href: "/login", label: "Login", icon: <User className="h-5 w-5" /> },
];

const authNavItems: MobileNavItem[] = [
  { href: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
  { href: "/services", label: "Services", icon: <Wrench className="h-5 w-5" /> },
  { href: "/technicians", label: "Technicians", icon: <Users className="h-5 w-5" /> },
];

function getDashboardHref(role?: string): string {
  switch (role) {
    case "ADMIN":
      return "/admin/dashboard";
    case "TECHNICIAN":
      return "/technician/dashboard";
    case "CUSTOMER":
      return "/customer/dashboard";
    default:
      return "/login";
  }
}

function getDashboardLabel(role?: string): string {
  switch (role) {
    case "ADMIN":
    case "TECHNICIAN":
    case "CUSTOMER":
      return "Dashboard";
    default:
      return "Login";
  }
}

export default function MobileNav() {
  const pathname = usePathname();
  const { user, token } = useAuthStore();

  const isAuthed = !!token && !!user;

  // Don't show on dashboard pages (they have the sidebar)
  const isDashboardPage =
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/technician/") ||
    pathname.startsWith("/customer/") ||
    pathname.startsWith("/profile");

  if (isDashboardPage) return null;

  const navItems = isAuthed
    ? [
        ...authNavItems,
        {
          href: getDashboardHref(user?.role),
          label: getDashboardLabel(user?.role),
          icon: <CalendarCheck className="h-5 w-5" />,
        },
      ]
    : publicNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
