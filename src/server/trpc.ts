// src/server/trpc.ts
import { initTRPC } from "@trpc/server";
import type { Context } from "./context";

// Initialize tRPC with context
const t = initTRPC.context<Context>().create();

// Export helpers
export const router = t.router;
export const publicProcedure = t.procedure;
