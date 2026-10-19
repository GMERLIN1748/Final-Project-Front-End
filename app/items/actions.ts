"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/app/auth";
import prisma from "@/app/lib/prisma";
import { itemSchema } from "./validation";

export type ItemFormState = {
  errors?: Partial<
    Record<"name" | "category" | "description" | "totalQty" | "form", string[]>
  >;
  values?: {
    name: string;
    category: string;
    description: string;
    totalQty: string;
  };
};

// ตรวจสิทธิ์ฝั่งเซิร์ฟเวอร์ (สำคัญ: ห้ามเช็กแค่ที่หน้าเว็บ)
async function isAdmin() {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

function readForm(formData: FormData) {
  const values = {
    name: String(formData.get("name") ?? ""),
    category: String(formData.get("category") ?? ""),
    description: String(formData.get("description") ?? ""),
    totalQty: String(formData.get("totalQty") ?? ""),
  };

  const parsed = itemSchema.safeParse({
    name: values.name,
    category: values.category,
    description: values.description,
    totalQty: Number(values.totalQty),
  });

  return { values, parsed };
}

// เพิ่มอุปกรณ์
export async function createItem(
  prevState: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  if (!(await isAdmin())) {
    return { errors: { form: ["คุณไม่มีสิทธิ์ทำรายการนี้"] } };
  }

  const { values, parsed } = readForm(formData);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, values };
  }

  const d = parsed.data;

  await prisma.item.create({
    data: {
      name: d.name,
      category: d.category,
      description: d.description || null,
      totalQty: d.totalQty,
      availableQty: d.totalQty, // ตอนเพิ่มใหม่ ของว่างเท่ากับทั้งหมด
    },
  });

  revalidatePath("/items");
  redirect("/items");
}

// แก้ไขอุปกรณ์
export async function updateItem(
  id: number,
  prevState: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  if (!(await isAdmin())) {
    return { errors: { form: ["คุณไม่มีสิทธิ์ทำรายการนี้"] } };
  }

  const { values, parsed } = readForm(formData);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, values };
  }

  const item = await prisma.item.findUnique({ where: { id } });

  if (!item) {
    return { errors: { form: ["ไม่พบอุปกรณ์นี้"] }, values };
  }

  const d = parsed.data;

  // จำนวนที่ถูกยืมออกไปอยู่ตอนนี้
  const borrowedOut = item.totalQty - item.availableQty;

  if (d.totalQty < borrowedOut) {
    return {
      errors: {
        totalQty: [
          `ตอนนี้มีของถูกยืมอยู่ ${borrowedOut} ชิ้น จำนวนทั้งหมดต้องไม่น้อยกว่านี้`,
        ],
      },
      values,
    };
  }

  await prisma.item.update({
    where: { id },
    data: {
      name: d.name,
      category: d.category,
      description: d.description || null,
      totalQty: d.totalQty,
      availableQty: d.totalQty - borrowedOut,
    },
  });

  revalidatePath("/items");
  redirect("/items");
}

// ลบอุปกรณ์
export async function deleteItem(id: number): Promise<{ error?: string }> {
  if (!(await isAdmin())) {
    return { error: "คุณไม่มีสิทธิ์ทำรายการนี้" };
  }

  const borrowCount = await prisma.borrow.count({ where: { itemId: id } });

  if (borrowCount > 0) {
    return { error: "ลบไม่ได้ เพราะอุปกรณ์นี้มีประวัติการยืมอยู่ในระบบ" };
  }

  await prisma.item.delete({ where: { id } });

  revalidatePath("/items");
  return {};
}