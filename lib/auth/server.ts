/* ****************************************************************
 * Imports
 ***************************************************************** */
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { prisma } from "../prisma";

/* ****************************************************************
 * Auth Configuration
 ***************************************************************** */
const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "https://middleware.media";

export const auth = betterAuth({
  baseURL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
  },

  trustedOrigins: [
    baseURL,
    "https://middleware.media",
    "http://localhost:3000",
    ...(process.env.NODE_ENV === "development" ? ["http://localhost:3000"] : []),
  ],

  plugins: [nextCookies()],
});

/* ****************************************************************
 * Session Helpers
 ***************************************************************** */
export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function getAuthenticatedUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function getUser() {
  const sessionUser = await getAuthenticatedUser();
  if (!sessionUser) {
    return null;
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { role: true },
  });

  if (!dbUser) {
    return null;
  }

  return {
    ...sessionUser,
    role: dbUser.role,
  };
}

export async function getAdminUser() {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return user;
}
