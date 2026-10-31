<template>
  <div class="flex flex-col items-center w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <!-- Logo Section -->
    <div class="flex items-center gap-4 mt-8 mb-8 bg-white/80 backdrop-blur-sm rounded-3xl p-6 px-8 shadow-lg border border-white/20 animate-fade-in-up">
      <img src="@/assets/logo.png" class="w-20 h-20 drop-shadow-lg" alt="DietistaAI Logo" />
      <div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          DietistaAI
        </h1>
        <p class="text-sm text-gray-600 mt-1">Akıllı Beslenme Asistanı</p>
      </div>
    </div>

    <!-- Main Tracking Card -->
    <div class="w-full max-w-2xl animate-fade-in-up" style="animation-delay: 0.1s;">
      <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 mb-6 hover-lift">
        <!-- Modern Tab Design -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 p-2 bg-gray-100/60 rounded-2xl">
          <button
            v-for="tab in trackingTabs"
            :key="tab.id"
            :class="[ 
              'w-full px-3 py-2 rounded-xl text-[13px] sm:text-sm font-medium text-center transition-all duration-200 focus-ring',
              'leading-tight break-words',
              activeTab === tab.id 
                ? 'bg-white text-blue-600 shadow-md ring-2 ring-blue-100' 
                : 'text-gray-700 hover:text-gray-900 hover:bg-white/50'
            ]"
            @click="activeTab = tab.id"
          >
            {{ tab.name }}
          </button>
        </div>

        <!-- Calories Tracking -->
        <div v-if="activeTab === 'calories'" class="space-y-6">
          <!-- Three Metrics with Modern Design -->
          <div class="grid grid-cols-3 gap-3">
            <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-3 text-center text-white shadow-lg hover-lift">
              <span class="block text-2xl font-bold mb-1">{{ totalConsumed }}</span>
              <span class="text-xs opacity-90 leading-tight">Tüketilen</span>
            </div>
            <div class="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-3 text-center text-white shadow-lg hover-lift">
              <span class="block text-2xl font-bold mb-1">{{ remainingCalories }}</span>
              <span class="text-xs opacity-90 leading-tight">Geriye Kalan</span>
            </div>
            <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-3 text-center text-white shadow-lg hover-lift">
              <span class="block text-2xl font-bold mb-1">{{ totalBurned }}</span>
              <span class="text-xs opacity-90 leading-tight">Yakılan</span>
            </div>
          </div>

          <!-- Meals Grid with Enhanced Design -->
          <div class="grid grid-cols-4 gap-3">
            <div v-for="meal in meals" :key="meal.id" class="flex flex-col items-center group">
              <div class="relative mb-2">
                <div class="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center text-2xl shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-110">
                  {{ meal.icon }}
                </div>
                <button
                  @click="openPhotoOptions(meal.id)"
                  class="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 focus-ring text-sm"
                >
                  +
                </button>
              </div>
              <span class="text-xs font-medium text-gray-800 mb-1 text-center leading-tight">{{ meal.name }}</span>
              <span class="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full leading-tight">{{ meal.calories }} kcal</span>
            </div>
          </div>
        </div>

        <!-- Water Tracking -->
        <div v-else-if="activeTab === 'water'" class="text-center space-y-4"> 
          <div class="bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl  p-2 text-white shadow-lg hover-lift">
            <p class="text-3xl font-bold mb-2"> 
              {{ Number(waterTaken || 0).toFixed(1) }} / {{ Number(user && user.dailyWaterIntake ? user.dailyWaterIntake : 0).toFixed(1) }} lt.
            </p>  
            <div class="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center mb-3 animate-pulse">
              <span class="text-4xl">💧</span>  
            </div>  
          </div>  
        
          <div class="space-y-3">
            <button
              @click="addWater200"
              class="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 focus-ring"
            >
              +200 ml
            </button>
          
            <div class="flex justify-center">
              <button
                @click="addWater200"
                class="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full text-white text-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 focus-ring"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <!-- Exercise Tracking -->
        <div v-else-if="activeTab === 'exercise'" class="space-y-4">
  <div class="grid grid-cols-2 gap-3">
    <div class="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-3 hover-lift text-center">
      <span class="text-3xl mb-1 block">👟</span>
      <span class="text-lg font-bold text-gray-800 block">{{ stepsToday }}</span>
      <span class="text-xs text-gray-600 block">Adım (bugün)</span>
    </div>

    <div class="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-3 hover-lift text-center">
      <span class="text-3xl mb-1 block">🏃</span>
      <span class="text-sm font-bold text-gray-800 block truncate">{{ exerciseNote || '—' }}</span>
      <span class="text-xs text-gray-600 block">Egzersiz Notu</span>
    </div>
  </div>

  <div class="bg-white/80 rounded-2xl p-4 border border-white/30 shadow space-y-3">
    <div>
      <label class="block text-xs font-semibold text-gray-600 mb-1">Bugünkü Adım</label>
      <input
        v-model.number="stepsInput"
        type="number"
        min="0"
        class="input w-full"
        placeholder="Örn: 6500"
      />
    </div>

    <div>
      <label class="block text-xs font-semibold text-gray-600 mb-1">Egzersiz (manuel)</label>
      <input
        v-model="exerciseInput"
        class="input w-full"
        placeholder="Örn: 30 dk ağırlık antrenmanı"
      />
    </div>

    <button
      @click="saveExercise"
      class="button primary focus-ring w-full"
    >
      Kaydet
    </button>
  </div>

  <!-- <div class="bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl p-4 text-center hover-lift">
    <span class="text-4xl mb-2 block">🔥</span>
    <span class="text-2xl font-bold text-gray-800">{{ Number(burnedCalories || 0) }}</span>
    <span class="text-sm text-gray-600">Yakılan (kcal)</span>
  </div> -->
        </div>

        <!-- Macros Tracking -->
        <div v-else-if="activeTab === 'macros'" class="space-y-6">
          <div class="grid grid-cols-3 gap-3">
            <div class="bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl p-5 text-center hover-lift">
              <div class="flex flex-col items-center justify-center">
                <span class="text-3xl font-bold text-gray-800 leading-tight">{{ totalCarb }}</span>
                <span class="text-sm text-gray-600 font-medium mt-1">Karbohidrat</span>
              </div>
            </div>
            <div class="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-5 text-center hover-lift">
              <div class="flex flex-col items-center justify-center">
                <span class="text-3xl font-bold text-gray-800 leading-tight">{{ totalProtein }}</span>
                <span class="text-sm text-gray-600 font-medium mt-1">Protein</span>
              </div>
            </div>
            <div class="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl p-5 text-center hover-lift">
              <div class="flex flex-col items-center justify-center">
                <span class="text-3xl font-bold text-gray-800 leading-tight">{{ totalFat }}</span>
                <span class="text-sm text-gray-600 font-medium mt-1">Yağ</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI Chat Section -->
    <div class="w-full max-w-2xl mb-8 animate-fade-in-up" style="animation-delay: 0.2s;">
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0">
          <RobotIcon class="w-16 h-16 drop-shadow-lg animate-pulse" />
        </div>
        <div class="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl px-6 py-4 text-white shadow-xl border border-white/20 hover-lift">
          <p class="text-base leading-relaxed font-medium">
            Bugün harika gidiyorsun! 🎉 Hedefine ulaşmak için bu tempoda devam et.
          </p>
        </div>
      </div>
    </div>

    <!-- Photo Options Modal -->
    <div v-if="showPhotoOptions" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
      <div class="bg-white rounded-3xl p-8 w-full max-w-sm text-center space-y-6 shadow-2xl border border-white/20">
        <h2 class="text-2xl font-bold text-gray-800">Fotoğraf Ekle</h2>
        <div class="space-y-4">
          <button @click="$refs.fileInput.click()" class="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 px-6 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus-ring">
            📁 Fotoğraf Seç
          </button>
          <button @click="takePhoto" class="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus-ring">
            📷 Fotoğraf Çek
          </button>
        </div>
        <button @click="showPhotoOptions = false" class="text-sm text-gray-500 hover:text-gray-700 hover:underline transition-colors">
          Vazgeç
        </button>
        <input ref="fileInput" type="file" accept="image/*" capture="environment" class="hidden" @change="handleFileChange" />
      </div>
    </div>

    <!-- AI Analysis Result Modal -->
    <div v-if="aiAnalyzing || aiParsed || aiResultRaw"
         class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up">
      <div class="bg-white rounded-3xl p-8 w-full max-w-lg space-y-6 shadow-2xl border border-white/20 max-h-[80vh] overflow-y-auto">
        <div class="flex items-center justify-between">
          <h3 class="text-2xl font-bold text-gray-800">AI Analiz Sonucu</h3>
        </div>

        <!-- Loading State -->
        <div v-if="aiAnalyzing" class="flex flex-col items-center gap-6 text-center">
          <div class="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
          <div class="text-lg text-gray-600">Analiz ediliyor…</div>
          <button class="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium focus-ring"
                  @click="closeAiResult">İptal</button>
        </div>

        <!-- Results -->
        <div v-else class="space-y-4">
          <template v-if="aiParsed">
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 hover-lift">
              <div class="text-center mb-4">
                <span class="text-2xl font-bold text-blue-600">{{ aiParsed.total_kcal }} kcal</span>
                <p class="text-sm text-gray-600">Toplam Kalori</p>
              </div>
            </div>

            <div v-if="aiParsed.items && aiParsed.items.length" class="space-y-3">
              <h4 class="font-semibold text-gray-800">Kalemler:</h4>
              <div class="space-y-2">
                <div v-for="(it,i) in aiParsed.items" :key="i" 
                     class="bg-gray-50 rounded-xl p-3 border-l-4 border-blue-500 hover-lift">
                  <div class="font-medium text-gray-800">{{ it.name }}</div>
                  <div class="text-sm text-gray-600">
                    {{ it.kcal }} kcal (P: {{ it.protein_g }}g, K: {{ it.carb_g }}g, Y: {{ it.fat_g }}g)
                  </div>
                </div>
              </div>
            </div>

            <div v-if="aiParsed.warnings && aiParsed.warnings.length" class="space-y-3">
              <h4 class="font-semibold text-orange-700">⚠️ Uyarılar:</h4>
              <div class="space-y-2">
                <div v-for="(w,i) in aiParsed.warnings" :key="'w'+i" 
                     class="bg-orange-50 border-l-4 border-orange-500 rounded-xl p-3 hover-lift">
                  <p class="text-sm text-orange-800">{{ w }}</p>
                </div>
              </div>
            </div>

            <div v-if="aiParsed.solutions && aiParsed.solutions.length" class="space-y-3">
              <h4 class="font-semibold text-green-700">💡 Öneriler:</h4>
              <div class="space-y-2">
                <div v-for="(s,i) in aiParsed.solutions" :key="'s'+i" 
                     class="bg-green-50 border-l-4 border-green-500 rounded-xl p-3 hover-lift">
                  <p class="text-sm text-green-800">{{ s }}</p>
                </div>
              </div>
            </div>

            <div class="flex gap-3 justify-end pt-4">
              <button class="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus-ring" 
                      @click="addAiCaloriesToMeal">Öğüne Ekle</button>
              <button class="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors focus-ring" 
                      @click="closeAiResult">Kapat</button>
            </div>
          </template>

          <template v-else>
            <div class="text-center text-gray-500 py-8">
              <div class="text-4xl mb-4 animate-bounce">🤔</div>
              <p>Sonuç okunamadı. Tekrar deneyebilirsin.</p>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import RobotIcon from './RobotIcon.vue';
import { getUserData } from '@/api/fakeApi';
import { analyzeFoodPhoto } from '@/api/openrouter';
import { mapState } from 'vuex';

export default {
  name: 'Home',
  components: { RobotIcon },
  data() {
    return {
      user: null,
      showPhotoOptions: false,
      stepsInput: 0,
      exerciseInput: '',
      selectedMealId: null,
      aiAnalyzing: false,
      aiResultRaw: null,
      aiParsed: null,
      aiAbortController: null,
      trackingTabs: [
        { id: 'calories', name: 'Kalori Takibi' },
        { id: 'water', name: 'Su Takibi' },
        { id: 'exercise', name: 'Egzersiz Takibi' },
        { id: 'macros', name: 'Makro Takibi' }
      ],
      activeTab: 'calories',
      stepCalories: 0,
      exerciseCalories: 0,
    };
  },

  computed: {
    ...mapState(['meals', 'waterTaken', 'stepsToday', 'exerciseNote', 'burnedCalories']),
    totalConsumed() {
      return this.meals.reduce((t, m) => t + (Number(m.calories) || 0), 0);
    },
    remainingCalories() {
      const need = Number(this.user?.neededCalories) || 0;
      return Math.max(0, need - this.totalConsumed);
    },
    totalBurned() {
      const fromSteps = Math.round((Number(this.stepsToday) || 0) * 0.04);
      return fromSteps + (Number(this.burnedCalories) || 0);
    },
    totalProtein() {
      return this.meals.reduce((t, m) => t + (Number(m.protein_g) || 0), 0);
    },
    totalCarb() {
      return this.meals.reduce((t, m) => t + (Number(m.carb_g) || 0), 0);
    },
    totalFat() {
      return this.meals.reduce((t, m) => t + (Number(m.fat_g) || 0), 0);
    },
    waterTarget() {
      return Number(this.user && this.user.dailyWaterIntake ? this.user.dailyWaterIntake : 0);
    },
  },
  // watch: {
  //   burnedTotal(val) {
  //     this.$store.commit("addBurned", val - this.$store.state.burnedCalories);
  //   },
  // },
  methods: {
    addWater200() {
      this.$store.commit('addWater', 0.2);
    },
    saveExercise() {
      this.$store.commit('setStepsToday', this.stepsInput);
      this.$store.commit('setExerciseNote', this.exerciseInput);
    },
    loadExerciseFromStore() {
      this.stepsInput = Number(this.stepsToday || 0);
      this.exerciseInput = String(this.exerciseNote || '');
    },
    openPhotoOptions(mealId) {
      this.selectedMealId = mealId;
      this.showPhotoOptions = true;
    },
    dedupeWarnings(list) {
      const seen = new Set();
      return (list || []).filter(w => {
        const key = String(w).trim().toLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    },

    // gluten int için istemci tarafı güvenlik freni + spesifik uyarı
    enforceDietSafety(parsed) {
      try {
        if (!parsed || !parsed.items) return parsed;
        const userHasCeliac = String(this.user?.diseases || '').toLowerCase().includes('gluten intoleransı');
        if (!userHasCeliac) {
          parsed.warnings = this.dedupeWarnings(parsed.warnings);
          return parsed;
        }

        const glutenKeys = [
          'tam buğday','buğday','un','ekmek','kraker','galeta','makarna','bulgur','kuskus',
          'arpa','çavdar','malt','panko','kaplama','pane','kepekli'
        ];

        const hits = [];
        for (const it of parsed.items) {
          const name = String(it?.name || '').toLowerCase();
          const hit = glutenKeys.find(k => name.includes(k));
          if (hit) hits.push({ ingredient: it.name, rule: `gluten(${hit})` });
        }

        if (hits.length) {
          const culprit = hits[0].ingredient || 'glutenli içerik';
          parsed.is_safe_for_user = false;
          parsed.decision = 'unsafe';

          // Nötr mesajları sil, spesifik tek uyarı ekle
          const cleaned = (parsed.warnings || []).filter(w => !/sakıncası yok/i.test(String(w)));
          cleaned.unshift(
            `Senin gluten intoleransın olduğundan '${culprit}' içerdiği için bu öğün sana uygun değil.`
          );
          parsed.warnings = this.dedupeWarnings(cleaned);

          // Çözüm yoksa kısa alternatif öner
          if (!Array.isArray(parsed.solutions) || parsed.solutions.length === 0) {
            parsed.solutions = [
              `‘${culprit}’ yerine glutensiz kraker/ekmek kullan.`,
              'Garnitürde bulgur yerine kinoa veya pirinç tercih et.'
            ];
          }

          parsed.restricted_hits = Array.isArray(parsed.restricted_hits)
            ? parsed.restricted_hits.concat(hits) : hits;
        } else {
          parsed.warnings = this.dedupeWarnings(parsed.warnings);
        }
        return parsed;
      } catch (e) {
        console.warn('enforceDietSafety hata:', e);
        return parsed;
      }
    },

    onAddMealFromSuggestion(e) {
      const { mealId, kcal, title } = e.detail || {};
      if (!mealId || !kcal) return;
      const cur = this.meals.find(m => m.id === mealId);
      if (cur) alert(`“${title}” (${kcal} kcal) ${cur.name} öğününe eklendi.`);
    },

    async handleFileChange(event) {
      const file = event.target.files?.[0];
      this.showPhotoOptions = false;
      if (!file) return;

      const controller = new AbortController();
      this.aiAbortController = controller;
      this.aiAnalyzing = true;
      this.aiResultRaw = null;
      this.aiParsed = null;

      try {
        const mealName = this.meals.find(m => m.id === this.selectedMealId)?.name || '';
        const result = await analyzeFoodPhoto(file, mealName, controller.signal);

        if (this.aiAbortController !== controller) return;

        const clean = String(result || '').trim()
          .replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '');
        this.aiResultRaw = clean;

        try {
          this.aiParsed = this.normalizeAiResult(JSON.parse(clean));
          this.aiParsed = this.enforceDietSafety(this.aiParsed);
        } catch {
          const fb = this.extractCalories(clean); // metinden “xxx kcal” çek
          if (fb) {
            this.aiParsed = this.enforceDietSafety(this.normalizeAiResult({
              total_kcal: fb,
              items: []
            }));
          } else {
            this.aiParsed = null;
          }
        }
      } catch (e) {
        if (e?.code !== 'ERR_CANCELED' && e?.name !== 'AbortError') {
          console.error(e);
          this.aiResultRaw = 'Hata';
          this.aiParsed = null;
        }
      } finally {
        if (this.aiAbortController === controller) {
          this.aiAnalyzing = false;
          this.aiAbortController = null;
        }
        if (this.$refs.fileInput) this.$refs.fileInput.value = '';
      }
    },

    takePhoto() {
      this.showPhotoOptions = false;
      this.$nextTick(() => this.$refs.fileInput?.click());
    },

    closeAiResult() {
      this.aiAbortController?.abort();
      this.aiAbortController = null;
      this.aiAnalyzing = false;
      this.aiParsed = null;
      this.aiResultRaw = null;
    },

    addAiCaloriesToMeal() {
      if (!this.selectedMealId) {
        alert("Öğün seçili değil.");
        return;
      }
    
      // aiParsed beklenen örnek:
      // {
      //   total_kcal: 520,
      //   items: [{ kcal: 200, protein_g: 10, carb_g: 25, fat_g: 6 }, ...]
      // }
      const parsed = this.aiParsed || {};
      const items = Array.isArray(parsed.items) ? parsed.items : [];
    
      const kcalFromTotal = Number(parsed.total_kcal || 0) || 0;
    
      // items üzerinden topla
      const kcalFromItems = items.reduce((t, x) => t + (Number(x.kcal) || 0), 0);
    
      const protein_g = items.reduce((t, x) => t + (Number(x.protein_g) || 0), 0);
      const carb_g    = items.reduce((t, x) => t + (Number(x.carb_g) || 0), 0);
      const fat_g     = items.reduce((t, x) => t + (Number(x.fat_g) || 0), 0);
    
      const kcal = kcalFromTotal || kcalFromItems;
    
      if (!kcal) {
        alert("Kalori bilgisi bulunamadı.");
        return;
      }
    
      this.$store.commit("addNutritionToMeal", {
        mealId: this.selectedMealId,
        kcal,
        protein_g,
        carb_g,
        fat_g
      });
    
      // UI temizle
      this.aiParsed = null;
      this.aiResultRaw = null;
    },

    normalizeAiResult(parsed) {
      parsed = parsed || {};
      // 1) Kalemleri sayısallaştır
      parsed.items = Array.isArray(parsed.items) ? parsed.items.map(it => {
        const toNum = v => {
          if (v == null) return 0;
          const s = String(v).replace(',', '.').replace(/[^\d.]/g, '');
          const n = Number(s);
          return isNaN(n) ? 0 : n;
        };
        return {
          name: String(it?.name || '').trim(),
          kcal: toNum(it?.kcal),
          protein_g: toNum(it?.protein_g),
          carb_g: toNum(it?.carb_g),
          fat_g: toNum(it?.fat_g),
        };
      }) : [];
    
      // 2) Toplamı emniyete al
      const itemsSum = parsed.items.reduce((t, x) => t + (Number(x.kcal) || 0), 0);
      const tk = Number(String(parsed.total_kcal || '').replace(',', '.'));
      if ((!tk || isNaN(tk)) && itemsSum) parsed.total_kcal = itemsSum;
      else parsed.total_kcal = tk || 0;
    
      // 3) Tutarsızlık uyarısı (opsiyonel)
      if (itemsSum && parsed.total_kcal && Math.abs(itemsSum - parsed.total_kcal) > 50) {
        parsed.warnings = this.dedupeWarnings([...(parsed.warnings || []),
          'Kalori toplamı öğe kalemleriyle tam örtüşmüyor (±50 kcal).'
        ]);
      }
      return parsed;
    },

    // (Gerekirse) metinden kcal çekmek için basit yardımcı
    extractCalories(text) {
      if (!text) return 0;
      const m = text.match(/(\d{2,5})\s*(?:kcal|kalori)/i);
      if (m) return Number(m[1]);
      const nums = (text.match(/\d{2,5}/g) || []).map(n => Number(n));
      const plausible = nums.find(n => n >= 50 && n <= 1500);
      return plausible || 0;
    }
  },
  mounted() {
    getUserData().then(data => { this.user = data; });
    this.loadExerciseFromStore();
    window.addEventListener('diet:addMeal', this.onAddMealFromSuggestion);
  },
  beforeDestroy() {
    window.removeEventListener('diet:addMeal', this.onAddMealFromSuggestion);
  }
};
</script>
