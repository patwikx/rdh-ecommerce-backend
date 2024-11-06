import { NextResponse } from "next/server";

import prismadb from "@/lib/db";
import { auth } from "@/auth";


export async function GET(
  req: Request,
  { params }: { params: { sizeId: string } }
) {
  try {
    if (!params.sizeId) {
      return new NextResponse("Size id is required", { status: 400 });
    }

    const size = await prismadb.size.findUnique({
      where: {
        id: params.sizeId
      }
    });
  
    return NextResponse.json(size);
  } catch (error) {
    console.log('[SIZE_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function DELETE(
  req: Request,
  { params }: { params: { sizeId: string, storeId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.sizeId) {
      return new NextResponse("Size id is required", { status: 400 });
    }

    const user = await prismadb.user.findUnique({
      where: { id: session.user.id },
      include: { store: true }
    });

    if (!user) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const size = await prismadb.size.delete({
      where: {
        id: params.sizeId
      }
    });
  
    return NextResponse.json(size);
  } catch (error) {
    console.log('[SIZE_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};


export async function PATCH(
  req: Request,
  { params }: { params: { sizeId: string, storeId: string } }
) {
  try {
    const session = await auth()

    const body = await req.json();

    const { name, value } = body;

    if (!session?.user?.id) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!value) {
      return new NextResponse("Value is required", { status: 400 });
    }


    if (!params.sizeId) {
      return new NextResponse("Size id is required", { status: 400 });
    }

    const user = await prismadb.user.findUnique({
      where: { id: session.user.id },
      include: { store: true }
    });

    if (!user) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const size = await prismadb.size.update({
      where: {
        id: params.sizeId
      },
      data: {
        name,
        value
      }
    });
  
    return NextResponse.json(size);
  } catch (error) {
    console.log('[SIZE_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
