"use client";

import { useActionState } from "react";

import { requestBorrow, type BorrowFormState } from "@/app/borrows/actions";

type Props = {
  itemId: number;
  maxQty: number;
};

const fieldClass =
  "w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-sky-500 focus:outline-none";

export default function BorrowRequest({ itemId, maxQty }: Props) {
  const [state, formAction, pending] = useActionState(
    requestBorrow,
    {} as BorrowFormState,
  );

  const today = new Date().toISOString().slice(0, 10);
  const err = state.errors;

  return (
    <details className="min-w-[220px]">
      <summary className="inline-block cursor-pointer rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600">
        ขอยืม
      </summary>

      <form action={formAction} className="mt-2 space-y-2 rounded-lg bg-slate-50 p-3">
        <input type="hidden" name="itemId" value={itemId} />

        {state.error && (
          <p className="rounded bg-red-50 p-2 text-xs text-red-600">{state.error}</p>
        )}

        <div>
          <label className="mb-1 block text-xs text-gray-600">จำนวน (ว่าง {maxQty})</label>
          <input name="quantity" type="number" min="1" max={maxQty} defaultValue="1" className={fieldClass} disabled={pending} />
          {err?.quantity && <p className="mt-1 text-xs text-red-600">{err.quantity[0]}</p>}
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-600">วันที่คืน</label>
          <input name="dueDate" type="date" min={today} className={fieldClass} disabled={pending} />
          {err?.dueDate && <p className="mt-1 text-xs text-red-600">{err.dueDate[0]}</p>}
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-600">หมายเหตุ (ไม่บังคับ)</label>
          <input name="note" type="text" className={fieldClass} disabled={pending} />
          {err?.note && <p className="mt-1 text-xs text-red-600">{err.note[0]}</p>}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
        >
          {pending ? "กำลังส่งคำขอ..." : "ส่งคำขอยืม"}
        </button>
      </form>
    </details>
  );
}