'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { UserAuthForm } from './components/auth-form'
import { useRouter } from 'next/navigation'
import { useCurrentUser } from '@/lib/auth'

export default function Login() {
  const session = useCurrentUser()
  const router = useRouter()

  useEffect(() => {
    if (session) {
      router.push('/')
    }
  }, [session, router])

  return (
    <div className="flex min-h-screen">
      {/* Hero Section */}
      <div className="hidden w-1/2 bg-[#f8f9fa] lg:block">
        <div className="relative flex h-full flex-col justify-between p-8">
          <div className="relative z-10">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">RD Hardware & Fishing Supply, Inc.</h1>
          </div>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-90"
            style={{
              backgroundImage: "url('/placeholder.svg?height=1080&width=1080')",
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
    
            }}
          />
        </div>
      </div>

      {/* Login Form Section */}
      <div className="flex w-full items-center justify-center lg:w-1/2">
        <div className="w-full max-w-md space-y-8 px-4 sm:px-6">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Welcome 👋</h2>
            <p className="text-sm text-muted-foreground">Please login here</p>
          </div>

          <UserAuthForm />

          <div className="flex items-center justify-between space-x-2">
            <Link
              href="/register"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Contact MIS Department.
            </Link>
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
              Privacy Policy
            </Link>
            .
          </div>
        </div>
      </div>
    </div>
  )
}