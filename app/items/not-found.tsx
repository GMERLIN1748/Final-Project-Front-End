import Link from "next/link";

export default function NotFound() {
  return (
    <div className="p-8 text-center">
      <h2 className="text-xl font-semibold text-red-600">ไม่พบอุปกรณ์นี้ในระบบ</h2>
      <p className="mt-2 text-gray-600">อุปกรณ์อาจถูกลบออกไปแล้ว</p>
      <Link href="/items" className="mt-4 inline-block text-sky-700 underline">
        ← กลับไปหน้ารายการอุปกรณ์
      </Link>
    </div>
  );
}