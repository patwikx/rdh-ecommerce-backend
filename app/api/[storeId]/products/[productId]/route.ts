// /api/product/[productId]/route.ts

import { NextResponse } from "next/server";
import prismadb from "@/lib/db";
import { auth } from "@/auth";

// GET function remains the same...
export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    const product = await prismadb.product.findUnique({
      where: {
        id: params.productId
      },
      include: {
        images: true,
        category: true,
        size: true,
        color: true,
      }
    });
  
    return NextResponse.json(product);
  } catch (error) {
    console.log('[PRODUCT_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

// DELETE function remains the same...
export async function DELETE(
  req: Request,
  { params }: { params: { productId: string, storeId: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    // Recommended: Add a check to ensure the user owns the store
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        users: { some: { id: session.user.id } }
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const product = await prismadb.product.delete({
      where: {
        id: params.productId,
      },
    });
  
    return NextResponse.json(product);
  } catch (error) {
    console.log('[PRODUCT_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};


// MODIFIED PATCH function
export async function PATCH(
  req: Request,
  { params }: { params: { productId: string, storeId: string } }
) {
  try {
    const session = await auth()
    const body = await req.json();
    const { name, price, categoryId, images, colorId, sizeId, isFeatured, isArchived } = body;
    
    if (!session?.user?.id) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    // When doing a full update, these fields are required.
    // We keep these checks but make them conditional.
    if (name !== undefined && !name) {
      return new NextResponse("Name is required", { status: 400 });
    }
    if (images !== undefined && (!images || !images.length)) {
      return new NextResponse("Images are required", { status: 400 });
    }
    if (price !== undefined && !price) {
      return new NextResponse("Price is required", { status: 400 });
    }
    if (categoryId !== undefined && !categoryId) {
      return new NextResponse("Category id is required", { status: 400 });
    }
    if (colorId !== undefined && !colorId) {
      return new NextResponse("Color id is required", { status: 400 });
    }
    if (sizeId !== undefined && !sizeId) {
      return new NextResponse("Size id is required", { status: 400 });
    }

    // Recommended: Add a check to ensure the user owns the store
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        users: { some: { id: session.user.id } }
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    // This logic now handles both full updates and partial updates (like archiving)
    await prismadb.product.update({
      where: {
        id: params.productId
      },
      data: {
        name,
        price,
        categoryId,
        colorId,
        sizeId,
        isFeatured,
        isArchived,
        // Only update images if they are provided in the request body
        ...(images && images.length > 0 && {
          images: {
            deleteMany: {},
          }
        })
      },
    });

    // If new images were provided, create them
    if (images && images.length > 0) {
      const product = await prismadb.product.update({
        where: {
          id: params.productId
        },
        data: {
          images: {
            createMany: {
              data: [
                ...images.map((image: { url: string }) => image),
              ],
            },
          },
        },
      })
      return NextResponse.json(product);
    }
    
    // For requests without images (like deactivation), return the result of the first update
    const product = await prismadb.product.findUnique({ where: { id: params.productId } });
    return NextResponse.json(product);

  } catch (error) {
    console.log('[PRODUCT_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};