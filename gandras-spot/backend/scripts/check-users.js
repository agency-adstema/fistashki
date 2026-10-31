const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

(async () => {
  const users = await p.user.findMany({
    select: {
      email: true,
      isActive: true,
      firstName: true,
      restaurants: { select: { role: true, restaurant: { select: { name: true } } } },
    },
    orderBy: { email: "asc" },
  });
  for (const u of users) {
    console.log(JSON.stringify(u));
  }
  const target = await p.user.findUnique({
    where: { email: "osvmedia.evan@gmail.com" },
    select: { email: true, isActive: true, restaurants: true },
  });
  console.log("--- osvmedia ---");
  console.log(JSON.stringify(target));
  await p.$disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
