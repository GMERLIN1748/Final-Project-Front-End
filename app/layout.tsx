import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./ui/navbar";

export const metadata: Metadata = {
  title: "ระบบยืมอุปกรณ์ห้องโปรเจกต์ CIS",
  description: "ระบบยืม-คืนอุปกรณ์ในห้องโปรเจกต์ สาขาวิทยาการคอมพิวเตอร์",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-slate-50 text-slate-800 antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}