import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../components/Home.vue'
import Start from '../components/Start.vue'


Vue.use(VueRouter)

const routes = [
  // ✅ İlk açılış her zaman Start ekranı
  { path: '/', name: 'Start', component: Start },

  // ✅ Uygulamanın ana ekranı artık /home
  { path: '/home', name: 'Home', component: Home },

  {
    path: '/about',
    name: 'About',
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },

  { path: '/scan', name: 'ProductScan', component: () => import('@/views/ProductScan.vue') },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// // ✅ Kullanıcı seçilmeden uygulamaya girilmesin
// router.beforeEach((to, from, next) => {
//   // Start sayfasına her zaman izin ver
//   if (to.path === '/start') return next()

//   const currentId = localStorage.getItem('dietista_current_user_id')

//   // Seçili kullanıcı yoksa start'a gönder
//   if (!currentId) return next('/start')

//   return next()
// })

export default router
