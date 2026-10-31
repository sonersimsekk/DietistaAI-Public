<template>
  <div class="w-full min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-sky-50 p-4">
    <!-- Header -->
    <div class="w-full max-w-5xl mx-auto">
      <div class="flex items-start justify-between gap-3 mb-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Kişisel Egzersizler
          </h1>
          <p class="text-slate-600 mt-1">
            Fiziksel özelliklerin ve hedefine göre uygun egzersizleri listeler.
          </p>
        </div>
      </div>

      <!-- Top summary cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div class="bg-white/80 backdrop-blur rounded-3xl border border-white/40 shadow p-4">
          <div class="flex items-center justify-between">
            <div class="text-sm text-slate-600">Vücut Kitle İndeksi</div>
            <span
              class="text-xs font-semibold px-2 py-1 rounded-full"
              :class="bmiBadgeClass"
            >
              {{ bmiLabel }}
            </span>
          </div>
          <div class="mt-2 flex items-end gap-2">
            <div class="text-3xl font-extrabold text-slate-900">{{ bmi }}</div>
            <div class="text-sm text-slate-600 pb-1">kg/m²</div>
          </div>
          <div class="mt-3">
            <div class="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                class="h-2 rounded-full bg-slate-900"
                :style="{ width: bmiProgress + '%' }"
              />
            </div>
            <div class="text-xs text-slate-500 mt-2">
              Boy: {{ profile.heightCm }} cm • Kilo: {{ profile.weightKg }} kg
            </div>
          </div>
        </div>

        <div class="bg-white/80 backdrop-blur rounded-3xl border border-white/40 shadow p-4">
          <div class="text-sm text-slate-600">Hedef</div>
          <div class="mt-2 text-2xl font-extrabold text-slate-900">
            {{ goalTitle }}
          </div>
          <div class="mt-2 flex flex-wrap gap-2">
            <span class="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-700">
              Seviye: {{ levelTitle }}
            </span>
            <span class="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-700">
              Süre: {{ profile.sessionMinutes }} dk
            </span>
            <span class="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-700">
              Haftada: {{ profile.daysPerWeek }} gün
            </span>
          </div>
        </div>

        <div class="bg-white/80 backdrop-blur rounded-3xl border border-white/40 shadow p-4">
          <div class="text-sm text-slate-600">Bugün İçin Plan</div>
          <div class="mt-2 text-2xl font-extrabold text-slate-900">
            {{ todaysPlan.length }} egzersiz
          </div>

          <div class="mt-3">
            <div class="flex items-center justify-between text-xs text-slate-600 mb-2">
              <span>Toplam süre</span>
              <span class="font-semibold text-slate-900">{{ planMinutes }} dk</span>
            </div>
            <div class="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                class="h-2 rounded-full bg-slate-900"
                :style="{ width: planProgress + '%' }"
              />
            </div>
          </div>

          <div class="mt-3 flex items-center justify-between">
            <div class="text-xs text-slate-500">
              Tahmini: <span class="font-semibold text-slate-800">{{ planCalories }}</span> kcal
            </div>
            <button
              type="button"
              class="text-sm font-semibold rounded-2xl px-3 py-2 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 disabled:opacity-50"
              :disabled="!todaysPlan.length || planStarted"
              @click="startPlan"
            >
              {{ planStarted ? "Eklendi" : "Başlat" }}
            </button>
          </div>
        </div>
      </div>

      
      <div class="flex flex-wrap gap-2 mb-4">
        <button
          v-for="c in categoryChips"
          :key="c.key"
          type="button"
          class="text-xs font-semibold px-3 py-1.5 rounded-full border"
          :class="activeCategory === c.key ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'"
          @click="activeCategory = c.key"
        >
          {{ c.label }}
        </button>
      </div>

      <!-- Recommended section -->
      <div class="flex items-center justify-between gap-3 mb-2">
        <h2 class="text-lg sm:text-xl font-extrabold text-slate-900">
          Sana Uygun Egzersizler
        </h2>
      </div>

      <!-- Grid cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pb-10">
        <div
          v-for="ex in filteredExercises"
          :key="ex.id"
          class="bg-white/85 backdrop-blur rounded-3xl border border-white/40 shadow p-4 hover:shadow-md transition"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl shadow-sm">
                {{ ex.icon }}
              </div>
              <div>
                <div class="font-extrabold text-slate-900 leading-tight">
                  {{ ex.title }}
                </div>
                <div class="text-xs text-slate-600 mt-1">
                  {{ ex.focus.join(' • ') }}
                </div>
              </div>
            </div>

            <button
              class="w-9 h-9 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center shadow-sm"
              @click="toggleFavorite(ex.id)"
              :title="favorites.has(ex.id) ? 'Favorilerden çıkar' : 'Favorilere ekle'"
            >
              <span class="text-base">{{ favorites.has(ex.id) ? '★' : '☆' }}</span>
            </button>
          </div>

          <div class="mt-3 flex flex-wrap gap-2">
            <span class="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-700">
              {{ ex.duration }} dk
            </span>
            <span class="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-700">
              {{ levelLabel(ex.level) }}
            </span>
            <span class="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-700">
              {{ ex.categoryLabel }}
            </span>
            <span v-if="ex.lowImpact" class="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
              Düşük Etki
            </span>
          </div>

          <div class="mt-3 text-sm text-slate-700">
            {{ ex.desc }}
          </div>
          <div v-if="detailId === ex.id" class="mt-2 text-xs text-slate-500">
            Ekipman: {{ ex.equipment && ex.equipment.length ? equipmentLabels(ex.equipment) : "Gerekmez" }}
          </div>

          <div class="mt-3 flex items-center justify-between">
            <div class="text-xs text-slate-500">
              Tahmini: <span class="font-semibold text-slate-800">{{ estimateCalories(ex) }}</span> kcal
            </div>
            <div class="flex gap-2">
              <button
                type="button"
                class="px-3 py-2 rounded-2xl text-sm font-semibold border border-slate-200 bg-white hover:bg-slate-50 shadow-sm"
                @click="detailId = detailId === ex.id ? null : ex.id"
              >
                {{ detailId === ex.id ? "Gizle" : "Detay" }}
              </button>
              <button
                type="button"
                class="px-3 py-2 rounded-2xl text-sm font-semibold bg-slate-900 text-white shadow hover:opacity-95"
                @click="addExercise(ex)"
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PersonalizedWorkout",
  data() {
    return {
      activeCategory: "all",
      favorites: new Set(),
      detailId: null,
      planStarted: false,

      profile: {
        age: 17,
        heightCm: 175,
        weightKg: 70,
        goal: "fat_loss", // fat_loss | muscle_gain | fitness | mobility
        level: "beginner", // beginner | intermediate | advanced
        daysPerWeek: 3,
        sessionMinutes: 20,
        equipment: {
          dumbbell: true,
          band: false,
          mat: true,
          treadmill: false,
        },
      },

      equipmentOptions: [
        { key: "dumbbell", label: "Dambıl" },
        { key: "band", label: "Lastik" },
        { key: "mat", label: "Mat" },
        { key: "treadmill", label: "Koşu Bandı" },
      ],

      categoryChips: [
        { key: "all", label: "Tümü" },
        { key: "strength", label: "Güç" },
        { key: "cardio", label: "Kardiyo" },
        { key: "core", label: "Core" },
        { key: "mobility", label: "Mobilite" },
      ],

      // Demo egzersiz havuzu (sunum için yeterince dolu ve “premium” görünsün diye)
      exercises: [
        {
          id: 1,
          title: "Dambıl Full Body",
          icon: "🏋️",
          category: "strength",
          categoryLabel: "Güç",
          level: "beginner",
          duration: 20,
          focus: ["Tüm vücut", "Kas tonusu"],
          equipment: ["dumbbell", "mat"],
          goals: ["muscle_gain", "fitness", "fat_loss"],
          lowImpact: true,
          desc: "Basit ama etkili full body devre. Kontrollü tempo ile.",
        },
        {
          id: 2,
          title: "Yağ Yakım HIIT",
          icon: "⚡️",
          category: "cardio",
          categoryLabel: "Kardiyo",
          level: "intermediate",
          duration: 15,
          focus: ["Kondisyon", "Yağ yakımı"],
          equipment: ["mat"],
          goals: ["fat_loss", "fitness"],
          lowImpact: false,
          desc: "Kısa aralarla yüksek tempo. Terletir, hızlandırır.",
        },
        {
          id: 3,
          title: "Düşük Etki Kardiyo",
          icon: "🚶‍♀️",
          category: "cardio",
          categoryLabel: "Kardiyo",
          level: "beginner",
          duration: 20,
          focus: ["Kalp sağlığı", "Dayanıklılık"],
          equipment: [],
          goals: ["fat_loss", "fitness"],
          lowImpact: true,
          desc: "Ekipmansız, eklemlere nazik kardiyo. Yeni başlayanlar için ideal.",
        },
        {
          id: 4,
          title: "Core Stabilite",
          icon: "🧘",
          category: "core",
          categoryLabel: "Core",
          level: "beginner",
          duration: 12,
          focus: ["Karın", "Bel desteği"],
          equipment: ["mat"],
          goals: ["fitness", "fat_loss", "mobility"],
          lowImpact: true,
          desc: "Plank varyasyonları ile merkez bölgeyi güçlendirir.",
        },
        {
          id: 5,
          title: "Glute & Legs",
          icon: "🍑",
          category: "strength",
          categoryLabel: "Güç",
          level: "intermediate",
          duration: 25,
          focus: ["Bacak", "Kalça"],
          equipment: ["dumbbell", "band"],
          goals: ["muscle_gain", "fitness", "fat_loss"],
          lowImpact: true,
          desc: "Bacak ve kalça odaklı. Form odaklı tekrarlar.",
        },
        {
          id: 6,
          title: "Omuz & Postür",
          icon: "🧍",
          category: "strength",
          categoryLabel: "Güç",
          level: "beginner",
          duration: 18,
          focus: ["Omuz", "Duruş"],
          equipment: ["band", "mat"],
          goals: ["fitness", "mobility"],
          lowImpact: true,
          desc: "Postür kaslarını aktive eder, gün boyu daha dik duruş sağlar.",
        },
        {
          id: 7,
          title: "Mobilite Akışı",
          icon: "🌀",
          category: "mobility",
          categoryLabel: "Mobilite",
          level: "beginner",
          duration: 15,
          focus: ["Kalça", "Omurga", "Esneklik"],
          equipment: ["mat"],
          goals: ["mobility", "fitness"],
          lowImpact: true,
          desc: "Günlük mobilite rutini. Sabah/akşam için harika.",
        },
        {
          id: 8,
          title: "Koşu Bandı Interval",
          icon: "🏃‍♀️",
          category: "cardio",
          categoryLabel: "Kardiyo",
          level: "advanced",
          duration: 20,
          focus: ["Kondisyon", "Hız"],
          equipment: ["treadmill"],
          goals: ["fat_loss", "fitness"],
          lowImpact: false,
          desc: "Interval koşu ile maksimum kondisyon ve kalori harcaması.",
        },
        {
          id: 9,
          title: "Üst Vücut Güç",
          icon: "💪",
          category: "strength",
          categoryLabel: "Güç",
          level: "intermediate",
          duration: 22,
          focus: ["Göğüs", "Sırt", "Kol"],
          equipment: ["dumbbell"],
          goals: ["muscle_gain", "fitness"],
          lowImpact: true,
          desc: "Üst vücut kas gruplarını dengeli çalıştırır.",
        },
      ],
    };
  },

  computed: {
    bmi() {
      const h = this.profile.heightCm / 100;
      if (!h || !this.profile.weightKg) return "0.0";
      const v = this.profile.weightKg / (h * h);
      return v.toFixed(1);
    },

    bmiValue() {
      return Number(this.bmi) || 0;
    },

    bmiLabel() {
      const b = this.bmiValue;
      if (b < 18.5) return "Zayıf";
      if (b < 25) return "Normal";
      if (b < 30) return "Fazla kilolu";
      return "Obezite";
    },

    bmiBadgeClass() {
      const b = this.bmiValue;
      if (b < 18.5) return "bg-sky-50 text-sky-700 border border-sky-100";
      if (b < 25) return "bg-emerald-50 text-emerald-700 border border-emerald-100";
      if (b < 30) return "bg-amber-50 text-amber-700 border border-amber-100";
      return "bg-rose-50 text-rose-700 border border-rose-100";
    },

    bmiProgress() {
      // Sunum amaçlı görsel ölçek: 16-36 arası -> 0-100
      const min = 16, max = 36;
      const v = Math.min(max, Math.max(min, this.bmiValue));
      return Math.round(((v - min) / (max - min)) * 100);
    },

    goalTitle() {
      const map = {
        fat_loss: "Yağ Yakımı",
        muscle_gain: "Kas Kazanımı",
        fitness: "Form & Kondisyon",
        mobility: "Esneklik & Mobilite",
      };
      return map[this.profile.goal] || "Hedef";
    },

    levelTitle() {
      const map = {
        beginner: "Başlangıç",
        intermediate: "Orta",
        advanced: "İleri",
      };
      return map[this.profile.level] || "Seviye";
    },

    filteredExercises() {
      const levelRank = this.levelRank(this.profile.level);
      const goal = this.profile.goal;
      const minutes = this.profile.sessionMinutes;
      const equipment = this.profile.equipment;
      const wantsLowImpact = this.bmiValue >= 30; // BMI yüksekse “düşük etki” öne çıksın

      let list = this.exercises
        .filter((ex) => {
          // kategori filtresi
          if (this.activeCategory !== "all" && ex.category !== this.activeCategory) return false;

          // hedef uyumu
          if (!ex.goals.includes(goal)) return false;

          // seviye uyumu (egzersiz seviyesi <= kullanıcı seviyesi)
          if (this.levelRank(ex.level) > levelRank) return false;

          // süre uyumu (çok taşmasın)
          if (ex.duration > minutes + 10) return false;

          // ekipman uyumu: egzersizin ihtiyaç duyduğu ekipmanın kullanıcıda olması
          const required = ex.equipment || [];
          for (const req of required) {
            if (!equipment[req]) return false;
          }

          // BMI çok yüksekse yüksek zıplamalı/sert işleri eleyelim
          if (wantsLowImpact && ex.lowImpact === false) return false;

          return true;
        })
        .map((ex) => ({ ...ex, score: this.scoreExercise(ex) }))
        .sort((a, b) => b.score - a.score);

      // Favorileri en üste çek
      list = list.sort((a, b) => {
        const af = this.favorites.has(a.id) ? 1 : 0;
        const bf = this.favorites.has(b.id) ? 1 : 0;
        return bf - af;
      });

      return list;
    },

    todaysPlan() {
      // Sunum için “ilk 3 öneri” plan
      return this.filteredExercises.slice(0, 3);
    },

    planMinutes() {
      return this.todaysPlan.reduce((sum, ex) => sum + (ex.duration || 0), 0);
    },

    planProgress() {
      // hedef süreye göre doluluk (görsel)
      const target = this.profile.sessionMinutes || 20;
      const pct = Math.round((this.planMinutes / (target + 10)) * 100);
      return Math.max(0, Math.min(100, pct));
    },

    planCalories() {
      return this.todaysPlan.reduce((sum, ex) => sum + this.estimateCalories(ex), 0);
    },
  },

  mounted() {
    this.loadProfileFromUser();
  },

  methods: {
    loadProfileFromUser() {
      try {
        const users = JSON.parse(localStorage.getItem("dietista_users") || "[]");
        const id = localStorage.getItem("dietista_current_user_id");
        const u = Array.isArray(users) ? users.find((x) => x.id === id) : null;
        if (!u) return;

        this.profile.age = Number(u.age) || this.profile.age;
        this.profile.heightCm = Number(u.height) || this.profile.heightCm;
        this.profile.weightKg = Number(u.weight) || this.profile.weightKg;

        const goal = String(u.goal || "").toLowerCase();
        const hasMuscle = /kas/.test(goal);
        const hasFat = /yağ|yag|kilo ver|zayıfl/.test(goal);
        if (hasMuscle && hasFat) this.profile.goal = "fitness";
        else if (hasMuscle) this.profile.goal = "muscle_gain";
        else if (hasFat) this.profile.goal = "fat_loss";
        else if (/esne|mobil/.test(goal)) this.profile.goal = "mobility";
        else this.profile.goal = "fitness";

        const activity = String(u.activityLevel || "").toLowerCase();
        if (/yüksek|yuksek/.test(activity)) this.profile.level = "advanced";
        else if (/orta/.test(activity)) this.profile.level = "intermediate";
        else this.profile.level = "beginner";
      } catch (e) {
        console.warn("Profil okunamadı", e);
      }
    },

    equipmentLabels(keys) {
      const map = { dumbbell: "Dambıl", band: "Lastik", mat: "Mat", treadmill: "Koşu bandı" };
      return (keys || []).map((k) => map[k] || k).join(", ");
    },

    addExercise(ex) {
      const kcal = this.estimateCalories(ex);
      this.$store.commit("addBurned", kcal);
      this.$store.commit("setExerciseNote", ex.title);
    },

    startPlan() {
      if (!this.todaysPlan.length || this.planStarted) return;
      this.$store.commit("addBurned", this.planCalories);
      this.$store.commit("setExerciseNote", this.todaysPlan.map((ex) => ex.title).join(", "));
      this.planStarted = true;
    },

    levelRank(lvl) {
      const map = { beginner: 1, intermediate: 2, advanced: 3 };
      return map[lvl] || 1;
    },

    levelLabel(lvl) {
      const map = { beginner: "Başlangıç", intermediate: "Orta", advanced: "İleri" };
      return map[lvl] || "Seviye";
    },

    toggleEquipment(key) {
      this.profile.equipment[key] = !this.profile.equipment[key];
    },

    selectNoEquipment() {
      // ekipmansız demek: hepsini false yapıp matı açık bırakmak sunumda daha mantıklı
      Object.keys(this.profile.equipment).forEach((k) => (this.profile.equipment[k] = false));
      this.profile.equipment.mat = true;
    },

    toggleFavorite(id) {
      if (this.favorites.has(id)) this.favorites.delete(id);
      else this.favorites.add(id);

      // Vue 2 reactivity için Set güncellemesini tetikle
      this.favorites = new Set(Array.from(this.favorites));
    },

    scoreExercise(ex) {
      // Basit skor: hedef uyumu + seviye + süre yakınlığı + düşük etki bonus
      let s = 0;

      // hedef uyumu zaten filter’dan geçiyor, ama yine de bonus
      s += 30;

      // seviye: kullanıcıya daha yakın olan biraz daha yüksek
      const diff = Math.abs(this.levelRank(this.profile.level) - this.levelRank(ex.level));
      s += (3 - diff) * 10;

      // süre yakınlığı
      const d = Math.abs((ex.duration || 0) - (this.profile.sessionMinutes || 20));
      s += Math.max(0, 20 - d);

      // BMI yüksekse düşük etki ekstra
      if (this.bmiValue >= 30 && ex.lowImpact) s += 15;

      // ekipmanlı egzersizler sunumda “premium” his verir; ekipmanı varsa küçük bonus
      if ((ex.equipment || []).length > 0) s += 5;

      return s;
    },

    estimateCalories(ex) {
      // Demo amaçlı kalori: ağırlık * süre * çarpan
      // Kardiyo/HIIT daha yüksek, mobilite daha düşük
      const w = this.profile.weightKg || 70;
      const m = ex.duration || 15;

      let factor = 0.07; // default
      if (ex.category === "cardio") factor = ex.lowImpact ? 0.08 : 0.11;
      if (ex.category === "strength") factor = 0.075;
      if (ex.category === "core") factor = 0.065;
      if (ex.category === "mobility") factor = 0.045;

      const kcal = Math.round(w * m * factor);
      return Math.max(40, kcal);
    },

    resetDemo() {
      this.activeCategory = "all";
      this.favorites = new Set();
      this.profile = {
        age: 24,
        heightCm: 170,
        weightKg: 68,
        goal: "fat_loss",
        level: "beginner",
        daysPerWeek: 3,
        sessionMinutes: 20,
        equipment: { dumbbell: true, band: false, mat: true, treadmill: false },
      };
    },
  },
};
</script>

<style scoped>
/* Bu dosya Tailwind ağırlıklı, ek CSS minimal tutuldu */
</style>
