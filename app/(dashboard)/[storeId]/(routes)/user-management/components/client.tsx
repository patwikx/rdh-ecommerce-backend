"use client";

import { Plus } from 'lucide-react';
import { useParams, useRouter } from "next/navigation";
import { useState, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ApiList } from "@/components/ui/api-list";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { columns, UserColumn } from './columns';
import { UserRegisterForm } from './user-form';

interface UserClientProps {
  data: UserColumn[]
  storeId: string
  roles: { id: string; role: string }[]
}

export const UserClient: React.FC<UserClientProps> = ({ data, storeId, roles }) => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const searchContent = `${item.name} ${item.email}`.toLowerCase();
      const matchesSearch = searchContent.includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || item.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [data, searchTerm, roleFilter]);

  const handleUserCreated = () => {
    router.refresh();
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
        <UserRegisterForm storeId={storeId} onUserCreated={handleUserCreated} roles={roles} />
      </div>
      <Separator />
      <div className="flex items-center space-x-4 py-4">
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.role}>
                {role.role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <DataTable 
        searchKey="name" 
        columns={columns} 
        data={filteredData} 
      />
      <Heading title="API" description="API Calls for Users" />
      <Separator />
      <ApiList entityName="users" entityIdName="userId" />
    </>
  );
};