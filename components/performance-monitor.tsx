"use client"

import { useEffect } from "react"

export function PerformanceMonitor() {
  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') return

    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime)
        } else if (entry.entryType === 'first-input') {
          console.log('FID:', entry.processingStart - entry.startTime)
        } else if (entry.entryType === 'layout-shift') {
          console.log('CLS:', entry.value)
        }
      }
    })

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
    } catch (e) {
      // Fallback for browsers that don't support all entry types
      console.log('Performance monitoring not fully supported')
    }

    // Monitor long tasks with throttling
    let longTaskCount = 0
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          longTaskCount++
          // Only log every 5th long task to reduce console spam
          if (longTaskCount % 5 === 0) {
            console.warn(`Long task detected (${longTaskCount} total):`, entry.duration, 'ms')
          }
        }
      }
    })

    try {
      longTaskObserver.observe({ entryTypes: ['longtask'] })
    } catch (e) {
      console.log('Long task monitoring not supported')
    }

    return () => {
      observer.disconnect()
      longTaskObserver.disconnect()
    }
  }, [])

  return null
}