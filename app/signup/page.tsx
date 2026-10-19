"use client";

import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { signUp, type SignUpState } from "@/app/signup/actions";

const initialState: SignUpState = {};

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-sky-500 focus:outline-none";
const labelClass = "mb-1 block text-sm font-medium text-gray-700";

export default function SignUpPage() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(signUp, initialState);

  useEffect(() => {
    if (state.success) {
      router.push("/login?registered=1");
    }
  }, [state.success, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="mb-2 text-center text-3xl font-bold text-gray-800">
          สมัครสมาชิก
        </h1>
        <p className="mb-6 text-center text-gray-500">
          ระบบยืมอุปกรณ์ห้องโปรเจกต์ CIS
        </p>

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="name" className={labelClass}>ชื่อ</label>
            <input id="name" name="name" type="text" className={inputClass} placeholder="ชื่อของคุณ" required />
          </div>

          <div>
            <label htmlFor="email" className={labelClass}>Email</label>
            <input id="email" name="email" type="email" className={inputClass} placeholder="you@example.com" required />
          </div>

          <div>
            <label htmlFor="password" className={labelClass}>รหัสผ่าน</label>
            <input id="password" name="password" type="password" className={inputClass} placeholder="อย่างน้อย 6 ตัวอักษร" minLength={6} required />
          </div>

          <div>
            <label htmlFor="confirmPassword" className={labelClass}>ยืนยันรหัสผ่าน</label>
            <input id="confirmPassword" name="confirmPassword" type="password" className={inputClass} placeholder="กรอกรหัสผ่านอีกครั้ง" minLength={6} required />
          </div>

          {state.error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-orange-500 px-4 py-2.5 font-medium text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "กำลังสร้างบัญชี..." : "สร้างบัญชี"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          มีบัญชีอยู่แล้ว?
          <Link href="/login" className="ml-1 font-medium text-sky-600 hover:underline">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </main>
  );
}