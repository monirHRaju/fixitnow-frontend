"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Star,
  MapPin,
  Wrench,
  Clock,
  Award,
  Calendar,
  CheckCircle2,
  XCircle,
  Quote,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { technicianApi } from "@/lib/api";
import { formatCurrency, formatDate, getDayName } from "@/lib/utils";
import type { TechnicianDetail, Review } from "@/lib/types";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

function StarRatingDisplay({
  rating,
  size = "md",
}: {
  rating: number | null;
  size?: "sm" | "md";
}) {
  if (!rating)
    return <span className="text-sm text-muted-foreground">No ratings</span>;
  const starSize = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  const textSize = size === "sm" ? "text-sm" : "text-lg";
  return (
    <div className="flex items-center gap-1">
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
      <span className={`ml-1.5 font-medium text-foreground ${textSize}`}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function SkillBadge({ skill }: { skill: string }) {
  return (
    <Badge variant="secondary" className="text-sm px-3 py-1">
      {skill}
    </Badge>
  );
}

function RatingBar({
  stars,
  count,
  total,
}: {
  stars: number;
  count: number;
  total: number;
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 text-right text-sm text-muted-foreground">
        {stars}
      </span>
      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
      <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-yellow-400 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-8 text-right text-sm text-muted-foreground">
        {count}
      </span>
    </div>
  );
}

export default function TechnicianDetailPage() {
  const params = useParams();
  const [technician, setTechnician] = useState<TechnicianDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const techId = params.id as string;
        const res = await technicianApi.getById(techId);
        if (res.success) {
          setTechnician(res.data.technician);
        } else {
          throw new Error("Failed to load technician profile");
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to load technician details";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-6 w-24" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="mt-6 h-32 w-full rounded-xl" />
            <Skeleton className="mt-6 h-48 w-full rounded-xl" />
          </div>
          <div>
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !technician) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <Wrench className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h2 className="mt-4 text-2xl font-bold text-foreground">
          {error || "Technician not found"}
        </h2>
        <p className="mt-2 text-muted-foreground">
          The technician you are looking for does not exist or has been removed.
        </p>
        <Link href="/technicians">
          <Button variant="outline" className="mt-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Technicians
          </Button>
        </Link>
      </div>
    );
  }

  // Calculate rating distribution
  const totalReviews = technician.reviews?.length || 0;
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  technician.reviews?.forEach((r) => {
    if (distribution[r.rating] !== undefined) {
      distribution[r.rating]++;
    }
  });

  // Group availability by day
  const sortedAvailability = [...(technician.availability || [])].sort(
    (a, b) => a.dayOfWeek - b.dayOfWeek
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Link */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="mb-6"
      >
        <Link
          href="/technicians"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Technicians
        </Link>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Section */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
                {technician.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      {technician.user.name}
                    </h1>
                    <div className="mt-1">
                      <StarRatingDisplay rating={technician.avgRating} />
                      <span className="ml-2 text-sm text-muted-foreground">
                        ({technician.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={
                      technician.isAvailable ? "default" : "secondary"
                    }
                    className="text-sm px-4 py-1.5 w-fit"
                  >
                    {technician.isAvailable ? (
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" />
                        Available
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <XCircle className="h-4 w-4" />
                        Unavailable
                      </span>
                    )}
                  </Badge>
                </div>

                {/* Quick Info */}
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  {technician.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      {technician.location}
                    </span>
                  )}
                  {technician.hourlyRate !== undefined && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {formatCurrency(technician.hourlyRate)}/hr
                    </span>
                  )}
                  {technician.experience !== undefined && (
                    <span className="flex items-center gap-1.5">
                      <Award className="h-4 w-4" />
                      {technician.experience} years experience
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            {technician.bio && (
              <div className="mt-5">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {technician.bio}
                </p>
              </div>
            )}

            {/* Skills */}
            {technician.skills.length > 0 && (
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Skills & Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {technician.skills.map((skill) => (
                    <SkillBadge key={skill} skill={skill} />
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Availability Schedule */}
          {sortedAvailability.length > 0 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="rounded-xl border bg-card p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Availability Schedule
              </h2>
              <div className="mt-4 overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Day
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        Start Time
                      </th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                        End Time
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedAvailability.map((slot) => (
                      <tr key={slot.id} className="border-t border-border">
                        <td className="px-4 py-3 font-medium text-foreground">
                          {getDayName(slot.dayOfWeek)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {slot.startTime}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {slot.endTime}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Services Offered */}
          {technician.services.length > 0 && (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="rounded-xl border bg-card p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary" />
                Services Offered ({technician.services.length})
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {technician.services.map((service) => (
                  <Link
                    key={service.id}
                    href={`/services/${service.id}`}
                    className="group rounded-lg border bg-card p-4 transition-all hover:shadow-md hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {service.title}
                        </h3>
                        <Badge variant="secondary" className="mt-1.5 text-xs">
                          {service.category.name}
                        </Badge>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-semibold text-primary">
                        {formatCurrency(service.price)}
                      </span>
                      {service.durationMins && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {service.durationMins} min
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {/* Reviews Section */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="rounded-xl border bg-card p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              Reviews ({totalReviews})
            </h2>

            {totalReviews > 0 ? (
              <>
                {/* Rating Distribution */}
                <div className="mt-4 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <RatingBar
                      key={stars}
                      stars={stars}
                      count={distribution[stars]}
                      total={totalReviews}
                    />
                  ))}
                </div>

                <Separator className="my-6" />

                {/* Review Cards */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={staggerContainer}
                  className="space-y-4"
                >
                  {technician.reviews.map((review: Review) => (
                    <motion.div
                      key={review.id}
                      variants={fadeInUp}
                      className="rounded-lg border bg-card p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {(review.user?.name || "A").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <span className="text-sm font-medium text-foreground">
                              {review.user?.name || "Anonymous"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                          <div className="mt-1">
                            <StarRatingDisplay
                              rating={review.rating}
                              size="sm"
                            />
                          </div>
                          {review.comment && (
                            <div className="mt-2 flex gap-2">
                              <Quote className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground/40" />
                              <p className="text-sm text-muted-foreground italic">
                                {review.comment}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </>
            ) : (
              <div className="mt-6 flex flex-col items-center py-8 text-center">
                <Quote className="h-10 w-10 text-muted-foreground/30" />
                <p className="mt-3 text-sm text-muted-foreground">
                  No reviews yet. Be the first to leave a review after booking a
                  service.
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="sticky top-24 rounded-xl border bg-card p-6 shadow-sm"
          >
            {/* Rate Card */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Hourly Rate</p>
              <p className="mt-1 text-3xl font-bold text-primary">
                {technician.hourlyRate
                  ? formatCurrency(technician.hourlyRate)
                  : "N/A"}
              </p>
            </div>

            <Separator className="my-5" />

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Services</span>
                <span className="font-medium text-foreground">
                  {technician._count.services}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total Jobs</span>
                <span className="font-medium text-foreground">
                  {technician._count.bookings}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Experience</span>
                <span className="font-medium text-foreground">
                  {technician.experience
                    ? `${technician.experience} years`
                    : "N/A"}
                </span>
              </div>
            </div>

            <Separator className="my-5" />

            <Link href={`/services?technician=${technician.id}`}>
              <Button className="w-full gap-2">
                <Calendar className="h-4 w-4" />
                Book a Service
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
