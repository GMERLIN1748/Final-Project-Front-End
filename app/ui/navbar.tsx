import Link from "next/link";

import { auth, signOut } from "@/app/auth";
import NavLinks from "./nav-links";

const roleLabel: Record<string, string> = {
  ADMIN: "ผู้ดูแลระบบ",
  STAFF: "เจ้าหน้าที่",
  USER: "ผู้ใช้ทั่วไป",
};

export default async function Navbar() {
  const session = await auth();
  const user = session?.user;

  const links = user
    ? [
        { href: "/", label: "หน้าแรก" },
        { href: "/items", label: "อุปกรณ์" },
        { href: "/borrows", label: "รายการยืม" },
      ]
    : [];

  return (
    <header className="sticky top-0 z-10 bg-sky-700 shadow-md">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-sm font-bold text-white">
            CIS
          </span>
          <span className="text-lg font-semibold text-white">
            ยืมอุปกรณ์ห้องโปรเจกต์
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <NavLinks links={links} />

          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right text-xs leading-tight text-sky-50">
                <div className="font-medium">{user.name ?? user.email}</div>
                <div className="text-sky-200">
                  {roleLabel[user.role] ?? user.role}
                </div>
              </div>

              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/login" });
                }}
              >
                <button
                  type="submit"
                  className="rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
                >
                  ออกจากระบบ
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
            >
              เข้าสู่ระบบ
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}