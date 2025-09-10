// src/pages/api/trpc/[trpc].ts
import { createNextApiHandler } from "@trpc/server/adapters/next";
import type { NextApiHandler } from "next";
import { appRouter } from "@/server/routers/_app";
import { createContext } from "@/server/context";

// Wrap the TRPC handler in a Next.js API handler
const handler: NextApiHandler = (req, res) => {
  return createNextApiHandler({
    router: appRouter,
    createContext,
  })(req, res);
};

export default handler;
