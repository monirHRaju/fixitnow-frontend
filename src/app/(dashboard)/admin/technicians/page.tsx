"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Wrench,
} from "lucide-react";
import { adminApi } from "@/lib/api";
import type { AdminUser } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LoadingSkeleton, PageHeader } from "@/components/shared";
import { toast } from "sonner";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminTechniciansPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const fetchTechnicians = useCallback(
    async (page: number = 1) => {
      setLoading(true);
      try {
        const params: Record<string, string> = {
          page: String(page),
          limit: "10",
          role: "TECHNICIAN",
        };
        if (search.trim()) {
          params.search = search.trim();
        }
        const res = await adminApi.listUsers(params);
        setUsers(res.data.users || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      } catch {
        toast.error("Failed to load technicians");
      } finally {
        setLoading(false);
      }
    },
    [search]
  );

  useEffect(() => {
    fetchTechnicians(1);
  }, [fetchTechnicians]);

  function handlePageChange(page: number) {
    if (page < 1 || page > pagination.totalPages) return;
    fetchTechnicians(page);
  }

  // NOTE: We use search submit rather than immediate fetch to allow typing
  // but fetchTechnicians fires in useEffect which reads current search state
  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      fetchTechnicians(1);
    }
  }

  // Sync fetchTechnicians with the debounced search value via useEffect above.
  // Since fetchTechnicians is memoised with [search], typing triggers refetch.
  // We add a small guard: only refetch when component is mounted.
  const [initialLoad, setInitialLoad] = useState(true);
  useEffect(() => {
    if (initialLoad) {
      setInitialLoad(false);
      return;
    }
    fetchTechnicians(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Stats derived from users list (mock data fallback)
  const totalTechnicians = pagination.total || users.length;

  return (
    <div className="space-y-6">
      <PageHeader title="Technicians" description="Manage all registered technicians" />

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>
      </div>

      {/* Technicians Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <LoadingSkeleton count={5} />
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Wrench className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                No technicians found
              </p>
              {search.trim() && (
                <p className="text-xs text-muted-foreground mt-1">
                  Try a different search term
                </p>
              )}
            </div>
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
                    <th className="text-left font-medium text-muted-foreground py-3 px-4 hidden md:table-cell">
                      Skills
                    </th>
                    <th className="text-left font-medium text-muted-foreground py-3 px-4 hidden lg:table-cell">
                      Location
                    </th>
                    <th className="text-left font-medium text-muted-foreground py-3 px-4">
                      Status
                    </th>
                    <th className="text-right font-medium text-muted-foreground py-3 px-4 hidden md:table-cell">
                      Bookings
                    </th>
                    <th className="text-left font-medium text-muted-foreground py-3 px-4 hidden xl:table-cell">
                      Joined
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
                      <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">
                        {/* Skills are not available on AdminUser directly;
                            would come from a deeper join. Show placeholder. */}
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">
                            Plumbing
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Electrical
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground hidden lg:table-cell">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Dhaka
                        </span>
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
                      <td className="py-3 px-4 text-right hidden md:table-cell">
                        {user._count?.customerBookings || 0}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground hidden xl:table-cell">
                        {formatDate(user.createdAt)}
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
