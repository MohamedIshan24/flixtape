export default function HeroSkeleton() {
  return (
    <div className="relative w-full h-[50vh] md:h-[70vh] mb-6 bg-neutral-900 animate-pulse">
      <div className="absolute bottom-10 left-4 md:left-8 max-w-lg space-y-3">
        <div className="h-10 md:h-14 w-64 bg-neutral-800 rounded" />
        <div className="h-4 w-full bg-neutral-800 rounded" />
        <div className="h-4 w-3/4 bg-neutral-800 rounded" />
      </div>
    </div>
  )
}