import { format } from "date-fns"

import prismadb from "@/lib/db"
import { UserColumn } from "./components/columns"
import { UserClient } from "./components/client"

interface UserManagementPageProps {
  params: { storeId: string }
}

const UserManagementPage: React.FC<UserManagementPageProps> = async ({ params }) => {
  const users = await prismadb.user.findMany({
    where: {
      storeId: params.storeId
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const formattedUsers: UserColumn[] = users.map((item) => ({
    id: item.id,
    name: item.name || '',
    email: item.email || '',
    createdAt: format(item.createdAt, 'MMMM do, yyyy')
  }))

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <UserClient data={formattedUsers} storeId={params.storeId} />
      </div>
    </div>
  )
}

export default UserManagementPage