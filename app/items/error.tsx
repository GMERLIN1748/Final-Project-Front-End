"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="p-8 text-center">
      <h2 className="text-xl font-semibold text-red-600">เกิดข้อผิดพลาด</h2>
      <p className="mt-2 text-gray-600">ไม่สามารถโหลดข้อมูลอุปกรณ์ได้</p>
      <button
        onClick={() => reset()}
        className="mt-4 rounded-lg bg-orange-500 px-5 py-2 text-white hover:bg-orange-600"
      >
        ลองใหม่อีกครั้ง
      </button>
    </div>
  );
}