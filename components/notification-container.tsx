"use client"

import { useNotification } from "@/contexts/notification-context"
import { ToastNotification } from "@/components/toast-notification"

export function NotificationContainer() {
  const { notifications, removeNotification } = useNotification()

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {notifications.map((notification) => (
        <ToastNotification
          key={notification.id}
          message={notification.message}
          isVisible={true}
          onClose={() => removeNotification(notification.id)}
          duration={notification.duration}
        />
      ))}
    </div>
  )
}
