"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/app/auth";
import prisma from "@/app/lib/prisma";

const SAMPLE_ITEMS = [
  // ไมโครคอนโทรลเลอร์และอิเล็กทรอนิกส์
  { name: "Raspberry Pi 4", category: "ไมโครคอนโทรลเลอร์", description: "บอร์ดคอมพิวเตอร์ขนาดเล็ก RAM 4GB", qty: 5 },
  { name: "Arduino Uno R3", category: "ไมโครคอนโทรลเลอร์", description: "บอร์ดไมโครคอนโทรลเลอร์พร้อมสาย USB", qty: 10 },
  { name: "ESP32 DevKit", category: "ไมโครคอนโทรลเลอร์", description: "บอร์ดพร้อม Wi-Fi และ Bluetooth", qty: 8 },
  { name: "Arduino Mega 2560", category: "ไมโครคอนโทรลเลอร์", description: "บอร์ดขาเยอะสำหรับโปรเจกต์ขนาดใหญ่", qty: 4 },
  { name: "Raspberry Pi Pico", category: "ไมโครคอนโทรลเลอร์", description: "บอร์ดไมโครคอนโทรลเลอร์ขนาดเล็ก", qty: 8 },
  { name: "micro:bit", category: "ไมโครคอนโทรลเลอร์", description: "บอร์ดสำหรับเรียนเขียนโปรแกรมเบื้องต้น", qty: 6 },
  { name: "เซนเซอร์อุณหภูมิ DHT11", category: "ไมโครคอนโทรลเลอร์", description: "วัดอุณหภูมิและความชื้น", qty: 10 },
  { name: "เซนเซอร์อัลตราโซนิก HC-SR04", category: "ไมโครคอนโทรลเลอร์", description: "วัดระยะทาง", qty: 10 },
  { name: "เบรดบอร์ดและสายจัมเปอร์", category: "ไมโครคอนโทรลเลอร์", description: "ชุดสำหรับต่อวงจรทดลอง", qty: 12 },
  { name: "ชุด LED และตัวต้านทาน", category: "ไมโครคอนโทรลเลอร์", description: "ชุดอุปกรณ์วงจรพื้นฐาน", qty: 10 },

  // คอมพิวเตอร์
  { name: "โน้ตบุ๊กสำหรับยืมใช้งาน", category: "คอมพิวเตอร์", description: "พร้อมสายชาร์จ", qty: 4 },
  { name: "คอมพิวเตอร์", category: "คอมพิวเตอร์", description: "เครื่องตั้งโต๊ะพร้อมจอและคีย์บอร์ด", qty: 5 },
  { name: "แท็บเล็ต", category: "คอมพิวเตอร์", description: "สำหรับทดสอบแอปพลิเคชัน", qty: 3 },

  // เครือข่าย
  { name: "สาย LAN CAT6 (3 เมตร)", category: "เครือข่าย", description: null, qty: 15 },
  { name: "Wi-Fi Router", category: "เครือข่าย", description: "สำหรับทดลองตั้งค่าเครือข่าย", qty: 3 },
  { name: "สวิตช์ฮับ 8 พอร์ต", category: "เครือข่าย", description: null, qty: 3 },
  { name: "LAN Tester", category: "เครือข่าย", description: "ตรวจสอบสาย LAN", qty: 2 },

  // อุปกรณ์ต่อพ่วง
  { name: "จอมอนิเตอร์ 24 นิ้ว", category: "อุปกรณ์ต่อพ่วง", description: "พร้อมสาย HDMI", qty: 6 },
  { name: "คีย์บอร์ดและเมาส์", category: "อุปกรณ์ต่อพ่วง", description: "แบบ USB", qty: 10 },
  { name: "เมาส์ไร้สาย", category: "อุปกรณ์ต่อพ่วง", description: null, qty: 8 },
  { name: "เว็บแคม HD", category: "อุปกรณ์ต่อพ่วง", description: null, qty: 3 },
  { name: "หูฟังครอบหู", category: "อุปกรณ์ต่อพ่วง", description: "พร้อมไมโครโฟน", qty: 8 },
  { name: "ฮาร์ดดิสก์พกพา 1TB", category: "อุปกรณ์ต่อพ่วง", description: null, qty: 4 },
  { name: "แฟลชไดรฟ์ 32GB", category: "อุปกรณ์ต่อพ่วง", description: null, qty: 15 },
  { name: "โปรเจกเตอร์", category: "อุปกรณ์ต่อพ่วง", description: "พร้อมสาย HDMI และรีโมต", qty: 2 },

  // เครื่องมือช่าง
  { name: "ชุดไขควงอเนกประสงค์", category: "เครื่องมือช่าง", description: null, qty: 5 },
  { name: "มัลติมิเตอร์ดิจิทัล", category: "เครื่องมือช่าง", description: "วัดแรงดัน กระแส และความต้านทาน", qty: 4 },
  { name: "หัวแร้งบัดกรี", category: "เครื่องมือช่าง", description: "พร้อมขาตั้ง", qty: 4 },
  { name: "คีมเข้าหัว LAN", category: "เครื่องมือช่าง", description: null, qty: 2 },
  { name: "คีมปอกสายไฟ", category: "เครื่องมือช่าง", description: null, qty: 3 },

  // เครื่องเสียงและดนตรี
  { name: "กลอง", category: "เครื่องเสียงและดนตรี", description: "ชุดกลองสำหรับซ้อมดนตรี", qty: 2 },
  { name: "ไมค์", category: "เครื่องเสียงและดนตรี", description: "ไมโครโฟนพร้อมสาย", qty: 6 },
  { name: "ลำโพงบลูทูธ", category: "เครื่องเสียงและดนตรี", description: null, qty: 4 },
  { name: "ขาตั้งไมค์", category: "เครื่องเสียงและดนตรี", description: null, qty: 3 },
  { name: "กีตาร์โปร่ง", category: "เครื่องเสียงและดนตรี", description: null, qty: 2 },
  { name: "คีย์บอร์ดไฟฟ้า", category: "เครื่องเสียงและดนตรี", description: "เปียโนไฟฟ้า 61 คีย์", qty: 2 },

  // เกมและหนังสือ
  { name: "บอร์ดเกม", category: "เกมและหนังสือ", description: "เกมกระดานสำหรับกิจกรรมสันทนาการ", qty: 6 },
  { name: "หนังสือการ์ตูน", category: "เกมและหนังสือ", description: "หนังสือการ์ตูนสำหรับอ่านพักผ่อน", qty: 20 },
  { name: "ไพ่ UNO", category: "เกมและหนังสือ", description: null, qty: 5 },
  { name: "หมากรุก", category: "เกมและหนังสือ", description: null, qty: 3 },
  { name: "หนังสือคู่มือเขียนโปรแกรม", category: "เกมและหนังสือ", description: "หนังสืออ้างอิงสำหรับเรียนและทำโปรเจกต์", qty: 10 },

  // อุปกรณ์ศิลปะ
  { name: "สี", category: "อุปกรณ์ศิลปะ", description: "ชุดสีสำหรับงานวาดและตกแต่ง", qty: 12 },
  { name: "พู่กัน", category: "อุปกรณ์ศิลปะ", description: null, qty: 15 },
  { name: "กระดาษ A3", category: "อุปกรณ์ศิลปะ", description: "สำหรับวาดและทำโปสเตอร์", qty: 20 },
  { name: "ปากกามาร์กเกอร์", category: "อุปกรณ์ศิลปะ", description: null, qty: 20 },
  { name: "กรรไกรและคัตเตอร์", category: "อุปกรณ์ศิลปะ", description: null, qty: 8 },

  // ของใช้ทั่วไป
  { name: "ปลั๊กไฟ", category: "ของใช้ทั่วไป", description: "ปลั๊กพ่วงหลายช่อง", qty: 10 },
  { name: "สายต่อพ่วงไฟยาว 10 เมตร", category: "ของใช้ทั่วไป", description: null, qty: 4 },
  { name: "ช้อนส้อม", category: "ของใช้ทั่วไป", description: "ชุดช้อนส้อมสำหรับกิจกรรม", qty: 30 },
  { name: "ถ้วย", category: "ของใช้ทั่วไป", description: "ถ้วยสำหรับกิจกรรม", qty: 30 },
  { name: "พัดลมตั้งโต๊ะ", category: "ของใช้ทั่วไป", description: null, qty: 3 },
  { name: "โต๊ะพับ", category: "ของใช้ทั่วไป", description: null, qty: 5 },
  { name: "เก้าอี้พับ", category: "ของใช้ทั่วไป", description: null, qty: 10 },
  { name: "กล่องเก็บของ", category: "ของใช้ทั่วไป", description: null, qty: 10 },

  // อื่นๆ
  { name: "กล้องดิจิทัล", category: "อื่นๆ", description: "พร้อมแบตเตอรี่และการ์ดความจำ", qty: 2 },
  { name: "ไวท์บอร์ดพกพา", category: "อื่นๆ", description: null, qty: 3 },
];

// เพิ่มอุปกรณ์ตัวอย่าง (เฉพาะ ADMIN) โดยข้ามรายการที่ชื่อซ้ำกับที่มีอยู่แล้ว
export async function seedSampleItems(): Promise<{
  error?: string;
  added?: number;
}> {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return { error: "คุณไม่มีสิทธิ์ทำรายการนี้" };
  }

  const existing = await prisma.item.findMany({ select: { name: true } });
  const existingNames = new Set(existing.map((i) => i.name));

  const toAdd = SAMPLE_ITEMS.filter((i) => !existingNames.has(i.name));

  if (toAdd.length === 0) {
    return { error: "มีอุปกรณ์ตัวอย่างครบแล้ว ไม่มีรายการใหม่ให้เพิ่ม" };
  }

  await prisma.item.createMany({
    data: toAdd.map((i) => ({
      name: i.name,
      category: i.category,
      description: i.description,
      totalQty: i.qty,
      availableQty: i.qty,
    })),
  });

  revalidatePath("/items");
  revalidatePath("/borrows/new");
  revalidatePath("/");

  return { added: toAdd.length };
}