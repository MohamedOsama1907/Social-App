import { Skeleton } from "@/Components/ui/skeleton";
export default function PostSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[900px] px-0 py-2 sm:py-3">
      <article className="mx-auto w-full overflow-hidden rounded-2xl border border-[#e8e8e6] bg-white shadow-[0_8px_24px_rgba(22,22,26,0.06)]">
        <header className="flex items-start justify-between gap-3 px-4 py-4 sm:px-6 sm:py-5 lg:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <Skeleton className="size-10 shrink-0 rounded-full sm:size-11" />
            <div className="min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-28 sm:h-5 sm:w-36" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-3.5 w-20 sm:w-24" />
                <Skeleton className="size-3.5 rounded-full" />
                <Skeleton className="h-3.5 w-12" />
              </div>
            </div>
          </div>
          <Skeleton className="mt-1 size-6 shrink-0 rounded-full" />
        </header>

        <div className="px-4 pb-5 sm:px-6 lg:px-7">
          <Skeleton className="h-5 w-12 sm:h-6" />
        </div>

        <Skeleton className="block aspect-[4/3] w-full rounded-none sm:aspect-[16/10] lg:aspect-[16/9]" />

        <footer className="px-4 py-4 sm:px-6 lg:px-7">
          <div className="flex items-center justify-between border-b border-[#eeeeec] pb-3">
            <Skeleton className="h-4 w-16 sm:w-20" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-20 sm:w-24" />
              <Skeleton className="h-4 w-16 sm:w-20" />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1 border-b border-[#eeeeec] py-2 text-xs sm:text-sm">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-center gap-2 py-2">
                <Skeleton className="size-4 rounded-full" />
                <Skeleton className="h-4 w-10 sm:w-14" />
              </div>
            ))}
          </div>

          <div className="mt-2 flex items-start gap-2.5 pt-1">
            <Skeleton className="size-7 shrink-0 rounded-full" />
            <Skeleton className="mt-1 h-4 w-28 sm:w-36" />
          </div>
        </footer>
      </article>
    </div>
  );
}
