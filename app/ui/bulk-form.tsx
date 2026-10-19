"use client";

import Link from "next/link";
import { useActionState } from "react";

import { bulkCreateItems, type BulkState } from "@/app/items/bulk-actions";

const example = `# บรรทัดที่ขึ้นต้นด้วย # จะถูกข้าม
เมาส์เกมมิ่ง, อุปกรณ์ต่อพ่วง, 5, แบบมีสาย
ชุดสายไฟ DuPont, ไมโครคอนโทรลเลอร์, 20
เทปพันสายไฟ, เครื่องมือช่าง, 10`;

export default function BulkForm() {
  const [state, formAction, pending] = useActionState(
    bulkCreateItems,
    {} as BulkState,
  );

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      {state.added !== undefined && (
        <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
          <div>
            {state.added > 0
              ? `เพิ่มอุปกรณ์ใหม่ ${state.added} รายการเรียบร้อย`
              : "ไม่มีรายการใหม่ให้เพิ่ม"}
          </div>
          {state.skipped && state.skipped.length > 0 && (
            <div className="mt-1 text-green-800">
              ข้ามรายการที่มีอยู่แล้ว {state.skipped.length} รายการ:{" "}
              {state.skipped.join(", ")}
            </div>
          )}
          <Link href="/items" className="mt-2 inline-block font-medium underline">
            ไปดูรายการอุปกรณ์ →
          </Link>
        </div>
      )}

      {state.errors && state.errors.length > 0 && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          <div className="font-medium">พบข้อผิดพลาด ยังไม่มีรายการใดถูกเพิ่ม</div>
          <ul className="mt-1 list-inside list-disc">
            {state.errors.slice(0, 10).map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
          {state.errors.length > 10 && (
            <div className="mt-1">...และอีก {state.errors.length - 10} รายการ</div>
          )}
        </div>
      )}

      <div>
        <label htmlFor="text" className="mb-1 block text-sm font-medium text-gray-700">
          รายการอุปกรณ์ (1 บรรทัดต่อ 1 รายการ)
        </label>
        <textarea
          id="text"
          name="text"
          rows={12}
          defaultValue={state.text ?? ""}
          placeholder={example}
          disabled={pending}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-sky-500 focus:outline-none disabled:bg-gray-100"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-orange-500 px-5 py-2 font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {pending ? "กำลังเพิ่ม..." : "เพิ่มอุปกรณ์ทั้งหมด"}
        </button>

        <Link
          href="/items"
          className="rounded-lg border border-gray-300 px-5 py-2 font-medium text-gray-700 hover:bg-gray-50"
        >
          กลับ
        </Link>
      </div>
    </form>
  );
}