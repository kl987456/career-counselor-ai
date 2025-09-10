// src/server/routers/_app.ts
import { router } from "../trpc";
import { chatRouter } from "./chat";

// Main tRPC router that combines all routers
export const appRouter = router({
  chat: chatRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
