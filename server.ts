import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Groq from "groq-sdk";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/chat", async (req, res) => {
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

      res.json({ 
        message: chatCompletion.choices[0]?.message?.content || "",
        role: "assistant"
      });
    } catch (error: any) {
      console.error("Groq API Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate response" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
