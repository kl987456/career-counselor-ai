// src/pages/api/trpc/[trpc].ts
import { createNextApiHandler } from "@trpc/server/adapters/next";
import type { NextApiHandler } from "next";
import { appRouter } from "@/server/routers/_app";
import { createContext } from "@/server/context";

// Explicitly type this as a Next.js API handler
const handler: NextApiHandler = createNextApiHandler({
  router: appRouter,
  createContext,
});

export default handler;
