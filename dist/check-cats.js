"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const cats = await prisma.category.findMany({ select: { id: true, name: true, slug: true }, orderBy: { sortOrder: 'asc' } });
    cats.forEach(c => console.log(`${c.slug} => "${c.name}"`));
}
main().finally(() => prisma.$disconnect());
//# sourceMappingURL=check-cats.js.map