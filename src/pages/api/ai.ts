import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // keep secret in .env.local
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // can change to "gpt-4o" for better responses
      messages: [{ role: "user", content: message }],
    });

    const reply = completion.choices[0]?.message?.content?.trim() || "No reply";

    return res.status(200).json({ reply });
  } catch (err: any) {
    console.error("AI API error:", err);
    return res.status(500).json({ error: "Something went wrong while contacting AI" });
  }
}
