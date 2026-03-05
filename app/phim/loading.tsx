// app/phim/loading.tsx
// Fix #5: Skeleton loading page khi navigate đến trang phim

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#010030] text-white">
      {/* Navbar placeholder */}
      <div className="fixed top-0 left-0 w-full z-[100] flex justify-center">
        <div className="w-[95%] max-w-6xl mt-6 rounded-full h-14 bg-white/5 animate-pulse" />
      </div>

      <div className="max-w-[1800px] mx-auto px-4 md:px-8 pt-[120px]">
        {/* Tiêu đề skeleton */}
        <div className="mb-8 border-b border-white/10 pb-4">
          <div className="h-8 w-48 bg-white/10 rounded-lg animate-pulse mb-3" />
          <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />
        </div>

        {/* Grid phim skeleton */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 md:gap-6">
          {Array.from({ length: 32 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="w-full aspect-[2/3] rounded-xl bg-white/10 animate-pulse" 
                   style={{ animationDelay: `${(i % 8) * 50}ms` }}
              />
              <div className="h-3 w-full bg-white/5 rounded animate-pulse" style={{ animationDelay: `${(i % 8) * 50}ms` }} />
              <div className="h-3 w-3/4 bg-white/5 rounded animate-pulse" style={{ animationDelay: `${(i % 8) * 50}ms` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
