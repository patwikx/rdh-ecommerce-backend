// app/api/[storeId]/products/bulk-deactivate/route.ts
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
    
    // Authorization check
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
    const { productIds } = body as { productIds: string[] };

    if (!productIds || productIds.length === 0) {
      return new NextResponse("Product IDs are required", { status: 400 });
    }

    // Use a transaction to deactivate all products at once
    const deactivatedProducts = await prismadb.product.updateMany({
      where: {
        id: {
          in: productIds,
        },
        storeId: params.storeId, // Ensure products belong to the correct store
      },
      data: {
        isArchived: true,
      },
    });

    return NextResponse.json({ count: deactivatedProducts.count });

  } catch (error) {
    console.log('[PRODUCTS_BULK_DEACTIVATE_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
