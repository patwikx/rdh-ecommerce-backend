import prismadb from "@/lib/db";

export const getTotalRevenue = async (storeId: string) => {
  // Fetch paid orders with their items and total item amount
  const paidOrders = await prismadb.order.findMany({
    where: {
      storeId,
      isPaid: true
    },
    include: {
      orderItems: {
        // Include product details if needed, but not necessary for total revenue calculation
        include: {
          product: true
        }
      }
    }
  });

  // Calculate total revenue based on totalItemAmount
  const totalRevenue = paidOrders.reduce((total, order) => {
    const orderTotal = order.orderItems.reduce((orderSum, item) => {
      // Ensure totalItemAmount is defined and use it for summing
      return orderSum + (item.totalItemAmount || 0);
    }, 0);
    return total + orderTotal;
  }, 0);

  return totalRevenue;
};
