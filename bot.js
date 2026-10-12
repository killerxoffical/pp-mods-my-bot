require("dotenv").config();
const express = require("express");
const { Telegraf } = require("telegraf");

const BOT_TOKEN = process.env.BOT_TOKEN || "8653938577:AAE1g-TDAedxbpGvszb0zRyVa04560mba0c";
const PORT = process.env.PORT || 3000;

const bot = new Telegraf(BOT_TOKEN);
const app = express();

app.use(express.json());

// রেন্ডারের লাইভ URL 
const RENDER_URL = process.env.RENDER_URL || "https://ppm-bot-auto.onrender.com";

// 🟢 সরাসরি সার্ভারের ভেতর মিনি অ্যাপের HTML পেজ সেট করা হলো (Not Found চিরতরে বন্ধ)
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>PP MOD - Mini App</title>
            <script src="https://telegram.org/js/telegram-web-app.js"></script>
            <script src="https://cdn.tailwindcss.com"></script>
            <script src="https://accounts.google.com/gsi/client" async defer></script>
        </head>
        <body class="bg-slate-900 text-white min-h-screen p-4 flex flex-col items-center justify-center">
            <div class="w-full max-w-md bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-xl text-center space-y-6">
                <div class="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                    <span class="text-2xl">🎁</span>
                </div>
                <div>
                    <h1 class="text-xl font-black">Google Play Points Hub</h1>
                    <p class="text-xs text-slate-400 mt-1">কানেক্ট করতে নিচের Google বাটনে চাপ দিন</p>
                </div>
                <div id="googleButtonContainer" class="flex justify-center"></div>
                <div id="statusBox" class="hidden p-3 bg-slate-900 rounded-xl text-xs font-mono text-emerald-400"></div>
            </div>

            <script>
                const tg = window.Telegram.WebApp;
                tg.expand();
                const userId = tg.initDataUnsafe?.user?.id || "guest_user";

                function handleCredentialResponse(response) {
                    const idToken = response.credential;
                    document.getElementById('statusBox').classList.remove('hidden');
                    document.getElementById('statusBox').textContent = "⏳ গুগল অ্যাকাউন্ট ভেরিফাই হচ্ছে...";

                    fetch('/api/auth/google', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token: idToken, userId: userId })
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.ok) {
                            document.getElementById('statusBox').textContent = "✅ সফলভাবে কানেক্ট হয়েছে!";
                            setTimeout(() => tg.close(), 2000);
                        } else {
                            document.getElementById('statusBox').textContent = "❌ ব্যর্থ: " + (data.error || "Error");
                        }
                    })
                    .catch(() => {
                        document.getElementById('statusBox').textContent = "❌ সার্ভার এরর!";
                    });
                }

                window.onload = function () {
                    google.accounts.id.initialize({
                        client_id: "765252903446-r9vpoaf4jn4n8bljn5d18mmrn0jrjcp5.apps.googleusercontent.com",
                        callback: handleCredentialResponse
                    });
                    google.accounts.id.renderButton(
                        document.getElementById("googleButtonContainer"),
                        { theme: "outline", size: "large", shape: "pill" }
                    );
                }
            </script>
        </body>
        </html>
    `);
});

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