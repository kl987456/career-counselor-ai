import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import { generateAIResponse } from "../utils/ai";

export const chatRouter = router({
  // Create new chat session
  createSession: publicProcedure
    .input(z.object({ title: z.string().min(1, "Title is required") }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.chatSession.create({
        data: { title: input.title },
      });
    }),

  // Delete chat session + its messages
  deleteSession: publicProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.message.deleteMany({
        where: { sessionId: input.sessionId },
      });
      return ctx.prisma.chatSession.delete({
        where: { id: input.sessionId },
      });
    }),

  // Send a message (USER or AI)
  sendMessage: publicProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        message: z.string().min(1, "Message cannot be empty"),
        sender: z.enum(["USER", "AI"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Save user/AI message
      const savedMessage = await ctx.prisma.message.create({
        data: {
          sessionId: input.sessionId,
          content: input.message,
          sender: input.sender,
        },
      });

      // If USER → queue AI reply
      if (input.sender === "USER") {
        // Create placeholder "thinking..." message
        const placeholder = await ctx.prisma.message.create({
          data: {
            sessionId: input.sessionId,
            content: "🤖 Thinking...",
            sender: "AI",
          },
        });

        // Generate AI reply in background
        generateAIResponse(input.message)
          .then(async (aiReply) => {
            await ctx.prisma.message.update({
              where: { id: placeholder.id },
              data: { content: aiReply },
            });
          })
          .catch(async (error) => {
            const errMsg =
              error instanceof Error ? error.message : "Unknown AI error";
            console.error("AI generation failed:", errMsg);

            await ctx.prisma.message.update({
              where: { id: placeholder.id },
              data: { content: `⚠️ AI error: ${errMsg}` },
            });
          });
      }

      return savedMessage;
    }),

  // Delete a single message
  deleteMessage: publicProcedure
    .input(z.object({ messageId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.message.delete({
        where: { id: input.messageId },
      });
    }),

  // Get all messages in a session
  getMessages: publicProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const messages = await ctx.prisma.message.findMany({
        where: { sessionId: input.sessionId },
        orderBy: { createdAt: "asc" },
      });

      return messages.map((m) => ({
        ...m,
        createdAt:
          m.createdAt instanceof Date ? m.createdAt : new Date(m.createdAt),
        updatedAt:
          m.updatedAt instanceof Date ? m.updatedAt : new Date(m.updatedAt),
      }));
    }),

  // List all sessions
  getSessions: publicProcedure.query(async ({ ctx }) => {
    const sessions = await ctx.prisma.chatSession.findMany({
      orderBy: { createdAt: "desc" },
    });

    return sessions.map((s) => ({
      ...s,
      createdAt:
        s.createdAt instanceof Date ? s.createdAt : new Date(s.createdAt),
      updatedAt:
        s.updatedAt instanceof Date ? s.updatedAt : new Date(s.updatedAt),
    }));
  }),
});
