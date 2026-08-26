const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const connectionString = "postgresql://postgres:18062004@3.75.176.131:5432/lms?schema=public";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("=== STUDENTS ===");
  const students = await prisma.users.findMany({
    where: { role: "STUDENT" },
    select: {
      id: true,
      full_name: true,
      phone: true,
      courseId: true,
      isPaid: true,
    }
  });
  console.log(students);

  console.log("=== COURSES ===");
  const courses = await prisma.courses.findMany({
    select: {
      id: true,
      name: true,
    }
  });
  console.log(courses);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect().then(() => pool.end()));
