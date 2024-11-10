import { NextResponse } from "next/server"
import prismadb from "@/lib/db"
import { auth } from "@/auth"

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await auth()
    const body = await req.json()

    const { products } = body

    if (!session?.user?.id) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 })
    }

    if (!products || !Array.isArray(products)) {
      return new NextResponse("Invalid input", { status: 400 })
    }

    const user = await prismadb.user.findUnique({
      where: { id: session.user.id },
      include: { store: true }
    });

    if (!user) {
      return new NextResponse("Unauthorized", { status: 405 })
    }

    const createdProducts = await prismadb.$transaction(
      products.map((product) => 
        prismadb.product.create({
          data: {
            ...product,
            storeId: params.storeId,
            images: {
              create: product.images?.map((image: string) => ({
                url: image
              })) || []
            }
          }
        })
      )
    )

    return NextResponse.json(createdProducts)
  } catch (error) {
    console.log('[PRODUCTS_POST]', error)
    return new NextResponse("Internal error", { status: 500 })
  }
}