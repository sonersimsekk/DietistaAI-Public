<template>
  <div>
    <!-- 🔑 Start ekranı -->
    <Start v-if="activeComponent === 'start'" />

    <!-- Ana uygulama ekranları -->
    <Home v-if="activeComponent === 'home'" />
    <Insights v-if="activeComponent === 'insights'" />
    <Exercises v-if="activeComponent === 'exercises'" />
    <AI v-if="activeComponent === 'ai'" />
    <FoodSuggestions v-if="activeComponent === 'food-suggestions'" />
    <PersonalizedWorkout v-if="activeComponent === 'personalized-workout'" />
    <AIDietChat v-if="activeComponent === 'ai-diet-chat'" />
    <ProductScan v-if="activeComponent === 'product-scan'" />

    <!-- More Menu -->
    <MoreMenu
      :open="activeComponent === 'more'"
      @close="onMenuClose"
      @logout="onLogout"
    />
  </div>
</template>

<script>
import Home from './Home.vue'
import Start from './Start.vue'
import Insights from './Insights.vue'
import Exercises from './Exercises.vue'
import AI from './Ai.vue'
import MoreMenu from './MoreMenu.vue'
import FoodSuggestions from './FoodSuggestions.vue'
import PersonalizedWorkout from './PersonalizedWorkout.vue'
import { mapState } from 'vuex'
import AIDietChat from './AIDietChat.vue'
import ProductScan from '@/views/ProductScan.vue'

export default {
  name: 'PageContent',
  components: {
    Start,
    Home,
    Insights,
    Exercises,
    AI,
    MoreMenu,
    FoodSuggestions,
    PersonalizedWorkout,
    AIDietChat,
    ProductScan
  },
  computed: {
    ...mapState(['activeComponent'])
  },
  methods: {
    // Menü kapandıysa → home’a dön
    onMenuClose() {
      this.$store.commit('setActiveComponent', 'home')
    },

    // 🔑 Oturum kapatma → start ekranı
    onLogout() {
      // seçili kullanıcıyı temizle
      localStorage.removeItem('dietista_current_user_id')

      // Start ekranına geç
      this.$store.commit('setActiveComponent', 'start')
    },

    openFoodSuggestions() {
      this.$store.commit('setActiveComponent', 'food-suggestions')
    },
    openAIDietChat() {
      this.$store.commit('setActiveComponent', 'ai-diet-chat')
    }
  }
}
</script>
