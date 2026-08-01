import { Skeleton } from "@/components/ui/skeleton";

export default function PaymentSuccessLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Checkmark icon placeholder */}
        <Skeleton className="h-20 w-20 rounded-full mx-auto" />
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-80 mx-auto" />
        <Skeleton className="h-10 w-40 mx-auto" />
      </div>
    </div>
  );
}