<template>
  <div id="app" class="min-h-screen pb-20 app-hero-bg">
    <Start v-if="activeComponent === 'start'" @next="showContent" />
    
    <PageContent v-else />
    
    <Footer v-if="activeComponent !== 'start'" />
  </div>
</template>

<script>
// Welcome yerine Start'ı import ediyoruz
import Start from './components/Start.vue' 
import PageContent from './components/PageContent.vue'
import Footer from './components/Footer.vue'
import { mapState } from 'vuex'

export default {
  name: 'App',
  components: { Start, PageContent, Footer }, // Start buraya eklendi
  computed: { ...mapState(['activeComponent']) },
  methods: {
    showContent() { 
      // Start ekranındaki butona basılınca state'i 'home' yapıyoruz
      this.$store.commit('setActiveComponent', 'home') 
    },
    onAddMealFromSuggestion(e) {
      const { mealId, kcal, macros } = e.detail || {};
      if (!mealId || !kcal) return;
      this.$store.commit('addNutritionToMeal', {
        mealId,
        kcal,
        protein_g: Number(macros && macros.protein_g) || 0,
        carb_g: Number(macros && macros.carb_g) || 0,
        fat_g: Number(macros && macros.fat_g) || 0,
      });
    }
  },
  mounted() {
    window.addEventListener('diet:addMeal', this.onAddMealFromSuggestion);
  },
  beforeDestroy() {
    window.removeEventListener('diet:addMeal', this.onAddMealFromSuggestion);
  }
}
</script>

<style src="@/styles/light-theme.css"></style>