import { format } from "date-fns";
import { CreditCard, DollarSign, Package, ShoppingCart } from 'lucide-react';

import prismadb from "@/lib/db";
import { formatter } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Charts } from "./components/charts";

const AccountingReportsPage = async ({ params }: { params: { storeId: string } }) => {
  const orders = await prismadb.order.findMany({
    where: {
      storeId: params.storeId,
      isPaid: true
    },
    include: {
      orderItems: {
        include: {
          product: {
            include: {
              category: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const totalRevenue = orders.reduce((total, order) => {
    return total + (order.totalAmountItemAndShipping?.toNumber() || 0);
  }, 0);

  const totalOrders = orders.length;

  const totalProducts = await prismadb.product.count({
    where: {
      storeId: params.storeId
    }
  });

  // Calculate monthly revenue
  const monthlyRevenue = orders.reduce((acc, order) => {
    const month = format(order.createdAt, 'MMMM');
    const revenue = order.totalAmountItemAndShipping?.toNumber() || 0;
    acc[month] = (acc[month] || 0) + revenue;
    return acc;
  }, {} as Record<string, number>);

  const monthlyRevenueData = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
    name: month,
    total: revenue
  }));

  // Calculate product category distribution
  const categoryDistribution = orders.reduce((acc, order) => {
    order.orderItems.forEach(item => {
      const category = item.product.category?.name || 'Uncategorized';
      acc[category] = (acc[category] || 0) + (item.totalItemAmount || 0);
    });
    return acc;
  }, {} as Record<string, number>);

  const categoryDistributionData = Object.entries(categoryDistribution).map(([category, total]) => ({
    name: category,
    value: total
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading title="Accounting Reports" description="Financial overview and reports" />
        <Separator />
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatter.format(totalRevenue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{totalOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales This Month</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatter.format(monthlyRevenueData[monthlyRevenueData.length - 1]?.total || 0)}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Charts 
          monthlyRevenueData={monthlyRevenueData}
          categoryDistributionData={categoryDistributionData}
        />
      </div>
    </div>
  );
};

export default AccountingReportsPage;