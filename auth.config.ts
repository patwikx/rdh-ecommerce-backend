import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcryptjs from "bcryptjs"

import { LoginSchema } from "@/schemas"
import { getUserByEmail } from "@/data/user"

export const authConfig = {
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const storeId = auth?.user?.storeId || ''
      const isOnDashboard = nextUrl.pathname.startsWith(`/${storeId}`)
      const isOnAuth = nextUrl.pathname.startsWith('/auth')

      if (isOnAuth) {
        if (isLoggedIn) {
          return Response.redirect(new URL(`/${storeId}`, nextUrl))
        }
        return true
      }

      if (isOnDashboard) {
        if (isLoggedIn) return true
        // Instead of redirecting, we'll return false and handle the redirect in the component
        return false
      }

      return true
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials)

        if (validatedFields.success) {
          const { email, password } = validatedFields.data

          const user = await getUserByEmail(email)
          if (!user || !user.password) return null

          const passwordsMatch = await bcryptjs.compare(password, user.password)

          if (passwordsMatch) return user
        }

        return null
      },
    }),
  ],
} satisfies NextAuthConfig

