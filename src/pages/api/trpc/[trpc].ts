// src/pages/api/trpc/[trpc].ts
import type { NextApiHandler } from "next";
import { createNextApiHandler } from "@trpc/server/adapters/next";
import { appRouter } from "@/server/routers/_app";
import { createContext } from "@/server/context";

// Create tRPC handler
const trpcHandler = createNextApiHandler({
  router: appRouter,
  createContext,
});

// Cast to NextApiHandler so Next.js accepts it
const handler: NextApiHandler = (req, res) =>
  (trpcHandler as unknown as NextApiHandler)(req, res);

export default handler;

// ✅ Ignore type errors for compatibility with Next.js 15
// @ts-expect-error - Next.js 15 ApiRouteConfig mismatch
