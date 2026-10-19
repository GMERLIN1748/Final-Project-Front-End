import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/app/auth";
import prisma from "@/app/lib/prisma";
import BorrowPicker from "@/app/ui/borrow-picker";
import SeedButton from "@/app/ui/seed-button";
import { CATEGORIES } from "@/app/items/validation";

type Props = {
  searchParams: Promise<{ itemId?: string }>;
};

export default async function NewBorrowPage({ searchParams }: Props) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "ADMIN";
  const { itemId } = await searchParams;

  const [items, totalItems] = await Promise.all([
    prisma.item.findMany({
      where: { availableQty: { gt: 0 } },
      orderBy: { name: "asc" },
    }),
    prisma.item.count(),
  ]);

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-6">
        <Link href="/borrows" className="text-sm text-sky-700 hover:underline">
          ← กลับไปรายการยืม
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-sky-900">ยืมอุปกรณ์</h1>
        <p className="mt-1 text-gray-600">
          เลือกอุปกรณ์ที่ต้องการ แล้วกรอกจำนวนและวันที่คืน
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <div className="text-4xl">📦</div>
          <h2 className="mt-3 text-xl font-semibold text-gray-800">
            {totalItems === 0 ? "ยังไม่มีอุปกรณ์ในระบบ" : "ตอนนี้อุปกรณ์ถูกยืมหมดแล้ว"}
          </h2>

          {totalItems === 0 && isAdmin ? (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <SeedButton />
              <Link
                href="/items/create"
                className="rounded-lg border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
              >
                เพิ่มอุปกรณ์เอง
              </Link>
            </div>
          ) : (
            <p className="mt-2 text-gray-500">
              {totalItems === 0
                ? "กรุณาแจ้งผู้ดูแลระบบให้เพิ่มอุปกรณ์ก่อน"
                : "กรุณากลับมาดูใหม่เมื่อมีการคืนอุปกรณ์"}
            </p>
          )}
        </div>
      ) : (
        <BorrowPicker
          items={items.map((i) => ({
            id: i.id,
            name: i.name,
            category: i.category,
            description: i.description,
            availableQty: i.availableQty,
            totalQty: i.totalQty,
          }))}
          categories={[...CATEGORIES]}
          initialItemId={itemId ? Number(itemId) : undefined}
        />
      )}
    </main>
  );
}