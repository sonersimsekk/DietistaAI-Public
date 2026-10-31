const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  stripCodeFences,
  clampNum,
  buildUserSummaryText,
  parseUser,
  ensureUserProfileInSystem,
  callOpenRouter,
} = require("../lib/openrouter");

const router = express.Router();

const imageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 12,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Fotoğraf analizi limiti doldu. Lütfen kısa süre sonra tekrar deneyin." },
});

function requireUser(body) {
  const user = parseUser(body && body.user);
  if (!user) {
    const err = new Error("NO_CURRENT_USER");
    err.status = 400;
    err.code = "NO_CURRENT_USER";
    throw err;
  }
  return user;
}

function parseMessages(input) {
  if (!Array.isArray(input)) return [];
  return input
    .slice(-20)
    .map((m) => {
      const role = m && m.role === "assistant" ? "assistant" : "user";
      const content = String((m && m.content) || "").slice(0, 4000);
      return { role, content };
    })
    .filter((m) => m.content.trim());
}

function parseIngredients(input) {
  if (!Array.isArray(input)) return [];
  return input
    .map((item) => String(item || "").trim().slice(0, 80))
    .filter(Boolean)
    .slice(0, 20);
}

function parseImage(value) {
  const raw = String(value || "").replace(/\s/g, "");
  if (!raw || raw.length > 5500000) return null;
  if (!/^[A-Za-z0-9+/]+=*$/.test(raw)) return null;
  return raw;
}

function parseProduct(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const n = input.nutriments && typeof input.nutriments === "object" ? input.nutriments : {};
  const num = (v) => {
    const x = Number(v);
    return Number.isFinite(x) ? x : null;
  };
  return {
    product_name: String(input.product_name || "").slice(0, 200),
    brands: String(input.brands || "").slice(0, 200),
    categories: String(input.categories || "").slice(0, 500),
    labels: String(input.labels || "").slice(0, 500),
    allergens: String(input.allergens || "").slice(0, 1000),
    ingredients_text: String(input.ingredients_text || "").slice(0, 4000),
    nutriments: {
      energy_kcal_100g: num(n.energy_kcal_100g),
      fat_100g: num(n.fat_100g),
      sugars_100g: num(n.sugars_100g),
      proteins_100g: num(n.proteins_100g),
      carbohydrates_100g: num(n.carbohydrates_100g),
      salt_100g: num(n.salt_100g),
    },
  };
}

function parseRegistration(input) {
  const r = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const name = String(r.name || "").trim().slice(0, 60);
  if (!name) return null;
  return {
    name,
    surname: String(r.surname || "").trim().slice(0, 60),
    age: clampNum(r.age, 1, 120, 25),
    gender: String(r.gender || "Belirtilmedi").slice(0, 40),
    height: clampNum(r.height, 50, 250, 170),
    weight: clampNum(r.weight, 20, 400, 70),
    goal: String(r.goal || "").slice(0, 200),
    activityLevel: String(r.activityLevel || "").slice(0, 40),
    diseases: String(r.diseases || "").slice(0, 300),
    allergies: String(r.allergies || "").slice(0, 300),
  };
}

function parseDayData(input) {
  const d = input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const totals = d.totals && typeof d.totals === "object" ? d.totals : {};
  const meals = Array.isArray(d.meals)
    ? d.meals.slice(0, 12).map((m) => ({
        id: String((m && m.id) || "").slice(0, 40),
        name: String((m && m.name) || "").slice(0, 40),
        calories: clampNum(m && m.calories, 0, 20000, 0),
        protein_g: clampNum(m && m.protein_g, 0, 2000, 0),
        carb_g: clampNum(m && m.carb_g, 0, 2000, 0),
        fat_g: clampNum(m && m.fat_g, 0, 2000, 0),
      }))
    : [];

  return {
    date: String(d.date || "").slice(0, 20),
    meals,
    totals: {
      calories: clampNum(totals.calories, 0, 50000, 0),
      protein_g: clampNum(totals.protein_g, 0, 5000, 0),
      carb_g: clampNum(totals.carb_g, 0, 5000, 0),
      fat_g: clampNum(totals.fat_g, 0, 5000, 0),
    },
    water_l: clampNum(d.water_l, 0, 20, 0),
    steps: clampNum(d.steps, 0, 200000, 0),
    exercise_note: String(d.exercise_note || "").slice(0, 500),
    burned_kcal: clampNum(d.burned_kcal, 0, 20000, 0),
  };
}

function endOfDayFallback() {
  return {
    score_10: 0,
    earned_points: 0,
    report: "Üzgünüm, gün sonu raporu oluşturulamadı.",
    highlights: [],
    improvements: [],
    tomorrow_plan: [],
  };
}

function sendError(res, err) {
  if (!err || err.name === "AbortError") return;
  if (res.headersSent) return;
  if (err.code === "NO_CURRENT_USER") {
    return res.status(400).json({
      error: "Devam etmek için lütfen bir kullanıcı seç veya yeni kullanıcı oluştur.",
      code: "NO_CURRENT_USER",
    });
  }
  if (err.status === 400) {
    return res.status(400).json({ error: err.message || "Geçersiz istek.", code: err.code || "BAD_REQUEST" });
  }
  if (err.code === "ONBOARDING_JSON_INVALID") {
    return res.status(502).json({ error: "Program oluşturulamadı.", code: "ONBOARDING_JSON_INVALID" });
  }
  console.error(err.message || err);
  return res.status(502).json({ error: "AI yanıtı alınamadı." });
}

function bindAbort(req, res) {
  const controller = new AbortController();
  res.on("close", () => {
    if (!res.writableEnded) controller.abort();
  });
  return controller.signal;
}

router.post("/chat", async (req, res) => {
  const signal = bindAbort(req, res);
  try {
    const user = requireUser(req.body);
    const text = buildUserSummaryText(user);
    const messages = ensureUserProfileInSystem(parseMessages(req.body && req.body.messages), text);
    const content = await callOpenRouter({ messages, max_tokens: 250, temperature: 0.7, signal });
    if (!res.writableEnded) res.json({ content });
  } catch (err) {
    sendError(res, err);
  }
});

router.post("/food-photo", imageLimiter, async (req, res) => {
  const signal = bindAbort(req, res);
  try {
    const user = requireUser(req.body);
    const image = parseImage(req.body && req.body.imageBase64);
    if (!image) {
      const err = new Error("Geçerli bir fotoğraf gerekli.");
      err.status = 400;
      throw err;
    }
    const mealName = String((req.body && req.body.mealName) || "").slice(0, 80);
    const text = buildUserSummaryText(user);
    const systemPrompt = `
Sen "DietistaAI" adında KİŞİSEL bir beslenme koçusun.
GÖREV: Fotoğrafı analiz et ve SADECE aşağıdaki JSON formatında dön. Doğal dil, markdown, kod bloğu YOK.

{
  "total_kcal": number,
  "items": [
    { "name": string, "kcal": number, "protein_g": number, "carb_g": number, "fat_g": number }
  ],
  "warnings": [string],
  "solutions": [string],
  "decision": "safe" | "caution" | "unsafe",
  "is_safe_for_user": boolean,
  "restricted_hits": [ { "ingredient": string, "rule": string } ]
}

/* Kurallar (çok önemli) */
- Gluten intoleransı varsa ve glutenli içerik tespit edilirse:
  - "is_safe_for_user": false, "decision": "unsafe"
  - "warnings" içinde tek, spesifik bir cümle yaz.
  - "solutions" içine 1-3 kısa alternatif ekle.
- Uyarı yoksa "warnings": ["Bu yemeğin senin için bir sakıncası yok."] ve "solutions": [] döndür.
- SADECE geçerli JSON döndür.

Kullanıcı:
${text}
    `.trim();

    const messages = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "text", text: `Öğün adı: ${mealName || "Bilinmiyor"}. Sadece geçerli JSON döndür.` },
          { type: "image_url", image_url: { detail: "low", url: `data:image/jpeg;base64,${image}` } },
        ],
      },
    ];

    const rawResp = await callOpenRouter({ messages, max_tokens: 800, temperature: 0.2, signal });
    if (!res.writableEnded) res.json({ content: stripCodeFences(rawResp) });
  } catch (err) {
    sendError(res, err);
  }
});

router.post("/meal-suggestions", async (req, res) => {
  const signal = bindAbort(req, res);
  try {
    const user = requireUser(req.body);
    const ingredients = parseIngredients(req.body && req.body.ingredients);
    const text = buildUserSummaryText(user);
    const systemPrompt = `
Sen "DietistaAI" adında KİŞİSEL bir beslenme koçusun.
Görev: Kullanıcıya uygun 3–5 yemek öner ve SADECE aşağıdaki JSON formatında dön.

{
  "meals": [
    {
      "title": string,
      "calories": number,
      "macros": { "protein_g": number, "carb_g": number, "fat_g": number },
      "ingredients": [string],
      "why_for_you": string,
      "flags": [string],
      "recipe_steps": [string]
    }
  ]
}

Kurallar:
- Öneriler kullanıcının alerji/rahatsızlık ve hedefleriyle uyumlu olsun.
- Gluten intoleransı varsa gluten içeren yemek önermE.
- SADECE geçerli JSON döndür.

Kullanıcı:
${text}
    `.trim();

    const userMsg = ingredients.length
      ? `Elimde şu malzemeler var: ${ingredients.join(", ")}. Lütfen bunları da dikkate al.`
      : "Malzeme listesi verilmedi; yine de uygun 3–5 pratik yemek öner.";

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: [{ type: "text", text: userMsg }] },
    ];

    const rawResp = await callOpenRouter({ messages, max_tokens: 900, temperature: 0.4, signal });
    if (!res.writableEnded) res.json({ content: stripCodeFences(rawResp) });
  } catch (err) {
    sendError(res, err);
  }
});

router.post("/barcode-analysis", async (req, res) => {
  const signal = bindAbort(req, res);
  try {
    const user = requireUser(req.body);
    const barcode = String((req.body && req.body.barcode) || "").trim();
    if (!/^[0-9A-Za-z]{4,32}$/.test(barcode)) {
      const err = new Error("Geçerli bir barkod gerekli.");
      err.status = 400;
      throw err;
    }
    const product = parseProduct(req.body && req.body.product);
    if (!product) {
      const err = new Error("Ürün bilgisi gerekli.");
      err.status = 400;
      throw err;
    }

    const text = buildUserSummaryText(user);
    const systemPrompt = `
Sen "DietistaAI" adlı kişisel beslenme asistanısın.
SADECE aşağıdaki JSON şemasında dön:

{
  "barcode": string,
  "product_name": string,
  "decision": "safe" | "caution" | "unsafe",
  "reasons": [string],
  "conditions": [string],
  "portion_advice": string,
  "risky_ingredients": [ { "ingredient": string, "rule": string } ],
  "badges": [string]
}

Kullanıcı özeti:
${text}

Kurallar:
- Kararı kullanıcının alerji ve hassasiyetine göre ver.
- Gluten, buğday, arpa, çavdar veya malt yalnızca kullanıcıda gluten hassasiyeti varsa decision="unsafe" yapar.
- Anlamlı risk yoksa "safe".
- SADECE geçerli JSON döndür.
    `.trim();

    const userMsg = {
      role: "user",
      content: [
        { type: "text", text: `Barkod: ${barcode}\nLütfen sadece JSON döndür.` },
        { type: "text", text: `Ürün: ${product.product_name} | Marka: ${product.brands} | Kategoriler: ${product.categories} | Etiketler: ${product.labels}` },
        { type: "text", text: `Alerjenler: ${product.allergens}` },
        { type: "text", text: `İçindekiler: ${product.ingredients_text}` },
        { type: "text", text: `Besin (100g): kcal=${product.nutriments.energy_kcal_100g}, yağ=${product.nutriments.fat_100g}g, şeker=${product.nutriments.sugars_100g}g, protein=${product.nutriments.proteins_100g}g, kh=${product.nutriments.carbohydrates_100g}g, tuz=${product.nutriments.salt_100g}g` },
      ],
    };

    const rawResp = await callOpenRouter({
      messages: [{ role: "system", content: systemPrompt }, userMsg],
      max_tokens: 500,
      temperature: 0.2,
      signal,
    });

    const cleaned = stripCodeFences(rawResp);
    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        barcode,
        product_name: product.product_name || "Bilinmiyor",
        decision: "caution",
        reasons: ["Model yanıtı JSON formatında değildi. Dikkatli tüket."],
        conditions: ["Porsiyonu küçük tut."],
        portion_advice: "",
        risky_ingredients: [],
        badges: [],
      };
    }

    parsed.barcode = String(parsed.barcode || barcode);
    parsed.product_name = parsed.product_name || product.product_name || "Bilinmiyor";
    parsed.reasons = Array.isArray(parsed.reasons) ? parsed.reasons.slice(0, 4).map((x) => String(x)) : [];
    parsed.conditions = Array.isArray(parsed.conditions) ? parsed.conditions.slice(0, 4).map((x) => String(x)) : [];
    parsed.badges = Array.isArray(parsed.badges) ? parsed.badges.map((x) => String(x)).slice(0, 8) : [];
    parsed.risky_ingredients = Array.isArray(parsed.risky_ingredients) ? parsed.risky_ingredients.slice(0, 8) : [];

    const profileBlob = `${user.diseases || ""} ${user.allergies || ""}`.toLowerCase();
    const userAvoidsGluten = /gluten|çölyak|colyak/.test(profileBlob);
    const blob = `${product.ingredients_text} ${product.allergens} ${product.labels} ${product.categories}`.toLowerCase();
    if (userAvoidsGluten && /(gluten|buğday|wheat|arpa|çavdar|malt|barley|rye)/i.test(blob)) {
      parsed.decision = "unsafe";
      parsed.reasons = ["Gluten şüphesi/varlığı."];
      parsed.conditions = [];
      if (!parsed.badges.includes("gluten-şüphesi")) parsed.badges.push("gluten-şüphesi");
      if (!parsed.risky_ingredients.length) parsed.risky_ingredients = [{ ingredient: "gluten", rule: "gluten intoleransı" }];
    }

    if (!res.writableEnded) res.json(parsed);
  } catch (err) {
    sendError(res, err);
  }
});

router.post("/onboarding-plans", async (req, res) => {
  const signal = bindAbort(req, res);
  try {
    const registration = parseRegistration(req.body && req.body.registration);
    if (!registration) {
      const err = new Error("Kayıt için ad gerekli.");
      err.status = 400;
      throw err;
    }

    const systemPrompt = `
Sen DietistaAI için güvenli bir "onboarding plan üreticisisin".
Kullanıcı kayıt verilerinden:
1) Günlük kalori hedefini (neededCalories)
2) Makroları (protein/carbs/fat gram)
3) Günlük su hedefini (litre)
4) 3 farklı program seçeneğini

hesaplayacaksın.

ZORUNLU GÜVENLİK KURALLARI:
- Tıbbi teşhis/tedavi yok. Aşırı diyet/egzersiz yok.
- Kalori hedefi SÜRDÜRÜLEBİLİR olmalı. 
  "Kısa vade" bile aşırı agresif olamaz.
- Enerji hedefi çok düşük olamaz: genelde günlük hedef, kişinin özelliklerine göre makul aralıkta olsun.
- Egzersiz önerileri güvenli ve genel düzeyde olmalı. Yeni başlayanlara uygun varyant ver.
- Hassasiyet ve alerjileri dikkate al (örn: gluten intoleransı).
- SADECE geçerli JSON döndür (markdown/kod bloğu yok).

ÇIKTI ŞEMASI (SADECE BU):
{
  "computed_profile": {
    "neededCalories": number,
    "dailyWaterIntake": number,
    "macros": { "protein": number, "carbs": number, "fat": number },
    "notes": [string]
  },
  "programs": [
    {
      "id": "easy" | "balanced" | "fast",
      "title": string,
      "difficulty": "Kolay" | "Orta" | "Zor",
      "duration_days": number,
      "daily_calorie_target": number,
      "macros": { "protein_g": number, "carb_g": number, "fat_g": number },
      "steps_target": number,
      "workouts_per_week": number,
      "workout_style": string,
      "weekly_focus": [string],
      "safety_notes": [string],
      "who_is_this_for": string
    }
  ]
}
  `.trim();

    const userPrompt = `
Kayıt verileri:
${JSON.stringify(registration, null, 2)}

İsteğim:
- computed_profile içinde neededCalories, su ve makroları hesapla.
- programs içinde 3 program üret:
  1) easy: uzun vade, kolay, sürdürülebilir
  2) balanced: orta vade, orta zorluk
  3) fast: daha kısa vade, biraz daha zor AMA risk yok
- Programların daily_calorie_target değerleri computed_profile.neededCalories’a göre mantıklı aralıkta olsun.
- SADECE JSON döndür.
  `.trim();

    const rawResp = await callOpenRouter({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 1200,
      temperature: 0.25,
      signal,
    });

    const parsed = JSON.parse(stripCodeFences(rawResp));
    if (!parsed?.computed_profile?.neededCalories || !Array.isArray(parsed?.programs) || parsed.programs.length !== 3) {
      const err = new Error("ONBOARDING_JSON_INVALID");
      err.code = "ONBOARDING_JSON_INVALID";
      throw err;
    }
    if (!res.writableEnded) res.json(parsed);
  } catch (err) {
    if (err instanceof SyntaxError) {
      err.code = "ONBOARDING_JSON_INVALID";
    }
    sendError(res, err);
  }
});

router.post("/end-of-day", async (req, res) => {
  const signal = bindAbort(req, res);
  try {
    const user = requireUser(req.body);
    const dayData = parseDayData(req.body && req.body.dayData);
    const text = buildUserSummaryText(user);
    const systemPrompt = `
Sen DietistaAI'sın. Görevin: Kullanıcının gün verilerini analiz edip DETAyLI bir gün sonu raporu üretmek.

KURALLAR:
- Tıbbi teşhis/tedavi yok.
- Aşırı kısıtlama / riskli egzersiz önerisi yok.
- Kullanıcının alerji/hassasiyetini dikkate al.
- Rapor motive edici ama gerçekçi olmalı.
- SADECE geçerli JSON döndür (markdown/kod bloğu yok).

ÇIKTI ŞEMASI:
{
  "score_10": number,            // 0-10 arası tam sayı
  "earned_points": number,       // score_10 * 10 (tam sayı)
  "report": string,              // çok satırlı, başlıklar + maddeler
  "highlights": [string],        // 3-6 madde
  "improvements": [string],      // 2-5 madde
  "tomorrow_plan": [string]      // 3-6 madde
}
`.trim();

    const userMsg = `
[KULLANICI PROFİLİ]
${text}

[GÜN VERİLERİ]
${JSON.stringify(dayData, null, 2)}

İSTEK:
1) score_10: 0-10 arası tam sayı ver.
2) earned_points: score_10 * 10 olarak hesapla.
3) report alanı DETAYLI olsun. Şu başlıklara göre yaz:

- Genel Özet (1-2 cümle)
- Kalori Analizi
  * Alınan toplam kalori
  * Bakım/hedef ile kıyas (açık/fazla)
  * Hedefe etkisi (kilo verme/koruma/almaya uygunluk)
- Makro Analizi
  * Protein/Karb/Yağ toplamları
  * Dengeli mi? (kısa yorum)
- Su & Aktivite
  * Su miktarı ve hedefe göre durum
  * Adım sayısı + egzersiz notu yorumu
- Öğün Dağılımı (meals listesinden kısa yorum: en yüksek kalori hangi öğün vs.)
- Güçlü Yanlar (highlights ile uyumlu)
- Geliştirilecek Noktalar (improvements ile uyumlu)
- Yarın İçin Mikro Plan (tomorrow_plan ile uyumlu)

Not: Eğer bazı değerler 0/eksik ise bunu belirt ama raporu yine de üret.

SADECE JSON döndür.
`.trim();

    const raw = await callOpenRouter({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMsg },
      ],
      max_tokens: 850,
      temperature: 0.35,
      signal,
    });

    const parsed = JSON.parse(stripCodeFences(raw));
    let score = Number(parsed.score_10);
    if (isNaN(score)) score = 0;
    score = Math.max(0, Math.min(10, Math.round(score)));
    parsed.score_10 = score;
    parsed.earned_points = score * 10;
    parsed.report = String(parsed.report || "").trim();
    parsed.highlights = Array.isArray(parsed.highlights) ? parsed.highlights.map((x) => String(x)).slice(0, 8) : [];
    parsed.improvements = Array.isArray(parsed.improvements) ? parsed.improvements.map((x) => String(x)).slice(0, 8) : [];
    parsed.tomorrow_plan = Array.isArray(parsed.tomorrow_plan) ? parsed.tomorrow_plan.map((x) => String(x)).slice(0, 8) : [];
    if (!res.writableEnded) res.json(parsed);
  } catch (err) {
    if (err && err.code === "NO_CURRENT_USER") return sendError(res, err);
    console.error(err && err.message ? err.message : err);
    if (!res.writableEnded) res.json(endOfDayFallback());
  }
});

router.post("/ai-diet", async (req, res) => {
  const signal = bindAbort(req, res);
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const age = clampNum(body.age, 1, 120, 0);
    const gender = String(body.gender || "belirtilmemiş").slice(0, 40);
    const weight = clampNum(body.weight, 20, 400, 0);
    const height = clampNum(body.height, 50, 250, 0);
    const goals = String(body.goals || "sağlıklı beslenme").slice(0, 200);
    const conditions = Array.isArray(body.conditions)
      ? body.conditions.map((item) => String(item || "").slice(0, 80)).filter(Boolean).slice(0, 12).join(", ")
      : String(body.conditions || "belirtilmedi").slice(0, 300);

    const prompt = `
Sen profesyonel bir diyetisyensin. ${age || "belirtilmemiş"} yaşında, ${gender}, ${weight || "belirtilmemiş"} kg, ${height || "belirtilmemiş"} cm boyunda bir kişi için
${conditions} bilgilerini dikkate alarak ${goals} amacıyla bir günlük yemek planı hazırla.
Tıbbi teşhis koyma. Aşırı düşük kalorili veya riskli bir plan önerme.
`;

    const plan = await callOpenRouter({
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
      temperature: 0.7,
      signal,
    });
    if (!res.writableEnded) res.json({ plan });
  } catch (err) {
    sendError(res, err);
  }
});

module.exports = router;
