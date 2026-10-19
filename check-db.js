const fs = require("fs");
const { createClient } = require("@libsql/client");

console.log("dev.db ที่โฟลเดอร์หลัก:", fs.existsSync("dev.db"));
console.log("prisma/dev.db:", fs.existsSync("prisma/dev.db"));

const c = createClient({ url: "file:./dev.db" });

c.execute("SELECT email, role FROM User").then((r) => {
  console.log("ผู้ใช้ในระบบ:");
  r.rows.forEach((x) => console.log(" -", x.email, "->", x.role));
});
