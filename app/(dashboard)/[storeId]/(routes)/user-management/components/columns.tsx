"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-actions"


export type UserColumn = {
  id: string
  name: string
  email: string
  createdAt: string
}

export const columns: ColumnDef<UserColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "createdAt",
    header: "Date Created",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />
  },
]