<template>
  <!-- Robot SVG'si -->
  <svg width="140" height="180" viewBox="0 0 140 180" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Kafa -->
    <ellipse cx="70" cy="60" rx="55" ry="50" fill="#E0F2F1"/>
    <!-- Yüz maskesi -->
    <ellipse cx="70" cy="60" rx="40" ry="28" fill="#141925"/>
    <!-- Gözler -->
    <ellipse cx="55" cy="60" rx="7" ry="7" fill="none" stroke="#2DD4BF" stroke-width="3"/>
    <ellipse cx="85" cy="60" rx="7" ry="7" fill="none" stroke="#2DD4BF" stroke-width="3"/>
    <!-- Kulaklar -->
    <ellipse cx="20" cy="60" rx="7" ry="14" fill="#2DD4BF"/>
    <ellipse cx="120" cy="60" rx="7" ry="14" fill="#2DD4BF"/>
    <!-- Ağız -->
    <ellipse cx="70" cy="80" rx="10" ry="3" fill="none" stroke="#2DD4BF" stroke-width="2"/>
    <!-- Boyun gölgesi -->
    <ellipse cx="70" cy="105" rx="18" ry="7" fill="#141925"/>
    <!-- Gövde -->
    <path d="M35 120 Q70 160 105 120 Q70 110 35 120Z" fill="#E0F2F1"/>
    <!-- Gövde çizgisi -->
    <path d="M50 130 Q70 150 90 130" stroke="#2DD4BF" stroke-width="3" fill="none"/>
    <!-- Anten -->
    <rect x="67" y="20" width="6" height="18" rx="3" fill="#2DD4BF"/>
    <circle cx="70" cy="18" r="4" fill="#2DD4BF"/>
  </svg>
</template>

<script>
export default {
  name: 'RobotIcon'
}
</script> 