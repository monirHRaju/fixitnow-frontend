"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, Package } from "lucide-react";
import { serviceApi } from "@/lib/api";
import type { ServiceItem } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
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

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const fetchServices = useCallback(
    async (page: number = 1) => {
      setLoading(true);
      try {
        const params: Record<string, string> = {
          page: String(page),
          limit: "10",
        };
        if (search.trim()) {
          params.search = search.trim();
        }
        const res = await serviceApi.list(params);
        setServices(res.data.services || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        } else {
          // Fallback: compute pagination from array length
          setPagination((prev) => ({
            ...prev,
            total: res.data.services?.length || 0,
            totalPages: 1,
          }));
        }
      } catch {
        toast.error("Failed to load services");
      } finally {
        setLoading(false);
      }
    },
    [search]
  );

  useEffect(() => {
    fetchServices(1);
  }, [fetchServices]);

  function handlePageChange(page: number) {
    if (page < 1 || page > pagination.totalPages) return;
    fetchServices(page);
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      fetchServices(1);
    }
  }

  // Reactive search (debounced via useEffect re-fire)
  const [initialLoad, setInitialLoad] = useState(true);
  useEffect(() => {
    if (initialLoad) {
      setInitialLoad(false);
      return;
    }
    fetchServices(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="space-y-6">
      <PageHeader title="Services" description="View all services offered by technicians" />

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, category, or technician..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
        </div>
      </div>

      {/* Services Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <LoadingSkeleton count={5} />
          ) : services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                No services found
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
                      Title
                    </th>
                    <th className="text-left font-medium text-muted-foreground py-3 px-4 hidden sm:table-cell">
                      Category
                    </th>
                    <th className="text-left font-medium text-muted-foreground py-3 px-4 hidden md:table-cell">
                      Technician
                    </th>
                    <th className="text-right font-medium text-muted-foreground py-3 px-4">
                      Price
                    </th>
                    <th className="text-left font-medium text-muted-foreground py-3 px-4">
                      Status
                    </th>
                    <th className="text-right font-medium text-muted-foreground py-3 px-4 hidden md:table-cell">
                      Bookings
                    </th>
                    <th className="text-left font-medium text-muted-foreground py-3 px-4 hidden xl:table-cell">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service, i) => (
                    <motion.tr
                      key={service.id}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-medium">{service.title}</span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">
                        {service.category?.name || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground hidden md:table-cell">
                        {service.technician?.user?.name || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">
                        {formatCurrency(service.price)}
                      </td>
                      <td className="py-3 px-4">
                        {service.isActive ? (
                          <Badge
                            variant="outline"
                            className="text-green-600 border-green-600"
                          >
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right hidden md:table-cell">
                        {service._count?.bookings || 0}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground hidden xl:table-cell">
                        {formatDate(service.createdAt)}
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
