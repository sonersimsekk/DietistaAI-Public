import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

const makeDefaultMeals = () => ([
  { id: "breakfast", name: "Kahvaltı", icon: "🍳", calories: 0, protein_g: 0, carb_g: 0, fat_g: 0 },
  { id: "lunch",     name: "Öğle",     icon: "🥗", calories: 0, protein_g: 0, carb_g: 0, fat_g: 0 },
  { id: "dinner",    name: "Akşam",    icon: "🍲", calories: 0, protein_g: 0, carb_g: 0, fat_g: 0 },
  { id: "snack",     name: "Ara",      icon: "🍎", calories: 0, protein_g: 0, carb_g: 0, fat_g: 0 },
]);

const key = (userId) => `tracking:${userId}`;

function loadTracking(userId) {
  try {
    const raw = localStorage.getItem(key(userId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function saveTracking(userId, payload) {
  try {
    localStorage.setItem(key(userId), JSON.stringify(payload));
  } catch (e) {}
}

function trackingPayload(state) {
  return {
    meals: state.meals,
    burnedCalories: state.burnedCalories,
    waterTaken: state.waterTaken,
    stepsToday: state.stepsToday,
    exerciseNote: state.exerciseNote,
  };
}

function persist(state) {
  if (!state.currentUserId) return;
  saveTracking(state.currentUserId, trackingPayload(state));
}

export default new Vuex.Store({
  state: {
    activeComponent: "start",
    stepsToday: 0,
    exerciseNote: '',
    currentUserId: null,
    meals: makeDefaultMeals(),
    burnedCalories: 0,
    waterTaken: 0,
  },

  mutations: {
    setActiveComponent(state, component) {
      state.activeComponent = component;
    },
    setStepsToday(state, steps) {
      state.stepsToday = Number(steps) || 0;
      persist(state);
    },
    setExerciseNote(state, note) {
      state.exerciseNote = String(note || '');
      persist(state);
    },
    setCurrentUser(state, userId) {
      state.currentUserId = userId;
    },
    loadUserTracking(state, userId) {
      const saved = loadTracking(userId);

      state.meals = saved?.meals?.length ? saved.meals : makeDefaultMeals();
      state.burnedCalories = Number(saved?.burnedCalories || 0);
      state.waterTaken = Number(saved?.waterTaken || 0);
      state.stepsToday = Number(saved?.stepsToday || 0);
      state.exerciseNote = String(saved?.exerciseNote || "");
    },

    // ✅ store’daki güncel state’i aktif kullanıcı için kaydet
    persistCurrentUserTracking(state) {
      persist(state);
    },

    // --- mevcut mutasyonların: işlem + persist ---

    // addCaloriesToMeal(state, { mealId, kcal }) {
    //   const m = state.meals.find((x) => x.id === mealId);
    //   if (m) m.calories = (Number(m.calories) || 0) + (Number(kcal) || 0);
    //   // ✅
    //   if (state.currentUserId) saveTracking(state.currentUserId, { meals: state.meals, burnedCalories: state.burnedCalories, waterTaken: state.waterTaken });
    // },

    addNutritionToMeal(state, payload) {
      const { mealId, kcal, protein_g, carb_g, fat_g } = payload || {};
      const m = state.meals.find((x) => x.id === mealId);
      if (!m) return;

      m.calories = (Number(m.calories) || 0) + (Number(kcal) || 0);
      m.protein_g = (Number(m.protein_g) || 0) + (Number(protein_g) || 0);
      m.carb_g = (Number(m.carb_g) || 0) + (Number(carb_g) || 0);
      m.fat_g = (Number(m.fat_g) || 0) + (Number(fat_g) || 0);

      persist(state);
    },

    addWater(state, liters) {
      state.waterTaken = (Number(state.waterTaken) || 0) + (Number(liters) || 0);
      persist(state);
    },

    addBurned(state, kcal) {
      state.burnedCalories = (Number(state.burnedCalories) || 0) + (Number(kcal) || 0);
      persist(state);
    },

    resetTracking(state) {
      state.meals = state.meals.map((m) => ({ ...m, calories: 0, protein_g: 0, carb_g: 0, fat_g: 0 }));
      state.burnedCalories = 0;
      state.waterTaken = 0;
      state.stepsToday = 0;
      state.exerciseNote = '';
      persist(state);
    },
  },
});
