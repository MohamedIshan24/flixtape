import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPortalSession } from '../api/billing'
import { changePassword, deleteAccount } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function Account() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  async function handleManageBilling() {
    setError('')
    setIsLoading(true)
    try {
      const res = await createPortalSession()
      window.location.href = res.data.portal_url
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to open billing portal')
      setIsLoading(false)
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters')
      return
    }

    setIsSavingPassword(true)
    try {
      await changePassword(currentPassword, newPassword)
      setPasswordSuccess('Password updated successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordError(err.response?.data?.detail || 'Failed to update password')
    } finally {
      setIsSavingPassword(false)
    }
  }

  async function handleDeleteAccount() {
    setDeleteError('')
    setIsDeleting(true)
    try {
      await deleteAccount()
      logout()
      navigate('/login')
    } catch (err) {
      setDeleteError(err.response?.data?.detail || 'Failed to delete account')
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-void text-reel px-4 md:px-8 py-10 font-display">
      <button onClick={() => navigate(-1)} className="text-smoke hover:text-reel mb-6 transition">
        ← Back
      </button>

      <h1 className="text-3xl font-extrabold mb-8">Settings</h1>

      <div className="max-w-lg mx-auto space-y-8">
        {/* Profile / plan info */}
        <div className="bg-panel border border-panel-line rounded-lg p-6 space-y-4">
          <div>
            <p className="text-smoke text-sm">Email</p>
            <p>{user?.email}</p>
          </div>
          <div>
            <p className="text-smoke text-sm">Current Plan</p>
            <p className="capitalize">{user?.subscription_plan || 'free'}</p>
          </div>
          <div>
            <p className="text-smoke text-sm">Status</p>
            <p className="capitalize">{user?.subscription_status || 'No active subscription'}</p>
          </div>

          {error && <p className="text-flix-red text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            {user?.subscription_plan !== 'free' && (
              <button
                onClick={handleManageBilling}
                disabled={isLoading}
                className="bg-void-soft hover:bg-panel-line border border-panel-line text-reel px-4 py-2 rounded font-semibold transition"
              >
                {isLoading ? 'Loading...' : 'Manage Billing'}
              </button>
            )}
            <button
              onClick={() => navigate('/pricing')}
              className="bg-flix-red hover:bg-flix-red-dim text-reel px-4 py-2 rounded font-semibold transition"
            >
              {user?.subscription_plan === 'free' ? 'Subscribe Now' : 'Change Plan'}
            </button>
          </div>
        </div>

        {/* Change password */}
        <div className="bg-panel border border-panel-line rounded-lg p-6">
          <h2 className="text-lg font-extrabold mb-4">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <input
              type="password"
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-void border border-panel-line text-reel placeholder-smoke rounded px-3 py-2 outline-none focus:border-flix-red focus:ring-1 focus:ring-flix-red transition"
              required
            />
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-void border border-panel-line text-reel placeholder-smoke rounded px-3 py-2 outline-none focus:border-flix-red focus:ring-1 focus:ring-flix-red transition"
              required
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-void border border-panel-line text-reel placeholder-smoke rounded px-3 py-2 outline-none focus:border-flix-red focus:ring-1 focus:ring-flix-red transition"
              required
            />

            {passwordError && <p className="text-flix-red text-sm">{passwordError}</p>}
            {passwordSuccess && <p className="text-green-500 text-sm">{passwordSuccess}</p>}

            <button
              type="submit"
              disabled={isSavingPassword}
              className="bg-void-soft hover:bg-panel-line border border-panel-line text-reel px-4 py-2 rounded font-semibold transition"
            >
              {isSavingPassword ? 'Saving...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Danger zone */}
        <div className="bg-panel border border-flix-red/40 rounded-lg p-6">
          <h2 className="text-lg font-extrabold mb-2 text-flix-red">Danger Zone</h2>
          <p className="text-smoke text-sm mb-4">
            Deleting your account permanently removes all profiles, watch history, ratings, and My List entries. This cannot be undone.
          </p>

          {deleteError && <p className="text-flix-red text-sm mb-3">{deleteError}</p>}

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="border border-flix-red text-flix-red hover:bg-flix-red hover:text-reel px-4 py-2 rounded font-semibold transition"
            >
              Delete Account
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm">Are you sure? Type your email to confirm you understand this is permanent.</p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="bg-flix-red hover:bg-flix-red-dim text-reel px-4 py-2 rounded font-semibold transition"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="border border-panel-line text-smoke hover:text-reel px-4 py-2 rounded font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}