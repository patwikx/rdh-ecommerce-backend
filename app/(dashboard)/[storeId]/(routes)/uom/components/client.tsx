"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Separator } from "@/components/ui/separator";
import { ApiList } from "@/components/ui/api-list";

import { columns, UoMColumn } from "./columns";
import { Heading } from "@/components/ui/heading";

interface UoMClientProps {
  data: UoMColumn[];
}

export const UoMClient: React.FC<UoMClientProps> = ({
  data
}) => {
  const params = useParams();
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`UoM (${data.length})`} description="Manage unit of measure for your products" />
        <Button onClick={() => router.push(`/${params.storeId}/uom/new`)}>
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
      <Heading title="API" description="API Calls for UoM" />
      <Separator />
      <ApiList entityName="uom" entityIdName="uomId" />
    </>
  );
};
