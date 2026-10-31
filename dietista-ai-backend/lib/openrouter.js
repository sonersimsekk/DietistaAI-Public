const DEFAULT_MODEL = "openai/gpt-4o-mini";

function stripCodeFences(str = "") {
  return String(str)
    .trim()
    .replace(/^```json/i, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();
}

function clampNum(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function buildUserSummaryText(u) {
  return `
    Ad: ${u.name} ${u.surname}, Yaş: ${u.age}, Cinsiyet: ${u.gender}
    Boy: ${u.height} cm, Kilo: ${u.weight} kg, Aktivite: ${u.activityLevel}
    Hedef: ${u.goal}
      
    ${u.neededCalories ? `Günlük Kalori: ${u.neededCalories} kcal` : ""}
    ${u.dailyWaterIntake ? `Günlük Su: ${u.dailyWaterIntake} L` : ""}
    ${u.macros ? `Makrolar: P ${u.macros.protein}g / K ${u.macros.carbs}g / Y ${u.macros.fat}g` : ""}
      
    Alerji: ${u.allergies || "Yok"} | Hassasiyet: ${u.diseases || "Yok"}
      `.trim();
}

function parseUser(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const name = String(input.name || "").trim().slice(0, 60);
  const id = String(input.id || "").trim().slice(0, 80);
  if (!name && !id) return null;

  const macrosIn = input.macros && typeof input.macros === "object" ? input.macros : null;
  const macros = macrosIn
    ? {
        protein: clampNum(macrosIn.protein, 0, 1000, 0),
        carbs: clampNum(macrosIn.carbs, 0, 2000, 0),
        fat: clampNum(macrosIn.fat, 0, 1000, 0),
      }
    : null;

  return {
    id,
    name,
    surname: String(input.surname || "").trim().slice(0, 60),
    age: clampNum(input.age, 0, 120, 0),
    gender: String(input.gender || "").slice(0, 40),
    height: clampNum(input.height, 0, 300, 0),
    weight: clampNum(input.weight, 0, 500, 0),
    activityLevel: String(input.activityLevel || "").slice(0, 40),
    goal: String(input.goal || "").slice(0, 240),
    neededCalories: input.neededCalories ? clampNum(input.neededCalories, 0, 10000, 0) : 0,
    dailyWaterIntake: input.dailyWaterIntake ? clampNum(input.dailyWaterIntake, 0, 20, 0) : 0,
    macros,
    allergies: String(input.allergies || "Yok").slice(0, 300),
    diseases: String(input.diseases || "Yok").slice(0, 300),
  };
}

function ensureUserProfileInSystem(messages, userText) {
  const cloned = Array.isArray(messages) ? messages.map((m) => ({ ...m })) : [];
  const userBlock = `[KULLANICI PROFİLİ]\n${userText}`.trim();

  const sysIndex = cloned.findIndex((m) => m && m.role === "system");
  if (sysIndex === -1) {
    cloned.unshift({
      role: "system",
      content: `
Sen "DietistaAI" adında bir sağlıklı yaşam koçusun.
Kullanıcının sorularını anlaşılır, samimi ve motive edici şekilde yanıtla.
Yanıtlarda kullanıcının fiziksel özelliklerini ve hedeflerini dikkate al.

${userBlock}
      `.trim(),
    });
    return cloned;
  }

  const prev = cloned[sysIndex]?.content || "";
  if (!String(prev).includes("[KULLANICI PROFİLİ]")) {
    cloned[sysIndex] = { ...cloned[sysIndex], content: `${prev}\n\n${userBlock}`.trim() };
  }
  return cloned;
}

async function callOpenRouter({ messages, max_tokens, temperature, signal }) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    const err = new Error("MISSING_API_KEY");
    err.code = "MISSING_API_KEY";
    throw err;
  }

  const body = {
    model: process.env.OPENROUTER_MODEL || DEFAULT_MODEL,
    messages,
    temperature,
  };
  if (max_tokens) body.max_tokens = max_tokens;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:8080",
      "X-Title": "DietistaAI",
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const err = new Error(`OPENROUTER_HTTP_${response.status}`);
    err.status = response.status;
    throw err;
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "Cevap alınamadı.";
}

module.exports = {
  stripCodeFences,
  clampNum,
  buildUserSummaryText,
  parseUser,
  ensureUserProfileInSystem,
  callOpenRouter,
};
