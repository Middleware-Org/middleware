/* **************************************************
 * Imports
 **************************************************/
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

/* **************************************************
 * Auth API Route
 **************************************************/
export const { GET, POST } = toNextJsHandler(auth);
