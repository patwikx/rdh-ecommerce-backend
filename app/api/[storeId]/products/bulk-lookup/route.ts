// app/api/[storeId]/products/bulk-lookup/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prismadb from "@/lib/db";

export async function POST(
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
    const { barcodes } = body as { barcodes: string[] };

    if (!barcodes || !Array.isArray(barcodes) || barcodes.length === 0) {
        return new NextResponse("Barcodes array is required", { status: 400 });
    }

    // Find all products that match the provided barcodes for the specific store
    const products = await prismadb.product.findMany({
        where: {
            storeId: params.storeId,
            barCode: {
                in: barcodes
            }
        },
        include: {
            category: { select: { name: true } },
            size: { select: { name: true } },
            color: { select: { name: true } },
        }
    });

    return NextResponse.json(products);

  } catch (error) {
    console.log('[PRODUCTS_BULK_LOOKUP_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}