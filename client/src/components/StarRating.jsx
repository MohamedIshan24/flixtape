export default function StarRating({ value, onChange, size = 'text-2xl' }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`${size} transition-colors ${
            star <= value ? 'text-red-500' : 'text-neutral-600 hover:text-neutral-400'
          }`}
          aria-label={`Rate ${star} out of 10`}
        >
          ★
        </button>
      ))}
    </div>
  )
}