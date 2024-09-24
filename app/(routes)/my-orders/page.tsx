import { promises as fs } from "fs"
import path from "path"
import { Metadata } from "next"
import Image from "next/image"
import { z } from "zod"
import { taskSchema } from "./data/schema"
import { DataTable } from "./components/data-table"
import { columns } from "./components/columns"
import { getServerSession } from "next-auth"

export const metadata: Metadata = {
  title: "Tasks",
  description: "A task and issue tracker build using Tanstack Table.",
}

// Simulate a database read for tasks.
async function getTasks() {
  const data = await fs.readFile(
    path.join(process.cwd(), "app/(routes)/my-orders/data/task.json") // Updated path here
  )

  const tasks = JSON.parse(data.toString())

  return z.array(taskSchema).parse(tasks)
}



export default async function TaskPage() {
  const tasks = await getTasks()
  const session = await getServerSession();

  return (
    <>
      <div className="md:hidden">
        <Image
          src="/examples/tasks-light.png"
          width={1280}
          height={998}
          alt="Playground"
          className="block dark:hidden"
        />
        <Image
          src="/examples/tasks-dark.png"
          width={1280}
          height={998}
          alt="Playground"
          className="hidden dark:block"
        />
      </div>
      <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome back! {session?.user?.name} </h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your orders for this month.
            </p>
          </div>
          <div className="flex items-center space-x-2">
          </div>
        </div>
        <DataTable data={tasks} columns={columns} />
      </div>
    </>
  )
}