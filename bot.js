require("dotenv").config();
const express = require("express");
const { Telegraf } = require("telegraf");
const path = require("path");

const BOT_TOKEN = process.env.BOT_TOKEN || "8653938577:AAE1g-TDAedxbpGvszb0zRyVa04560mba0c";
const PORT = process.env.PORT || 3000;

const bot = new Telegraf(BOT_TOKEN);
const app = express();

app.use(express.json());

// 🟢 ফিক্সড পাথ যাতে 'Not Found' না আসে
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

console.log("🚀 Mini App Engine Active...");

const RENDER_URL = process.env.RENDER_URL || "https://ppm-bot-auto.onrender.com";

bot.start(async (ctx) => {
    await ctx.reply(
        `👋 <b>স্বাগতম PP MOD বটে!</b>\n\n` +
        `আপনার গুগল প্লে পয়েন্ট কোয়েস্ট অটো কমপ্লিট করতে নিচের বাটনে চাপ দিয়ে অ্যাকাউন্ট কানেক্ট করুন:`,
        {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🚀 Open Mini App (Google Login)", web_app: { url: RENDER_URL } }]
                ]
            }
        }
    );
});

app.post("/api/auth/google", async (req, res) => {
    try {
        const { token, userId } = req.body;
        console.log(`[GOOGLE LOGIN] Received Token for Telegram ID: ${userId}`);
        return res.json({ ok: true, message: "Connected successfully!" });
    } catch (e) {
        return res.status(500).json({ ok: false, error: e.message });
    }
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`[HTTP] Server running on port ${PORT}`);
});

bot.launch().catch(console.error);
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));