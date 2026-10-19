const { createClient } = require("@libsql/client");

const email = process.argv[2];

if (!email) {
  console.log("ใช้งาน: node set-admin.js อีเมล");
  process.exit(1);
}

const c = createClient({ url: "file:./dev.db" });

c.execute({
  sql: "UPDATE User SET role = ? WHERE email = ?",
  args: ["ADMIN", email.toLowerCase()],
}).then((r) => console.log("แก้ไข", r.rowsAffected, "แถว"));
