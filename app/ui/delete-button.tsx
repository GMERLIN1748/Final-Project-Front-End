"use client";

import { useTransition } from "react";

import { deleteItem } from "@/app/items/actions";

export default function DeleteButton({ id, name }: { id: number; name: string }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm(`ต้องการลบ "${name}" ใช่หรือไม่?`)) return;

    startTransition(async () => {
      const result = await deleteItem(id);
      if (result.error) {
        alert(result.error);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="rounded-md bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-50"
    >
      {pending ? "กำลังลบ..." : "ลบ"}
    </button>
  );
}