"use client";

import { useTransition } from "react";

import { seedSampleItems } from "@/app/items/seed";

export default function SeedButton({ label = "เพิ่มอุปกรณ์ตัวอย่าง" }: { label?: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await seedSampleItems();

      if (result.error) {
        alert(result.error);
      } else {
        alert(`เพิ่มอุปกรณ์ใหม่ ${result.added} รายการเรียบร้อย`);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="rounded-lg border border-sky-600 bg-white px-5 py-2.5 font-medium text-sky-700 hover:bg-sky-50 disabled:opacity-50"
    >
      {pending ? "กำลังเพิ่ม..." : label}
    </button>
  );
}