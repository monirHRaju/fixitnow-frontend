"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Wrench,
  ShieldCheck,
  CalendarCheck,
  User,
  Briefcase,
  Award,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { StarRating } from "@/components/shared";
import { serviceApi, technicianApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/lib/store";
import { toast } from "@/components/ui/toast";
import type { ServiceItem, TechnicianDetail } from "@/lib/types";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function StarRatingDisplay({ rating }: { rating: number | null }) {
  return <StarRating rating={rating} />;
}

function SkillBadge({ skill }: { skill: string }) {
  return (
    <Badge variant="secondary" className="text-xs">
      {skill}
    </Badge>
  );
}

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [service, setService] = useState<ServiceItem | null>(null);
  const [technician, setTechnician] = useState<TechnicianDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const serviceId = params.id as string;

        // Fetch the service directly by ID
        const servRes = await serviceApi.getById(serviceId);
        if (!servRes.success) {
          throw new Error("Failed to load service");
        }

        const foundService = servRes.data.service;

        if (!foundService) {
          throw new Error("Service not found");
        }

        setService(foundService);

        // Fetch the technician's full profile
        const techRes = await technicianApi.getById(
          foundService.technician.id
        );
        if (techRes.success) {
          setTechnician(techRes.data.technician);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load service details";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const handleBookNow = () => {
    if (!token || !user) {
      toast.error("Please login to book a service");
      router.push(`/login?redirect=/services/${params.id}`);
      return;
    }

    if (!service) return;
    router.push(
      `/bookings/new?serviceId=${service.id}&technicianId=${service.technician.id}`
    );
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-6 w-24" />
        <Skeleton className="mb-4 h-10 w-3/4" />
        <Skeleton className="mb-8 h-6 w-1/2" />
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
          <div>
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <Wrench className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h2 className="mt-4 text-2xl font-bold text-foreground">
          {error || "Service not found"}
        </h2>
        <p className="mt-2 text-muted-foreground">
          The service you are looking for does not exist or has been removed.
        </p>
        <Link href="/services">
          <Button variant="outline" className="mt-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Services
          </Button>
        </Link>
      </div>
    );
  }

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
          href="/services"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Services
        </Link>
      </motion.div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <Badge variant="secondary" className="mb-3">
              {service.category.name}
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {service.title}
            </h1>

            {service.description && (
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                {service.description}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {service.durationMins
                    ? `${service.durationMins} minutes`
                    : "Flexible duration"}
                </span>
              </div>
              {service._count?.bookings !== undefined && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {service._count.bookings} bookings
                  </span>
                </div>
              )}
            </div>

            <Separator className="my-6" />

            {/* Technician Profile Section */}
            <h2 className="text-xl font-semibold text-foreground">
              About the Technician
            </h2>

            <div className="mt-4 rounded-xl border bg-card p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <UserAvatar
                  src={service.technician.user.avatarUrl}
                  name={service.technician.user.name}
                  className="h-14 w-14 shrink-0 text-xl"
                  fallbackClassName="text-xl"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {service.technician.user.name}
                      </h3>
                      <StarRatingDisplay rating={service.avgRating} />
                    </div>
                    <Link href={`/technicians/${service.technician.id}`}>
                      <Button variant="outline" size="sm">
                        View Profile
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>

                  {technician?.bio && (
                    <p className="mt-3 text-sm text-muted-foreground">
                      {technician.bio}
                    </p>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    {technician?.location && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {technician.location}
                      </span>
                    )}
                    {technician?.experience !== undefined && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Award className="h-3.5 w-3.5" />
                        {technician.experience} years exp.
                      </span>
                    )}
                    {technician?.hourlyRate !== undefined && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {formatCurrency(technician.hourlyRate)}/hr
                      </span>
                    )}
                    {technician?.isAvailable !== undefined && (
                      <Badge
                        variant={technician.isAvailable ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {technician.isAvailable ? "Available" : "Unavailable"}
                      </Badge>
                    )}
                  </div>

                  {technician && technician.skills.length > 0 && (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-1.5">
                        {technician.skills.map((skill) => (
                          <SkillBadge key={skill} skill={skill} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar - Pricing & Booking */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="md:col-span-1"
        >
          <div className="sticky top-24 rounded-xl border bg-card p-6 shadow-sm">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="mt-1 text-4xl font-bold text-primary">
                {formatCurrency(service.price)}
              </p>
              {service.durationMins && (
                <p className="mt-1 text-sm text-muted-foreground">
                  ~{service.durationMins} minutes
                </p>
              )}
            </div>

            <Separator className="my-5" />

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                <span className="text-sm text-muted-foreground">
                  Verified professional
                </span>
              </div>
              <div className="flex items-start gap-3">
                <CalendarCheck className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                <span className="text-sm text-muted-foreground">
                  Flexible scheduling
                </span>
              </div>
              <div className="flex items-start gap-3">
                <User className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                <span className="text-sm text-muted-foreground">
                  Secure online booking
                </span>
              </div>
            </div>

            <Separator className="my-5" />

            <Button
              className="w-full gap-2"
              size="lg"
              onClick={handleBookNow}
            >
              <CalendarCheck className="h-5 w-5" />
              Book Now
            </Button>

            {technician && (technician.services?.length ?? 0) > 1 && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground text-center">
                  This technician offers {technician.services?.length} service(s).
                  <br />
                  <Link
                    href={`/technicians/${service.technician.id}`}
                    className="text-primary hover:underline"
                  >
                    View all services
                  </Link>
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
