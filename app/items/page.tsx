import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/app/auth";
import prisma from "@/app/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import SearchFilter from "@/app/ui/search-filter";
import DeleteButton from "@/app/ui/delete-button";
import SeedButton from "@/app/ui/seed-button";
import { CATEGORIES } from "./validation";

type Props = {
  searchParams: Promise<{ q?: string; category?: string; stock?: string }>;
};

export default async function ItemsPage({ searchParams }: Props) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const isAdmin = session.user.role === "ADMIN";
  const { q, category, stock } = await searchParams;

  const where: Prisma.ItemWhereInput = {};

  if (q?.trim()) {
    where.OR = [
      { name: { contains: q.trim() } },
      { description: { contains: q.trim() } },
    ];
  }
  if (category) {
    where.category = category;
  }
  if (stock === "available") {
    where.availableQty = { gt: 0 };
  }
  if (stock === "out") {
    where.availableQty = { lte: 0 };
  }

  const items = await prisma.item.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const hasFilter = Boolean(q || category || stock);

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-sky-900">รายการอุปกรณ์</h1>
          <p className="mt-1 text-gray-600">พบ {items.length} รายการ</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/borrows/new"
            className="rounded-lg bg-orange-500 px-5 py-2.5 font-medium text-white hover:bg-orange-600"
          >
            ยืมอุปกรณ์
          </Link>

          {isAdmin && (
            <>
              <SeedButton />
              <Link
                href="/items/bulk"
                className="rounded-lg border border-sky-600 bg-white px-5 py-2.5 font-medium text-sky-700 hover:bg-sky-50"
              >
                เพิ่มหลายรายการ
              </Link>
              <Link
                href="/items/create"
                className="rounded-lg bg-sky-600 px-5 py-2.5 font-medium text-white hover:bg-sky-700"
              >
                + เพิ่มอุปกรณ์
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="mb-4">
        <SearchFilter categories={[...CATEGORIES]} />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-sky-50 text-sky-900">
            <tr>
              <th className="px-4 py-3 font-semibold">ชื่ออุปกรณ์</th>
              <th className="px-4 py-3 font-semibold">หมวดหมู่</th>
              <th className="px-4 py-3 font-semibold">คงเหลือ / ทั้งหมด</th>
              <th className="px-4 py-3 font-semibold">สถานะ</th>
              <th className="px-4 py-3 font-semibold">ยืม</th>
              {isAdmin && <th className="px-4 py-3 font-semibold">จัดการ</th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={isAdmin ? 6 : 5}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  {hasFilter
                    ? "ไม่พบอุปกรณ์ที่ตรงกับเงื่อนไขที่ค้นหา"
                    : isAdmin
                      ? "ยังไม่มีอุปกรณ์ในระบบ กดปุ่ม \"เพิ่มอุปกรณ์ตัวอย่าง\" ด้านบนได้เลย"
                      : "ยังไม่มีอุปกรณ์ในระบบ"}
                </td>
              </tr>
            )}

            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{item.name}</div>
                  {item.description && (
                    <div className="text-xs text-gray-500">{item.description}</div>
                  )}
                </td>
                <td className="px-4 py-3">{item.category}</td>
                <td className="px-4 py-3">
                  {item.availableQty} / {item.totalQty}
                </td>
                <td className="px-4 py-3">
                  {item.availableQty > 0 ? (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                      ว่าง
                    </span>
                  ) : (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                      หมด
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {item.availableQty > 0 ? (
                    <Link
                      href={`/borrows/new?itemId=${item.id}`}
                      className="rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600"
                    >
                      ขอยืม
                    </Link>
                  ) : (
                    <span className="text-gray-400">ของหมด</span>
                  )}
                </td>
                {isAdmin && (
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/items/${item.id}/edit`}
                        className="rounded-md bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700 hover:bg-sky-100"
                      >
                        แก้ไข
                      </Link>
                      <DeleteButton id={item.id} name={item.name} />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}