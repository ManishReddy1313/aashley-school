import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
  return (
    <div className="space-y-4 animate-pulse p-6">
      <Skeleton className="h-8 w-48 rounded-none" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton className="h-24 rounded-none" />
        <Skeleton className="h-24 rounded-none" />
        <Skeleton className="h-24 rounded-none" />
        <Skeleton className="h-24 rounded-none" />
      </div>
      <Skeleton className="h-64 rounded-none" />
    </div>
  );
}
