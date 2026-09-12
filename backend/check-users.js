const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      collegeName: true
    },
    orderBy: { createdAt: 'asc' }
  });
  
  console.log('Total users:', users.length);
  console.log('---');
  users.forEach((u, i) => {
    console.log(`${i + 1}. ${u.name} | ${u.email} | ${u.role} | ${u.collegeName} | ${u.createdAt}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
