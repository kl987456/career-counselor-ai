// src/pages/api/trpc/[trpc].ts
import type { NextApiHandler } from "next";
import { createNextApiHandler } from "@trpc/server/adapters/next";
import { appRouter } from "@/server/routers/_app";
import { createContext } from "@/server/context";

// TRPC handler
const trpcHandler = createNextApiHandler({
  router: appRouter,
  createContext,
});

// Force Next.js to accept it as an API handler
const handler: NextApiHandler = (req, res) => {
  return (trpcHandler as unknown as NextApiHandler)(req, res);
};

export default handler;
