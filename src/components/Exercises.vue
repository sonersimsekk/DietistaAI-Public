<template>
  <div class="w-full flex flex-col items-center px-3 py-4">
    <!-- Points / Status -->
    <div class="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
      <div class="card p-4 shadow-sm border border-gray-100 bg-white">
      <!-- ÜST SATIR -->
      <div class="flex items-center justify-between">
        <!-- Sol: Kullanıcı -->
        <div class="flex items-center gap-3">
          <!-- Avatar -->
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-white"
            style="background: linear-gradient(135deg, #4f46e5, #06b6d4)"
          >
            {{ userInitial }}
          </div>
        
          <!-- İsim -->
          <div>
            <div class="text-xs text-gray-500 font-semibold">Hoş geldin</div>
            <div class="text-sm font-extrabold text-gray-900">
              {{ userName }}
            </div>
          </div>
        </div>
      
        <!-- Sağ: Puan -->
        <div class="flex items-center gap-2">
          <div class="text-right">
            <div class="text-xs font-semibold text-gray-500">Toplam Puan</div>
            <div class="text-2xl font-extrabold text-gray-900">
              {{ points }}
            </div>
          </div>
        </div>
      </div>
    
      <!-- ALT KISIM (AYNI KALIYOR) -->
      <div class="mt-4">
        <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Seviye: <b class="text-gray-700">{{ levelName }}</b></span>
          <span><b class="text-gray-700">{{ levelProgress }}%</b></span>
        </div>
        <div class="h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            class="h-2 rounded-full bg-gradient-to-r from-indigo-600 to-sky-500"
            :style="{ width: levelProgress + '%' }"
          ></div>
        </div>
        <div class="text-[11px] text-gray-500 mt-2">
          Bir sonraki seviyeye: <b class="text-gray-700">{{ pointsToNext }}</b> puan
        </div>
      </div>
    </div>

      <!-- <div class="card p-4 shadow-sm border border-gray-100 bg-white">
        <div class="flex items-start justify-between">
          <div>
            <div class="text-xs font-semibold text-gray-500">Bugünün Hedefi</div>
            <div class="text-lg font-extrabold" style="color: var(--text)">
              100 puana ulaş
            </div>
            <div class="text-xs text-gray-500 mt-1">
              Mini görevlerle hızlı puan kazan.
            </div>
          </div>
          <div class="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
            +10 / görev
          </div>
        </div>

        <div class="mt-3 grid grid-cols-2 gap-2">
          <button class="button secondary focus-ring text-sm py-2" @click="addPoints(10)">
            Su hedefi (+10)
          </button>
          <button class="button secondary focus-ring text-sm py-2" @click="addPoints(10)">
            10dk yürüyüş (+10)
          </button>
          <button class="button secondary focus-ring text-sm py-2" @click="addPoints(10)">
            Ürün tarama (+10)
          </button>
          <button class="button secondary focus-ring text-sm py-2" @click="addPoints(10)">
            Sağlıklı öğün (+10)
          </button>
        </div>

        <div class="text-[11px] text-gray-500 mt-3">
          * Sunum için: Bu butonlar demo amaçlı hızlı puan ekler.
        </div>
      </div> -->
    </div>

    <!-- Products -->
    <div class="w-full max-w-5xl">
      <div class="flex items-center justify-between mb-3">
        <div class="text-lg font-extrabold" style="color: var(--text)">Dietista Ürünleri</div>
        <div class="text-xs text-gray-500">
          {{ products.length }} ürün
        </div>
      </div>

      <!-- 2'li grid (Trendyol hissi) -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div
          v-for="p in products"
          :key="p.id"
          class="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden"
        >
          <!-- Image -->
          <div class="relative">
            <img :src="p.image" :alt="p.title" class="w-full h-36 object-cover" />
            <div class="absolute top-2 left-2 flex gap-2">
              <span class="badge-discount">%{{ p.discount }} indirim</span>
            </div>
            <div class="absolute bottom-2 left-2 right-2 flex items-center justify-between">
              <div class="rating">
                <span v-for="n in 5" :key="n" class="star" :class="n <= p.rating ? 'on' : ''">★</span>
                <span class="text-[11px] text-white/90 ml-1">({{ p.reviews }})</span>
              </div>
              <span class="badge-points">{{ p.pointsCost }}p</span>
            </div>
          </div>

          <!-- Content -->
          <div class="p-3">
            <div class="text-[11px] text-gray-500 font-semibold">{{ p.brand }} - {{ p.subtext }}</div>
            <div class="text-sm font-extrabold text-gray-900 leading-snug line-clamp-2 mt-0.5">
              {{ p.title }}
            </div>

            <div class="mt-2 flex items-end justify-between">
              <div>
                <div class="text-[11px] text-gray-400 line-through">
                  {{ formatPrice(p.oldPrice) }}
                </div>
                <div class="text-base font-extrabold text-gray-900">
                  {{ formatPrice(p.price) }}
                </div>
              </div>

              <div class="text-right">
                <div class="text-[11px] font-semibold text-gray-500">Kupon</div>
                <div class="text-xs font-extrabold text-indigo-700">
                  {{ p.discountText }}
                </div>
              </div>
            </div>

            <div class="mt-3">
              <button
                class="w-full rounded-2xl px-3 py-2 text-sm font-semibold shadow-sm transition"
                :class="redeemed[p.id]
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                  : canRedeem(p) ? 'bg-slate-900 text-white hover:opacity-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'"
                :disabled="!canRedeem(p) || redeemed[p.id]"
                @click="redeem(p)"
              >
                <span v-if="redeemed[p.id]">✅ Kazanıldı</span>
                <span v-else-if="canRedeem(p)">Kuponu Al</span>
                <span v-else>{{ needMorePoints(p) }} puan daha gerek</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="toast"
      class="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-2xl shadow-lg"
    >
      {{ toast }}
    </div>
  </div>
</template>

<script>
// Bu sayfa: Puan & Ürün vitrini
// Puanlar basitçe localStorage'da current user üzerinden saklanır.
const LS_USERS = "dietista_users";
const LS_CURRENT = "dietista_current_user_id";

function safeParse(raw) {
  try { return JSON.parse(raw); } catch (e) { return null; }
}

function readUsers() {
  const arr = safeParse(localStorage.getItem(LS_USERS));
  return Array.isArray(arr) ? arr : [];
}

function writeUsers(users) {
  localStorage.setItem(LS_USERS, JSON.stringify(users));
}

function getCurrentUserId() {
  return localStorage.getItem(LS_CURRENT) || "";
}

// Basit placeholder görseller (dış marka yok)
function svgData(title, accent1, accent2) {
  const t = String(title || "Dietista").slice(0, 24);
  const svg =
`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${accent1}"/>
      <stop offset="1" stop-color="${accent2}"/>
    </linearGradient>
  </defs>
  <rect width="640" height="360" rx="32" fill="url(#g)"/>
  <circle cx="520" cy="90" r="70" fill="rgba(255,255,255,0.18)"/>
  <circle cx="120" cy="260" r="90" fill="rgba(255,255,255,0.14)"/>
  <text x="44" y="190" font-size="44" font-family="Inter, Arial" font-weight="800" fill="white">${t}</text>
  <text x="44" y="230" font-size="18" font-family="Inter, Arial" font-weight="600" fill="rgba(255,255,255,0.85)">
    Dietista Collection
  </text>
</svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

export default {
  name: 'Exercises',
  data() {
    return {
      points: 0,
      redeemed: {}, // { [productId]: true }
      toast: "",

      products: [
        {
          id: "p1",
          brand: "Dietista",
          title: "Dietista Glutensiz Gofret - Kakao Aromalı",
          subtext: "Pratik atıştırmalık",
          oldPrice: 119.9,
          price: 99.9,
          discount: 15,
          discountText: "%15 indirim",
          pointsCost: 120,
          rating: 5,
          reviews: 328,
          freeShip: true,
          image: svgData("Glutensiz", "#4f46e5", "#06b6d4"),
        },
        {
          id: "p2",
          brand: "Dietista",
          title: "Dietista Protein Bar – Vanilya Aromalı",
          subtext: "Glutensiz • Hafif tatlı kaçamak",
          oldPrice: 89.9,
          price: 74.9,
          discount: 20,
          discountText: "%20 indirim",
          pointsCost: 160,
          rating: 4,
          reviews: 214,
          freeShip: false,
          image: svgData("Protein Bar", "#0ea5e9", "#22c55e"),
        },
        {
          id: "p3",
          brand: "Dietista",
          title: "Dietista Fit Granola – Yaban Mersini",
          subtext: "Lif kaynağı • Kahvaltıya uygun",
          oldPrice: 149.9,
          price: 124.9,
          discount: 15,
          discountText: "%15 indirim",
          pointsCost: 140,
          rating: 5,
          reviews: 186,
          freeShip: true,
          image: svgData("Granola", "#6366f1", "#10b981"),
        },
        {
          id: "p4",
          brand: "Dietista",
          title: "Dietista Elektrolit İçecek – Limon",
          subtext: "Antrenman sonrası • Ferah",
          oldPrice: 69.9,
          price: 54.9,
          discount: 10,
          discountText: "%10 indirim",
          pointsCost: 80,
          rating: 4,
          reviews: 97,
          freeShip: false,
          image: svgData("Elektrolit", "#06b6d4", "#a855f7"),
        },
        {
          id: "p5",
          brand: "Dietista",
          title: "Dietista Glutensiz Pirinç Patlağı – Lif Kaynağı",
          subtext: "Günlük destek • Premium",
          oldPrice: 199.9,
          price: 129.9,
          discount: 35,
          discountText: "%35 indirim",
          pointsCost: 200,
          rating: 5,
          reviews: 412,
          freeShip: true,
          image: svgData("Pirinç Patlağı", "#3b82f6", "#22c55e"),
        },
        {
          id: "p6",
          brand: "Dietista",
          title: "Dietista Protein Shake – Çikolata",
          subtext: "Vegan • Yüksek protein",
          oldPrice: 99.9,
          price: 69.9,
          discount: 30,
          discountText: "%30 indirim",
          pointsCost: 140,
          rating: 4,
          reviews: 155,
          freeShip: true,
          image: svgData("Protein", "#111827", "#4f46e5"),
        },
      ],
    }
  },

  computed: {
    levelName() {
      if (this.points >= 500) return "Altın";
      if (this.points >= 250) return "Gümüş";
      return "Bronz";
    },
    pointsToNext() {
      if (this.points >= 500) return 0;
      if (this.points >= 250) return 500 - this.points;
      return 250 - this.points;
    },
    levelProgress() {
      if (this.points >= 500) return 100;
      if (this.points >= 250) {
        const span = 500 - 250;
        return Math.min(100, Math.max(0, Math.round(((this.points - 250) / span) * 100)));
      }
      const span = 250;
      return Math.min(100, Math.max(0, Math.round((this.points / span) * 100)));
    },
    perksTitle() {
      if (this.levelName === "Altın") return "Premium ayrıcalıklar";
      if (this.levelName === "Gümüş") return "Daha yüksek indirim";
      return "Başlangıç avantajları";
    },
    userName() {
    const users = JSON.parse(localStorage.getItem("dietista_users") || "[]");
    const id = localStorage.getItem("dietista_current_user_id");
    const u = users.find(x => x.id === id);
    return u ? `${u.name}` : "Kullanıcı";
  },
    userInitial() {
      return this.userName ? this.userName.charAt(0).toUpperCase() : "?";
    },
  },

  mounted() {
    this.loadPoints();
    this.loadRedeemed();
  },

  methods: {
    formatPrice(n) {
      const v = Number(n || 0);
      return v.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });
    },

    canRedeem(p) {
      return this.points >= Number(p.pointsCost || 0);
    },

    needMorePoints(p) {
      const need = Number(p.pointsCost || 0) - this.points;
      return need > 0 ? need : 0;
    },

    loadPoints() {
      const users = readUsers();
      const id = getCurrentUserId();
      const u = users.find(x => x.id === id);
      // user.points yoksa demo 80 ile başlat
      const p = u && typeof u.points === "number" ? u.points : 80;
      this.points = p;

      // user'a points alanını yaz (yoksa)
      if (u && typeof u.points !== "number") {
        u.points = p;
        writeUsers(users);
      }
    },

    savePoints() {
      const users = readUsers();
      const id = getCurrentUserId();
      const u = users.find(x => x.id === id);
      if (!u) return;
      u.points = this.points;
      writeUsers(users);
    },

    loadRedeemed() {
      const id = getCurrentUserId() || "guest";
      const key = "dietista_redeemed_" + id;
      const saved = safeParse(localStorage.getItem(key));
      this.redeemed = saved && typeof saved === "object" ? saved : {};
    },

    saveRedeemed() {
      const id = getCurrentUserId() || "guest";
      const key = "dietista_redeemed_" + id;
      localStorage.setItem(key, JSON.stringify(this.redeemed));
    },

    addPoints(amount) {
      const a = Number(amount || 0);
      if (!a) return;
      this.points += a;
      this.savePoints();
      this.showToast("Harika! +" + a + " puan kazandın 🎉");
    },

    redeem(p) {
      if (!p || !p.id) return;
      if (this.redeemed[p.id]) return;
      if (!this.canRedeem(p)) return;

      this.points -= Number(p.pointsCost || 0);
      this.redeemed[p.id] = true;

      this.savePoints();
      this.saveRedeemed();

      this.showToast("Kupon kazanıldı! " + p.discountText + " 🎁");
    },

    showToast(msg) {
      this.toast = msg;
      const self = this;
      clearTimeout(this._t);
      this._t = setTimeout(function () {
        self.toast = "";
      }, 2200);
    }
  }
}
</script>

<style scoped>
/* Küçük “market” dokunuşları */
.badge-discount {
  @apply text-[11px] font-extrabold px-2 py-1 rounded-full bg-white/90 text-gray-900 shadow;
}
.badge-ship {
  @apply text-[11px] font-extrabold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100;
}
.badge-points {
  @apply text-[11px] font-extrabold px-2 py-1 rounded-full bg-black/70 text-white backdrop-blur;
}

.rating {
  @apply px-2 py-1 rounded-full bg-black/45 backdrop-blur text-white flex items-center;
}
.star {
  font-size: 12px;
  opacity: 0.5;
}
.star.on {
  opacity: 1;
}

.chip {
  @apply text-[11px] font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700;
}

/* Tailwind line-clamp yoksa fallback */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>