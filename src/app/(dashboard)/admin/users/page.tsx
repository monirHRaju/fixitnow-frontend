"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Ban,
  CheckCircle,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { adminApi } from "@/lib/api";
import type { AdminUser } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LoadingSkeleton, PageHeader } from "@/components/shared";
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = useCallback(
    async (page: number = 1) => {
      setLoading(true);
      try {
        const params: Record<string, string> = {
          page: String(page),
          limit: "10",
        };
        if (roleFilter !== "all") {
          params.role = roleFilter;
        }
        if (search.trim()) {
          params.search = search.trim();
        }
        const res = await adminApi.listUsers(params);
        setUsers(res.data.users || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      } catch {
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    },
    [roleFilter, search]
  );

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  function handlePageChange(page: number) {
    if (page < 1 || page > pagination.totalPages) return;
    fetchUsers(page);
  }

  async function handleToggleBan(userId: string, currentlyBanned: boolean) {
    setActionLoading(userId);
    try {
      await adminApi.toggleBan(userId);
      toast.success(
        currentlyBanned ? "User unbanned" : "User banned"
      );
      fetchUsers(pagination.page);
    } catch {
      toast.error("Failed to update user");
    } finally {
      setActionLoading(null);
    }
  }

  function getRoleBadgeVariant(role: string) {
    switch (role) {
      case "ADMIN":
        return "default" as const;
      case "TECHNICIAN":
        return "secondary" as const;
      default:
        return "outline" as const;
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Manage all platform users" />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="CUSTOMER">Customer</SelectItem>
            <SelectItem value="TECHNICIAN">Technician</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <LoadingSkeleton count={5} />
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6 text-center">
              No users found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left font-medium text-muted-foreground py-3 px-4">
                      Name
                    </th>
                    <th className="text-left font-medium text-muted-foreground py-3 px-4 hidden sm:table-cell">
                      Email
                    </th>
                    <th className="text-left font-medium text-muted-foreground py-3 px-4">
                      Role
                    </th>
                    <th className="text-left font-medium text-muted-foreground py-3 px-4">
                      Status
                    </th>
                    <th className="text-left font-medium text-muted-foreground py-3 px-4 hidden md:table-cell">
                      Joined
                    </th>
                    <th className="text-right font-medium text-muted-foreground py-3 px-4 hidden md:table-cell">
                      Bookings
                    </th>
                    <th className="text-right font-medium text-muted-foreground py-3 px-4">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium">{user.name}</span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">
                        {user.email}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {user.isBanned ? (
                          <Badge variant="destructive">Banned</Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-600"
                          >
                            Active
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right hidden md:table-cell">
                        {user._count?.customerBookings || 0}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant={user.isBanned ? "outline" : "destructive"}
                          size="sm"
                          onClick={() =>
                            handleToggleBan(user.id, user.isBanned)
                          }
                          disabled={actionLoading === user.id}
                        >
                          {user.isBanned ? (
                            <>
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Unban
                            </>
                          ) : (
                            <>
                              <Ban className="h-3.5 w-3.5 mr-1" />
                              Ban
                            </>
                          )}
                        </Button>
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
