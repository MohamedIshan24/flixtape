import { useProfiles } from '../context/ProfileContext'

export default function Browse() {
  const { activeProfile } = useProfiles()

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <h1 className="text-3xl font-bold">
        Browse coming in Step 5 — watching as {activeProfile?.name}
      </h1>
    </div>
  )
}