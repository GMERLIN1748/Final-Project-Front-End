"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/app/auth";
import prisma from "@/app/lib/prisma";
import { itemSchema } from "./validation";

export type BulkState = {
  errors?: string[];
  added?: number;
  skipped?: string[];
  text?: string;
};

const MAX_ROWS = 200;

// เพิ่มอุปกรณ์หลายรายการพร้อมกัน (เฉพาะ ADMIN)
// รูปแบบแต่ละบรรทัด: ชื่อ, หมวดหมู่, จำนวน, รายละเอียด (ไม่บังคับ)
export async function bulkCreateItems(
  prevState: BulkState,
  formData: FormData,
): Promise<BulkState> {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return { errors: ["คุณไม่มีสิทธิ์ทำรายการนี้"] };
  }

  const text = String(formData.get("text") ?? "");
  const lines = text.split(/\r?\n/);

  const rows: {
    name: string;
    category: string;
    description?: string;
    totalQty: number;
  }[] = [];
  const errors: string[] = [];

  lines.forEach((raw, index) => {
    const line = raw.trim();

    if (!line || line.startsWith("#")) return;

    // แยกคอลัมน์ด้วย | หรือ Tab หรือ ,
    const [name = "", category = "", qtyText = "", ...rest] = line
      .split(/[|\t,]/)
      .map((p) => p.trim());

    const parsed = itemSchema.safeParse({
      name,
      category,
      totalQty: Number(qtyText),
      description: rest.join(", ") || undefined,
    });

    if (!parsed.success) {
      const messages = Object.values(parsed.error.flatten().fieldErrors)
        .flat()
        .filter(Boolean) as string[];

      errors.push(`บรรทัดที่ ${index + 1}: ${messages[0] ?? "ข้อมูลไม่ถูกต้อง"}`);
      return;
    }

    rows.push(parsed.data);
  });

  if (errors.length > 0) {
    return { errors, text };
  }

  if (rows.length === 0) {
    return { errors: ["กรุณากรอกอย่างน้อย 1 รายการ"], text };
  }

  if (rows.length > MAX_ROWS) {
    return { errors: [`เพิ่มได้ครั้งละไม่เกิน ${MAX_ROWS} รายการ`], text };
  }

  // ข้ามรายการที่ชื่อซ้ำกับในระบบ หรือซ้ำกันเองในข้อความที่กรอก
  const existing = await prisma.item.findMany({ select: { name: true } });
  const seen = new Set(existing.map((i) => i.name));

  const toAdd: typeof rows = [];
  const skipped: string[] = [];

  for (const row of rows) {
    if (seen.has(row.name)) {
      skipped.push(row.name);
    } else {
      seen.add(row.name);
      toAdd.push(row);
    }
  }

  if (toAdd.length > 0) {
    await prisma.item.createMany({
      data: toAdd.map((r) => ({
        name: r.name,
        category: r.category,
        description: r.description ?? null,
        totalQty: r.totalQty,
        availableQty: r.totalQty,
      })),
    });

    revalidatePath("/items");
    revalidatePath("/borrows/new");
    revalidatePath("/");
  }

  return { added: toAdd.length, skipped, text: "" };
}