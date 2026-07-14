import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getNotifications, markNotificationRead, deleteNotification } from '../api/notifications'
import { useProfiles } from '../context/ProfileContext'

export default function NotificationBell() {
  const { activeProfile } = useProfiles()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    async function load() {
      if (!activeProfile) return
      try {
        const res = await getNotifications(activeProfile.id)
        setNotifications(res.data)
      } catch (err) {
        console.error('Failed to load notifications', err)
      }
    }
    load()
  }, [activeProfile])

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  async function handleNotificationClick(notification) {
    if (!notification.is_read) {
      try {
        await markNotificationRead(activeProfile.id, notification.id)
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n))
        )
      } catch (err) {
        console.error('Failed to mark notification read', err)
      }
    }
    setIsOpen(false)
    navigate(`/movie/${notification.movie_id}`)
  }

  async function handleDismiss(e, notificationId) {
    e.stopPropagation()
    try {
      await deleteNotification(activeProfile.id, notificationId)
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
    } catch (err) {
      console.error('Failed to dismiss notification', err)
    }
  }

  return (
    <div className="relative font-display" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative text-smoke hover:text-reel transition"
        aria-label="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-flix-red text-reel text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-panel border border-panel-line rounded shadow-lg z-20">
          {notifications.length === 0 ? (
            <p className="text-smoke text-sm p-4">No notifications yet.</p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`flex items-start justify-between gap-2 p-3 border-b border-panel-line cursor-pointer hover:bg-void-soft transition ${
                  notification.is_read ? 'opacity-60' : ''
                }`}
              >
                <div>
                  <p className="text-sm text-reel">{notification.message}</p>
                  <p className="text-xs text-smoke mt-1">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDismiss(e, notification.id)}
                  className="text-smoke hover:text-reel text-xs shrink-0 transition"
                  aria-label="Dismiss"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
