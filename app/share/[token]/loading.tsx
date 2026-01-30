import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Header skeleton */}
        <div className="text-center space-y-3">
          <Skeleton className="h-9 w-32 mx-auto" />
          <Skeleton className="h-5 w-40 mx-auto" />
          <Skeleton className="h-4 w-36 mx-auto" />
        </div>

        {/* Download button skeleton */}
        <div className="mt-8">
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>

        {/* File list skeleton */}
        <div className="mt-8 rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30">
            <Skeleton className="h-5 w-16" />
          </div>

          <div className="divide-y">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-9 w-9 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Footer skeleton */}
        <div className="mt-8 flex justify-center">
          <Skeleton className="h-4 w-72" />
        </div>
      </div>
    </main>
  );
}
