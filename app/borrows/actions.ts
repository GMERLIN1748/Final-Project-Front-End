"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/app/auth";
import prisma from "@/app/lib/prisma";
import { borrowManySchema, borrowSchema } from "./validation";

export type BorrowFormState = {
  error?: string;
  errors?: Partial<Record<"quantity" | "dueDate" | "note" | "items", string[]>>;
};

type ActionResult = { error?: string };

async function getSession() {
  const session = await auth();
  const role = session?.user?.role;
  return {
    userId: session?.user?.id,
    isStaff: role === "ADMIN" || role === "STAFF",
  };
}

function refresh() {
  revalidatePath("/borrows");
  revalidatePath("/borrows/new");
  revalidatePath("/items");
  revalidatePath("/");
}

// วันที่คืนต้องไม่เป็นวันที่ผ่านมาแล้ว
function parseDueDate(value: string) {
  const due = new Date(`${value}T23:59:59`);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return { due, valid: due >= startOfToday };
}

// ผู้ใช้ขอยืมอุปกรณ์ทีละรายการ
export async function requestBorrow(
  prevState: BorrowFormState,
  formData: FormData,
): Promise<BorrowFormState> {
  const { userId } = await getSession();

  if (!userId) {
    return { error: "กรุณาเข้าสู่ระบบก่อน" };
  }

  const parsed = borrowSchema.safeParse({
    itemId: Number(formData.get("itemId")),
    quantity: Number(formData.get("quantity")),
    dueDate: String(formData.get("dueDate") ?? ""),
    note: String(formData.get("note") ?? ""),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const d = parsed.data;
  const { due, valid } = parseDueDate(d.dueDate);

  if (!valid) {
    return { errors: { dueDate: ["วันที่คืนต้องไม่เป็นวันที่ผ่านมาแล้ว"] } };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return {
      error: "บัญชีนี้ยังไม่ได้ลงทะเบียนในระบบ กรุณาสมัครสมาชิกด้วยอีเมลก่อนยืม",
    };
  }

  const item = await prisma.item.findUnique({ where: { id: d.itemId } });

  if (!item) {
    return { error: "ไม่พบอุปกรณ์นี้" };
  }

  if (d.quantity > item.availableQty) {
    return {
      errors: { quantity: [`ตอนนี้มีของว่างเพียง ${item.availableQty} ชิ้น`] },
    };
  }

  await prisma.borrow.create({
    data: {
      userId,
      itemId: d.itemId,
      quantity: d.quantity,
      dueDate: due,
      note: d.note || null,
      status: "PENDING",
    },
  });

  refresh();
  redirect("/borrows");
}

// ผู้ใช้ขอยืมอุปกรณ์หลายรายการพร้อมกัน
export async function requestBorrowMany(
  prevState: BorrowFormState,
  formData: FormData,
): Promise<BorrowFormState> {
  const { userId } = await getSession();

  if (!userId) {
    return { error: "กรุณาเข้าสู่ระบบก่อน" };
  }

  let rawItems: unknown = [];

  try {
    rawItems = JSON.parse(String(formData.get("payload") ?? "[]"));
  } catch {
    return { error: "ข้อมูลที่ส่งมาไม่ถูกต้อง กรุณาลองใหม่" };
  }

  const parsed = borrowManySchema.safeParse({
    items: rawItems,
    dueDate: String(formData.get("dueDate") ?? ""),
    note: String(formData.get("note") ?? ""),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const d = parsed.data;

  // ห้ามเลือกอุปกรณ์ชิ้นเดียวกันซ้ำ
  const ids = d.items.map((i) => i.itemId);

  if (new Set(ids).size !== ids.length) {
    return { errors: { items: ["มีอุปกรณ์ซ้ำกันในรายการที่เลือก"] } };
  }

  const { due, valid } = parseDueDate(d.dueDate);

  if (!valid) {
    return { errors: { dueDate: ["วันที่คืนต้องไม่เป็นวันที่ผ่านมาแล้ว"] } };
  }

  // ผู้ใช้ที่ login ด้วย GitHub ไม่มีข้อมูลในตาราง User จึงยืมไม่ได้
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    return {
      error: "บัญชีนี้ยังไม่ได้ลงทะเบียนในระบบ กรุณาสมัครสมาชิกด้วยอีเมลก่อนยืม",
    };
  }

  const items = await prisma.item.findMany({ where: { id: { in: ids } } });

  if (items.length !== ids.length) {
    return { error: "ไม่พบอุปกรณ์บางรายการ อาจถูกลบออกไปแล้ว กรุณารีเฟรชหน้า" };
  }

  // ตรวจจำนวนคงเหลือของทุกชิ้น ถ้าชิ้นไหนไม่พอ จะไม่สร้างรายการใดเลย
  const problems: string[] = [];

  for (const line of d.items) {
    const item = items.find((i) => i.id === line.itemId);

    if (item && line.quantity > item.availableQty) {
      problems.push(`${item.name}: ตอนนี้ว่างเพียง ${item.availableQty} ชิ้น`);
    }
  }

  if (problems.length > 0) {
    return { errors: { items: problems } };
  }

  await prisma.borrow.createMany({
    data: d.items.map((line) => ({
      userId,
      itemId: line.itemId,
      quantity: line.quantity,
      dueDate: due,
      note: d.note || null,
      status: "PENDING" as const,
    })),
  });

  refresh();
  redirect("/borrows");
}

// อนุมัติการยืม (ADMIN / STAFF)
export async function approveBorrow(id: number): Promise<ActionResult> {
  const { isStaff } = await getSession();

  if (!isStaff) {
    return { error: "คุณไม่มีสิทธิ์ทำรายการนี้" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const borrow = await tx.borrow.findUnique({ where: { id } });

      if (!borrow || borrow.status !== "PENDING") {
        throw new Error("รายการนี้ถูกดำเนินการไปแล้ว");
      }

      const item = await tx.item.findUnique({ where: { id: borrow.itemId } });

      if (!item || item.availableQty < borrow.quantity) {
        throw new Error("ของคงเหลือไม่พอสำหรับการอนุมัติ");
      }

      await tx.item.update({
        where: { id: item.id },
        data: { availableQty: { decrement: borrow.quantity } },
      });

      await tx.borrow.update({
        where: { id },
        data: { status: "BORROWED", borrowDate: new Date() },
      });
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "เกิดข้อผิดพลาด" };
  }

  refresh();
  return {};
}

// รับคืนอุปกรณ์ (ADMIN / STAFF)
export async function returnBorrow(id: number): Promise<ActionResult> {
  const { isStaff } = await getSession();

  if (!isStaff) {
    return { error: "คุณไม่มีสิทธิ์ทำรายการนี้" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const borrow = await tx.borrow.findUnique({ where: { id } });

      if (!borrow || borrow.status !== "BORROWED") {
        throw new Error("รายการนี้ไม่ได้อยู่ในสถานะกำลังยืม");
      }

      await tx.item.update({
        where: { id: borrow.itemId },
        data: { availableQty: { increment: borrow.quantity } },
      });

      await tx.borrow.update({
        where: { id },
        data: { status: "RETURNED", returnedAt: new Date() },
      });
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "เกิดข้อผิดพลาด" };
  }

  refresh();
  return {};
}

// ยกเลิกคำขอ (เจ้าของรายการ) หรือปฏิเสธคำขอ (ADMIN / STAFF) ใช้ได้เฉพาะตอนรออนุมัติ
export async function cancelBorrow(id: number): Promise<ActionResult> {
  const { userId, isStaff } = await getSession();

  if (!userId) {
    return { error: "กรุณาเข้าสู่ระบบก่อน" };
  }

  const borrow = await prisma.borrow.findUnique({ where: { id } });

  if (!borrow) {
    return { error: "ไม่พบรายการนี้" };
  }

  if (borrow.status !== "PENDING") {
    return { error: "ยกเลิกได้เฉพาะรายการที่รออนุมัติ" };
  }

  if (!isStaff && borrow.userId !== userId) {
    return { error: "คุณไม่มีสิทธิ์ทำรายการนี้" };
  }

  await prisma.borrow.delete({ where: { id } });

  refresh();
  return {};
}