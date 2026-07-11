export default function MovieRowSkeleton({ cardCount = 6 }) {
  return (
    <div className="px-4 md:px-8 mb-8">
      <div className="h-6 w-40 bg-neutral-800 rounded mb-4 animate-pulse" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: cardCount }).map((_, i) => (
          <div
            key={i}
            className="w-40 md:w-48 aspect-video shrink-0 bg-neutral-800 rounded animate-pulse"
          />
        ))}
      </div>
    </div>
  )
}