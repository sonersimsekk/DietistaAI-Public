<template>
  <div v-if="open" class="fixed inset-0 z-50 bg-white">
    <!-- Fullscreen Panel -->
    <section class="h-full w-full flex flex-col">
      <!-- Header -->
      <div class="p-5 border-b border-gray-100">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="text-xs font-semibold text-gray-500">DietistaAI</div>
            <div class="text-xl font-extrabold" style="color: var(--text)">Menü</div>
          </div>

          <button
            class="w-10 h-10 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-2xl flex items-center justify-center transition"
            @click="close"
            aria-label="Kapat"
          >
            ×
          </button>
        </div>

        <div class="mt-4 rounded-2xl p-3 border border-gray-100 bg-gradient-to-br from-indigo-50 to-sky-50">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-extrabold shadow"
                style="background: var(--primary);"
              >
                {{ userInitial }}
              </div>
              <div>
                <div class="text-sm font-extrabold text-gray-900">{{ userName }}</div>
                <div class="text-xs text-gray-500">
                  Toplam Puan: <b class="text-gray-800">{{ userPoints }}</b>
                </div>
              </div>
            </div>

            <button
              class="text-xs font-semibold px-3 py-2 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition"
              @click="openLeaderboard"
            >
              🏆 Sıralama
            </button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="p-5 flex-1 overflow-auto">
        <div class="text-xs font-semibold text-gray-500 mb-2">Menü</div>

        <button class="menuItem" @click="go('home')">🏠 Ana Sayfa</button>
        <button class="menuItem" @click="go('insights')">📊 İstatistikler</button>
        <button class="menuItem" @click="go('product-scan')">📷 Ürün Tara</button>
        <button class="menuItem" @click="go('ai-diet-chat')">💬 AI Diyet Chat</button>
        <button class="menuItem" @click="go('personalized-workout')">🏋️ Kişisel Egzersizler</button>
        <button class="menuItem" @click="go('food-suggestions')">🍽️ Yemek Önerileri</button>
        <button class="menuItem" @click="go('exercises')">🎁 Ödüller / Ürünler</button>

        <!-- Gösterimlik Destek Bölümü -->
        <div class="mt-6 pt-4 border-t border-gray-100">
          <div class="text-xs font-semibold text-gray-500 mb-2">Destek</div>

          <button class="menuItem ghost" type="button">❓ SSS</button>
          <button class="menuItem ghost" type="button">📝 Geri Bildirim</button>
          <button class="menuItem ghost" type="button">📩 İletişim</button>
          <button class="menuItem ghost" type="button">ℹ️ Hakkımızda</button>
        </div>

        <!-- Hesap -->
        <div class="mt-6 pt-4 border-t border-gray-100">
          <div class="text-xs font-semibold text-gray-500 mb-2">Hesap</div>

          <button class="menuItem danger" @click="logout">
            🚪 Oturumu Kapat
          </button>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-5 border-t border-gray-100">
        <div class="text-[11px] text-gray-500">DietistaAI • Modern demo menü</div>
      </div>
    </section>

    <!-- Leaderboard Modal -->
    <div v-if="showLeaderboard" class="fixed inset-0 z-[60] flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="closeLeaderboard"></div>

      <div class="relative w-[92vw] max-w-sm rounded-3xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
        <div class="p-4 border-b border-gray-100 bg-gradient-to-br from-indigo-50 to-sky-50">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs font-semibold text-gray-500">DietistaAI</div>
              <div class="text-lg font-extrabold text-gray-900">🏆 Kullanıcı Sıralaması</div>
            </div>
            <button
              class="w-9 h-9 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xl flex items-center justify-center transition"
              @click="closeLeaderboard"
              aria-label="Kapat"
            >
              ×
            </button>
          </div>
        </div>

        <div class="p-4">
          <div v-if="!leaderboard.length" class="text-sm text-gray-500">
            Henüz kullanıcı yok.
          </div>

          <div v-else class="space-y-2 max-h-[360px] overflow-auto pr-1">
            <div
              v-for="(u, i) in leaderboard"
              :key="u.id"
              class="rowItem"
              :class="rowClass(i)"
            >
              <div class="flex items-center gap-3">
                <div class="rank">
                  {{ rankLabel(i) }}
                </div>

                <div class="min-w-0">
                  <div class="text-sm font-extrabold text-gray-900 truncate">{{ u.name }}</div>
                  <div class="text-[11px] text-gray-500">Kullanıcı</div>
                </div>
              </div>

              <div class="text-right">
                <div class="text-xs text-gray-500">Puan</div>
                <div class="text-lg font-extrabold" style="color: var(--primary)">{{ u.points }}</div>
              </div>
            </div>
          </div>

          <div class="mt-4">
            <button class="buttonLike" @click="closeLeaderboard">Kapat</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
const LS_USERS = "dietista_users";
const LS_CURRENT = "dietista_current_user_id";

function safeParse(raw) {
  try { return JSON.parse(raw); } catch (e) { return null; }
}

export default {
  name: "MoreMenu",
  props: {
    open: { type: Boolean, default: false }
  },
  data() {
    return {
      showLeaderboard: false,
      leaderboard: []
    };
  },
  computed: {
    currentUser() {
      const users = safeParse(localStorage.getItem(LS_USERS)) || [];
      const id = localStorage.getItem(LS_CURRENT) || "";
      if (!Array.isArray(users)) return null;
      for (let i = 0; i < users.length; i++) {
        if (users[i].id === id) return users[i];
      }
      return null;
    },
    userName() {
      return (this.currentUser && this.currentUser.name) ? this.currentUser.name : "Misafir";
    },
    userInitial() {
      const n = this.userName || "";
      return n.trim().slice(0, 1).toUpperCase() || "D";
    },
    userPoints() {
      const p = this.currentUser && this.currentUser.points != null ? Number(this.currentUser.points) : 0;
      return isNaN(p) ? 0 : p;
    }
  },
  methods: {
    close() {
      this.$emit("close");
    },
    go(key) {
      if (this.$store && this.$store.commit) {
        this.$store.commit("setActiveComponent", key);
      }
      this.close();
      window.scrollTo(0, 0);
    },
    logout() {
      localStorage.removeItem(LS_CURRENT);
      this.$emit("logout");
      this.close();
      window.scrollTo(0, 0);
    },

    openLeaderboard() {
      const users = safeParse(localStorage.getItem(LS_USERS)) || [];
      const list = Array.isArray(users) ? users : [];

      this.leaderboard = list
        .map(u => ({
          id: u.id,
          name: String(u.name || "Kullanıcı"),
          points: Number(u.points || 0) || 0
        }))
        .sort((a, b) => b.points - a.points);

      this.showLeaderboard = true;
    },
    closeLeaderboard() {
      this.showLeaderboard = false;
    },
    rankLabel(i) {
      if (i === 0) return "🥇";
      if (i === 1) return "🥈";
      if (i === 2) return "🥉";
      return String(i + 1);
    },
    rowClass(i) {
      if (i === 0) return "rowTop1";
      if (i === 1) return "rowTop2";
      if (i === 2) return "rowTop3";
      return "";
    }
  }
};
</script>

<style scoped>
.menuItem{
  width:100%;
  text-align:left;
  padding:12px 12px;
  border-radius:16px;
  border:1px solid #f3f4f6;
  background:#fff;
  color:#111827;
  font-weight:800;
  font-size:14px;
  transition: all .15s ease;
  margin-bottom:10px;
}
.menuItem:hover{
  background:#f9fafb;
  transform: translateY(-1px);
}
.menuItem.ghost{
  background:#fff;
  color:#374151;
  font-weight:700;
}
.menuItem.ghost:hover{
  background:#f3f4f6;
  transform: none;
}
.menuItem.danger{
  border-color:#fee2e2;
  background:#fff5f5;
  color:#b91c1c;
}
.menuItem.danger:hover{
  background:#ffecec;
}

.rowItem{
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:12px 12px;
  border-radius:18px;
  border:1px solid #f3f4f6;
  background:#fff;
}
.rank{
  width:34px;
  height:34px;
  border-radius:14px;
  display:flex;
  align-items:center;
  justify-content:center;
  background:#f3f4f6;
  font-weight:800;
}

.rowTop1{ background:#fff7ed; border-color:#fed7aa; }
.rowTop2{ background:#f8fafc; border-color:#e5e7eb; }
.rowTop3{ background:#fef2f2; border-color:#fecaca; }

.buttonLike{
  width:100%;
  padding:12px 14px;
  border-radius:18px;
  border:1px solid #e5e7eb;
  background:#fff;
  font-weight:800;
  color:#111827;
  transition: all .15s ease;
}
.buttonLike:hover{
  background:#f9fafb;
}
</style>
