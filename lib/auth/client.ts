/* ****************************************************************
 * Imports
 ***************************************************************** */
"use client";

import { createAuthClient } from "better-auth/react";

/* ****************************************************************
 * Auth Client
 ***************************************************************** */
const baseURL =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_BASE_URL || "https://middleware.media";

export const authClient = createAuthClient({
  baseURL,
});

export const { useSession } = authClient;
