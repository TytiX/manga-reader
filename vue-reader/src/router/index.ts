import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'

import Favorites from '../views/Favorites.vue'
import Filters from '../views/Filters.vue'
import Home from '../views/Home.vue'
import Recents from '../views/Recents.vue'
import Started from '../views/Started.vue'
import Recomended from '../views/Recomended.vue'
import Untaged from '../views/Untaged.vue'
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
    path: '/filtres',
    name: 'Filtre',
    component: Filters
  },
  {
    path: '/mangas',
    name: 'All',
    component: Home
  },
  {
    path: '/updated-today',
    name: 'Today',
    component: Recents
  },
  {
    path: '/updated-weekly',
    name: 'This Week',
    component: Recents
  },
  {
    path: '/started',
    name: 'Started',
    component: Started
  },
  {
    path: '/recomended',
    name: 'Recomended',
    component: Recomended
  },
  {
    path: '/untaged',
    name: 'Untaged',
    component: Untaged
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
    component: () => import(/* webpackChunkName: "settings" */ '../views/Settings.vue')
  },
  {
    path: '/manage-tags',
    name: 'ManageTags',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "settings" */ '../components/settings/TagsListEditor.vue')
  },
  {
    path: '/manage-mangas',
    name: 'ManageMangas',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "settings" */ '../components/settings/MangaMergeEditor.vue')
  },
  {
    path: '/manage-logs',
    name: 'ManageLogs',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "settings" */ '../components/settings/ManageLogs.vue')
  },
  {
    path: '/settings/:id',
    name: 'SettingsDetail',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "settings" */ '../views/SettingsDetail.vue')
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
