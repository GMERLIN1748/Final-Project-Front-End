import { z } from "zod";

const dueDateField = z
  .string()
  .min(1, "กรุณาเลือกวันที่คืน")
  .refine((v) => !Number.isNaN(Date.parse(v)), "รูปแบบวันที่ไม่ถูกต้อง");

const noteField = z
  .string()
  .trim()
  .max(200, "หมายเหตุต้องไม่เกิน 200 ตัวอักษร")
  .optional();

// ยืมทีละรายการ
export const borrowSchema = z.object({
  itemId: z.number().int("ข้อมูลอุปกรณ์ไม่ถูกต้อง"),

  quantity: z
    .number({ error: "กรุณากรอกจำนวนเป็นตัวเลข" })
    .int("จำนวนต้องเป็นจำนวนเต็ม")
    .min(1, "จำนวนต้องไม่น้อยกว่า 1")
    .max(100, "จำนวนต้องไม่เกิน 100"),

  dueDate: dueDateField,
  note: noteField,
});

// ยืมหลายรายการพร้อมกัน
export const borrowManySchema = z.object({
  items: z
    .array(
      z.object({
        itemId: z.number().int("ข้อมูลอุปกรณ์ไม่ถูกต้อง"),
        quantity: z
          .number({ error: "กรุณากรอกจำนวนเป็นตัวเลข" })
          .int("จำนวนต้องเป็นจำนวนเต็ม")
          .min(1, "จำนวนต้องไม่น้อยกว่า 1")
          .max(100, "จำนวนต้องไม่เกิน 100"),
      }),
    )
    .min(1, "กรุณาเลือกอุปกรณ์อย่างน้อย 1 รายการ")
    .max(20, "ยืมได้ครั้งละไม่เกิน 20 รายการ"),

  dueDate: dueDateField,
  note: noteField,
});