<template>
  <div class="flex flex-col items-center w-full min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <div
      v-if="loading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
    >
      <div class="bg-white rounded-3xl shadow-xl border border-white/40 px-6 py-5 w-[min(420px,92vw)]">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 text-white flex items-center justify-center">
            ⏳
          </div>
          <div>
            <div class="text-sm font-extrabold text-slate-900">{{ loadingText }}</div>
            <div class="text-xs text-slate-600 mt-0.5">Lütfen bekle…</div>
          </div>
        </div>
      
        <div class="mt-4 h-2 rounded-full bg-slate-100 overflow-hidden">
          <div class="h-2 rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 animate-pulse" style="width: 60%"></div>
        </div>
      </div>
    </div>
    <!-- ✅ Home.vue'daki Logo Section (aynısı) -->
    <div
      class="flex items-center gap-4 mt-8 mb-6 bg-white/80 backdrop-blur-sm rounded-3xl p-6 px-8 shadow-lg border border-white/20 animate-fade-in-up"
    >
      <img src="@/assets/logo.png" class="w-20 h-20 drop-shadow-lg" alt="DietistaAI Logo" />
      <div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          DietistaAI
        </h1>
        <p class="text-sm text-gray-600 mt-1">Akıllı Beslenme Asistanı</p>
      </div>
    </div>

    <div class="w-full max-w-3xl animate-fade-in-up" style="animation-delay: 0.05s;">
      <!-- Ana Kart -->
      <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6 hover-lift">
        <!-- Başlık -->
        <div class="mb-4">
          <h2 class="text-xl font-extrabold text-gray-900">Hesap Seçimi</h2>
          <p class="text-sm text-gray-600 mt-1">
            Devam etmek için bir kullanıcı seç veya yeni kullanıcı oluştur.
          </p>
        </div>

        <!-- Kullanıcı Listesi -->
        <div class="flex items-center justify-between mb-3">
          <div class="text-sm font-semibold text-gray-700">Kayıtlı Kullanıcılar</div>
          <span class="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
            {{ users.length }} kişi
          </span>
        </div>

        <div v-if="users.length === 0" class="rounded-2xl border border-gray-200 bg-white p-4">
          <div class="text-sm font-semibold text-gray-900">Henüz kullanıcı yok</div>
          <div class="text-sm text-gray-600 mt-1">
            Yeni kullanıcı oluşturarak başlayabilirsin.
          </div>
        </div>

        <div v-else class="space-y-2">
          <button
            v-for="u in users"
            :key="u.id"
            class="w-full text-left rounded-2xl border bg-white px-4 py-3 shadow-sm hover:bg-gray-50 transition"
            :class="u.id === currentUserId ? 'border-blue-600 ring-2 ring-blue-100' : 'border-gray-200'"
            @click="selectUser(u.id)"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <div class="font-extrabold text-gray-900 truncate">
                    {{ u.name }} {{ u.surname }}
                  </div>
                  <span
                    v-if="u.id === currentUserId"
                    class="text-[11px] font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100"
                  >
                    Seçili
                  </span>
                </div>

                <div class="text-xs text-gray-500 mt-1">
                  {{ u.age }} yaş • {{ u.height }} cm • {{ u.weight }} kg • {{ u.gender }}
                </div>

                <div class="mt-2 flex flex-wrap gap-2">
                  <span class="chip">Aktivite: {{ u.activityLevel || "Orta" }}</span>
                  <span class="chip">Hedef: {{ u.goal || "—" }}</span>
                  <span class="chip">Hassasiyet: {{ u.diseases || "Yok" }}</span>
                  <span class="chip">Alerji: {{ u.allergies || "Yok" }}</span>
                </div>
              </div>

              <!-- Sil -->
              <button
                class="shrink-0 text-xs font-semibold px-3 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50"
                @click.stop="askDelete(u)"
                title="Sil"
              >
                Sil
              </button>
            </div>
          </button>
        </div>

        <!-- ✅ Kullanıcı aksiyonları -->
        <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <!-- Yeni Kullanıcı Toggle -->
          <button
            class="rounded-2xl bg-white border border-gray-200 px-4 py-3 text-sm font-semibold shadow-sm hover:bg-gray-50 transition"
            @click="toggleCreate"
          >
            <span v-if="!showCreate">+ Yeni Kullanıcı</span>
            <span v-else>× Yeni Kullanıcıyı Kapat</span>
          </button>
        </div>

        <!-- ✅ Giriş Yap / Kayıt Ol butonu (kuralına göre) -->
        <div class="mt-4">
          <!-- showCreate değilse: kullanıcı seçiliyse giriş yap -->
          <button
            v-if="!showCreate"
            class="w-full rounded-2xl px-4 py-3 text-sm font-semibold shadow transition
                   bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:opacity-95 active:opacity-90
                   disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!currentUserId"
            @click="goApp"
          >
            Giriş Yap
          </button>

          <!-- showCreate ise: kayıt ol -->
          <button
            v-else
            class="w-full rounded-2xl px-4 py-3 text-sm font-semibold shadow transition
                   bg-slate-900 text-white hover:opacity-95 active:opacity-90"
            @click="createUser"
          >
            Kayıt Ol
          </button>

          <div class="text-center text-xs text-gray-500 mt-2">
            Seçili kullanıcı:
            <span class="font-semibold text-gray-800">{{ currentUserName || "Yok" }}</span>
          </div>
        </div>

        <!-- ✅ Yeni Kullanıcı Formu (toggle ile açılır) -->
        <div v-if="showCreate" class="mt-6 pt-6 border-t border-gray-200">
          <div class="flex items-center justify-between gap-3 mb-3">
            <div>
              <div class="text-lg font-extrabold text-gray-900">Yeni Kullanıcı Oluştur</div>
              <div class="text-sm text-gray-600">Bilgileri doldur, “Kayıt Ol” ile ekle.</div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="lbl">Ad</label>
              <input v-model="form.name" class="inp" placeholder="Ad" />
            </div>
            <div>
              <label class="lbl">Soyad</label>
              <input v-model="form.surname" class="inp" placeholder="Soyad" />
            </div>

            <div>
              <label class="lbl">Yaş</label>
              <input v-model.number="form.age" type="number" class="inp" placeholder="Yaş" />
            </div>
            <div>
              <label class="lbl">Cinsiyet</label>
              <input v-model="form.gender" class="inp" placeholder="Cinsiyet" />
            </div>

            <div>
              <label class="lbl">Boy (cm)</label>
              <input v-model.number="form.height" type="number" class="inp" placeholder="Boy (cm)" />
            </div>
            <div>
              <label class="lbl">Kilo (kg)</label>
              <input v-model.number="form.weight" type="number" class="inp" placeholder="Kilo (kg)" />
            </div>
          </div>

          <div class="mt-2 grid grid-cols-1 gap-2">
            <div>
              <label class="lbl">Hedef</label>
              <input v-model="form.goal" class="inp" placeholder="Hedef (örn: Yağ yakımı)" />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="lbl">Aktivite</label>
                <input v-model="form.activityLevel" class="inp" placeholder="Düşük/Orta/Yüksek" />
              </div>
              <div>
                <label class="lbl">Hassasiyet</label>
                <input v-model="form.diseases" class="inp" placeholder="örn: Gluten intoleransı" />
              </div>
            </div>

            <div>
              <label class="lbl">Alerji</label>
              <input v-model="form.allergies" class="inp" placeholder="örn: Fındık" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ✅ Silme Onayı Modal -->
    <div
      v-if="deleteModalOpen"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in-up"
    >
      <div class="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-white/20">
        <div class="text-lg font-extrabold text-gray-900">Kullanıcı Silinsin mi?</div>
        <p class="text-sm text-gray-600 mt-2">
          <b>
            {{ deleteTarget && deleteTarget.name }}
            {{ deleteTarget && deleteTarget.surname }}
          </b>
          kullanıcısını silmek üzeresin.
          Bu işlem geri alınamaz.
        </p>

        <div class="mt-5 grid grid-cols-2 gap-2">
          <button
            class="rounded-2xl bg-white border border-gray-200 px-4 py-3 text-sm font-semibold hover:bg-gray-50 transition"
            @click="closeDeleteModal"
          >
            Vazgeç
          </button>
          <button
            class="rounded-2xl bg-red-600 text-white px-4 py-3 text-sm font-semibold hover:bg-red-700 transition"
            @click="confirmDelete"
          >
            Evet, Sil
          </button>
        </div>
      </div>
    </div>

    <div class="text-center text-xs text-gray-500 mt-6 mb-6">
      DietistaAI • Kullanıcı giriş ekranı
    </div>
  </div>
</template>

<script>
import { generateOnboardingPlans } from "@/api/openrouter";
const LS_USERS = "dietista_users";
const LS_CURRENT = "dietista_current_user_id";

function safeParseJSON(raw) {
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export default {
  name: "Start",
  data() {
    return {
      users: [],
      currentUserId: "",
      showCreate: false,
      loading: false,
      loadingText: "Programlar hazırlanıyor…",
      deleteModalOpen: false,
      deleteTarget: null,

      form: {
        name: "",
        surname: "",
        age: 25,
        gender: "Belirtilmedi",
        height: 170,
        weight: 70,
        activityLevel: "Orta",
        goal: "Form ve Sağlık",
        neededCalories: 2100,
        diseases: "Yok",
        allergies: "Yok",
        dailyWaterIntake: 2.0,
        macros: { protein: 120, carbs: 220, fat: 60 },
      },
    };
  },

  computed: {
    currentUserName() {
      const u = this.users.find((x) => x.id === this.currentUserId);
      if (!u) return "";
      return ((u.name || "") + " " + (u.surname || "")).trim();
    },
  },

  mounted() {
    this.load();
    // hiç kullanıcı yoksa demo kullanıcı ekle (sunum rahatlığı)
    if (this.users.length === 0) this.seedDefaultUser();
  },

  methods: {
    load() {
      const list = safeParseJSON(localStorage.getItem(LS_USERS));
      this.users = Array.isArray(list) ? list : [];

      const current = localStorage.getItem(LS_CURRENT);
      // ✅ varsa seçili göster, yoksa boş bırak (kullanıcı seçsin)
      this.currentUserId = current || "";
    },

    persist() {
      localStorage.setItem(LS_USERS, JSON.stringify(this.users));
      if (this.currentUserId) localStorage.setItem(LS_CURRENT, this.currentUserId);
    },

    selectUser(id) {
      this.currentUserId = id;
      this.showCreate = false; // seçim yapınca formu kapatalım (UX)
      this.$store.commit("setCurrentUser", id);
      this.$store.commit("loadUserTracking", id);
      this.persist();
    },

    toggleCreate() {
      this.showCreate = !this.showCreate;
      // form açıldıysa seçimi kaldırmak istersen bunu açabilirsin:
      // if (this.showCreate) this.currentUserId = "";
    },

    async createUser() {
      this.loading = true;
      try {
        // 1) Sadece kayıt alanları
        const registration = {
          name: (this.form.name || "").trim(),
          surname: (this.form.surname || "").trim(),
          age: Number(this.form.age || 25),
          gender: this.form.gender || "Belirtilmedi",
          height: Number(this.form.height || 170),
          weight: Number(this.form.weight || 70),
          goal: this.form.goal || "Form ve Sağlık",
          activityLevel: this.form.activityLevel || "Orta",
          diseases: this.form.diseases || "Yok",
          allergies: this.form.allergies || "Yok"
        };

        if (!registration.name) {
          alert("Kayıt için ad gerekli.");
          return;
        }
      
        // 2) AI hesaplasın
        const { computed_profile, programs } = await generateOnboardingPlans(registration);
      
        // 3) Kullanıcı objesini AI verileriyle tamamla
        const id = "u_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
      
        const newUser = {
          id,
          ...registration,
          neededCalories: Number(computed_profile.neededCalories),
          dailyWaterIntake: Number(computed_profile.dailyWaterIntake),
          macros: {
            protein: Number(computed_profile.macros.protein),
            carbs: Number(computed_profile.macros.carbs),
            fat: Number(computed_profile.macros.fat),
          },
        
          // program seçenekleri
          programOptions: programs,
          selectedProgramId: programs?.[0]?.id || "easy",
          programStartDate: new Date().toISOString(),
        
          // gamification alanları (istersen)
          points: 80,
          badges: []
        };
      
        // 4) localStorage'a yaz + current set
        const users = JSON.parse(localStorage.getItem("dietista_users") || "[]");
        users.push(newUser);
        localStorage.setItem("dietista_users", JSON.stringify(users));
        localStorage.setItem("dietista_current_user_id", id);

        this.users = users;
        this.currentUserId = id;
        this.$store.commit("setCurrentUser", id);
        this.$store.commit("loadUserTracking", id);
        this.$store.commit("resetTracking");
      
        // 5) Uygulamaya geç
        this.showCreate = false;
        this.$store.commit("setActiveComponent", "home");
      } catch (e) {
        console.error(e);
        const detail = e && e.response && e.response.data && e.response.data.error;
        alert(detail || "Program oluşturulamadı. Lütfen tekrar deneyin.");
      } finally {
        this.loading = false;
      }
    },

    // ✅ Silme onayı
    askDelete(user) {
      this.deleteTarget = user;
      this.deleteModalOpen = true;
    },

    closeDeleteModal() {
      this.deleteModalOpen = false;
      this.deleteTarget = null;
    },

    confirmDelete() {
      if (!this.deleteTarget) return;

      const id = this.deleteTarget.id;
      this.users = this.users.filter((u) => u.id !== id);

      if (this.currentUserId === id) {
        this.currentUserId = "";
        localStorage.removeItem(LS_CURRENT);
        this.$store.commit("setCurrentUser", null);
      }

      localStorage.removeItem("tracking:" + id);
      localStorage.removeItem("dietista_redeemed_" + id);
      localStorage.setItem(LS_USERS, JSON.stringify(this.users));
      this.closeDeleteModal();
    },

    seedDefaultUser() {
      const already = this.users.some((u) => u.id === "u_seed_soner");
      if (already) return;

      const demo = {
        id: "u_seed_soner",
        name: "Soner",
        surname: "Şimşek",
        age: 17,
        gender: "Erkek",
        height: 175,
        weight: 70,
        activityLevel: "Düşük",
        goal: "Kas Kütlesi Arttırma ve Yağ Yakımı",
        neededCalories: 2100,
        diseases: "Gluten intoleransı",
        allergies: "Yok",
        dailyWaterIntake: 2.5,
        macros: { protein: 150, carbs: 230, fat: 45 },
      };

      this.users.push(demo);
      // ✅ otomatik seçmek istemiyorsan currentUserId'yi set etmiyoruz
      localStorage.setItem(LS_USERS, JSON.stringify(this.users));
    },

    goApp() {
      this.$store.commit("setCurrentUser", this.currentUserId);
      this.$store.commit("loadUserTracking", this.currentUserId);
      this.$store.commit("setActiveComponent", "home");
      if (!this.currentUserId) return;

      // Kullanıcıyı kaydet
      localStorage.setItem("dietista_current_user_id", this.currentUserId);

      // Router yerine event fırlatıyoruz
      console.log(this.currentUserId);
      this.$emit('next'); 
    }
  },
};
</script>

<style scoped>
.inp {
  @apply w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none
    focus:ring-2 focus:ring-blue-200;
}
.lbl {
  @apply block text-xs font-semibold text-gray-600 mb-1;
}
.chip {
  @apply text-[11px] font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700;
}
</style>
