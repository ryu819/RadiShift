import { Skeleton } from "@/components/ui/skeleton";

export function SummaryValueSkeleton() {
  return (
    <div className="flex justify-center pt-5">
      <Skeleton className="h-9 w-18" />
    </div>
  );
}
