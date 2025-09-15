"use client"

import React from "react"
import { CheckCircle, X } from "lucide-react"

interface ToastNotificationProps {
  message: string
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export function ToastNotification({ 
  message, 
  isVisible, 
  onClose, 
  duration = 3000 
}: ToastNotificationProps) {
  // Remove the useEffect timer since the notification context handles auto-removal
  if (!isVisible) return null

  return (
    <div className="toast-notification">
      <div className="toast-content">
        <CheckCircle className="toast-icon" size={20} />
        <span className="toast-message">{message}</span>
        <button 
          className="toast-close" 
          onClick={onClose}
          type="button"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
