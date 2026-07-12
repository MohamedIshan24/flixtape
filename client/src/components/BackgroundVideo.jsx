export default function BackgroundVideo() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-black">
      <div className="absolute inset-0 bg-linear-to-br from-neutral-900 via-black to-red-950/40" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, rgba(220,38,38,0.25) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(220,38,38,0.15) 0%, transparent 40%)',
        }}
      />
    </div>
  )
}