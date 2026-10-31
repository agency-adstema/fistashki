const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const p = new PrismaClient();

(async () => {
  const emails = ["admin@gandrasspot.rs", "osvmedia.evan@gmail.com"];
  const passwords = ["admin123", "dostava123", "vanja123", "password", "123456"];

  for (const email of emails) {
    const user = await p.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      console.log(email, "NOT FOUND");
      continue;
    }
    console.log(email, "active:", user.isActive, "hash prefix:", user.passwordHash?.slice(0, 20));
    for (const pw of passwords) {
      const ok = await bcrypt.compare(pw, user.passwordHash);
      if (ok) console.log("  MATCH:", pw);
    }
  }
  await p.$disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
