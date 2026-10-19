import { redirect } from "next/navigation";

import { auth } from "@/app/auth";
import ItemForm from "@/app/ui/item-form";
import { createItem } from "../actions";
import { CATEGORIES } from "../validation";

export default async function CreateItemPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold text-sky-900">เพิ่มอุปกรณ์</h1>

      <ItemForm
        action={createItem}
        categories={[...CATEGORIES]}
        submitLabel="บันทึก"
      />
    </main>
  );
}