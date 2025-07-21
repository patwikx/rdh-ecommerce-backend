// app/api/[storeId]/products/search/route.ts
import { NextResponse } from "next/server";
import prismadb from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    if (!query) {
      return new NextResponse("Search query is required", { status: 400 });
    }

    const products = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        // Search by either name or barcode
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive', // Case-insensitive search
            },
          },
          {
            barCode: {
              equals: query,
            },
          },
        ],
        // Only find active products
        isArchived: false,
      },
      // Include details needed for the frontend display
      include: {
        category: { select: { name: true } },
        size: { select: { name: true } },
        color: { select: { name: true } },
      },
      take: 10, // Limit results to prevent performance issues
    });

    return NextResponse.json(products);
  } catch (error) {
    console.log('[PRODUCTS_SEARCH_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
