require("dotenv").config();
const express = require("express");
const axios = require("axios");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Rota teste
app.get("/", (req, res) => {
  res.send("🤖 Bot WhatsApp IA ONLINE");
});

// Webhook UltraMsg
app.post("/webhook", async (req, res) => {
  try {
    if (req.body?.data?.fromMe) return res.sendStatus(200);

    const message = req.body?.data?.body;
    let from = req.body?.data?.from;

    if (!message || !from) return res.sendStatus(200);

    // limpa número
    from = from.replace("@c.us", "").replace(/\D/g, "");

    console.log("📩 Recebido:", message, "de", from);

    // OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "Você é um atendente de WhatsApp educado, direto e prestativo. Responda curto.",
        },
        { role: "user", content: message },
      ],
    });

    const resposta = completion.choices[0].message.content;

    console.log("📤 Enviando:", resposta);

    // ENVIO UltraMsg (endpoint correto)
    const url = `https://api.ultramsg.com/${process.env.ULTRAMSG_INSTANCE}/messages/chat`;

    const result = await axios.post(url, {
      token: process.env.ULTRAMSG_TOKEN,
      to: from,
      body: resposta,
    });

    console.log("✅ UltraMsg:", result.data);
    res.sendStatus(200);
  } catch (err) {
    console.error("❌ ERRO:", err.response?.data || err.message);
    res.sendStatus(500);
  }
});

app.listen(3000, () => {
  console.log("🚀 Servidor rodando na porta 3000");
});