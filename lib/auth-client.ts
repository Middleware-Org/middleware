/* ****************************************************************
 * Imports
 ***************************************************************** */
"use client";

import { createAuthClient } from "better-auth/react";

/* ****************************************************************
 * Auth Client
 ***************************************************************** */
export const authClient = createAuthClient({});

export const { useSession } = authClient;
