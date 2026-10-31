const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const aiRoutes = require("./routes/ai");

const app = express();

const origins = (process.env.CORS_ORIGINS || "http://localhost:8080,http://127.0.0.1:8080")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin || origins.includes(origin)) return true;
  try {
    const url = new URL(origin);
    const localHost = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    return localHost && (url.protocol === "http:" || url.protocol === "https:");
  } catch (err) {
    return false;
  }
}

app.use(cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) return callback(null, true);
    return callback(new Error("CORS"));
  },
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
  maxAge: 600,
}));

app.use(express.json({ limit: "8mb" }));

app.use((err, req, res, next) => {
  if (err && err.message === "CORS") {
    return res.status(403).json({ error: "Bu origin için erişim yok." });
  }
  if (err && (err.type === "entity.too.large" || err.status === 413)) {
    return res.status(413).json({ error: "İstek çok büyük." });
  }
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({ error: "Geçersiz JSON." });
  }
  return next(err);
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Çok fazla istek. Lütfen kısa süre sonra tekrar deneyin." },
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api", aiLimiter, aiRoutes);

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  const keyReady = Boolean(process.env.OPENROUTER_API_KEY);
  console.log(`AI backend ${PORT} portunda çalışıyor.`);
  console.log(keyReady ? "OpenRouter anahtarı yüklü." : "OPENROUTER_API_KEY eksik.");
});
