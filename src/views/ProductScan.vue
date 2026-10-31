<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <div class="max-w-2xl mx-auto space-y-6">
      <!-- Header -->
      <div class="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 flex items-center justify-between gap-6">
        <div>
          <h2 class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Barkod ile Uygunluk Kontrolü</h2>
          <p class="text-sm text-gray-600 mt-1">Kameradan tara, barkod fotoğrafı yükle ya da barkodu elle gir.</p>
        </div>
        <div class="hidden sm:flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 border border-white/40 shadow-soft">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="8" y="14" width="44" height="32" rx="6" fill="#ffffff"/>
            <g fill="#1e293b">
              <rect x="12" y="18" width="2" height="24"/>
              <rect x="16" y="18" width="1" height="24"/>
              <rect x="19" y="18" width="3" height="24"/>
              <rect x="24" y="18" width="1" height="24"/>
              <rect x="27" y="18" width="2" height="24"/>
              <rect x="31" y="18" width="1" height="24"/>
              <rect x="34" y="18" width="3" height="24"/>
              <rect x="39" y="18" width="1" height="24"/>
              <rect x="42" y="18" width="2" height="24"/>
              <rect x="46" y="18" width="1" height="24"/>
            </g>
            <circle cx="46" cy="44" r="6" fill="#34d399"/>
            <path d="M44.5 44.5l2.2 2.2 4.1-4.1" stroke="#065f46" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      <!-- Scanner / Inputs Card -->
      <div class="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 space-y-5 hover-lift animate-fade-in-up">
        <!-- Camera -->
        <div v-if="supported" class="space-y-3">
          <div class="relative rounded-2xl overflow-hidden border border-gray-200 shadow-soft bg-gray-50" :class="{ 'ring-2 ring-blue-200': scanning }">
            <video ref="video" autoplay playsinline class="w-full block"></video>
            <div v-if="scanning" class="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full shadow">Taranıyor…</div>
          </div>
          <div class="flex items-center gap-2">
            <button @click="startScan" :disabled="scanning"
                    class="button focus-ring disabled:opacity-60 disabled:cursor-not-allowed">
              {{ scanning ? 'Taranıyor...' : 'Kameradan Tara' }}
            </button>
            <button v-if="scanning" @click="stopScan" 
                    class="button ghost">
              Durdur
            </button>
          </div>
        </div>

        <!-- Upload from image -->
        <div>
          <label class="block text-sm font-medium mb-1 text-gray-700">Fotoğraftan Tara</label>
          <input type="file" accept="image/*" @change="onImageFile" 
                 class="block w-full text-sm text-gray-700 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:text-white file:bg-gradient-to-r file:from-blue-500 file:to-indigo-600 hover:file:opacity-90" />
          <div class="mt-2 flex items-center gap-3 text-xs text-gray-500">
            <div class="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <svg width="52" height="18" viewBox="0 0 52 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <rect width="52" height="18" rx="4" fill="#fff"/>
                <rect x="4" y="3" width="2" height="12" fill="#334155"/>
                <rect x="8" y="3" width="1" height="12" fill="#334155"/>
                <rect x="11" y="3" width="3" height="12" fill="#334155"/>
                <rect x="16" y="3" width="1" height="12" fill="#334155"/>
                <rect x="19" y="3" width="2" height="12" fill="#334155"/>
                <rect x="23" y="3" width="1" height="12" fill="#334155"/>
                <rect x="26" y="3" width="3" height="12" fill="#334155"/>
                <rect x="31" y="3" width="1" height="12" fill="#334155"/>
                <rect x="34" y="3" width="2" height="12" fill="#334155"/>
                <rect x="38" y="3" width="1" height="12" fill="#334155"/>
                <rect x="41" y="3" width="3" height="12" fill="#334155"/>
              </svg>
              <span>Örnek barkod görünümü</span>
            </div>
            <span class="hidden sm:inline">Net ışık ve odak en iyi sonucu verir.</span>
          </div>
        </div>

        <!-- Manual barcode -->
        <div>
          <label class="block text-sm font-medium mb-1 text-gray-700">Elle Gir</label>
          <div class="flex gap-2">
            <input v-model="manualBarcode" placeholder="Barkod No" class="input w-full" />
              <button
                @click="lookupManual"
                class="button secondary focus-ring inline-flex items-center justify-center"
              >
                Sorgula
              </button>
          </div>
        </div>

        <div v-if="loading" class="text-gray-600 flex items-center gap-2">
          <span class="w-5 h-5 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin inline-block"></span>
          Ürün bilgisi getiriliyor...
        </div>
        <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 whitespace-pre-line shadow-soft">{{ error }}</div>
      </div>

      <!-- Result Card -->
      <div v-if="result" class="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white/20 space-y-4 hover-lift animate-fade-in-up">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="text-xl font-bold text-gray-800">{{ result.product_name }} <span class="text-gray-500 text-base font-normal">({{ result.barcode }})</span></h3>
            <div class="flex flex-wrap gap-2 mt-2">
              <span v-for="b in result.badges" :key="b" class="badge">{{ b }}</span>
            </div>
          </div>
        </div>

        <div class="p-4 rounded-2xl border shadow-soft"
             :class="{
               'border-green-300 bg-green-50': result.decision==='safe',
               'border-yellow-300 bg-yellow-50': result.decision==='caution',
               'border-red-300 bg-red-50': result.decision==='unsafe'
             }">
          <div class="font-semibold text-gray-800 flex items-center gap-2">
            <span v-if="result.decision==='safe'" class="text-green-600 text-lg">✔️</span>
            <span v-else-if="result.decision==='caution'" class="text-yellow-600 text-lg">⚠️</span>
            <span v-else class="text-red-600 text-lg">⛔</span>
            <span>Uygunluk: {{ decisionLabel(result.decision) }}</span>
          </div>
          <ul class="list-disc ml-5 mt-1 text-gray-700">
            <li v-for="(r,i) in result.reasons" :key="i">{{ r }}</li>
          </ul>
          <div v-if="result.conditions && result.conditions.length" class="mt-2">
            <div class="font-semibold text-gray-800">Koşullar</div>
            <ul class="list-disc ml-5 text-gray-700">
              <li v-for="(c,i) in result.conditions" :key="i">{{ c }}</li>
            </ul>
          </div>
          <div v-if="result.risky_ingredients && result.risky_ingredients.length" class="mt-2 text-sm text-gray-700">
            <strong>Riskli içerikler:</strong> {{ ingredientsList(result.risky_ingredients, 'ingredient') }}
          </div>
        </div>

        <div class="mt-4">
          <button
            @click="showNutritionDetails = !showNutritionDetails"
            class="w-full text-sm font-semibold rounded-xl px-4 py-2
                   bg-gray-100 hover:bg-gray-200 transition
                   text-gray-700"
          >
            {{ showNutritionDetails ? "Detayları Gizle" : "Detaylar" }}
          </button>
        </div>

        <!-- Besin Değerleri -->
        <div
          v-if="showNutritionDetails && result && result.nutrition"
          class="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-4"
        >
          <h4 class="text-sm font-bold text-gray-800 mb-3">
            Besin Değerleri ({{ result.nutrition.portion }})
          </h4>
        
          <div class="grid grid-cols-2 gap-y-2 text-sm text-gray-700">
            <div>Kalori</div>
            <div class="text-right font-semibold">{{ result.nutrition.calories }} kcal</div>
          
            <div>Protein</div>
            <div class="text-right">{{ result.nutrition.protein }} g</div>
          
            <div>Karbonhidrat</div>
            <div class="text-right">{{ result.nutrition.carbs }} g</div>
          
            <div>Şeker</div>
            <div class="text-right">{{ result.nutrition.sugar }} g</div>
          
            <div>Yağ</div>
            <div class="text-right">{{ result.nutrition.fat }} g</div>
          
            <div>Lif</div>
            <div class="text-right">{{ result.nutrition.fiber }} g</div>
          
            <div>Tuz</div>
            <div class="text-right">{{ result.nutrition.salt }} g</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { analyzeBarcodeProduct, fetchProductByBarcode } from '@/api/openrouter';

export default {
  name: 'ProductScan',
  data() {
    return {
      supported: 'BarcodeDetector' in window,
      scanning: false,
      detector: null,
      stream: null,
      manualBarcode: '',
      loading: false,
      error: '',
      result: null,
      zxingReader: null,
      showNutritionDetails: false,
    };
  },
  async mounted() {
    if (this.supported) {
      try { this.detector = new window.BarcodeDetector({ formats: ['ean_13','ean_8','upc_a','upc_e'] }); }
      catch { this.supported = false; }
    }
    if (!this.supported) {
      try {
        const { BrowserMultiFormatReader } = await import('@zxing/library');
        this.zxingReader = new BrowserMultiFormatReader();
      } catch (e) { console.warn('ZXing yüklenemedi:', e?.message); }
    }
  },
  beforeDestroy() { this.stopScan(); },
  methods: {
    demoDietistaGofretiResult() {
      return {
        product_name: "Dietista Gofreti",
        barcode: "12345",
        badges: ["Demo Ürün", "Kakaolu", "25 g / 1 adet"],
        decision: "caution", // safe | caution | unsafe
        reasons: [
          "Şeker oranı yüksektir",
          "Atıştırmalık bir üründür, porsiyon kontrolü gerektirir.",
          "Protein oranı düşüktür; ana öğün yerine önerilmez."
        ],
        conditions: [
          "⚠️ Gluten intoleransın olduğu için bu ürün senin için önerilmez!",
          "Tüketilecekse mutlaka glutensiz alternatifler tercih edilmelidir.",
          "Yağ yakımı hedefinde: Günlük kalori hedefini aşmamaya dikkat edilmelidir."
        ],
        portion_advice: "Öneri: 1 adet (25 g). Yanına su veya şekersiz kahve ile tüket.",
        risky_ingredients: [
          { ingredient: "Buğday unu" },
          { ingredient: "Şeker" },
          { ingredient: "Glukoz şurubu" },
        ],
      
        // İstersen sunumda göstermek için ek alanlar da koyabiliriz
        nutrition: {
          portion: "25 g",
          calories: 138,     // sahte ama gerçekçi
          protein: 2.1,
          carbs: 18.6,
          sugar: 10.4,
          fat: 6.5,
          fiber: 1.2,
          salt: 0.12
        }
      };
    },

    ingredientsList(arr, key='ingredient') {
      return (arr || []).map(function(x){ return x && x[key]; }).filter(Boolean).join(', ');
    },

    decisionLabel(d){ return d==='safe' ? 'Uygun' : d==='caution' ? 'Koşullu Uygun' : 'Uygun Değil'; },
    async startScan() {
      this.error = '';
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        this.$refs.video.srcObject = this.stream;
        this.scanning = true;
        this.scanLoop();
      } catch { this.error = 'Kameraya erişilemedi veya izin verilmedi.'; }
    },
    stopScan() {
      this.scanning = false;
      if (this.stream) this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    },
    async scanLoop() {
      const video = this.$refs.video;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const tick = async () => {
        if (!this.scanning) return;
        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth; canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          try {
            const res = await this.detector.detect(canvas);
            if (res?.length) { const code = res[0].rawValue; this.stopScan(); await this.lookup(code); return; }
          } catch {}
        }
        requestAnimationFrame(tick);
      };
      tick();
    },
    async onImageFile(e) {
      const file = e.target.files?.[0]; if (!file) return;
      this.error=''; let code='';
      if (this.detector && 'createImageBitmap' in window) {
        try { const bitmap = await createImageBitmap(file); const res = await this.detector.detect(bitmap); if (res?.length) code = res[0].rawValue; } catch {}
      }
      if (!code && this.zxingReader) {
        const url = URL.createObjectURL(file);
        try { const result = await this.zxingReader.decodeFromImageUrl(url); code = result?.getText?.() || ''; } catch {}
        URL.revokeObjectURL(url);
      }
      if (!code) { this.error='Fotoğraftan barkod okunamadı. Daha net/aydınlık bir görsel deneyin.'; return; }
      await this.lookup(code);
    },
    async lookupManual() {
      const bc = this.manualBarcode.trim(); if (!bc) return;
      await this.lookup(bc);
    },
    async lookup(barcode) {
      if (String(barcode).trim() === "12345") {
        this.loading = false;
        this.error = "";
        this.result = this.demoDietistaGofretiResult();
        this.showNutritionDetails = false;
        return;
      }
      this.loading = true; this.error=''; this.result=null;
      try {
        const product = await fetchProductByBarcode(barcode);
        if (!product) { this.error='Ürün bulunamadı.'; return; }
        const analysis = await analyzeBarcodeProduct(barcode, product);
        const n = product.nutriments || {};
        const show = (v) => (v === null || v === undefined || v === "" ? "—" : v);
        this.result = {
          ...analysis,
          nutrition: {
            portion: "100 g",
            calories: show(n.energy_kcal_100g),
            protein: show(n.proteins_100g),
            carbs: show(n.carbohydrates_100g),
            sugar: show(n.sugars_100g),
            fat: show(n.fat_100g),
            fiber: show(n.fiber_100g),
            salt: show(n.salt_100g),
          },
        };
      } catch (e) {
        console.error(e); this.error='Analiz sırasında hata oluştu.';
      } finally { this.loading = false; }
    },
    addToList() { alert('Listeye eklendi (örnek).'); }
  }
};
</script>

<style scoped>
video { max-height: 360px; }
</style>
