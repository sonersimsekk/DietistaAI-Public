<template>
  <div class="flex flex-col items-center justify-center min-h-[80vh] w-full px-4 bg-[#18192a]">
    <div class="bg-gradient-to-br from-purple-500 to-blue-500 m-5 rounded-3xl shadow-xl px-8 py-8 w-full max-w-md flex flex-col items-center mb-12">
      <div class="mb-4">
        <svg width="100" height="100" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="70" cy="60" rx="55" ry="50" fill="#A5B4FC"/>
          <ellipse cx="70" cy="60" rx="40" ry="28" fill="#18192a"/>
          <ellipse cx="55" cy="60" rx="7" ry="7" fill="none" stroke="#60A5FA" stroke-width="3"/>
          <ellipse cx="85" cy="60" rx="7" ry="7" fill="none" stroke="#60A5FA" stroke-width="3"/>
          <ellipse cx="20" cy="60" rx="7" ry="14" fill="#60A5FA"/>
          <ellipse cx="120" cy="60" rx="7" ry="14" fill="#60A5FA"/>
          <ellipse cx="70" cy="80" rx="10" ry="3" fill="none" stroke="#60A5FA" stroke-width="2"/>
          <ellipse cx="70" cy="105" rx="18" ry="7" fill="#18192a"/>
          <path d="M35 120 Q70 140 105 120 Q70 110 35 120Z" fill="#A5B4FC"/>
          <path d="M50 130 Q70 140 90 130" stroke="#60A5FA" stroke-width="3" fill="none"/>
          <rect x="67" y="20" width="6" height="18" rx="3" fill="#60A5FA"/>
          <circle cx="70" cy="18" r="4" fill="#60A5FA"/>
        </svg>
      </div>
      <div class="text-white text-2xl font-bold mb-2 text-center">Hadi tanışalım!</div>
      <ul class="text-gray-200 text-base font-normal text-center space-y-1 mb-2">
        <li>- Yaşın, cinsiyetin, boyun, kilon</li>
        <li>- Sevdiğin / sevmediğin yemekler</li>
        <li>- Hedefin ne? Örneğin; kilo vermek mi, yağ oranını düşürmek mi, kas oranını artırmak mı?</li>
      </ul>
    </div>
    <div class="flex flex-col items-center">
      <button class="w-28 h-28 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg mb-4 hover:scale-105 transition-transform">
        <svg width="60" height="60" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="24" fill="oklch(81.1% 0.111 293.571)" fill-opacity="0.55"/>
          <rect x="20" y="12" width="8" height="16" rx="4" fill="#fff"/>
          <rect x="22" y="28" width="4" height="8" rx="2" fill="#fff"/>
          <rect x="18" y="36" width="12" height="2" rx="1" fill="#fff"/>
        </svg>
      </button>
      <div class="text-gray-300 text-base mt-1">Konuşmaya başlamak için dokun</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Welcome'
}
</script> 