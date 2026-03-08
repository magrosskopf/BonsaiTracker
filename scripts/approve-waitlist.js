const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function parseEmailFromArgs(args) {
  const index = args.findIndex((arg) => arg === "--email");
  if (index < 0) {
    return null;
  }
  const value = args[index + 1];
  if (!value) {
    return null;
  }
  return normalizeEmail(value);
}

async function main() {
  const email = parseEmailFromArgs(process.argv.slice(2));
  if (!email) {
    throw new Error("Usage: node scripts/approve-waitlist.js --email <email>");
  }

  await prisma.$transaction(async (tx) => {
    await tx.signupAllowlist.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    await tx.waitlistRequest.upsert({
      where: { email },
      update: { status: "APPROVED" },
      create: { email, status: "APPROVED" },
    });
  });

  console.log(`Approved: ${email}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
