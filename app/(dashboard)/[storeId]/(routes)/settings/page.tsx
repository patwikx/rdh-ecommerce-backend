import { redirect } from "next/navigation";
import { SettingsForm } from "./components/settings-form";
import prismadb from "@/lib/db";
import { auth } from "@/auth";

export default async function SettingsPage({
  params
}: {
  params: { storeId: string }
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const user = await prismadb.user.findUnique({
    where: {
      id: session.user.id
    },
    include: {
      store: true
    }
  });

  if (!user) {
    redirect('/sign-in');
  }

  if (!user.store || user.store.id !== params.storeId) {
    redirect('/');
  }

  return ( 
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SettingsForm initialData={user.store} />
      </div>
    </div>
  );
}