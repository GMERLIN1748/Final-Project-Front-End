"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { ItemFormState } from "@/app/items/actions";

type Props = {
  action: (state: ItemFormState, formData: FormData) => Promise<ItemFormState>;
  categories: string[];
  submitLabel: string;
  defaultValues?: {
    name: string;
    category: string;
    description: string;
    totalQty: string;
  };
};

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-sky-500 focus:outline-none disabled:bg-gray-100";
const labelClass = "mb-1 block text-sm font-medium text-gray-700";

export default function ItemForm({
  action,
  categories,
  submitLabel,
  defaultValues,
}: Props) {
  const [state, formAction, pending] = useActionState(action, {} as ItemFormState);

  // ถ้ากรอกผิด ให้คงค่าที่พิมพ์ไว้ ไม่ให้ฟอร์มถูกล้าง
  const v = state.values ??
    defaultValues ?? { name: "", category: "", description: "", totalQty: "" };

  const err = state.errors;

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      {err?.form && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {err.form[0]}
        </div>
      )}

      <div>
        <label htmlFor="name" className={labelClass}>ชื่ออุปกรณ์</label>
        <input id="name" name="name" type="text" defaultValue={v.name} className={inputClass} disabled={pending} />
        {err?.name && <p className="mt-1 text-sm text-red-600">{err.name[0]}</p>}
      </div>

      <div>
        <label htmlFor="category" className={labelClass}>หมวดหมู่</label>
        <select id="category" name="category" defaultValue={v.category} className={inputClass} disabled={pending}>
          <option value="">-- เลือกหมวดหมู่ --</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        {err?.category && <p className="mt-1 text-sm text-red-600">{err.category[0]}</p>}
      </div>

      <div>
        <label htmlFor="totalQty" className={labelClass}>จำนวนทั้งหมด</label>
        <input id="totalQty" name="totalQty" type="number" min="1" defaultValue={v.totalQty} className={inputClass} disabled={pending} />
        {err?.totalQty && <p className="mt-1 text-sm text-red-600">{err.totalQty[0]}</p>}
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>รายละเอียด (ไม่บังคับ)</label>
        <textarea id="description" name="description" rows={3} defaultValue={v.description} className={inputClass} disabled={pending} />
        {err?.description && <p className="mt-1 text-sm text-red-600">{err.description[0]}</p>}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-orange-500 px-5 py-2 font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {pending ? "กำลังบันทึก..." : submitLabel}
        </button>

        <Link
          href="/items"
          className="rounded-lg border border-gray-300 px-5 py-2 font-medium text-gray-700 hover:bg-gray-50"
        >
          ยกเลิก
        </Link>
      </div>
    </form>
  );
}