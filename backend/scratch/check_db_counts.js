const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectTables() {
  const models = [
    'user', 'institution', 'department', 'course', 'assignment',
    'doubt', 'doubtAnswer', 'doubtVote', 'doubtAnswerVote',
    'doubtTag', 'doubtNotification', 'interviewExperience'
  ];
  const counts = {};
  for (const m of models) {
    if (prisma[m]) {
      try {
        counts[m] = await prisma[m].count();
      } catch (e) {
        counts[m] = 'error: ' + e.message;
      }
    }
  }
  console.log("Database Table Counts:", JSON.stringify(counts, null, 2));
  await prisma.$disconnect();
}

inspectTables();
