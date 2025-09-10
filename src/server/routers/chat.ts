import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const chatRouter = router({
  createSession: publicProcedure
    .input(z.object({ title: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.chatSession.create({ data: { title: input.title } });
    }),

  deleteSession: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.message.deleteMany({ where: { sessionId: input.sessionId } });
      return ctx.prisma.chatSession.delete({ where: { id: input.sessionId } });
    }),

  sendMessage: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
        message: z.string(),
        sender: z.enum(["USER", "AI"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Save user message immediately
      const message = await ctx.prisma.message.create({
        data: {
          sessionId: input.sessionId,
          content: input.message,
          sender: input.sender,
        },
      });

      // Async AI response
      if (input.sender === "USER") {
        (async () => {
          try {
            const completion = await openai.chat.completions.create({
              model: "gpt-4o-mini",
              messages: [
                { role: "system", content: "You are a helpful AI career counselor." },
                { role: "user", content: input.message },
              ],
            });

            const aiMessage = completion.choices?.[0]?.message?.content ?? "AI could not respond.";

            await ctx.prisma.message.create({
              data: {
                sessionId: input.sessionId,
                content: aiMessage,
                sender: "AI",
              },
            });
          } catch (err) {
            const error = err instanceof Error ? err : new Error("Unknown error");
            console.error("OpenAI API error:", error.message);
            await ctx.prisma.message.create({
              data: {
                sessionId: input.sessionId,
                content: `AI error: ${error.message}`,
                sender: "AI",
              },
            });
          }
        })();
      }

      return message; // immediately return user message
    }),

  deleteMessage: publicProcedure
    .input(z.object({ messageId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.message.delete({ where: { id: input.messageId } });
    }),

  getMessages: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.message.findMany({
        where: { sessionId: input.sessionId },
        orderBy: { createdAt: "asc" },
      });
    }),

  getSessions: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.chatSession.findMany({
      orderBy: { createdAt: "desc" },
    });
  }),
});
