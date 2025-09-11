// src/server/trpc.ts
import { initTRPC } from "@trpc/server";
import type { Context } from "./context";

// Initialize tRPC with context
const t = initTRPC.context<Context>().create({
  // (optional) add errorFormatter if you want custom error shapes
  // errorFormatter({ shape }) {
  //   return shape;
  // },
});

// Export helpers
export const router = t.router;
export const publicProcedure = t.procedure;

// (optional) if you need middlewares later
export const middleware = t.middleware;
