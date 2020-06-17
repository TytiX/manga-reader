import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

import Favorites from '../views/Favorites.vue'
import Home from '../views/Home.vue'
import Detail from '../views/Detail.vue'
import Reader from '../views/Reader.vue'

Vue.use(VueRouter)

  const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Fav',
    component: Favorites
  },
  {
    path: '/mangas',
    name: 'All',
    component: Home
  },
  {
    path: '/manga/:id',
    name: 'Manga',
    component: Detail
  },
  {
    path: '/reader/:chapterId/:page?',
    name: 'Reader',
    component: Reader
  },
  {
    path: '/settings',
    name: 'Settings',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Settings.vue')
  },
  {
    path: '/settings/:id',
    name: 'SettingsDetail',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/SettingsDetail.vue')
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
