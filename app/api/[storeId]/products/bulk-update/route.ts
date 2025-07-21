// app/api/[storeId]/products/bulk-update/route.ts
import { NextResponse } from "next/server";
import prismadb from "@/lib/db";
import { auth } from "@/auth";

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }
    
    // Authorization check: ensure user is associated with the store
    const storeByUserId = await prismadb.store.findFirst({
        where: {
          id: params.storeId,
          users: { some: { id: session.user.id } }
        }
      });
  
    if (!storeByUserId) {
    return new NextResponse("Unauthorized", { status: 405 });
    }

    const body = await req.json();
    const { products } = body as { products: { id: string; price: number }[] };

    if (!products || products.length === 0) {
      return new NextResponse("Product data is required", { status: 400 });
    }

    // Validate the input
    for (const product of products) {
        if (!product.id || typeof product.price !== 'number' || product.price < 0) {
            return new NextResponse("Invalid product data provided", { status: 400 });
        }
    }

    // Use a transaction to update all products at once
    const updatedProducts = await prismadb.$transaction(
      products.map((p) =>
        prismadb.product.update({
          where: {
            id: p.id,
            // Ensure the product belongs to the correct store
            storeId: params.storeId,
          },
          data: {
            price: p.price,
          },
        })
      )
    );

    return NextResponse.json({ count: updatedProducts.length });

  } catch (error) {
    console.log('[PRODUCTS_BULK_UPDATE_PATCH]', error);
    // If transaction fails, Prisma throws an error that will be caught here
    return new NextResponse("Internal error", { status: 500 });
  }
}
