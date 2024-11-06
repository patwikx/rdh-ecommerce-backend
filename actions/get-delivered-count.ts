import prismadb from "@/lib/db";


export const getDeliveredOrder = async (storeId: string) => {
  const salesCount = await prismadb.order.count({
    where: {
      storeId,
      orderStatus: true
    },
  });

  return salesCount;
};
