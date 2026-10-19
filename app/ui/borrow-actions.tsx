"use client";

import { useTransition } from "react";

import { approveBorrow, cancelBorrow, returnBorrow } from "@/app/borrows/actions";

type Props = {
  id: number;
  status: "PENDING" | "BORROWED" | "RETURNED";
  isStaff: boolean;
};

export default function BorrowActions({ id, status, isStaff }: Props) {
  const [pending, startTransition] = useTransition();

  function run(
    fn: (id: number) => Promise<{ error?: string }>,
    confirmText?: string,
  ) {
    if (confirmText && !confirm(confirmText)) return;

    startTransition(async () => {
      const result = await fn(id);
      if (result.error) {
        alert(result.error);
      }
    });
  }

  const base = "rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50";

  if (status === "PENDING" && isStaff) {
    return (
      <div className="flex gap-2">
        <button disabled={pending} onClick={() => run(approveBorrow)} className={`${base} bg-green-50 text-green-700 hover:bg-green-100`}>
          อนุมัติ
        </button>
        <button disabled={pending} onClick={() => run(cancelBorrow, "ต้องการปฏิเสธคำขอนี้ใช่หรือไม่?")} className={`${base} bg-red-50 text-red-600 hover:bg-red-100`}>
          ปฏิเสธ
        </button>
      </div>
    );
  }

  if (status === "PENDING") {
    return (
      <button disabled={pending} onClick={() => run(cancelBorrow, "ต้องการยกเลิกคำขอนี้ใช่หรือไม่?")} className={`${base} bg-red-50 text-red-600 hover:bg-red-100`}>
        ยกเลิกคำขอ
      </button>
    );
  }

  if (status === "BORROWED" && isStaff) {
    return (
      <button disabled={pending} onClick={() => run(returnBorrow, "ยืนยันว่าได้รับอุปกรณ์คืนแล้ว?")} className={`${base} bg-sky-50 text-sky-700 hover:bg-sky-100`}>
        รับคืน
      </button>
    );
  }

  return <span className="text-gray-400">-</span>;
}