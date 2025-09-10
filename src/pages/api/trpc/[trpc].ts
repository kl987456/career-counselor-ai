// src/pages/api/trpc/[trpc].ts
import type { NextApiHandler } from "next";
import { createNextApiHandler } from "@trpc/server/adapters/next";
import { appRouter } from "@/server/routers/_app";
import { createContext } from "@/server/context";

const handler = createNextApiHandler({
  router: appRouter,
  createContext,
});

// Explicit cast so Next.js/Vercel accepts it
export default handler as NextApiHandler;
