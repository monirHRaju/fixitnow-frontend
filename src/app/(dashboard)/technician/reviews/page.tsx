"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Star,
  MessageSquare,
  Quote,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { reviewApi } from "@/lib/api";
import type { Review, ReviewStats } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { StarRating as StarRatingShared } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  return <StarRatingShared rating={rating} size={size === "lg" ? "md" : "sm"} />;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function TechnicianReviewsPage() {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ratingFilter, setRatingFilter] = useState<string>("all");

  const technicianId = user?.technicianProfile?.id;

  useEffect(() => {
    if (!technicianId) return;

    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await reviewApi.listByTechnician(technicianId);
        setReviews(response.data?.reviews ?? []);
        if (response.data?.stats) {
          setStats(response.data.stats);
        }
      } catch (err: unknown) {
        const errorObj = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        setError(
          errorObj?.response?.data?.message ||
            errorObj?.message ||
            "Failed to load reviews"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [technicianId]);

  const filteredReviews = useMemo(() => {
    let sorted = [...reviews].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (ratingFilter !== "all") {
      const rating = parseInt(ratingFilter, 10);
      sorted = sorted.filter((r) => r.rating === rating);
    }

    return sorted;
  }, [reviews, ratingFilter]);

  const distribution = stats?.distribution ?? {};
  const totalReviews = stats?.totalReviews ?? reviews.length;
  const averageRating = stats?.averageRating ?? null;

  // Compute max count for bar scaling
  const maxCount = Math.max(...Object.values(distribution), 1);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight">My Reviews</h1>
        <p className="mt-1 text-muted-foreground">
          See what customers are saying about your services
        </p>
      </motion.div>

      {/* Stats Card */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rating Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-5 w-full" />
                  ))}
                </div>
              </div>
            ) : totalReviews > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Average Rating Display */}
                <div className="flex flex-col items-center justify-center rounded-lg border border-border p-6">
                  <span className="text-5xl font-bold">
                    {averageRating !== null
                      ? averageRating.toFixed(1)
                      : "—"}
                  </span>
                  <StarRating rating={Math.round(averageRating ?? 0)} size="lg" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    {totalReviews}{" "}
                    {totalReviews === 1 ? "review" : "reviews"}
                  </p>
                </div>

                {/* Distribution Bars */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = distribution[star] ?? 0;
                    const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <span className="w-6 text-right text-sm font-medium tabular-nums">
                          {star}
                        </span>
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="h-full rounded-full bg-yellow-400"
                          />
                        </div>
                        <span className="w-8 text-right text-sm text-muted-foreground tabular-nums">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <Star className="h-12 w-12 text-muted-foreground/30" />
                <p className="mt-3 text-sm text-muted-foreground">
                  No ratings yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Filter Controls */}
      {!loading && !error && totalReviews > 0 && (
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between"
        >
          <p className="text-sm text-muted-foreground">
            {filteredReviews.length === totalReviews
              ? `${totalReviews} review${totalReviews === 1 ? "" : "s"}`
              : `${filteredReviews.length} of ${totalReviews} review${totalReviews === 1 ? "" : "s"}`}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filter by:</span>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All ratings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ratings</SelectItem>
                <SelectItem value="5">5 stars</SelectItem>
                <SelectItem value="4">4 stars</SelectItem>
                <SelectItem value="3">3 stars</SelectItem>
                <SelectItem value="2">2 stars</SelectItem>
                <SelectItem value="1">1 star</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>
      )}

      {/* Reviews List */}
      <motion.div variants={itemVariants} className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="mt-4 text-sm text-muted-foreground">{error}</p>
            </CardContent>
          </Card>
        ) : !technicianId ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground/40" />
              <p className="mt-4 text-sm text-muted-foreground">
                Technician profile not found. Please complete your profile setup.
              </p>
            </CardContent>
          </Card>
        ) : filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <MessageSquare className="h-16 w-16 text-muted-foreground/30" />
              <h3 className="mt-4 text-lg font-medium">
                {ratingFilter !== "all"
                  ? "No reviews match this rating"
                  : "No reviews yet"}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground text-center max-w-sm">
                {ratingFilter !== "all"
                  ? "Try selecting a different rating filter."
                  : "When customers leave reviews, they will appear here."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredReviews.map((review) => (
            <motion.div key={review.id} variants={itemVariants}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-3">
                    {/* Customer Info */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                            {review.user?.name
                              ? getInitials(review.user.name)
                              : "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">
                            {review.user?.name || "Anonymous"}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <StarRating rating={review.rating} />
                            <Badge variant="secondary" className="text-xs px-1.5 py-0">
                              {review.rating}/5
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Comment with Quote Icon */}
                    {review.comment && (
                      <div className="relative pl-7">
                        <Quote className="absolute left-0 top-0 h-4 w-4 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground italic leading-relaxed">
                          &ldquo;{review.comment}&rdquo;
                        </p>
                      </div>
                    )}

                    <Separator />

                    {/* Date */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(review.createdAt)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  );
}