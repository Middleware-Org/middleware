import { PrismaClient } from "@/lib/generated/prisma/client";

const prisma = new PrismaClient();

function parseAdminEmails() {
  const raw = process.env.ADMIN_EMAILS || "";
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (users.length === 0) {
    console.log("[roles:migrate] No users found, skipping.");
    return;
  }

  const adminEmails = new Set(parseAdminEmails());

  if (adminEmails.size > 0) {
    const adminCandidates = users.filter((user) => adminEmails.has(user.email.toLowerCase()));

    if (adminCandidates.length === 0) {
      throw new Error(
        "[roles:migrate] ADMIN_EMAILS provided, but none match existing users. Aborting to avoid lockout.",
      );
    }

    const adminIds = adminCandidates.map((user) => user.id);

    const demoted = await prisma.user.updateMany({
      where: {
        id: { notIn: adminIds },
      },
      data: {
        role: "EDITOR",
      },
    });

    const promoted = await prisma.user.updateMany({
      where: {
        id: { in: adminIds },
      },
      data: {
        role: "ADMIN",
      },
    });

    console.log(
      `[roles:migrate] Completed with ADMIN_EMAILS. Promoted/kept ADMIN: ${promoted.count}, set EDITOR: ${demoted.count}.`,
    );
    return;
  }

  const admins = users.filter((user) => user.role === "ADMIN");
  const allAdmins = admins.length === users.length;

  if (allAdmins && users.length > 1) {
    const [firstUser, ...restUsers] = users;

    const demoted = await prisma.user.updateMany({
      where: {
        id: { in: restUsers.map((user) => user.id) },
      },
      data: {
        role: "EDITOR",
      },
    });

    await prisma.user.update({
      where: { id: firstUser.id },
      data: { role: "ADMIN" },
    });

    console.log(
      `[roles:migrate] Detected legacy all-admin state. Kept ADMIN: ${firstUser.email}, set EDITOR: ${demoted.count}.`,
    );
    return;
  }

  if (admins.length === 0) {
    const firstUser = users[0];
    await prisma.user.update({
      where: { id: firstUser.id },
      data: { role: "ADMIN" },
    });

    console.log(`[roles:migrate] No ADMIN found. Promoted ${firstUser.email} to ADMIN.`);
    return;
  }

  console.log("[roles:migrate] Existing role distribution looks valid. No changes applied.");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
