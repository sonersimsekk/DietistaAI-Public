<template>
  <div class="w-full flex flex-col items-center px-2 py-4">
    <!-- Program Seçimi -->
    <div class="card p-4 w-full max-w-md mb-4 shadow">
      <div class="flex items-center justify-between mb-3">
    <div class="font-semibold" style="color: var(--text)">Program Seç</div>
        
    <!-- Aç/Kapat -->
    <button
      v-if="programs.length"
      type="button"
      class="flex items-center gap-1 text-xs text-muted select-none"
      @click="programsOpen = !programsOpen"
      :aria-expanded="programsOpen ? 'true' : 'false'"
      aria-controls="program-options"
    >
      <span>{{ programs.length }} seçenek</span>
      <svg
        class="w-4 h-4 transition-transform duration-200"
        :class="programsOpen ? 'rotate-180' : 'rotate-0'"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    <div v-else class="text-xs text-muted">0 seçenek</div>
  </div>

      <div v-if="!programs.length" class="text-sm text-muted">
        Henüz program bulunamadı. (Kayıt sırasında program oluşturulmamış olabilir.)
      </div>
      <div v-else v-show="programsOpen" class="grid grid-cols-1 gap-2">
        <button
          v-for="p in programs"
          :key="p.id"
          class="w-full text-left rounded-2xl border px-3 py-3 transition"
          :class="p.id === selectedProgramId
            ? 'border-indigo-200 bg-indigo-50'
            : 'border-gray-100 bg-white hover:bg-gray-50'"
          @click="selectProgram(p.id)"
        >
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="text-sm font-extrabold text-gray-900">{{ p.title }}</div>
              <div class="text-xs text-gray-500 mt-0.5">
                {{ p.difficulty }} • {{ p.duration_days }} gün • {{ p.workouts_per_week }} antrenman/hafta
              </div>
            </div>
            <div class="text-right">
              <div class="text-xs text-gray-500">Günlük</div>
              <div class="text-sm font-extrabold text-gray-900">{{ p.daily_calorie_target }} kcal</div>
            </div>
          </div>

          <div class="mt-2 flex flex-wrap gap-2">
            <span class="chip">🚶 {{ p.steps_target }} adım</span>
            <span class="chip">🏋️ {{ p.workout_style }}</span>
            <span class="chip">🍗 P {{ getMacro(p, 'protein_g') }}g</span>
          </div>
        </button>
      </div>
    </div>

    <!-- Kalan Günler + İlerleme -->
    <div class="card p-4 w-full max-w-md mb-4 shadow" v-if="selectedProgram">
      <div class="flex justify-between items-center mb-2">
        <div class="font-semibold" style="color: var(--text)">Kalan Süre</div>
        <div class="font-semibold" style="color: var(--primary)">
          {{ daysLeft }} gün kaldı
        </div>
      </div>

      <div class="w-full h-4 rounded-full mb-2 overflow-hidden" style="background: var(--border);">
        <div
          class="h-4 rounded-full"
          style="background: var(--primary)"
          :style="{ width: progressPercent + '%' }"
        ></div>
      </div>

      <div class="flex justify-between text-xs text-muted">
        <span>Başlangıç: {{ prettyDate(programStartDate) }}</span>
        <span>İlerleme: <b style="color: var(--text)">{{ progressPercent }}%</b></span>
      </div>
    </div>

    <!-- Kalori / Hedef Özet -->
    <div class="card p-4 shadow w-full max-w-md mb-4" v-if="selectedProgram">
      <div class="font-semibold mb-3" style="color: var(--text)">Hedef Özeti</div>

      <div class="grid grid-cols-2 gap-2 text-sm">
        <div class="miniStat">
          <div class="miniLabel">Bakım (Tahmini)</div>
          <div class="miniValue">{{ userMaintenance }} kcal</div>
          <div class="miniHint">neededCalories</div>
        </div>

        <div class="miniStat">
          <div class="miniLabel">Günlük Hedef</div>
          <div class="miniValue">{{ selectedProgram.daily_calorie_target }} kcal</div>
          <div class="miniHint">program hedefi</div>
        </div>

        <div class="miniStat">
          <div class="miniLabel">Günlük Fark</div>
          <div class="miniValue" :style="{ color: deltaColor }">
            {{ deltaLabel }}
          </div>
          <div class="miniHint">alınacak/verilecek</div>
        </div>

        <div class="miniStat">
          <div class="miniLabel">Tahmini Değişim</div>
          <div class="miniValue">
            {{ projectedKgChange }} kg
          </div>
          <div class="miniHint">{{ selectedProgram.duration_days }} günde</div>
        </div>
      </div>
    </div>

    <!-- Makro / Su / Aktivite -->
    <div class="grid grid-cols-2 gap-2 w-full max-w-md mb-4" v-if="selectedProgram">
      <div class="card p-4 shadow">
        <div class="font-semibold mb-2" style="color: var(--text)">Makrolar (günlük)</div>
        <div class="text-sm">
          <div class="flex justify-between"><span class="text-muted">Protein</span><b>{{ selectedMacroProtein }}g</b></div>
          <div class="flex justify-between"><span class="text-muted">Karbonhidrat</span><b>{{ selectedMacroCarb }}g</b></div>
          <div class="flex justify-between"><span class="text-muted">Yağ</span><b>{{ selectedMacroFat }}g</b></div>
        </div>
      </div>

      <div class="card p-4 shadow">
        <div class="font-semibold mb-2" style="color: var(--text)">Günlük Hedefler</div>
        <div class="text-sm">
          <div class="flex justify-between"><span class="text-muted">Adım</span><b>{{ selectedProgram.steps_target }}</b></div>
          <div class="flex justify-between"><span class="text-muted">Antrenman</span><b>{{ selectedProgram.workouts_per_week }}/hafta</b></div>
          <div class="flex justify-between"><span class="text-muted">Su</span><b>{{ userWater }} L</b></div>
        </div>
      </div>

      <!-- Diğer İstatistikler -->
        <div v-for="stat in otherStats" :key="stat.id" class="card p-4 shadow">
          <div class="font-semibold mb-2" style="color: var(--text)">{{ stat.label }}</div>
          <div class="text-2xl font-extrabold" style="color: var(--primary)">{{ stat.value }}</div>
        </div>
      </div>
    <!-- Haftalık Odak + Güvenlik Notları -->
    <div class="card p-4 w-full max-w-md mb-4 shadow" v-if="selectedProgram">
      <div class="font-semibold mb-3" style="color: var(--text)">Plan Detayları</div>

      <div class="mb-3">
        <div class="text-xs font-semibold text-gray-600 mb-2">Haftalık Odak</div>
        <div class="flex flex-wrap gap-2">
          <span v-for="(x, i) in selectedProgram.weekly_focus || []" :key="i" class="chip">
            {{ x }}
          </span>
        </div>
      </div>

      <div>
        <div class="text-xs font-semibold text-gray-600 mb-2">Güvenlik Notları</div>
        <ul class="text-sm text-muted list-disc pl-5 space-y-1">
          <li v-for="(x, i) in selectedProgram.safety_notes || []" :key="i">{{ x }}</li>
        </ul>
      </div>
    </div>

    <!-- Özet -->
    <div class="card p-4 w-full max-w-md shadow" v-if="selectedProgram">
      <div class="font-semibold mb-2" style="color: var(--text)">Özet</div>
      <p class="text-sm text-muted" v-html="aiSummary"></p>
    </div>

    <!-- Günü Tamamla -->
    <div class="card p-4 w-full max-w-md shadow mt-4">
      <div class="font-semibold mb-2" style="color: var(--text)">Gün Sonu</div>
    
      <button
        class="button primary focus-ring w-full"
        :disabled="dayReportLoading"
        @click="finishDay"
      >
        {{ dayReportLoading ? 'Rapor hazırlanıyor…' : 'Günü Tamamla' }}
      </button>
    
      <div v-if="dayReport" class="mt-3 text-sm whitespace-pre-line">
        {{ dayReport }}
      </div>
      <div v-if="dayScore !== null" class="mt-3 flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-3">
        <div>
          <div class="text-xs text-muted font-semibold">Performans Puanın</div>
          <div class="text-lg font-extrabold" style="color: var(--text)">{{ dayScore }}/10</div>
        </div>
        <div class="text-right">
          <div class="text-xs text-muted font-semibold">Kazanılan</div>
          <div class="text-lg font-extrabold" style="color: var(--primary)">+{{ dayEarnedPoints }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { getEndOfDayReport } from '@/api/openrouter'

const LS_USERS = "dietista_users";
const LS_CURRENT = "dietista_current_user_id";

function safeParse(raw) {
  try { return JSON.parse(raw); } catch (e) { return null; }
}

function readUsers() {
  const users = safeParse(localStorage.getItem(LS_USERS));
  return Array.isArray(users) ? users : [];
}

function saveUsers(users) {
  localStorage.setItem(LS_USERS, JSON.stringify(users));
}

function getCurrentUserId() {
  return localStorage.getItem(LS_CURRENT) || "";
}

export default {
  name: "Insights",
  data() {
    return {
      user: null,
      programs: [],
      selectedProgramId: "",
      dayReportLoading: false,
      dayReport: '',
      dayScore: null,
      dayEarnedPoints: 0,
      programStartDate: null,
      programsOpen: false,
      otherStats: [
        { id:1, label:'Haftalık Kaçamak', value:"?" },
        { id:2, label:'AI Öneri Uygulama', value:'?' },
        { id:3, label:'Paketli Ürün', value:"?" },
        { id:4, label:'Süper Gıda Oranı', value:'?' },
        { id:5, label:'Egzersiz Serisi', value:'?' },
        { id:6, label:'Günlük Su Tüketimi', value:'?' },
        { id:7, label:'Öğün Düzeni', value:'?' },
        { id:8, label:'Uyku Kalitesi', value:'?' }
      ],
    };
  },
  computed: {
    ...mapState(['meals', 'waterTaken', 'stepsToday', 'exerciseNote', 'burnedCalories']),
    selectedProgram() {
      for (let i = 0; i < this.programs.length; i++) {
        if (this.programs[i].id === this.selectedProgramId) return this.programs[i];
      }
      return null;
    },

    userMaintenance() {
      const v = this.user && this.user.neededCalories ? Number(this.user.neededCalories) : 0;
      return v || 0;
    },

    userWater() {
      const v = this.user && this.user.dailyWaterIntake ? Number(this.user.dailyWaterIntake) : 0;
      return v || 0;
    },

    elapsedDays() {
      if (!this.programStartDate) return 0;
      const start = new Date(this.programStartDate).getTime();
      if (!start || isNaN(start)) return 0;
      const diff = Math.max(0, Date.now() - start);
      return Math.floor(diff / (1000 * 60 * 60 * 24));
    },

    daysLeft() {
      const p = this.selectedProgram;
      if (!p) return 0;
      const duration = Number(p.duration_days || 0);
      return Math.max(0, duration - this.elapsedDays);
    },

    progressPercent() {
      const p = this.selectedProgram;
      if (!p) return 0;
      const duration = Math.max(1, Number(p.duration_days || 1));
      const used = Math.min(duration, this.elapsedDays);
      return Math.round((used / duration) * 100);
    },

    dailyDelta() {
      const p = this.selectedProgram;
      if (!p) return 0;
      const target = Number(p.daily_calorie_target || 0);
      const maint = Number(this.userMaintenance || 0);
      if (!target || !maint) return 0;
      return target - maint;
    },

    deltaLabel() {
      const d = this.dailyDelta;
      if (d === 0) return "0 kcal";
      const abs = Math.abs(d);
      return d > 0 ? "+" + abs + " kcal" : "-" + abs + " kcal";
    },

    deltaColor() {
      const d = this.dailyDelta;
      if (d < 0) return "var(--primary)";
      if (d > 0) return "var(--accent)";
      return "var(--text)";
    },

    projectedKgChange() {
      const p = this.selectedProgram;
      if (!p) return "0.0";
      const duration = Number(p.duration_days || 0);
      const total = this.dailyDelta * duration;
      const kg = total / 7700;
      return (Math.round(kg * 10) / 10).toFixed(1);
    },

    selectedMacroProtein() {
      const p = this.selectedProgram;
      if (!p || !p.macros) return 0;
      return Number(p.macros.protein_g || 0);
    },
    selectedMacroCarb() {
      const p = this.selectedProgram;
      if (!p || !p.macros) return 0;
      return Number(p.macros.carb_g || 0);
    },
    selectedMacroFat() {
      const p = this.selectedProgram;
      if (!p || !p.macros) return 0;
      return Number(p.macros.fat_g || 0);
    },

    aiSummary() {
      const p = this.selectedProgram;
      if (!p) return "";

      const goal = (this.user && this.user.goal) ? this.user.goal : "hedef";
      const name = (this.user && this.user.name) ? this.user.name : "Kullanıcı";

      const d = this.dailyDelta;
      const deltaTxt = d < 0
        ? "günlük yaklaşık <strong>" + Math.abs(d) + " kcal</strong> açık"
        : d > 0
          ? "günlük yaklaşık <strong>" + Math.abs(d) + " kcal</strong> fazla"
          : "kalori dengesi";

      return (
        "👤 <strong>" + name + "</strong> için seçili plan: <strong>" + p.title + "</strong><br/>" +
        "🎯 Hedef: <strong>" + goal + "</strong> • Süre: <strong>" + p.duration_days + " gün</strong><br/>" +
        "🔥 Kalori: <strong>" + p.daily_calorie_target + " kcal</strong> (" + deltaTxt + ")<br/>" +
        "🚶 Günlük: <strong>" + p.steps_target + " adım</strong> • 🏋️ <strong>" + p.workouts_per_week + "/hafta</strong><br/>" +
        "✅ Bu plan “güvenli ve sürdürülebilir” çerçevede hazırlanmıştır."
      );
    }
  },

  mounted() {
    this.loadFromStorage();
  },

  methods: {
    addPointsToCurrentUser(earned) {
      const LS_USERS = "dietista_users";
      const LS_CURRENT = "dietista_current_user_id";

      const currentId = localStorage.getItem(LS_CURRENT);
      const users = JSON.parse(localStorage.getItem(LS_USERS) || "[]");
      const u = users.find(x => x.id === currentId);
      if (!u) return 0;

      const cur = Number(u.points || 0);
      const add = Number(earned || 0);
      u.points = cur + add;

      localStorage.setItem(LS_USERS, JSON.stringify(users));
      return u.points;
    },
    async finishDay() {
      this.dayReportLoading = true;
      this.dayReport = '';
      this.dayScore = null;
      this.dayEarnedPoints = 0;

      try {
        const totals = {
          calories: this.meals.reduce((t, m) => t + (Number(m.calories) || 0), 0),
          protein_g: this.meals.reduce((t, m) => t + (Number(m.protein_g) || 0), 0),
          carb_g: this.meals.reduce((t, m) => t + (Number(m.carb_g) || 0), 0),
          fat_g: this.meals.reduce((t, m) => t + (Number(m.fat_g) || 0), 0),
        };
      
        const dayData = {
          date: new Date().toISOString().slice(0, 10),
          meals: this.meals,
          totals,
          water_l: Number(this.waterTaken || 0),
          steps: Number(this.stepsToday || 0),
          exercise_note: String(this.exerciseNote || ''),
          burned_kcal: Number(this.burnedCalories || 0),
        };
      
        const result = await getEndOfDayReport(dayData);
        const score = Number(result && result.score_10 != null ? result.score_10 : 0);
        const report = String(result && result.report ? result.report : "");
        const safeScore = Math.max(0, Math.min(10, Math.round(score)));
        const earned = safeScore * 10;

        this.dayScore = safeScore;
        this.dayEarnedPoints = earned;
        this.dayReport = report || 'Rapor alınamadı.';
        this.addPointsToCurrentUser(earned);
      } finally {
        this.dayReportLoading = false;
      }
    },
    getMacro(p, key) {
      if (!p || !p.macros) return 0;
      const v = Number(p.macros[key] || 0);
      return v || 0;
    },

    prettyDate(iso) {
      if (!iso) return "-";
      const d = new Date(iso);
      if (isNaN(d.getTime())) return "-";
      return d.toLocaleDateString("tr-TR", { year: "numeric", month: "short", day: "2-digit" });
    },

    loadFromStorage() {
      const users = readUsers();
      const id = getCurrentUserId();
      let u = null;
      for (let i = 0; i < users.length; i++) {
        if (users[i].id === id) { u = users[i]; break; }
      }

      this.user = u;

      this.programs = (u && Array.isArray(u.programOptions)) ? u.programOptions : [];
      this.selectedProgramId = (u && u.selectedProgramId)
        ? u.selectedProgramId
        : (this.programs[0] ? this.programs[0].id : "");

      this.programStartDate = (u && u.programStartDate) ? u.programStartDate : null;
    },

    selectProgram(id) {
      this.selectedProgramId = id;

      const users = readUsers();
      const currentId = getCurrentUserId();
      for (let i = 0; i < users.length; i++) {
        if (users[i].id === currentId) {
          users[i].selectedProgramId = id;
          break;
        }
      }
      saveUsers(users);
    }
  }
};
</script>

<style scoped>
.text-muted { color: var(--muted); }

.chip {
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 9999px;
  background: #f3f4f6;
  color: #374151;
}

.miniStat {
  border-radius: 16px;
  border: 1px solid #f3f4f6;
  background: #fff;
  padding: 12px;
}
.miniLabel { font-size: 12px; font-weight: 600; color: #6b7280; }
.miniValue { font-size: 18px; font-weight: 800; color: #111827; margin-top: 4px; }
.miniHint  { font-size: 11px; color: #9ca3af; margin-top: 2px; }
</style>