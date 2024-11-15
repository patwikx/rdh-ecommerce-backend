

import prismadb from "@/lib/db";
import { UoMForm } from "./components/uom-form";

const UoMPage = async ({
  params
}: {
  params: { uomId: string }
}) => {
  const uom = await prismadb.uoM.findUnique({
    where: {
      id: params.uomId
    }
  });

  return ( 
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <UoMForm initialData={uom} />
      </div>
    </div>
  );
}

export default UoMPage;
