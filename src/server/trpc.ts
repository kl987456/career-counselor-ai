// src/server/trpc.ts
import { initTRPC } from "@trpc/server";

// Create the tRPC instance
const t = initTRPC.create();

// Export helpers
export const router = t.router;
export const publicProcedure = t.procedure;
