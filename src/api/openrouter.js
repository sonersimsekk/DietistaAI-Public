// src/api/openrouter.js
// OpenRouter anahtarı backend ortamında kalır. Bu dosya yalnızca kendi API'mize istek atar.
import axios from 'axios';
import { fileToBase64 } from '@/utils/imageUtils';
import { getUserData } from '@/api/fakeApi';

const API_BASE = String(process.env.VUE_APP_API_BASE_URL || '').replace(/\/$/, '');

function _cacheGet(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
}
function _cacheSet(key, val, ttlMs = 24 * 60 * 60 * 1000) {
  try { localStorage.setItem(key, JSON.stringify({ v: val, exp: Date.now() + ttlMs })); } catch { /* ignore quota */ }
}
function _cacheRead(key) {
  const obj = _cacheGet(key);
  if (obj && obj.exp && obj.exp > Date.now()) return obj.v;
  if (obj) localStorage.removeItem(key);
  return null;
}

function isAbort(error) {
  return error?.code === 'ERR_CANCELED' || error?.name === 'AbortError' || error?.name === 'CanceledError';
}

async function requireUser() {
  const u = await getUserData();
  if (!u) {
    const err = new Error('NO_CURRENT_USER');
    err.code = 'NO_CURRENT_USER';
    throw err;
  }
  return {
    id: u.id,
    name: u.name,
    surname: u.surname,
    age: u.age,
    gender: u.gender,
    height: u.height,
    weight: u.weight,
    activityLevel: u.activityLevel,
    goal: u.goal,
    neededCalories: u.neededCalories,
    dailyWaterIntake: u.dailyWaterIntake,
    macros: u.macros,
    allergies: u.allergies,
    diseases: u.diseases,
  };
}

async function postJson(path, body, signal) {
  const res = await axios.post(`${API_BASE}${path}`, body, {
    timeout: 35000,
    signal,
    headers: { 'Content-Type': 'application/json' },
  });
  return res.data;
}

function endOfDayFallback() {
  return {
    score_10: 0,
    earned_points: 0,
    report: 'Üzgünüm, gün sonu raporu oluşturulamadı.',
    highlights: [],
    improvements: [],
    tomorrow_plan: [],
  };
}

/** 1) Sohbet yanıtı */
export async function getChatResponse(chatHistory) {
  try {
    const user = await requireUser();
    const data = await postJson('/api/chat', { messages: chatHistory, user });
    return data?.content ?? 'Cevap alınamadı.';
  } catch (error) {
    if (error?.code === 'NO_CURRENT_USER') {
      return 'Devam etmek için lütfen bir kullanıcı seç veya yeni kullanıcı oluştur.';
    }
    if (isAbort(error)) throw error;
    console.error('❌ Chat hatası:', error?.response?.data || error.message);
    return 'Üzgünüm, şu anda cevap veremiyorum.';
  }
}

// 2) Yemek fotoğrafı analizi
export async function analyzeFoodPhoto(file, mealName = '', signal) {
  try {
    const user = await requireUser();
    const imageBase64 = await fileToBase64(file);
    const data = await postJson('/api/food-photo', { imageBase64, mealName, user }, signal);
    return data?.content ?? '';
  } catch (error) {
    if (error?.code === 'NO_CURRENT_USER') {
      return JSON.stringify({
        total_kcal: 0,
        items: [],
        warnings: ['Devam etmek için lütfen bir kullanıcı seç veya yeni kullanıcı oluştur.'],
        solutions: [],
        decision: 'caution',
        is_safe_for_user: false,
        restricted_hits: [],
      });
    }
    if (isAbort(error)) throw error;
    console.error('❌ Fotoğraf analizi hatası:', error?.response?.data || error.message);
    throw error;
  }
}

// 3) Akıllı Yemek Önerisi
export async function getMealSuggestions(ingredients = [], signal) {
  try {
    const user = await requireUser();
    const data = await postJson('/api/meal-suggestions', { ingredients, user }, signal);
    return data?.content ?? '';
  } catch (error) {
    if (error?.code === 'NO_CURRENT_USER') {
      return JSON.stringify({ meals: [] });
    }
    if (isAbort(error)) throw error;
    console.error('❌ Öneri hatası:', error?.response?.data || error.message);
    throw error;
  }
}

// 4) OpenFoodFacts: Barkodla ürün çek. Gizli anahtar gerektirmez.
export async function fetchProductByBarcode(barcode) {
  const ck = `off:barcode:${barcode}`;
  const cached = _cacheRead(ck);
  if (cached) return cached;

  try {
    const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`;
    const { data } = await axios.get(url, { timeout: 12000 });
    const p = data?.product;
    if (!p) return null;

    const ingredients_tr = p.ingredients_text_tr || '';
    const ingredients_any = p.ingredients_text || '';
    const allergens_line = p.allergens || (Array.isArray(p.allergens_tags) ? p.allergens_tags.join(', ') : '');

    const normalized = {
      barcode,
      product_name: p.product_name || p.generic_name || 'Bilinmiyor',
      brands: p.brands || '',
      categories: p.categories || '',
      ingredients_text: ingredients_tr || ingredients_any || '',
      allergens: allergens_line,
      labels: p.labels || '',
      nutriscore: p.nutriscore_grade || '',
      nova: p.nova_groups || '',
      nutriments: {
        energy_kcal_100g: p.nutriments?.['energy-kcal_100g'] ?? null,
        fat_100g: p.nutriments?.fat_100g ?? null,
        sugars_100g: p.nutriments?.sugars_100g ?? null,
        proteins_100g: p.nutriments?.proteins_100g ?? null,
        salt_100g: p.nutriments?.salt_100g ?? null,
        carbohydrates_100g: p.nutriments?.carbohydrates_100g ?? null,
        fiber_100g: p.nutriments?.fiber_100g ?? null,
      },
    };

    _cacheSet(ck, normalized);
    return normalized;
  } catch (e) {
    console.error('OFF fetch error', e?.message);
    return null;
  }
}

// 5) Barkod ürünü AI ile değerlendir
export async function analyzeBarcodeProduct(barcode, product, signal) {
  try {
    const user = await requireUser();
    const profileKey = `${user?.id || 'anon'}:${user?.diseases || ''}:${user?.allergies || ''}`;
    const ck = `ai:barcode:${barcode}:${profileKey}`;
    const cached = _cacheRead(ck);
    if (cached) return cached;

    const parsed = await postJson('/api/barcode-analysis', { barcode, product, user }, signal);
    _cacheSet(ck, parsed);
    return parsed;
  } catch (error) {
    if (error?.code === 'NO_CURRENT_USER') {
      return {
        barcode: String(barcode),
        product_name: product?.product_name || 'Bilinmiyor',
        decision: 'caution',
        reasons: ['Devam etmek için lütfen bir kullanıcı seç veya yeni kullanıcı oluştur.'],
        conditions: [],
        portion_advice: '',
        risky_ingredients: [],
        badges: [],
      };
    }
    if (isAbort(error)) throw error;
    throw error;
  }
}

export async function generateOnboardingPlans(registration, signal) {
  const data = await postJson('/api/onboarding-plans', { registration }, signal);
  if (!data?.computed_profile?.neededCalories || !Array.isArray(data?.programs) || data.programs.length !== 3) {
    throw new Error('ONBOARDING_JSON_INVALID');
  }
  return data;
}

export async function getEndOfDayReport(dayData, signal) {
  try {
    const user = await requireUser();
    return await postJson('/api/end-of-day', { dayData, user }, signal);
  } catch (error) {
    if (isAbort(error)) throw error;
    console.error('❌ EndOfDayReport hata:', error?.response?.data || error?.message || error);
    return endOfDayFallback();
  }
}
