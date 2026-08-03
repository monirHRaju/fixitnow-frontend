"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const iconVariants = {
  hidden: { scale: 0, rotate: 180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: { type: "spring" as const, stiffness: 200, damping: 15 },
  },
};

function PaymentFailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") || searchParams.get("tran_id");
  const error = searchParams.get("error");

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-4"
    >
      <Card className="w-full text-center">
        <CardHeader className="pb-4">
          <motion.div
            variants={iconVariants}
            className="mb-4 flex justify-center"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="h-12 w-12 text-amber-600 dark:text-amber-400" />
            </div>
          </motion.div>
          <motion.div variants={itemVariants}>
            <CardTitle className="text-2xl font-bold">Payment Failed</CardTitle>
            <CardDescription className="mt-2 text-base">
              Your payment could not be completed. Please try again or use a
              different payment method.
            </CardDescription>
          </motion.div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <motion.div
              variants={itemVariants}
              className="rounded-lg bg-muted/50 p-4 text-left text-sm"
            >
              <span className="text-muted-foreground">Reason: </span>
              <span className="font-medium">{error}</span>
            </motion.div>
          )}

          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-3"
          >
            <Button
              size="lg"
              className="w-full"
              onClick={() => router.push(`/bookings/${bookingId || ""}`)}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => router.push("/bookings")}
            >
              <CalendarX className="mr-2 h-4 w-4" />
              View Bookings
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PaymentFailSkeleton() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-4">
      <Card className="w-full">
        <CardHeader className="items-center pb-4">
          <Skeleton className="mb-4 h-20 w-20 rounded-full" />
          <Skeleton className="h-8 w-56" />
          <Skeleton className="mt-2 h-5 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-muted/50 p-4">
            <Skeleton className="h-5 w-full" />
          </div>
          <Skeleton className="h-11 w-full rounded-md" />
          <Skeleton className="h-11 w-full rounded-md" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={<PaymentFailSkeleton />}>
      <PaymentFailContent />
    </Suspense>
  );
}
