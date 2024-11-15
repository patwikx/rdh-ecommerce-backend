import { format } from "date-fns";
import { UoMClient } from "./components/client";
import prismadb from "@/lib/db";
import { UoMColumn } from "./components/columns";

const UoMsPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const uoms = await prismadb.uoM.findMany({
    where: {
      storeId: params.storeId
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedColors: UoMColumn[] = uoms.map((item) => ({
    id: item.id,
    UoM: item.UoM,
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <UoMClient data={formattedColors} />
      </div>
    </div>
  );
};

export default UoMsPage;
