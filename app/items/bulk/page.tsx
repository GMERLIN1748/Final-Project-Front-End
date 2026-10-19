import { redirect } from "next/navigation";

import { auth } from "@/app/auth";
import BulkForm from "@/app/ui/bulk-form";
import { CATEGORIES } from "../validation";

export default async function BulkItemsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold text-sky-900">เพิ่มอุปกรณ์หลายรายการ</h1>
      <p className="mt-1 mb-6 text-gray-600">
        พิมพ์หรือวางรายการอุปกรณ์ทีละบรรทัด (วางจาก Excel ได้)
      </p>

      <div className="mb-6 rounded-xl bg-sky-50 p-4 text-sm text-sky-900">
        <div className="font-semibold">รูปแบบแต่ละบรรทัด</div>
        <code className="mt-1 block">ชื่ออุปกรณ์, หมวดหมู่, จำนวน, รายละเอียด (ไม่บังคับ)</code>

        <div className="mt-3 font-semibold">หมวดหมู่ที่ใช้ได้</div>
        <div className="mt-1 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <span key={c} className="rounded-full bg-white px-3 py-1 text-xs">
              {c}
            </span>
          ))}
        </div>

        <ul className="mt-3 list-inside list-disc space-y-1 text-sky-800">
          <li>ใช้เครื่องหมาย , หรือ | หรือ Tab คั่นแต่ละช่องก็ได้</li>
          <li>ชื่อที่ซ้ำกับอุปกรณ์ที่มีอยู่แล้วจะถูกข้ามให้อัตโนมัติ</li>
          <li>ถ้ามีบรรทัดไหนผิด ระบบจะบอกเลขบรรทัด และยังไม่เพิ่มรายการใดเลย</li>
        </ul>
      </div>

      <BulkForm />
    </main>
  );
}