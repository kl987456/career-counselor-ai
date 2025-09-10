import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type AIResponse = {
  reply: string;
};

type ErrorResponse = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AIResponse | ErrorResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body: { message?: string } =
      typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    if (!body.message || typeof body.message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: body.message }],
    });

    const reply =
      completion.choices?.[0]?.message?.content?.trim() ?? "No reply";

    return res.status(200).json({ reply });
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown error";
    console.error("AI API error:", error);
    return res.status(500).json({ error: "Something went wrong while contacting AI" });
  }
}
