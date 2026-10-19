import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/app/auth";
import prisma from "@/app/lib/prisma";
import type { Prisma } from "@/app/generated/prisma/client";
import StatusBadge from "@/app/ui/status-badge";
import BorrowActions from "@/app/ui/borrow-actions";

type Props = {
  searchParams: Promise<{ status?: string }>;
};

const tabs = [
  { value: "", label: "ทั้งหมด" },
  { value: "PENDING", label: "รออนุมัติ" },
  { value: "BORROWED", label: "กำลังยืม" },
  { value: "RETURNED", label: "คืนแล้ว" },
];

function formatDate(d: Date) {
  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function BorrowsPage({ searchParams }: Props) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;
  const isStaff = role === "ADMIN" || role === "STAFF";

  const { status } = await searchParams;

  const where: Prisma.BorrowWhereInput = {};

  // ผู้ใช้ทั่วไปเห็นเฉพาะรายการของตัวเอง
  if (!isStaff) {
    where.userId = session.user.id;
  }

  if (status === "PENDING" || status === "BORROWED" || status === "RETURNED") {
    where.status = status;
  }

  const borrows = await prisma.borrow.findMany({
    where,
    include: { item: true, user: true },
    orderBy: { id: "desc" },
  });

  const now = new Date();

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-sky-900">
            {isStaff ? "รายการยืมทั้งหมด" : "รายการยืมของฉัน"}
          </h1>
          <p className="mt-1 text-gray-600">พบ {borrows.length} รายการ</p>
        </div>

        <Link
          href="/borrows/new"
          className="rounded-lg bg-orange-500 px-5 py-2.5 font-medium text-white hover:bg-orange-600"
        >
          + ยืมอุปกรณ์
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((t) => {
          const active = (status ?? "") === t.value;
          return (
            <Link
              key={t.value}
              href={t.value ? `/borrows?status=${t.value}` : "/borrows"}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                active
                  ? "bg-sky-600 text-white"
                  : "bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-sky-50 text-sky-900">
            <tr>
              <th className="px-4 py-3 font-semibold">อุปกรณ์</th>
              {isStaff && <th className="px-4 py-3 font-semibold">ผู้ยืม</th>}
              <th className="px-4 py-3 font-semibold">จำนวน</th>
              <th className="px-4 py-3 font-semibold">วันที่ยืม</th>
              <th className="px-4 py-3 font-semibold">กำหนดคืน</th>
              <th className="px-4 py-3 font-semibold">สถานะ</th>
              <th className="px-4 py-3 font-semibold">จัดการ</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {borrows.length === 0 && (
              <tr>
                <td
                  colSpan={isStaff ? 7 : 6}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  <div>ยังไม่มีรายการยืม</div>
                  <Link
                    href="/borrows/new"
                    className="mt-2 inline-block font-medium text-sky-700 hover:underline"
                  >
                    เริ่มยืมอุปกรณ์ →
                  </Link>
                </td>
              </tr>
            )}

            {borrows.map((b) => {
              const overdue = b.status === "BORROWED" && b.dueDate < now;

              return (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{b.item.name}</div>
                    {b.note && (
                      <div className="text-xs text-gray-500">{b.note}</div>
                    )}
                  </td>
                  {isStaff && (
                    <td className="px-4 py-3">
                      <div>{b.user.name ?? "-"}</div>
                      <div className="text-xs text-gray-500">{b.user.email}</div>
                    </td>
                  )}
                  <td className="px-4 py-3">{b.quantity}</td>
                  <td className="px-4 py-3">
                    {b.status === "PENDING" ? "-" : formatDate(b.borrowDate)}
                  </td>
                  <td className="px-4 py-3">{formatDate(b.dueDate)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} overdue={overdue} />
                  </td>
                  <td className="px-4 py-3">
                    <BorrowActions
                      id={b.id}
                      status={b.status}
                      isStaff={isStaff}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}