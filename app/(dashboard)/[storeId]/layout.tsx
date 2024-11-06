import { redirect } from 'next/navigation'
import Navbar from '@/components/navbar'
import prismadb from '@/lib/db'
import { auth } from '@/auth'

export default async function DashboardLayout({
  children,
  params
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
    },
    include: {
      store: true
    }
  })

  if (!user) {
    redirect('/auth/sign-in')
  }

  if (!user.store || user.store.id !== params.storeId) {
    redirect('/')
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  )
}