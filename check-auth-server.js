const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
      select: { id: true, email: true, passwordHash: true }
    });
    
    console.log('User found:', user);
    if (!user) {
      console.log('NO USER FOUND WITH admin@example.com');
    } else if (!user.passwordHash) {
      console.log('ERROR: User has no password hash!');
    } else {
      console.log('Password hash exists (length:', user.passwordHash.length, ')');
    }
  } catch (error) {
    console.error('Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
