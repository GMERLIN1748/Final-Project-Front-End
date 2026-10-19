import { notFound, redirect } from "next/navigation";

import { auth } from "@/app/auth";
import prisma from "@/app/lib/prisma";
import ItemForm from "@/app/ui/item-form";
import { updateItem } from "../../actions";
import { CATEGORIES } from "../../validation";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  const { id } = await params;
  const itemId = Number(id);

  if (Number.isNaN(itemId)) {
    notFound();
  }

  const item = await prisma.item.findUnique({ where: { id: itemId } });

  if (!item) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold text-sky-900">แก้ไขอุปกรณ์</h1>

      <ItemForm
        action={updateItem.bind(null, item.id)}
        categories={[...CATEGORIES]}
        submitLabel="บันทึกการแก้ไข"
        defaultValues={{
          name: item.name,
          category: item.category,
          description: item.description ?? "",
          totalQty: String(item.totalQty),
        }}
      />
    </main>
  );
}