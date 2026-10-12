require("dotenv").config();
const express = require("express");
const { Telegraf } = require("telegraf");

const BOT_TOKEN = process.env.BOT_TOKEN || "8653938577:AAE1g-TDAedxbpGvszb0zRyVa04560mba0c";
const CLIENT_ID = "765252903446-r9vpoaf4jn4n8bljn5d18mmrn0jrjcp5.apps.googleusercontent.com";
const RENDER_URL = process.env.RENDER_URL || "https://quest-miniapp.onrender.com";
const PORT = process.env.PORT || 3000;

const bot = new Telegraf(BOT_TOKEN);
const app = express();

app.use(express.json());

// ১. মিনি অ্যাপ পেজ (যেখানে বাটন চাপলে ক্রোম ব্রাউজারে গুগল লগইন ওপেন হবে)
app.get('/', (req, res) => {
    const userId = req.query.userId || "guest";
    
    // গুগল লগইনের অফিশিয়াল ডাইরেক্ট লিঙ্ক
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(RENDER_URL + '/auth/google/callback')}&` +
        `response_type=code&` +
        `scope=openid%20email%20profile%20https://www.googleapis.com/auth/games&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `state=${userId}`;

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>PP MOD - Connect Google</title>
            <script src="https://telegram.org/js/telegram-web-app.js"></script>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-slate-900 text-white min-h-screen p-5 flex flex-col items-center justify-center">
            <div class="w-full max-w-sm bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-2xl text-center space-y-6">
                <div class="w-16 h-16 bg-gradient-to-tr from-sky-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                    <span class="text-3xl">🎮</span>
                </div>
                <div>
                    <h1 class="text-xl font-black">Play Games Quest Hub</h1>
                    <p class="text-xs text-slate-400 mt-1">কানেক্ট করতে নিচের বাটনে চাপ দিন</p>
                </div>

                <!-- এই বাটনে চাপ দিলে টেলিগ্রামের সাদা স্ক্রিন আর আসবে না, সরাসরি ক্রোম ব্রাউজারে সুন্দর লগইন পেজ আসবে -->
                <a href="${googleAuthUrl}" target="_blank" class="w-full py-3.5 bg-white hover:bg-slate-100 text-slate-800 font-extrabold rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" class="w-5 h-5">
                    Sign in with Google
                </a>
            </div>
            <script>
                window.Telegram.WebApp.expand();
            </script>
        </body>
        </html>
    `);
});

// ২. ক্রোম ব্রাউজারে লগইন সফল হলে এই এন্ডপয়েন্টে ফিরে আসবে
app.get('/auth/google/callback', async (req, res) => {
    const code = req.query.code;
    const userId = req.query.state;

    console.log(`[GOOGLE SUCCESS] Code received for User: ${userId}`);

    // সফল নোটিফিকেশন পেজ
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Success</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-slate-900 text-white min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <div class="bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-xl max-w-sm w-full space-y-4">
                <div class="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto text-3xl shadow-lg">
                    ✓
                </div>
                <h2 class="text-xl font-black text-emerald-400">লগইন সফল হয়েছে!</h2>
                <p class="text-xs text-slate-300">আপনার গুগল একাউন্টটি সফলভাবে কানেক্ট হয়েছে। এখন টেলিগ্রাম অ্যাপে ফিরে যান।</p>
                <div class="pt-2">
                    <a href="https://t.me/Ppmod_bot" class="block w-full py-3 bg-indigo-600 text-white font-bold rounded-xl text-xs">
                        Back to Telegram
                    </a>
                </div>
            </div>
        </body>
        </html>
    `);

    // টেলিগ্রাম বটে ইউজারকে অটো কনফার্মেশন মেসেজ পাঠানো
    if (userId && userId !== "guest") {
        try {
            await bot.telegram.sendMessage(userId, 
                `🎉 <b>অভিনন্দন! আপনার গুগল একাউন্ট কানেক্ট হয়েছে।</b>\n\n` +
                `এখন আপনি চেস্ট সিলেক্ট করে কোয়েস্ট আনলক করতে পারবেন! 🚀`,
                { parse_mode: "HTML" }
            );
        } catch (e) {}
    }
});

// ৩. টেলিগ্রাম বট স্টার্ট কমান্ড
bot.start(async (ctx) => {
    const userId = ctx.from.id;
    const miniAppUrl = `${RENDER_URL}/?userId=${userId}`;

    await ctx.reply(
        `👋 <b>স্বাগতম Quest Helper বটে!</b>\n\n` +
        `গুগল প্লে পয়েন্ট কোয়েস্ট অটো-কমপ্লিট করতে নিচের বাটনে চাপ দিন:`,
        {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🚀 Open Quest App", web_app: { url: miniAppUrl } }]
                ]
            }
        }
    );
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`[HTTP] Server running on port ${PORT}`);
});

bot.launch().catch(console.error);
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));