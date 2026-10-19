import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/app/auth";
import prisma from "@/app/lib/prisma";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;
  const isStaff = role === "ADMIN" || role === "STAFF";

  // ผู้ใช้ทั่วไปนับเฉพาะรายการของตัวเอง
  const mine = isStaff ? {} : { userId: session.user.id };

  const [itemCount, pending, borrowed] = await Promise.all([
    prisma.item.count(),
    prisma.borrow.count({ where: { ...mine, status: "PENDING" } }),
    prisma.borrow.count({ where: { ...mine, status: "BORROWED" } }),
  ]);

  const stats = [
    { label: "อุปกรณ์ทั้งหมด", value: itemCount, color: "text-sky-700" },
    {
      label: isStaff ? "คำขอรออนุมัติ" : "คำขอของฉันที่รออนุมัติ",
      value: pending,
      color: "text-amber-600",
    },
    {
      label: isStaff ? "กำลังถูกยืมอยู่" : "ที่ฉันกำลังยืม",
      value: borrowed,
      color: "text-orange-600",
    },
  ];

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-3xl font-bold text-sky-900">
        สวัสดี {session.user.name ?? session.user.email}
      </h1>
      <p className="mt-1 text-gray-600">
        ระบบยืม-คืนอุปกรณ์ห้องโปรเจกต์ สาขาวิทยาการคอมพิวเตอร์ (CIS)
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className={`text-4xl font-bold ${s.color}`}>{s.value}</div>
            <div className="mt-1 text-sm text-gray-600">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/items"
          className="rounded-xl bg-sky-600 p-6 text-white shadow-sm hover:bg-sky-700"
        >
          <div className="text-xl font-semibold">ดูอุปกรณ์และขอยืม</div>
          <div className="mt-1 text-sm text-sky-100">ค้นหา กรอง และส่งคำขอยืมอุปกรณ์</div>
        </Link>

        <Link
          href="/borrows"
          className="rounded-xl bg-orange-500 p-6 text-white shadow-sm hover:bg-orange-600"
        >
          <div className="text-xl font-semibold">
            {isStaff ? "จัดการรายการยืม" : "รายการยืมของฉัน"}
          </div>
          <div className="mt-1 text-sm text-orange-50">
            {isStaff ? "อนุมัติคำขอและรับคืนอุปกรณ์" : "ติดตามสถานะและกำหนดคืน"}
          </div>
        </Link>
      </div>
    </main>
  );
}