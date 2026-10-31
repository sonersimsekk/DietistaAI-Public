<template>
  <div class="flex flex-col items-center w-full min-h-[80vh] px-4 py-8">
    <!-- Robot ikonu -->
    <div>
      <RobotIcon class="mx-auto" />
    </div>

    <!-- Karşılama metni -->
    <div class="text-xl font-bold mb-6 text-center" style="color: var(--text)">
      Merhaba! <br> Sana nasıl yardımcı olabilirim?
    </div>

    <!-- Kartlar -->
    <div class="grid grid-cols-2 gap-4 w-full max-w-md">
      <button
        class="feature-card"
        @click="openAIDietChat"
      >
        <span class="text-3xl mb-2">💬</span>
        <span class="feature-card-text">AI Diyet Sohbeti</span>
      </button>

      <button
        class="feature-card"
        @click="openFoodSuggestions"
      >
        <span class="text-3xl mb-2">💡</span>
        <span class="feature-card-text">Akıllı Yemek Önerisi</span>
      </button>

      <button
        class="feature-card"
        @click="goBarcodeScan"
      >
        <span class="text-3xl mb-2">𝄃𝄃𝄂𝄂𝄀𝄁𝄃𝄂𝄂𝄃</span>
        <span class="feature-card-text">Barkod Sistemi</span>
      </button>

      <button
        class="feature-card"
        @click="openPersonalizedWorkout"
      >
        <span class="text-3xl mb-2">🏋️‍♂️</span>
        <span class="feature-card-text">Kişisel Egzersizler</span>
      </button>
    </div>
  </div>
</template>

<script>
import RobotIcon from './RobotIcon.vue'

export default {
  name: 'Ai',
  components: { RobotIcon },
  methods: {
    openPersonalizedWorkout() {
      this.$store.commit('setActiveComponent', 'personalized-workout')
    },
    openFoodSuggestions() {
      this.$store.commit('setActiveComponent', 'food-suggestions')
    },
    openAIDietChat() {
      this.$store.commit('setActiveComponent', 'ai-diet-chat')
    },
    goBarcodeScan() {
      this.$store.commit('setActiveComponent', 'product-scan');
    },
  }
}
</script>

<style scoped>
.feature-card {
  background: linear-gradient(135deg, #8b5cf6, #3b82f6);
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
  box-shadow: 0 6px 16px rgba(139,92,246,.25);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  color: white;
  text-align: center;
}
.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(139,92,246,.35);
}
.feature-card-text {
  font-weight: 600;
  font-size: 1rem;
  line-height: 1.2rem;
}
</style>
