// app/api/[storeId]/products/bulk-update/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prismadb from "@/lib/db";

// Define a more flexible payload structure.
// 'id' is required, all other Product fields are optional.
type ProductUpdatePayload = {
  id: string;
  name?: string;
  barCode?: string;
  itemDesc?: string;
  price?: number;
  categoryId?: string;
  sizeId?: string;
  colorId?: string;
  uomId?: string;
  isFeatured?: boolean;
  isArchived?: boolean;
};

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
    const { products } = body as { products: ProductUpdatePayload[] };

    if (!products || !Array.isArray(products) || products.length === 0) {
      return new NextResponse("Product data array is required", { status: 400 });
    }

    // A transaction is essential for updating multiple records with different data
    const updatePromises = products.map(productData => {
      const { id, ...dataToUpdate } = productData;

      if (!id) {
        throw new Error("Product ID is missing in one of the update objects.");
      }

      // The `dataToUpdate` object will only contain the fields sent in the request
      return prismadb.product.update({
        where: {
          id: id,
          storeId: params.storeId, // SECURITY: Ensures we only update products in this store
        },
        data: dataToUpdate, // Dynamically updates only the provided fields
      });
    });

    // Execute all updates. If one fails, all are rolled back.
    await prismadb.$transaction(updatePromises);

    return NextResponse.json({ message: "Products updated successfully" });

  } catch (error) {
    console.log('[PRODUCTS_BULK_UPDATE_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}