import { auth } from "@/auth";
import prismadb from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { billboardId: string } }
) {
  try {
    if (!params.billboardId) {
      console.log("[ERROR] Billboard id is missing in GET request");
      return new NextResponse("Billboard id is required", { status: 400 });
    }

    const billboard = await prismadb.billboard.findUnique({
      where: { id: params.billboardId },
    });

    if (!billboard) {
      return new NextResponse("Billboard not found", { status: 404 });
    }

    return NextResponse.json(billboard);
  } catch (error) {
    console.error("[BILLBOARD_GET_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { billboardId: string; storeId: string } }
) {
  try {
    const session = await auth();
    console.log("Session:", session);
    console.log("Params:", params);

    if (!session?.user?.id) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.billboardId || !params.storeId) {
      console.log("[ERROR] Missing billboardId or storeId in DELETE request");
      return new NextResponse("Billboard id and Store id are required", { status: 400 });
    }

    const user = await prismadb.user.findUnique({
      where: { id: session.user.id },
      include: { store: true },
    });

    if (!user?.store || user.store.id !== params.storeId) {
      console.log("[ERROR] Unauthorized access attempt by user:", session.user.id);
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const deletedBillboard = await prismadb.billboard.delete({
      where: { id: params.billboardId },
    });

    return NextResponse.json(deletedBillboard);
  } catch (error) {
    console.error("[BILLBOARD_DELETE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { billboardId: string; storeId: string } }
) {
  try {
    const session = await auth();
    console.log("Session:", session);
    console.log("Params:", params);

    if (!session?.user?.id) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    const body = await req.json();
    const { label, imageUrl } = body;

    if (!label || !imageUrl) {
      console.log("[ERROR] Label or Image URL is missing in PATCH request");
      return new NextResponse("Label and Image URL are required", { status: 400 });
    }

    if (!params.billboardId || !params.storeId) {
      console.log("[ERROR] Missing billboardId or storeId in PATCH request");
      return new NextResponse("Billboard id and Store id are required", { status: 400 });
    }

    const user = await prismadb.user.findUnique({
      where: { id: session.user.id },
      include: { store: true },
    });

    if (!user?.store || user.store.id !== params.storeId) {
      console.log("[ERROR] Unauthorized access attempt by user:", session.user.id);
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const updatedBillboard = await prismadb.billboard.update({
      where: { id: params.billboardId },
      data: { label, imageUrl },
    });

    return NextResponse.json(updatedBillboard);
  } catch (error) {
    console.error("[BILLBOARD_PATCH_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
