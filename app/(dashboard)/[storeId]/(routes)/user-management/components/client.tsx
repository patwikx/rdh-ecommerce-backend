"use client";

import { Plus } from 'lucide-react';
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ApiList } from "@/components/ui/api-list";
import { columns, UserColumn } from './columns';
import { UserRegisterForm } from './user-form';



interface UserClientProps {
  data: UserColumn[]
  storeId: string
  roles: { id: string; role: string }[]
}

export const UserClient: React.FC<UserClientProps> = ({ data, storeId, roles }) => {
  const router = useRouter()

  const handleUserCreated = () => {
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
        <UserRegisterForm storeId={storeId} onUserCreated={handleUserCreated} roles={roles} />
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
      <Heading title="API" description="API Calls for Users" />
      <Separator />
      <ApiList entityName="users" entityIdName="userId" />
    </>
  )
};