import { auth } from "@/auth";
import prismadb from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await auth()
    const body = await req.json();

    const { name } = body;

    if (!session?.user?.id) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const user = await prismadb.user.findUnique({
      where: { id: session.user.id },
      include: { store: true }
    });

    if (!user || !user.store || user.store.id !== params.storeId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const updatedStore = await prismadb.store.update({
      where: {
        id: params.storeId,
      },
      data: {
        name
      }
    });
  
    return NextResponse.json(updatedStore);
  } catch (error) {
    console.log('[STORE_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const user = await prismadb.user.findUnique({
      where: { id: session.user.id },
      include: { store: true }
    });

    if (!user || !user.store || user.store.id !== params.storeId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const deletedStore = await prismadb.store.delete({
      where: {
        id: params.storeId,
      }
    });

    // Update the user to remove the store association
    await prismadb.user.update({
      where: { id: session.user.id },
      data: { storeId: null }
    });
  
    return NextResponse.json(deletedStore);
  } catch (error) {
    console.log('[STORE_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};