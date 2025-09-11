// src/server/utils/ai.ts
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateAIResponse(userMessage: string) {
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
You are a friendly AI career counselor.
When giving advice, always use emojis for headings instead of markdown like '##'.
For example:
🤔 Self-Assessment
🔍 Research
📚 Education and Skills Development
💼 Experience
💡 Tips
🎯 Goal Setting
🌐 Networking

Make responses visually appealing, concise, and professional.
        `,
      },
      {
        role: "user",
        content: userMessage,
      },
    ],
  });

  return response.choices[0].message?.content ?? "Sorry, I couldn't generate a reply.";
}
