import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return `৳${(amount / 100).toLocaleString("en-BD", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    REQUESTED: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    ACCEPTED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    DECLINED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    PAID: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    IN_PROGRESS: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    COMPLETED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    CANCELLED: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
    PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    FAILED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function formatLabel(status: string): string {
  return String(status || "")
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getDayName(day: number): string {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[day];
}

export const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];
