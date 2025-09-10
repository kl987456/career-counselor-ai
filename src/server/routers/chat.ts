export const chatRouter = router({
  createSession: publicProcedure
    .input(z.object({ title: z.string().min(1, "Title is required") }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.chatSession.create({ data: { title: input.title } });
    }),

  deleteSession: publicProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.message.deleteMany({ where: { sessionId: input.sessionId } });
      return ctx.prisma.chatSession.delete({ where: { id: input.sessionId } });
    }),

  sendMessage: publicProcedure
    .input(
      z.object({
        sessionId: z.string().uuid(),
        message: z.string().min(1, "Message cannot be empty"),
        sender: z.enum(["USER", "AI"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const message = await ctx.prisma.message.create({
        data: { sessionId: input.sessionId, content: input.message, sender: input.sender },
      });

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
              data: { sessionId: input.sessionId, content: aiMessage, sender: "AI" },
            });
          } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Unknown error";
            console.error("OpenAI API error:", msg);
            await ctx.prisma.message.create({
              data: { sessionId: input.sessionId, content: `AI error: ${msg}`, sender: "AI" },
            });
          }
        })();
      }

      return message;
    }),

  deleteMessage: publicProcedure
    .input(z.object({ messageId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.message.delete({ where: { id: input.messageId } });
    }),

  getMessages: publicProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const messages = await ctx.prisma.message.findMany({
        where: { sessionId: input.sessionId },
        orderBy: { createdAt: "asc" },
      });

      return messages.map((m) => ({
        ...m,
        createdAt: new Date(m.createdAt),
        updatedAt: new Date(m.updatedAt),
      }));
    }),

  getSessions: publicProcedure.query(async ({ ctx }) => {
    const sessions = await ctx.prisma.chatSession.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Convert string timestamps to Date objects
    return sessions.map((s) => ({
      ...s,
      createdAt: new Date(s.createdAt),
      updatedAt: new Date(s.updatedAt),
    }));
  }),
});
