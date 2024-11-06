import { auth } from '@/auth'
import prismadb from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const session = await auth()
    
    if (!session || !session.user || !session.user.id) {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const body = await req.json()
    const { name } = body

    if (!name) {
      return new NextResponse("Name is required", { status: 400 })
    }

    const user = await prismadb.user.findUnique({
      where: { id: session.user.id },
      include: { store: true }
    })

    if (!user) {
      return new NextResponse("User not found", { status: 404 })
    }

    if (user.store) {
      return new NextResponse("User already has a store", { status: 400 })
    }

    const store = await prismadb.store.create({
      data: {
        name,
        users: {
          connect: { id: user.id }
        }
      }
    })

    // Update the user with the new store
    await prismadb.user.update({
      where: { id: user.id },
      data: { storeId: store.id }
    })
  
    return NextResponse.json(store)
  } catch (error) {
    console.log('[STORES_POST]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}