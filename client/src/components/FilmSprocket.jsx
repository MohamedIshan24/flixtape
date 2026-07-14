/**
 * A row of filmstrip sprocket holes. Used as a section divider on the
 * landing page and as an edge detail on the auth panels — the one
 * recurring signature tying "Flixtape" back to actual tape/film stock.
 */
export default function FilmSprocket({ variant = 'red', className = '' }) {
  const tone = variant === 'panel' ? 'sprocket-row--panel' : ''
  return (
    <div
      aria-hidden="true"
      className={`sprocket-row ${tone} ${className}`}
    />
  )
}