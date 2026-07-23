"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, LayoutDashboard } from "lucide-react";
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
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 200, damping: 15 },
  },
};

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const transactionId = searchParams.get("transactionId");

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
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </motion.div>
          <motion.div variants={itemVariants}>
            <CardTitle className="text-2xl font-bold">
              Payment Successful
            </CardTitle>
            <CardDescription className="mt-2 text-base">
              Your payment has been processed successfully.
            </CardDescription>
          </motion.div>
        </CardHeader>
        <CardContent className="space-y-6">
          <motion.div
            variants={itemVariants}
            className="space-y-3 rounded-lg bg-muted/50 p-4 text-left"
          >
            {bookingId && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Booking ID</span>
                <span className="font-mono font-medium">{bookingId}</span>
              </div>
            )}
            {transactionId && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono font-medium">{transactionId}</span>
              </div>
            )}
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col gap-3"
          >
            <Button
              size="lg"
              className="w-full"
              onClick={() => router.push(`/bookings/${bookingId}`)}
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              View Booking
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => router.push("/dashboard")}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PaymentSuccessSkeleton() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center px-4">
      <Card className="w-full">
        <CardHeader className="items-center pb-4">
          <Skeleton className="mb-4 h-20 w-20 rounded-full" />
          <Skeleton className="h-8 w-56" />
          <Skeleton className="mt-2 h-5 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 rounded-lg bg-muted/50 p-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
          </div>
          <Skeleton className="h-11 w-full rounded-md" />
          <Skeleton className="h-11 w-full rounded-md" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSuccessSkeleton />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}