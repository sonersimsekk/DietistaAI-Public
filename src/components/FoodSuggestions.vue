<template>
  <div class="w-full max-w-md mx-auto py-8 px-4">
    <!-- Başlık -->
    <h2 class="text-2xl font-bold mb-6 text-center" style="color: var(--text)">Yemek Önerileri</h2>

    <!-- Malzeme giriş alanı -->
    <div class="card rounded-2xl p-6 mt-4">
      <h3 class="text-lg font-bold mb-3" style="color: var(--muted)">Malzemeler (opsiyonel)</h3>

      <form @submit.prevent="addIngredient">
        <input
          v-model="ingredientInput"
          class="w-full mb-3 px-3 py-2 rounded bg-[var(--bg-soft)] text-[var(--text)] placeholder-[var(--muted)] outline-none"
          placeholder="Örn: tavuk, domates, yoğurt"
        />
      </form>

      <div class="flex flex-wrap gap-2 mb-4">
        <span
          v-for="(item, idx) in ingredients"
          :key="idx"
          class="px-4 py-1 rounded-full flex items-center"
          style="background: rgba(139,92,246,0.15); color: #8b5cf6; border: 1px solid rgba(139,92,246,0.3);"
        >
          {{ item }}
          <button class="ml-2 font-bold" style="color: #8b5cf6;" @click="removeIngredient(idx)">×</button>
        </span>
      </div>

      <button
        class="w-full py-2 font-medium rounded-full text-white text-lg font-bold disabled:opacity-60"
        style="background: #8b5cf6; box-shadow: 0 6px 16px rgba(139,92,246,.25);"
        :disabled="loading"
        @click="fetchSuggestions"
      >
        <span v-if="!loading">Yemek Öner</span>
        <span v-else>Öneriler getiriliyor…</span>
      </button>

      <div v-if="errorMsg" class="mt-3 text-sm" style="color: var(--danger)">{{ errorMsg }}</div>
      <div v-if="successMsg" class="mt-3 text-sm text-emerald-700">{{ successMsg }}</div>
    </div>

    <!-- Öneri listesi -->
    <div v-if="suggestions.length" class="mt-6 grid gap-4">
      <div v-for="(m, i) in suggestions" :key="i" class="card p-4">
        <div class="flex items-center justify-between mb-1">
          <h4 class="font-semibold text-lg" style="color: var(--text)">{{ m.title }}</h4>
          <span class="badge ok">{{ m.calories }} kcal</span>
        </div>

        <div class="text-sm text-muted mb-2">
          P: {{ (m.macros && m.macros.protein_g) }}g • K: {{ (m.macros && m.macros.carb_g) }}g • Y: {{ (m.macros && m.macros.fat_g) }}g
        </div>

        <div v-if="m.flags && m.flags.length" class="flex flex-wrap gap-2 mb-2">
          <span v-for="(f,fi) in m.flags" :key="fi" class="badge">{{ f }}</span>
        </div>

        <div v-if="m.ingredients && m.ingredients.length" class="text-sm text-muted mb-2">
          <strong style="color: var(--text)">Malzemeler:</strong>
          {{ m.ingredients.join(', ') }}
        </div>

        <p class="text-sm" style="color: var(--text)">{{ m.why_for_you }}</p>

        <div class="flex justify-end gap-2 mt-3">
          <button class="button ghost" @click="toggleExpand(i)">
            {{ expanded[i] ? 'Detayı Gizle' : 'Detayı Göster' }}
          </button>
          <button class="button" @click="openMealPicker(i)">Öğüne ekle</button>
        </div>

        <div v-if="expanded[i] && m.recipe_steps && expanded[i] && m.recipe_steps.length" class="mt-3">
          <strong style="color: var(--text)">Tarif Adımları:</strong>
          <ol class="list-decimal ml-5 mt-1 text-sm text-muted">
            <li v-for="(step, si) in m.recipe_steps" :key="si">{{ step }}</li>
          </ol>
        </div>
      </div>
    </div>
    <div v-else-if="!loading" class="mt-6 text-center text-muted text-sm">
      Henüz öneri yok. Malzeme yazıp “Yemek Öner”e tıklayın.
    </div>

    <!-- Öğün seçici (aynı root içinde) -->
    <div
      v-if="showMealPicker"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl p-6 w-[90%] max-w-sm space-y-4">
        <h3 class="text-lg font-semibold" style="color: var(--text)">Hangi öğüne eklensin?</h3>
        <div class="grid grid-cols-2 gap-3">
          <button class="button" @click="chooseMeal('breakfast')">Kahvaltı</button>
          <button class="button" @click="chooseMeal('lunch')">Öğle</button>
          <button class="button" @click="chooseMeal('dinner')">Akşam</button>
          <button class="button" @click="chooseMeal('snack')">Ara</button>
        </div>
        <div class="flex justify-end">
          <button class="button ghost" @click="showMealPicker=false">Vazgeç</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getMealSuggestions } from '@/api/openrouter';

export default {
  name: 'FoodSuggestions',
  data() {
    return {
      ingredientInput: '',
      ingredients: [],
      suggestions: [],
      loading: false,
      errorMsg: '',
      successMsg: '',
      abortController: null,
      expanded: {},
      showMealPicker: false,
      pickerIndex: null,
    };
  },
  methods: {
    addIngredient() {
      const val = this.ingredientInput.trim();
      if (val && !this.ingredients.includes(val)) this.ingredients.push(val);
      this.ingredientInput = '';
    },
    removeIngredient(idx) {
      this.ingredients.splice(idx, 1);
    },
    toggleExpand(i) {
      this.$set(this.expanded, i, !this.expanded[i]);
    },
    openMealPicker(i) {
      this.pickerIndex = i;
      this.showMealPicker = true;
    },
    chooseMeal(mealId) {
      this.showMealPicker = false;
      if (this.pickerIndex == null) return;
      const m = this.suggestions[this.pickerIndex];
      if (!m) return;
      window.dispatchEvent(new CustomEvent('diet:addMeal', {
        detail: {
          mealId,
          title: m.title,
          kcal: Number(m.calories) || 0,
          macros: m.macros || null
        }
      }));
      const mealNames = { breakfast: "Kahvaltı", lunch: "Öğle", dinner: "Akşam", snack: "Ara" };
      this.successMsg = "“" + m.title + "” " + (mealNames[mealId] || "seçilen") + " öğününe eklendi.";
      this.pickerIndex = null;
    },
    async fetchSuggestions() {
      this.errorMsg = '';
      this.successMsg = '';
      this.suggestions = [];
      this.loading = true;

      if (this.abortController) this.abortController.abort();
      const controller = new AbortController();
      this.abortController = controller;

      try {
        const raw = await getMealSuggestions(this.ingredients, controller.signal);
        const clean = String(raw || '').trim()
          .replace(/^```json/i, '')
          .replace(/^```/, '')
          .replace(/```$/, '');
        const parsed = JSON.parse(clean);

        if (!parsed?.meals?.length) {
          this.errorMsg = 'Öneri bulunamadı. Malzeme ekleyip tekrar deneyin.';
        } else {
          this.suggestions = parsed.meals.slice(0, 5);
        }
      } catch (e) {
        if (e?.name === 'AbortError') return;
        console.error(e);
        this.errorMsg = 'Öneriler alınırken bir sorun oluştu.';
      } finally {
        if (this.abortController === controller) this.abortController = null;
        this.loading = false;
      }
    },
    addMealToPlan(meal) {
      alert(`${meal.title} öğününe eklendi.`);
    }
  }
};
</script>
