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
    const orderId = searchParams.get('orderId'); // Get orderId from query parameters


    if (!orderId) {
      // Fetch all orders if no orderId is provided
      const orders = await prismadb.order.findMany({
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

      return NextResponse.json(orders, { headers: corsHeaders });
    }

    // Fetch details for a specific order if orderId is provided
    const order = await prismadb.order.findUnique({
      where: {
        id: orderId, // Use the provided orderId to fetch the specific order
      },
      include: {
        orderItems: {
          include: {
            product: true,
          }
        }
      }
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404, headers: corsHeaders });
    }

    return NextResponse.json(order, { headers: corsHeaders });
  } catch (error) {
    console.error('[ORDERS_GET]', error);
    return new NextResponse("Internal error", { status: 500, headers: corsHeaders });
  }
}
