require("dotenv").config();
const prisma = require("./src/config/db");

async function main() {
  console.log("\n==========================================================================");
  console.log("  👥 CRYPTIC TO CLEAR — REGISTERED USERS (Render Database)");
  console.log("==========================================================================\n");

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { university: true, department: true },
    });

    if (users.length === 0) {
      console.log("No users found in database.");
    } else {
      console.table(
        users.map((u) => ({
          ID: u.id,
          Name: u.name,
          Email: u.email,
          Role: u.role,
          RollNo: u.rollNo || "N/A",
          Karma: u.karmaPoints,
          Score: u.overallScore,
          College: u.collegeName || (u.university ? u.university.name : "N/A"),
          Joined: new Date(u.createdAt).toLocaleDateString(),
        }))
      );
      console.log(`\nTotal Users: ${users.length}\n`);
    }
  } catch (err) {
    console.error("Failed to query database:", err.message);
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();
