// src/pages/api/test.ts
import { appRouter } from "@/server/routers/_app";
import { prisma } from "@/server/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const caller = appRouter.createCaller({ prisma });

  if (req.method === "GET") {
    // Create a session
    const session = await caller.chat.createSession({ title: "Test Session" });

    // Send a message
    await caller.chat.sendMessage({
      sessionId: session.id,
      message: "Hello from test!",
      sender: "USER",
    });

    // Get all messages
    const messages = await caller.chat.getMessages({ sessionId: session.id });

    return res.status(200).json({ session, messages });
  }

  res.status(405).json({ error: "Method not allowed" });
}
