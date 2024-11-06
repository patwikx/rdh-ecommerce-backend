import { NextResponse } from 'next/server';
import prismadb from '@/lib/db';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Adjust this to your frontend URL in production
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: Request) {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return NextResponse.json({}, { headers: corsHeaders });
  }

  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email'); // Get email from query parameters

    if (!email) {
      return new NextResponse("Email is required", { status: 400, headers: corsHeaders });
    }

    const orders = await prismadb.order.findMany({
      where: {
        clientEmail: email,
      },
      include: {
        orderItems: {
          include: {
            product: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    return NextResponse.json(orders, { headers: corsHeaders }); // Include CORS headers in the response
  } catch (error) {
    console.error('[ORDERS_GET]', error);
    return new NextResponse("Internal error", { status: 500, headers: corsHeaders });
  }
}
