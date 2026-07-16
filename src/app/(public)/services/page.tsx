"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Star,
  Clock,
  MapPin,
  Filter,
  X,
  Wrench,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryApi, serviceApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { Category, ServiceItem } from "@/lib/types";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

function StarRating({ rating, size = "sm" }: { rating: number | null; size?: "sm" | "xs" }) {
  if (!rating) return null;
  const starSize = size === "xs" ? "h-3 w-3" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${starSize} ${
            star <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-none text-muted-foreground/30"
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">
        ({rating.toFixed(1)})
      </span>
    </div>
  );
}

export default function ServicesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.categoryId = selectedCategory;

      const [catRes, servRes] = await Promise.all([
        categoryApi.list(),
        serviceApi.list(params),
      ]);

      if (catRes.success) {
        setCategories(catRes.data.categories);
      }
      if (servRes.success) {
        setServices(servRes.data.services);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load services";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleCategoryFilter = (categoryId: string | null) => {
    setSelectedCategory((prev) => (prev === categoryId ? null : categoryId));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Find a Service
        </h1>
        <p className="mt-2 text-muted-foreground">
          Browse through our wide range of services offered by skilled
          technicians.
        </p>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="mb-6"
      >
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
      </motion.div>

      {/* Category Filter Chips */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="mb-8 flex flex-wrap items-center gap-2"
      >
        <Filter className="h-4 w-4 text-muted-foreground" />
        <button
          onClick={() => handleCategoryFilter(null)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            selectedCategory === null
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryFilter(cat.id)}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedCategory === cat.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            {cat.name}
            {cat._count?.services !== undefined && (
              <span className="opacity-70">({cat._count.services})</span>
            )}
          </button>
        ))}
      </motion.div>

      {/* Loading State */}
      {loading && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div key={i} variants={fadeInUp}>
              <Skeleton className="h-48 w-full rounded-xl" />
              <div className="mt-3 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Error State */}
      {!loading && error && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <Wrench className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            Something went wrong
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => fetchData()}
          >
            Try Again
          </Button>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && !error && services.length === 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <Search className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            No services found
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your search or filter to find what you need.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory(null);
            }}
          >
            Clear Filters
          </Button>
        </motion.div>
      )}

      {/* Services Grid */}
      {!loading && !error && services.length > 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((service) => (
            <motion.div key={service.id} variants={fadeInUp}>
              <Link href={`/services/${service.id}`} className="group block">
                <div className="rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <div className="p-6">
                    {/* Category Badge */}
                    <Badge variant="secondary" className="mb-3">
                      {service.category.name}
                    </Badge>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {service.title}
                    </h3>

                    {/* Description */}
                    {service.description && (
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {service.description}
                      </p>
                    )}

                    {/* Price & Duration */}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xl font-bold text-primary">
                        {formatCurrency(service.price)}
                      </span>
                      {service.durationMins && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {service.durationMins} min
                        </span>
                      )}
                    </div>

                    {/* Divider */}
                    <div className="my-4 h-px bg-border" />

                    {/* Technician Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {service.technician.user.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {service.technician.user.name}
                        </span>
                      </div>
                      {service.technician.location && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {service.technician.location}
                        </span>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="mt-2">
                      <StarRating rating={service.avgRating} size="xs" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
