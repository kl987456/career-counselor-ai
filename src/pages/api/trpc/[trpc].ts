// src/pages/api/trpc/[trpc].ts
import { createNextApiHandler } from "@trpc/server/adapters/next";
import type { NextApiHandler } from "next";
import { appRouter } from "@/server/routers/_app";
import { createContext } from "@/server/context";

// Force the type explicitly
const handler: NextApiHandler = createNextApiHandler({
  router: appRouter,
  createContext,
});

// Export with explicit type so Next.js accepts it
export default handler;
