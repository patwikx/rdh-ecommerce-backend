import { auth } from "@/auth";
import prismadb from "@/lib/db";
import { NextResponse } from "next/server";


export async function GET(
  req: Request,
  { params }: { params: { uomId: string } }
) {
  try {
    if (!params.uomId) {
      return new NextResponse("UoM id is required", { status: 400 });
    }

    const uom = await prismadb.uoM.findUnique({
      where: {
        id: params.uomId
      }
    });
  
    return NextResponse.json(uom);
  } catch (error) {
    console.log('[UOM_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function DELETE(
  req: Request,
  { params }: { params: { uomId: string, storeId: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.uomId) {
      return new NextResponse("UoM id is required", { status: 400 });
    }

    const user = await prismadb.user.findUnique({
      where: { id: session.user.id },
      include: { store: true }
    });

    if (!user) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const uom = await prismadb.uoM.delete({
      where: {
        id: params.uomId
      }
    });
  
    return NextResponse.json(uom);
  } catch (error) {
    console.log('[UOM_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};


export async function PATCH(
  req: Request,
  { params }: { params: { uomId: string, storeId: string } }
) {
  try {
    const session = await auth()

    const body = await req.json();

    const { UoM } = body;

    if (!session?.user?.id) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!UoM) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!params.uomId) {
      return new NextResponse("Color id is required", { status: 400 });
    }

    const user = await prismadb.user.findUnique({
      where: { id: session.user.id },
      include: { store: true }
    });

    if (!user) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const uom = await prismadb.uoM.update({
      where: {
        id: params.uomId
      },
      data: {
        UoM
      }
    });
  
    return NextResponse.json(uom);
  } catch (error) {
    console.log('[UOM_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
