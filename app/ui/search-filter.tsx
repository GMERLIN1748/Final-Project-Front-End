"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const fieldClass =
  "rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-sky-500 focus:outline-none";

export default function SearchFilter({ categories }: { categories: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") ?? "");

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  // หน่วงเวลา 0.3 วินาทีหลังพิมพ์ ค่อยค้นหา
  useEffect(() => {
    const timer = setTimeout(() => {
      if ((searchParams.get("q") ?? "") !== q) {
        update("q", q);
      }
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const hasFilter = q || searchParams.get("category") || searchParams.get("stock");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="ค้นหาชื่อหรือรายละเอียดอุปกรณ์..."
        className={`${fieldClass} w-full sm:w-72`}
      />

      <select
        value={searchParams.get("category") ?? ""}
        onChange={(e) => update("category", e.target.value)}
        className={fieldClass}
      >
        <option value="">ทุกหมวดหมู่</option>
        {categories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        value={searchParams.get("stock") ?? ""}
        onChange={(e) => update("stock", e.target.value)}
        className={fieldClass}
      >
        <option value="">ทุกสถานะ</option>
        <option value="available">มีของว่าง</option>
        <option value="out">ของหมด</option>
      </select>

      {hasFilter && (
        <button
          type="button"
          onClick={() => {
            setQ("");
            router.replace(pathname);
          }}
          className="text-sm font-medium text-sky-700 hover:underline"
        >
          ล้างตัวกรอง
        </button>
      )}
    </div>
  );
}