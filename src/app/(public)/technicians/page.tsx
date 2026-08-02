"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search,
  Star,
  MapPin,
  Wrench,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  Clock,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/ui/UserAvatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { technicianApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { TechnicianListItem } from "@/lib/types";

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

function StarRatingDisplay({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-xs text-muted-foreground">No ratings</span>;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= Math.round(rating)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-none text-muted-foreground/30"
          }`}
        />
      ))}
      <span className="ml-1.5 text-xs font-medium text-foreground">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function SkillBadge({ skill }: { skill: string }) {
  return (
    <Badge variant="secondary" className="text-xs">
      {skill}
    </Badge>
  );
}

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<TechnicianListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [skillFilter, setSkillFilter] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const buildParams = useCallback((): Record<string, string> => {
    const params: Record<string, string> = {};
    if (searchTerm) params.search = searchTerm;
    if (skillFilter) params.skill = skillFilter;
    if (locationFilter) params.location = locationFilter;
    if (availableOnly) params.available = "true";
    if (minPrice) params.minRate = minPrice;
    if (maxPrice) params.maxRate = maxPrice;
    return params;
  }, [searchTerm, skillFilter, locationFilter, availableOnly, minPrice, maxPrice]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await technicianApi.list(buildParams());
      if (res.success) {
        setTechnicians(res.data.technicians);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to load technicians";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSkillFilter("");
    setLocationFilter("");
    setAvailableOnly(false);
    setMinPrice("");
    setMaxPrice("");
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
          Find a Technician
        </h1>
        <p className="mt-2 text-muted-foreground">
          Browse verified technicians and choose the best one for your needs.
        </p>
      </motion.div>

      {/* Search and Controls */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <form onSubmit={handleSearch} className="flex flex-1 gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search technicians..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
          <div className="flex rounded-lg border">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded-l-lg p-2 transition-colors ${
                viewMode === "grid"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50"
              }`}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded-r-lg border-l p-2 transition-colors ${
                viewMode === "list"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50"
              }`}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Filter Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 overflow-hidden"
        >
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex-1 min-w-[150px]">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Skill
                </label>
                <Input
                  placeholder="e.g. Plumbing"
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Location
                </label>
                <Input
                  placeholder="e.g. Dhaka"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
              <div className="w-[130px]">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Min Rate
                </label>
                <Input
                  type="number"
                  placeholder="Min (paisa)"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
              </div>
              <div className="w-[130px]">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  Max Rate
                </label>
                <Input
                  type="number"
                  placeholder="Max (paisa)"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 pb-1">
                <input
                  type="checkbox"
                  id="available"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                <label
                  htmlFor="available"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Available only
                </label>
              </div>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                <X className="mr-1 h-3 w-3" />
                Clear
              </Button>
              <Button size="sm" onClick={() => fetchData()}>
                Apply
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className={`grid gap-6 ${
            viewMode === "grid"
              ? "sm:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1"
          }`}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div key={i} variants={fadeInUp}>
              <Skeleton className={`w-full rounded-xl ${viewMode === "list" ? "h-28" : "h-52"}`} />
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
      {!loading && !error && technicians.length === 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <Users className="h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            No technicians found
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your filters to find available technicians.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </motion.div>
      )}

      {/* Technicians Grid/List */}
      {!loading && !error && technicians.length > 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className={`grid gap-6 ${
            viewMode === "grid"
              ? "sm:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1"
          }`}
        >
          {technicians.map((tech) => (
            <motion.div key={tech.id} variants={fadeInUp}>
              <Link href={`/technicians/${tech.id}`} className="group block">
                {viewMode === "grid" ? (
                  /* Grid Card */
                  <div className="rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                    {/* Avatar and Name */}
                    <div className="flex flex-col items-center text-center">
                      <UserAvatar
                        src={tech.user.avatarUrl}
                        name={tech.user.name}
                        className="h-16 w-16 text-2xl"
                        fallbackClassName="text-2xl"
                      />
                      <h3 className="mt-3 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {tech.user.name}
                      </h3>
                      <div className="mt-1">
                        <StarRatingDisplay rating={tech.avgRating} />
                      </div>
                      {tech.reviewCount > 0 && (
                        <span className="mt-1 text-xs text-muted-foreground">
                          {tech.reviewCount} review{tech.reviewCount !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    {/* Skills */}
                    {tech.skills.length > 0 && (
                      <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                        {tech.skills.slice(0, 4).map((skill) => (
                          <SkillBadge key={skill} skill={skill} />
                        ))}
                        {tech.skills.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{tech.skills.length - 4}
                          </Badge>
                        )}
                      </div>
                    )}

                    <Separator className="my-4" />

                    {/* Details */}
                    <div className="space-y-2">
                      {tech.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{tech.location}</span>
                        </div>
                      )}
                      {tech.hourlyRate !== undefined && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          <span>{formatCurrency(tech.hourlyRate)}/hr</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Wrench className="h-3.5 w-3.5 shrink-0" />
                        <span>
                          {tech._count.services} service{tech._count.services !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    {/* Availability Badge */}
                    <div className="mt-4 text-center">
                      <Badge
                        variant={tech.isAvailable ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {tech.isAvailable ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  /* List Card */
                  <div className="rounded-xl border bg-card p-4 shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="flex items-start gap-4">
                      <UserAvatar
                        src={tech.user.avatarUrl}
                        name={tech.user.name}
                        className="h-14 w-14 shrink-0 text-xl"
                        fallbackClassName="text-xl"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                              {tech.user.name}
                            </h3>
                            <StarRatingDisplay rating={tech.avgRating} />
                          </div>
                          <Badge
                            variant={tech.isAvailable ? "default" : "secondary"}
                            className="text-xs w-fit"
                          >
                            {tech.isAvailable ? "Available" : "Unavailable"}
                          </Badge>
                        </div>

                        {tech.skills.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {tech.skills.slice(0, 6).map((skill) => (
                              <SkillBadge key={skill} skill={skill} />
                            ))}
                            {tech.skills.length > 6 && (
                              <Badge variant="outline" className="text-xs">
                                +{tech.skills.length - 6}
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          {tech.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {tech.location}
                            </span>
                          )}
                          {tech.hourlyRate !== undefined && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatCurrency(tech.hourlyRate)}/hr
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Wrench className="h-3 w-3" />
                            {tech._count.services} services
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
