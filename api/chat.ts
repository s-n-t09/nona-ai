import Groq from "groq-sdk";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, systemPrompt } = req.body;
    
    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: "GROQ_API_KEY is not configured" });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: apiMessages,
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
    });

    res.status(200).json({ 
      message: chatCompletion.choices[0]?.message?.content || "",
      role: "assistant"
    });
  } catch (error: any) {
    console.error("Groq API Error:", error);
    res.status(500).json({ error: error.message || "Failed to generate response" });
  }
}
