// src/server/utils/ai.ts
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateAIResponse(userMessage: string) {
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: userMessage }],
  });

  return response.choices[0].message?.content ?? "Sorry, I couldn't generate a reply.";
}
