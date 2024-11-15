'use client'

import { useSession, signOut } from "next-auth/react"
import { useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"

const TIMEOUT_DURATION = 30 * 60 * 1000 // 30 minutes in milliseconds

export function IdleTimer() {
  const { data: session } = useSession()
  const router = useRouter()
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleTimeout = useCallback(async () => {
    if (session) {
      await signOut({ redirect: false })
      router.push('/auth/sign-in')
    }
  }, [session, router])

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(handleTimeout, TIMEOUT_DURATION)
  }, [handleTimeout])

  useEffect(() => {
    if (session) {
      resetTimer()
      window.addEventListener('mousemove', resetTimer)
      window.addEventListener('keydown', resetTimer)
      window.addEventListener('click', resetTimer)
      window.addEventListener('scroll', resetTimer)
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      window.removeEventListener('mousemove', resetTimer)
      window.removeEventListener('keydown', resetTimer)
      window.removeEventListener('click', resetTimer)
      window.removeEventListener('scroll', resetTimer)
    }
  }, [session, resetTimer])

  return null
}