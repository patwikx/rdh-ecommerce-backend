import { auth } from '@/auth';
import prismadb from '@/lib/db';
import { NextResponse } from 'next/server';


 
export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await auth();

    const body = await req.json();

    const { UoM } = body;

    if (!session?.user?.id) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!UoM) {
      return new NextResponse("UoM is required", { status: 400 });
    }


    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const user = await prismadb.user.findUnique({
      where: { id: session.user.id },
      include: { store: true }
    });

    if (!user) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const uom = await prismadb.uoM.create({
      data: {
        UoM,
        storeId: params.storeId
      }
    });
  
    return NextResponse.json(UoM);
  } catch (error) {
    console.log('[UOM_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const uoms = await prismadb.uoM.findMany({
      where: {
        storeId: params.storeId
      }
    });
  
    return NextResponse.json(uoms);
  } catch (error) {
    console.log('[UOM_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};