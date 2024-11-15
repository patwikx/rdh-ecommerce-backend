import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import prismadb from '@/lib/db'
import Navbar from '@/components/navbar'
import { Toaster } from '@/components/ui/toaster'




export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
  params: { storeId: string }
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/sign-in')
  }

  const user = await prismadb.user.findUnique({
    where: {
      id: session.user.id
    }
 
  })

  if (!user) {
    redirect('/auth/sign-in')
  }
  return (
    <>
    <Navbar />
      {children}
      <Toaster />
    </>
  )
}