"use client";

import { useActionState, useMemo, useState } from "react";

import { requestBorrowMany, type BorrowFormState } from "@/app/borrows/actions";

type PickerItem = {
  id: number;
  name: string;
  category: string;
  description: string | null;
  availableQty: number;
  totalQty: number;
};

type Props = {
  items: PickerItem[];
  categories: string[];
  initialItemId?: number;
};

function formatDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return formatDate(d);
}

const fieldClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-sky-500 focus:outline-none disabled:bg-gray-100";

export default function BorrowPicker({ items, categories, initialItemId }: Props) {
  const [state, formAction, pending] = useActionState(
    requestBorrowMany,
    {} as BorrowFormState,
  );

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");

  // รายการที่เลือกไว้ในตะกร้า: รหัสอุปกรณ์ -> จำนวนที่ต้องการยืม
  const [selected, setSelected] = useState<Record<number, number>>(() =>
    initialItemId && items.some((i) => i.id === initialItemId)
      ? { [initialItemId]: 1 }
      : {},
  );

  const selectedItems = items.filter((i) => selected[i.id] !== undefined);
  const count = selectedItems.length;

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((i) => {
      const matchText =
        !term ||
        i.name.toLowerCase().includes(term) ||
        (i.description ?? "").toLowerCase().includes(term);
      const matchCategory = !category || i.category === category;
      return matchText && matchCategory;
    });
  }, [items, q, category]);

  // คลิกการ์ด: เลือก / ยกเลิกการเลือก
  function toggle(id: number) {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[id] !== undefined) {
        delete next[id];
      } else {
        next[id] = 1;
      }
      return next;
    });
  }

  function remove(id: number) {
    setSelected((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function changeQty(item: PickerItem, value: number) {
    const qty = Math.min(Math.max(1, value || 1), item.availableQty);
    setSelected((prev) => ({ ...prev, [item.id]: qty }));
  }

  const payload = JSON.stringify(
    selectedItems.map((i) => ({ itemId: i.id, quantity: selected[i.id] })),
  );

  const err = state.errors;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* ฝั่งซ้าย: เลือกอุปกรณ์ (เลือกได้หลายรายการ) */}
      <section className="lg:col-span-3">
        <h2 className="mb-1 text-lg font-semibold text-sky-900">
          1. เลือกอุปกรณ์ที่ต้องการยืม
        </h2>
        <p className="mb-3 text-sm text-gray-500">
          คลิกการ์ดเพื่อเลือก เลือกได้หลายรายการ คลิกซ้ำเพื่อยกเลิก
        </p>

        <div className="mb-3 flex flex-wrap gap-2">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหาอุปกรณ์..."
            className={`${fieldClass} sm:w-64`}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`${fieldClass} sm:w-52`}
          >
            <option value="">ทุกหมวดหมู่</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
            ไม่พบอุปกรณ์ที่ตรงกับการค้นหา
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((item) => {
              const active = selected[item.id] !== undefined;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggle(item.id)}
                  aria-pressed={active}
                  className={`relative rounded-xl border p-4 text-left transition ${
                    active
                      ? "border-orange-500 bg-orange-50 ring-2 ring-orange-300"
                      : "border-gray-200 bg-white hover:border-sky-400 hover:shadow-sm"
                  }`}
                >
                  <span
                    className={`absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full border text-sm font-bold ${
                      active
                        ? "border-orange-500 bg-orange-500 text-white"
                        : "border-gray-300 bg-white text-transparent"
                    }`}
                  >
                    ✓
                  </span>

                  <div className="pr-8 font-semibold text-gray-900">{item.name}</div>
                  <div className="mt-1 text-xs text-sky-700">{item.category}</div>
                  {item.description && (
                    <div className="mt-1 text-xs text-gray-500">{item.description}</div>
                  )}
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-green-700">
                      ว่าง {item.availableQty} / {item.totalQty} ชิ้น
                    </span>
                    {active && (
                      <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white">
                        ยืม {selected[item.id]} ชิ้น
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* ฝั่งขวา: ตะกร้าและรายละเอียดการยืม */}
      <section className="lg:col-span-2">
        <h2 className="mb-3 text-lg font-semibold text-sky-900">
          2. ตรวจรายการและกรอกรายละเอียด
        </h2>

        <form
          action={formAction}
          className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:sticky lg:top-20"
        >
          <input type="hidden" name="payload" value={payload} />

          {state.error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {state.error}
            </div>
          )}

          {err?.items && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              <ul className="list-inside list-disc">
                {err.items.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          )}

          {/* รายการที่เลือก */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                อุปกรณ์ที่เลือก ({count} รายการ)
              </span>
              {count > 0 && (
                <button
                  type="button"
                  onClick={() => setSelected({})}
                  className="text-xs font-medium text-red-600 hover:underline"
                >
                  ล้างทั้งหมด
                </button>
              )}
            </div>

            {count === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
                ยังไม่ได้เลือกอุปกรณ์ กรุณาคลิกการ์ดจากรายการด้านซ้าย
              </div>
            ) : (
              <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {selectedItems.map((item) => (
                  <li key={item.id} className="rounded-lg bg-sky-50 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold text-sky-900">{item.name}</div>
                        <div className="text-xs text-gray-600">ว่าง {item.availableQty} ชิ้น</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        aria-label={`เอา ${item.name} ออก`}
                        className="rounded-md px-2 text-lg leading-none text-gray-400 hover:bg-white hover:text-red-600"
                      >
                        ×
                      </button>
                    </div>

                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => changeQty(item, selected[item.id] - 1)}
                        disabled={selected[item.id] <= 1}
                        className="h-8 w-8 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={item.availableQty}
                        value={selected[item.id]}
                        onChange={(e) => changeQty(item, Number(e.target.value))}
                        className="h-8 w-16 rounded-md border border-gray-300 bg-white text-center text-sm focus:border-sky-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => changeQty(item, selected[item.id] + 1)}
                        disabled={selected[item.id] >= item.availableQty}
                        className="h-8 w-8 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">วันที่คืน</label>
            <input
              name="dueDate"
              type="date"
              value={dueDate}
              min={addDays(0)}
              onChange={(e) => setDueDate(e.target.value)}
              suppressHydrationWarning
              className={fieldClass}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {[3, 7, 14].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setDueDate(addDays(n))}
                  className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 hover:bg-sky-100"
                >
                  อีก {n} วัน
                </button>
              ))}
            </div>
            {err?.dueDate && <p className="mt-1 text-sm text-red-600">{err.dueDate[0]}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              วัตถุประสงค์ / หมายเหตุ (ไม่บังคับ)
            </label>
            <textarea
              name="note"
              rows={2}
              className={fieldClass}
              placeholder="เช่น ใช้ทำโปรเจกต์วิชา..."
            />
            {err?.note && <p className="mt-1 text-sm text-red-600">{err.note[0]}</p>}
          </div>

          <button
            type="submit"
            disabled={count === 0 || pending}
            className="w-full rounded-lg bg-orange-500 px-4 py-2.5 font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {pending
              ? "กำลังส่งคำขอ..."
              : count > 0
                ? `ส่งคำขอยืม (${count} รายการ)`
                : "ส่งคำขอยืม"}
          </button>

          <p className="text-center text-xs text-gray-500">
            วันที่คืนและหมายเหตุใช้ร่วมกันทุกรายการ คำขอจะอยู่ในสถานะ "รออนุมัติ"
          </p>
        </form>
      </section>
    </div>
  );
}