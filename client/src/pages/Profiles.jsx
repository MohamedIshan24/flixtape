import { useAuth } from '../context/AuthContext'

export default function Profiles() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Profile selection coming in Step 4</h1>
      <p className="text-neutral-400">Logged in as {user?.email}</p>
      <button onClick={logout} className="text-red-500 hover:underline">
        Log out
      </button>
    </div>
  )
}