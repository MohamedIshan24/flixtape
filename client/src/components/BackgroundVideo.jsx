export default function BackgroundVideo() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-void">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 70% 60% at 15% 20%, rgba(229,9,20,0.16) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 85% 85%, rgba(229,9,20,0.10) 0%, transparent 55%)',
        }}
      />
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-void/40 to-void" />
      <div className="grain-overlay" />
      <div className="scanlines" />
    </div>
  )
}
