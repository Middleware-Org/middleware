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
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 8,
  },

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

export async function getUser() {
  const session = await getSession();
  return session?.user;
}
