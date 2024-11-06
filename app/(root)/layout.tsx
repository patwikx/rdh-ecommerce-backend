import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import prismadb from '@/lib/db'
import { StoreModal } from '@/components/modals/store-modal'

export default async function RootLayout({
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

  if (user.store && user.store.id !== params.storeId) {
    redirect(`/${user.store.id}`)
  }

  if (!user.store) {
    return (
      <>
        <StoreModal />
        {children}
      </>
    )
  }

  return <>{children}</>
}