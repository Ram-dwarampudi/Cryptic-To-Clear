const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clean() {
  const users = await prisma.user.findMany();
  console.log("Current users in DB:", users.length);
  for (const u of users) {
    console.log("Resetting test data for user:", u.email);
    await prisma.user.update({
      where: { id: u.id },
      data: {
        rollNo: null,
        collegeName: null,
        stream: null,
        bio: null,
        primaryLanguage: "Java",
        leetcodeHandle: null,
        codechefHandle: null,
        codeforcesHandle: null,
        hackerrankHandle: null,
        githubHandle: null,
        externalStats: null,
        overallScore: 0,
        karmaPoints: 0,
      }
    });
  }
  console.log("All user test data has been reset to clean state.");
  await prisma.$disconnect();
}

clean().catch(e => { console.error(e); process.exit(1); });
