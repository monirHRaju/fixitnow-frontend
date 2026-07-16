"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Star,
  Loader2,
  AlertCircle,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { reviewApi } from "@/lib/api";
import type { Review } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-none text-muted-foreground/30"
          }`}
        />
      ))}
      <span className="ml-1.5 text-sm text-muted-foreground">
        ({rating}/5)
      </span>
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await reviewApi.list();
        setReviews(response.data?.reviews ?? []);
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
  }, []);

  const sortedReviews = [...reviews].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

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
          Reviews you&apos;ve written for services
        </p>
      </motion.div>

      {/* Reviews List */}
      <motion.div variants={itemVariants} className="space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <p className="mt-4 text-sm text-muted-foreground">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : sortedReviews.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <MessageSquare className="h-16 w-16 text-muted-foreground/30" />
              <h3 className="mt-4 text-lg font-medium">No reviews yet</h3>
              <p className="mt-1 text-sm text-muted-foreground text-center max-w-sm">
                You haven&apos;t written any reviews yet. Share your experience
                after a completed service.
              </p>
              <Button asChild className="mt-6">
                <Link href="/bookings">View Completed Bookings</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          sortedReviews.map((review) => (
            <motion.div key={review.id} variants={itemVariants}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex flex-col gap-3">
                    {/* Service & Technician */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-semibold">
                          {review.booking?.service?.title || "Service"}
                        </h3>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          Technician:{" "}
                          {review.booking?.technician?.user?.name || "N/A"}
                        </p>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>

                    {/* Comment */}
                    {review.comment && (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    )}

                    {/* Date & Booking Link */}
                    <div className="flex items-center justify-between border-t border-border pt-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(review.createdAt)}
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/bookings/${review.bookingId}`}>
                          View Booking
                        </Link>
                      </Button>
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
