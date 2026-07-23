"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  FileText,
  Wrench,
  User,
  Loader2,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { bookingApi, serviceApi, technicianApi } from "@/lib/api";
import type { ServiceItem, TechnicianDetail } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { formatCurrency, getStatusColor } from "@/lib/utils";

const createBookingSchema = z.object({
  scheduledAt: z.string().min(1, "Please select a date and time"),
  address: z.string().min(1, "Address is required"),
  notes: z.string().optional(),
});

type CreateBookingFormData = z.infer<typeof createBookingSchema>;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function NewBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("serviceId");
  const technicianId = searchParams.get("technicianId");

  const [service, setService] = useState<ServiceItem | null>(null);
  const [technician, setTechnician] = useState<TechnicianDetail | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateBookingFormData>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      scheduledAt: "",
      address: "",
      notes: "",
    },
  });

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoadingDetails(true);
        setError(null);

        if (serviceId) {
          const found = await serviceApi.getById(serviceId);
          if (found.success && found.data?.service) setService(found.data.service);
        }

        if (technicianId) {
          const tech = await technicianApi.getById(technicianId);
          setTechnician(tech.data?.technician ?? null);
        }
      } catch (err: unknown) {
        const errorObj = err as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        setError(
          errorObj?.response?.data?.message ||
            errorObj?.message ||
            "Failed to load details"
        );
      } finally {
        setLoadingDetails(false);
      }
    };
    loadDetails();
  }, [serviceId, technicianId]);

  const onSubmit = async (data: CreateBookingFormData) => {
    if (!serviceId || !technicianId) {
      toast.error("Service and technician information is required");
      return;
    }

    try {
      const response = await bookingApi.create({
        serviceId,
        technicianId,
        scheduledAt: new Date(data.scheduledAt).toISOString(),
        address: data.address,
        notes: data.notes || undefined,
      });

      const booking = response.data?.booking;
      toast.success("Booking created successfully!");
      if (booking?.id) {
        router.push(`/bookings/${booking.id}`);
      } else {
        router.push("/bookings");
      }
    } catch (err: unknown) {
      const errorObj = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        errorObj?.response?.data?.message ||
          errorObj?.message ||
          "Failed to create booking"
      );
    }
  };

  if (loadingDetails) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="h-16 w-16 text-destructive" />
        <h2 className="mt-4 text-xl font-bold">Error Loading Details</h2>
        <p className="mt-2 text-muted-foreground">{error}</p>
        <Button variant="outline" className="mt-6" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  if (!serviceId || !technicianId) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="h-16 w-16 text-muted-foreground/50" />
        <h2 className="mt-4 text-xl font-bold">Missing Information</h2>
        <p className="mt-2 text-muted-foreground">
          Please select a service and technician first.
        </p>
        <Button asChild className="mt-6">
          <a href="/services">Browse Services</a>
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-2xl space-y-6"
    >
      {/* Back Button */}
      <motion.div variants={itemVariants}>
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </motion.div>

      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight">Book a Service</h1>
        <p className="mt-1 text-muted-foreground">
          Fill in the details to schedule your service
        </p>
      </motion.div>

      {/* Service Summary */}
      {service && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Service Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <Wrench className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{service.title}</p>
                  {service.description && (
                    <p className="text-sm text-muted-foreground">
                      {service.description}
                    </p>
                  )}
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <DollarSign className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Price</p>
                  <p className="text-lg font-semibold text-primary">
                    {formatCurrency(service.price)}
                  </p>
                </div>
              </div>
              {service.durationMins && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Duration</p>
                      <p className="text-sm text-muted-foreground">
                        ~{service.durationMins} minutes
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Technician Info */}
      {technician && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle>Technician</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {technician.user?.name || "N/A"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {technician.location || "Location not specified"}
                  </p>
                </div>
              </div>
              {technician.skills && technician.skills.length > 0 && (
                <>
                  <Separator />
                  <div className="flex flex-wrap gap-1.5">
                    {technician.skills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
              {technician.avgRating !== null && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Rating:</span>
                    <span className="text-yellow-500">
                      {"★".repeat(Math.round(technician.avgRating))}
                    </span>
                    <span className="text-muted-foreground">
                      ({technician.avgRating.toFixed(1)})
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Booking Form */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Booking Details</CardTitle>
            <CardDescription>
              When and where do you need the service?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="scheduledAt">Scheduled Date & Time</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    className="pl-10"
                    disabled={isSubmitting}
                    {...register("scheduledAt")}
                  />
                </div>
                {errors.scheduledAt && (
                  <p className="text-xs text-destructive">
                    {errors.scheduledAt.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Service Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="address"
                    type="text"
                    placeholder="123 Main St, City"
                    className="pl-10"
                    disabled={isSubmitting}
                    {...register("address")}
                  />
                </div>
                {errors.address && (
                  <p className="text-xs text-destructive">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="notes"
                    placeholder="Any special instructions or requirements..."
                    className="pl-10 min-h-[100px]"
                    disabled={isSubmitting}
                    {...register("notes")}
                  />
                </div>
                {errors.notes && (
                  <p className="text-xs text-destructive">
                    {errors.notes.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

export default function NewBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      }
    >
      <NewBookingContent />
    </Suspense>
  );
}
